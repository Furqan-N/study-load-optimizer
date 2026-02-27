"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade: string;
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
  credits: "",
  target_grade: "",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get<Course[]>("/courses/");
      setCourses(response.data);
    } catch (fetchError) {
      console.error("Failed to fetch courses:", fetchError);
      setError("Unable to load courses right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const openModal = () => {
    setError("");
    setIsModalOpen(true);
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
        course_code: formData.course_code.trim(),
        course_name: formData.course_name.trim(),
        credits: Number(formData.credits),
        target_grade: formData.target_grade.trim(),
      };

      const response = await api.post<Course>("/courses/", payload);
      setCourses((prev) => [response.data, ...prev]);
      closeModal();
    } catch (submitError) {
      console.error("Failed to create course:", submitError);
      setError("Could not add course. Please check your input and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCourse = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This will also delete all associated study sessions and assessments.",
    );
    if (!confirmed) return;

    try {
      await api.delete(`/courses/${id}`);
      await fetchCourses();
    } catch (deleteError) {
      console.error("Failed to delete course:", deleteError);
    }
  };

  const handleEditCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCourse) return;

    setSubmitting(true);
    try {
      await api.patch(`/courses/${editingCourse.id}`, editingCourse);
      await fetchCourses();
      setEditingCourse(null);
    } catch (editError) {
      console.error("Failed to update course:", editError);
      setError("Could not update course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 md:p-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Courses</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your classes and keep your targets visible.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FFD54F] px-4 py-2.5 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227]"
        >
          <span className="material-symbols-outlined !text-[20px]">add</span>
           Add Course
        </button>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <span className="material-symbols-outlined !text-4xl text-slate-300">school</span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">No courses yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add your first course to start building your study plan.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {course.course_code}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {course.credits} credits
                    </span>
                    <button onClick={() => setEditingCourse(course)} className="text-slate-300 hover:text-blue-500 transition-colors p-1"><span className="material-symbols-outlined !text-[18px]">edit</span></button>
                    <button onClick={() => deleteCourse(course.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                  </div>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{course.course_name}</h3>
                <p className="mt-3 text-sm text-slate-600">
                  Target Grade: <span className="font-semibold text-slate-800">{course.target_grade}</span>
                </p>
              </div>
              <div className="mt-6 w-full">
                <Link href={`/dashboard/courses/${course.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 border border-slate-200">View Course <span className="material-symbols-outlined !text-[16px]">arrow_forward</span></Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Add Course</h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="course_code" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course Code
                </label>
                <input
                  id="course_code"
                  type="text"
                  value={formData.course_code}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, course_code: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="course_name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course Name
                </label>
                <input
                  id="course_name"
                  type="text"
                  value={formData.course_name}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, course_name: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="credits" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Credits
                </label>
                <input
                  id="credits"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.credits}
                  onChange={(event) => setFormData((prev) => ({ ...prev, credits: event.target.value }))}
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="target_grade" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Target Grade
                </label>
                <input
                  id="target_grade"
                  type="text"
                  value={formData.target_grade}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, target_grade: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 rounded-lg bg-[#FFD54F] px-4 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227] disabled:opacity-60"
                >
                  {submitting ? "Adding..." : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Edit Course</h2>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                aria-label="Close modal"
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditCourse} className="space-y-4">
              <div>
                <label htmlFor="edit_course_code" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course Code
                </label>
                <input
                  id="edit_course_code"
                  type="text"
                  value={editingCourse.course_code}
                  onChange={(event) =>
                    setEditingCourse({ ...editingCourse, course_code: event.target.value })
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="edit_course_name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course Name
                </label>
                <input
                  id="edit_course_name"
                  type="text"
                  value={editingCourse.course_name}
                  onChange={(event) =>
                    setEditingCourse({ ...editingCourse, course_name: event.target.value })
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="edit_credits" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Credits
                </label>
                <input
                  id="edit_credits"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editingCourse.credits}
                  onChange={(event) =>
                    setEditingCourse({ ...editingCourse, credits: Number(event.target.value) })
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="edit_target_grade" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Target Grade
                </label>
                <input
                  id="edit_target_grade"
                  type="text"
                  value={editingCourse.target_grade}
                  onChange={(event) =>
                    setEditingCourse({ ...editingCourse, target_grade: event.target.value })
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  disabled={submitting}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 rounded-lg bg-[#FFD54F] px-4 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227] disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
