"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: number;
  is_completed: boolean;
};

type AssessmentFormData = {
  title: string;
  course_id: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: string;
};

const initialFormData: AssessmentFormData = {
  title: "",
  course_id: "",
  assessment_type: "Exam",
  due_date: "",
  weight_percentage: "",
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, assessmentsResponse] = await Promise.all([
          api.get<Course[]>("/courses/"),
          api.get<Assessment[]>("/assessments/"),
        ]);

        setCourses(coursesResponse.data);
        setAssessments(assessmentsResponse.data);
      } catch (fetchError) {
        console.error("Failed to fetch assessments data:", fetchError);
        setError("Unable to load assessments right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const courseCodeMap = useMemo(() => {
    return courses.reduce<Record<string, string>>((acc, course) => {
      acc[course.id] = course.course_code;
      return acc;
    }, {});
  }, [courses]);

  const parseLocalDate = (dateString: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString.replace(/-/g, "/"));
    }
    return new Date(dateString);
  };

  const sortedAssessments = useMemo(() => {
    return [...assessments].sort(
      (a, b) => parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime(),
    );
  }, [assessments]);

  const formatDate = (dateString: string) => {
    const localDate = parseLocalDate(dateString);
    return localDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openModal = () => {
    setError("");
    setIsModalOpen(true);
    setFormData((prev) => ({
      ...prev,
      course_id: prev.course_id || courses[0]?.id || "",
    }));
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setFormData(initialFormData);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        course_id: formData.course_id,
        assessment_type: formData.assessment_type,
        due_date: formData.due_date,
        weight_percentage: Number(formData.weight_percentage),
      };

      const response = await api.post<Assessment>("/assessments/", payload);
      setAssessments((prev) => [response.data, ...prev]);
      closeModal();
    } catch (submitError) {
      console.error("Failed to create assessment:", submitError);
      setError("Could not add assessment. Please check your input and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "h-10 w-full rounded-xl border border-[#E9ECEF] bg-white px-3 text-sm text-black outline-none focus:border-[#2B5EA7] focus:ring-2 focus:ring-[#2B5EA7]/20 transition-colors";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#6C757D]";

  return (
    <div className="mx-auto w-full max-w-[1100px] p-6 md:p-8">
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Upcoming Assessments</h1>
          <p className="mt-1 text-sm text-[#6C757D]">Keep track of deadlines across all your courses.</p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          <span className="material-symbols-outlined !text-[20px]">add_task</span>
          Add Task
        </button>
      </section>

      {loading ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm text-sm text-[#6C757D]">
          Loading assessments...
        </div>
      ) : sortedAssessments.length === 0 ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-10 shadow-sm text-center">
          <span className="material-symbols-outlined !text-4xl text-[#CED4DA]">event_busy</span>
          <h2 className="mt-3 text-lg font-semibold text-black">No upcoming tasks yet</h2>
          <p className="mt-1 text-sm text-[#6C757D]">
            Add your first assessment to start managing deadlines.
          </p>
        </div>
      ) : (
        <section className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm overflow-hidden">
          {sortedAssessments.map((assessment) => (
            <article
              key={assessment.id}
              className="flex items-center gap-4 border-b border-[#E9ECEF] last:border-b-0 p-4 hover:bg-[#F8F9FA] transition-colors"
            >
              <div className="h-10 w-1 rounded-full bg-[#2B5EA7]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black">{assessment.title}</p>
                <p className="text-xs text-[#6C757D]">
                  {courseCodeMap[assessment.course_id] ?? "Unknown Course"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-black">{formatDate(assessment.due_date)}</p>
                <p className="mt-1 text-[11px] text-[#6C757D]">{assessment.weight_percentage}% weight</p>
              </div>
              <span className="rounded-full border border-[#E9ECEF] bg-[#F8F9FA] px-2.5 py-1 text-xs font-medium text-[#6C757D]">
                {assessment.assessment_type}
              </span>
            </article>
          ))}
        </section>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Assessment</h2>
              <button type="button" onClick={closeModal} aria-label="Close modal" className="rounded-lg p-1 text-[#6C757D] transition-colors hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className={labelClass}>Title</label>
                <input id="title" type="text" value={formData.title} onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="course_id" className={labelClass}>Course</label>
                <select id="course_id" value={formData.course_id} onChange={(event) => setFormData((prev) => ({ ...prev, course_id: event.target.value }))} required className={inputClass}>
                  <option value="" disabled>Select a course</option>
                  {courses.map((course) => (<option key={course.id} value={course.id}>{course.course_code} - {course.course_name}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="assessment_type" className={labelClass}>Type</label>
                <select id="assessment_type" value={formData.assessment_type} onChange={(event) => setFormData((prev) => ({ ...prev, assessment_type: event.target.value }))} required className={inputClass}>
                  <option value="Exam">Exam</option>
                  <option value="Essay">Essay</option>
                  <option value="Project">Project</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label htmlFor="due_date" className={labelClass}>Due Date</label>
                <input id="due_date" type="date" value={formData.due_date} onChange={(event) => setFormData((prev) => ({ ...prev, due_date: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="weight_percentage" className={labelClass}>Weight %</label>
                <input id="weight_percentage" type="number" min="0" max="100" step="0.5" value={formData.weight_percentage} onChange={(event) => setFormData((prev) => ({ ...prev, weight_percentage: event.target.value }))} required className={inputClass} />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={submitting} className="h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-colors hover:bg-[#F8F9FA] disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={submitting || courses.length === 0} className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60">{submitting ? "Adding..." : "Add Task"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
