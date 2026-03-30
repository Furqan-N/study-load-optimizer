"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { persistSelectedTermId, readStoredSelectedTermId } from "@/lib/selectedTermStorage";

type Course = {
  id: string;
  term_id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade: string;
};

type Term = {
  id: string;
  season: string;
  year: number;
  is_archived: boolean;
};

type CourseFormData = {
  course_code: string;
  course_name: string;
  credits: string;
  target_grade: string;
};

const initialFormData: CourseFormData = {
  course_code: "",
  course_name: "",
  credits: "0.5",
  target_grade: "",
};

export default function CoursesPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);

  const archivedTermIds = new Set(terms.filter((t) => t.is_archived).map((t) => t.id));

  const courses = useMemo(() => {
    if (!selectedTermId) return [];
    return allCourses.filter((c) => c.term_id === selectedTermId);
  }, [allCourses, selectedTermId]);

  const selectedTermLabel = useMemo(() => {
    if (!selectedTermId) return null;
    const t = terms.find((x) => x.id === selectedTermId);
    return t ? `${t.season} ${t.year}` : null;
  }, [terms, selectedTermId]);

  const fetchCourses = useCallback(async () => {
    try {
      const [coursesRes, termsRes] = await Promise.all([
        api.get<Course[]>("/courses/"),
        api.get<Term[]>("/terms/"),
      ]);
      setAllCourses(coursesRes.data);
      setTerms(termsRes.data);
    } catch (fetchError) {
      console.error("Failed to fetch courses:", fetchError);
      setError("Unable to load courses right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleTermChange = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      setSelectedTermId(id);
      persistSelectedTermId(id);
    };
    window.addEventListener("term-selected", handleTermChange as EventListener);

    const stored = readStoredSelectedTermId();
    if (stored) {
      window.dispatchEvent(new CustomEvent("term-selected", { detail: stored }));
    }

    void fetchCourses();

    return () => {
      window.removeEventListener("term-selected", handleTermChange as EventListener);
    };
  }, [fetchCourses]);

  const openModal = () => { setError(""); setIsModalOpen(true); };
  const closeModal = () => { if (submitting) return; setIsModalOpen(false); setFormData(initialFormData); setError(""); };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTermId) {
      setError("Select a term on the dashboard first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        term_id: selectedTermId,
        course_code: formData.course_code.trim(),
        course_name: formData.course_name.trim(),
        credits: Number(formData.credits),
        target_grade: formData.target_grade.trim(),
      };
      const response = await api.post<Course>("/courses/", payload);
      setAllCourses((prev) => [response.data, ...prev]);
      closeModal();
    } catch (submitError) {
      console.error("Failed to create course:", submitError);
      setError("Could not add course. Please check your input and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCourse = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this course? This will also delete all associated study sessions and assessments.");
    if (!confirmed) return;
    try { await api.delete(`/courses/${id}`); await fetchCourses(); } catch (deleteError) { console.error("Failed to delete course:", deleteError); }
  };

  const handleEditCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCourse) return;
    setSubmitting(true);
    try { await api.patch(`/courses/${editingCourse.id}`, editingCourse); await fetchCourses(); setEditingCourse(null); } catch (editError) { console.error("Failed to update course:", editError); setError("Could not update course. Please try again."); } finally { setSubmitting(false); }
  };

  const inputClass = "h-10 w-full rounded-xl border border-[#E9ECEF] bg-white px-3 text-sm text-black outline-none focus:border-[#2B5EA7] focus:ring-2 focus:ring-[#2B5EA7]/20 transition-colors";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#6C757D]";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 md:p-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">My Courses</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            {selectedTermId
              ? selectedTermLabel
                ? `Courses for ${selectedTermLabel}.`
                : "Loading term…"
              : "Select a term on the dashboard to see courses for that term."}
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          disabled={!selectedTermId}
          title={!selectedTermId ? "Select a term on the dashboard first" : undefined}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined !text-[20px]">add</span>
          Add Course
        </button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm text-sm text-[#6C757D]">Loading courses...</div>
      ) : !selectedTermId ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-10 shadow-sm text-center">
          <span className="material-symbols-outlined !text-4xl text-[#CED4DA]">calendar_month</span>
          <h2 className="mt-3 text-lg font-semibold text-black">No term selected</h2>
          <p className="mt-1 text-sm text-[#6C757D]">Choose a term on the dashboard to view its courses here.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Go to dashboard
            <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
          </Link>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-10 shadow-sm text-center">
          <span className="material-symbols-outlined !text-4xl text-[#CED4DA]">school</span>
          <h2 className="mt-3 text-lg font-semibold text-black">No courses this term</h2>
          <p className="mt-1 text-sm text-[#6C757D]">Add a course for {selectedTermLabel ?? "this term"} to start building your study plan.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isArchived = archivedTermIds.has(course.term_id);
            return (
            <article key={course.id} className={`flex h-full flex-col rounded-xl border border-[#E9ECEF] p-6 shadow-sm hover:shadow-md transition-shadow ${isArchived ? "bg-[#F8F9FA] opacity-70" : "bg-white"}`}>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isArchived ? "bg-[#ADB5BD]" : "bg-[#2B5EA7]"}`}></span>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6C757D]">{course.course_code}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-[#F8F9FA] border border-[#E9ECEF] px-2.5 py-1 text-xs font-medium text-[#6C757D]">{course.credits} cr</span>
                    <button onClick={() => setEditingCourse(course)} className="text-[#CED4DA] hover:text-[#2B5EA7] transition-colors p-1"><span className="material-symbols-outlined !text-[18px]">edit</span></button>
                    <button onClick={() => deleteCourse(course.id)} className="text-[#CED4DA] hover:text-red-500 transition-colors p-1"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                  </div>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold text-black">{course.course_name}</h3>
                <p className="mt-3 text-sm text-[#6C757D]">Target: <span className="font-semibold text-black">{course.target_grade}</span></p>
              </div>
              <div className="mt-6 w-full">
                <Link href={`/dashboard/courses/${course.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#E9ECEF]">View Course <span className="material-symbols-outlined !text-[16px]">arrow_forward</span></Link>
              </div>
            </article>
            );
          })}
        </section>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Course</h2>
              <button type="button" onClick={closeModal} aria-label="Close modal" className="rounded-lg p-1 text-[#6C757D] transition-colors hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label htmlFor="course_code" className={labelClass}>Course Code</label><input id="course_code" type="text" value={formData.course_code} onChange={(e) => setFormData((prev) => ({ ...prev, course_code: e.target.value }))} required className={inputClass} /></div>
              <div><label htmlFor="course_name" className={labelClass}>Course Name</label><input id="course_name" type="text" value={formData.course_name} onChange={(e) => setFormData((prev) => ({ ...prev, course_name: e.target.value }))} required className={inputClass} /></div>
              <div><label htmlFor="credits" className={labelClass}>Credits</label><input id="credits" type="number" min="0" step="0.5" value={formData.credits} onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))} required className={inputClass} /></div>
              <div><label htmlFor="target_grade" className={labelClass}>Target Grade</label><input id="target_grade" type="text" value={formData.target_grade} onChange={(e) => setFormData((prev) => ({ ...prev, target_grade: e.target.value }))} required className={inputClass} /></div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={submitting} className="h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-colors hover:bg-[#F8F9FA] disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={submitting} className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60">{submitting ? "Adding..." : "Add Course"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Edit Course</h2>
              <button type="button" onClick={() => setEditingCourse(null)} aria-label="Close modal" className="rounded-lg p-1 text-[#6C757D] transition-colors hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <div><label htmlFor="edit_course_code" className={labelClass}>Course Code</label><input id="edit_course_code" type="text" value={editingCourse.course_code} onChange={(e) => setEditingCourse({ ...editingCourse, course_code: e.target.value })} required className={inputClass} /></div>
              <div><label htmlFor="edit_course_name" className={labelClass}>Course Name</label><input id="edit_course_name" type="text" value={editingCourse.course_name} onChange={(e) => setEditingCourse({ ...editingCourse, course_name: e.target.value })} required className={inputClass} /></div>
              <div><label htmlFor="edit_credits" className={labelClass}>Credits</label><input id="edit_credits" type="number" min="0" step="0.5" value={editingCourse.credits} onChange={(e) => setEditingCourse({ ...editingCourse, credits: Number(e.target.value) })} required className={inputClass} /></div>
              <div><label htmlFor="edit_target_grade" className={labelClass}>Target Grade</label><input id="edit_target_grade" type="text" value={editingCourse.target_grade} onChange={(e) => setEditingCourse({ ...editingCourse, target_grade: e.target.value })} required className={inputClass} /></div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingCourse(null)} disabled={submitting} className="h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-colors hover:bg-[#F8F9FA] disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={submitting} className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60">{submitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
