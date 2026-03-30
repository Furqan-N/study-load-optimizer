"use client";

import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Layers, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade: string;
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: number;
  is_completed: boolean;
  earned_score?: number | null;
};

type AssessmentEditDraft = {
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: string;
};

type BulkAddDraft = {
  baseTitle: string;
  count: string;
  totalWeight: string;
  startDate: string;
  frequency: "weekly" | "biweekly";
};

type PreviewItem = {
  title: string;
  due_date: string;
};

/**
 * Computes min / max / what-if final-grade projections.
 *
 * Min  = earned so far + 0%   on remaining weight
 * Max  = earned so far + 100% on remaining weight
 * WhatIf = earned so far + (user-entered %) on remaining weight
 *
 * All values are on a 0–100 scale (percentage of total course weight).
 */
function calculateProjections(
  projectedTotal: number,
  gradedWeight: number,
  remainingWeight: number,
  whatIfGradeInput: string,
) {
  const minProjection = gradedWeight > 0 ? projectedTotal : 0;
  const maxProjection = projectedTotal + remainingWeight;

  const whatIfNum = Number(whatIfGradeInput);
  const hasWhatIf =
    whatIfGradeInput.trim() !== "" && !Number.isNaN(whatIfNum);

  const whatIfProjection = hasWhatIf
    ? projectedTotal + (whatIfNum / 100) * remainingWeight
    : null;

  return { minProjection, maxProjection, whatIfProjection };
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const courseId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [savingAssessmentId, setSavingAssessmentId] = useState<string | null>(null);
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [savingGradeAssessmentId, setSavingGradeAssessmentId] = useState<string | null>(null);
  const [gradeDraftById, setGradeDraftById] = useState<Record<string, string>>({});
  const [targetGradeInput, setTargetGradeInput] = useState("90");
  const [whatIfGrade, setWhatIfGrade] = useState("");
  const [dropLowestQuizCount, setDropLowestQuizCount] = useState("0");
  const [editDraft, setEditDraft] = useState<AssessmentEditDraft>({
    title: "",
    assessment_type: "quiz",
    due_date: "",
    weight_percentage: "",
  });
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkDraft, setBulkDraft] = useState<BulkAddDraft>({
    baseTitle: "Quiz",
    count: "10",
    totalWeight: "20",
    startDate: "",
    frequency: "weekly",
  });
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [shiftFollowingDates, setShiftFollowingDates] = useState(false);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      const [coursesRes, assessmentsRes] = await Promise.all([
        api.get<Course[]>("/courses/"),
        api.get<Assessment[]>("/assessments/", { params: { course_id: courseId } }),
      ]);
      setCourse(coursesRes.data.find((c) => c.id === courseId) ?? null);
      setAssessments(assessmentsRes.data);
    } catch (error) {
      console.error("Failed to load course details:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  useEffect(() => {
    const nextDrafts: Record<string, string> = {};
    for (const assessment of assessments) {
      nextDrafts[assessment.id] =
        assessment.earned_score === null || assessment.earned_score === undefined
          ? ""
          : String(assessment.earned_score);
    }
    setGradeDraftById(nextDrafts);
  }, [assessments]);

  useEffect(() => {
    if (course?.target_grade) {
      setTargetGradeInput(course.target_grade);
    }
  }, [course?.target_grade]);

  useEffect(() => {
    if (!bulkDraft.startDate) {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setBulkDraft((prev) => ({ ...prev, startDate: localToday }));
    }
  }, [bulkDraft.startDate]);

  useEffect(() => {
    if (!bulkMenuOpen) {
      setPreviewItems([]);
      setShiftFollowingDates(false);
    }
  }, [bulkMenuOpen]);

  const isReadingWeekDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return false;
    const date = new Date(year, month - 1, day);

    // Family Day: third Monday of February.
    const febFirst = new Date(year, 1, 1);
    const febFirstDay = febFirst.getDay();
    const daysToMonday = (8 - febFirstDay) % 7;
    const firstMonday = 1 + daysToMonday;
    const thirdMonday = firstMonday + 14;
    const readingWeekStartFeb = new Date(year, 1, thirdMonday);
    const readingWeekEndFeb = new Date(year, 1, thirdMonday + 6);

    // Late October reading week (approx): Monday of the week that contains Oct 25.
    const octAnchor = new Date(year, 9, 25);
    const octDay = octAnchor.getDay();
    const mondayOffset = (octDay + 6) % 7;
    const readingWeekStartOct = new Date(year, 9, 25 - mondayOffset);
    const readingWeekEndOct = new Date(year, 9, readingWeekStartOct.getDate() + 6);

    return (
      (date >= readingWeekStartFeb && date <= readingWeekEndFeb) ||
      (date >= readingWeekStartOct && date <= readingWeekEndOct)
    );
  };

  const buildPreviewItems = () => {
    const count = Number(bulkDraft.count);
    if (!Number.isFinite(count) || count <= 0 || !bulkDraft.startDate) {
      setPreviewItems([]);
      return [];
    }
    const baseTitle = bulkDraft.baseTitle.trim() || "Item";
    const dayOffset = bulkDraft.frequency === "biweekly" ? 14 : 7;
    const [year, month, day] = bulkDraft.startDate.split("-").map(Number);
    const start = new Date(year, (month || 1) - 1, day || 1);
    const nextItems: PreviewItem[] = Array.from({ length: count }, (_, index) => {
      const itemDate = new Date(start);
      itemDate.setDate(start.getDate() + index * dayOffset);
      const localDate = new Date(itemDate.getTime() - itemDate.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return {
        title: `${baseTitle} ${index + 1}`,
        due_date: localDate,
      };
    });
    setPreviewItems(nextItems);
    return nextItems;
  };

  const formatDate = (dateString: string) => {
    const [datePart = ""] = dateString.split("T");
    const [yearRaw, monthRaw, dayRaw] = datePart.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);

    if (!year || !month || !day) return dateString;

    // Build local date from YYYY-MM-DD only to avoid timezone offset date shifting.
    const localDate = new Date(year, month - 1, day);
    const baseDate = localDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeMatch = dateString.match(/T(\d{2}):(\d{2})/);
    if (!timeMatch) return baseDate;

    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    if (hour === 0 && minute === 0) return baseDate;

    const timeDate = new Date(2000, 0, 1, hour, minute);
    const formattedTime = timeDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${baseDate} at ${formattedTime}`;
  };

  const getAssessmentStyle = (assessment: Assessment) => {
    const type = assessment.assessment_type.trim().toLowerCase();
    if (type === "midterm") {
      return {
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-300",
        borderClass: "border-l-4 border-amber-300",
      };
    }
    if (type === "exam") {
      return {
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-300",
        borderClass: "border-l-4 border-rose-300",
      };
    }
    if (type === "quiz") {
      return {
        badgeClass: "bg-[#e8f5e8] text-[#288028] border border-[#288028]/30",
        borderClass: "border-l-4 border-[#288028]/30",
      };
    }
    return {
      badgeClass: "bg-[#F8F9FA] text-[#6C757D] border border-[#E9ECEF]",
      borderClass: "border-l-4 border-[#E9ECEF]",
    };
  };

  const sortedAssessments = useMemo(
    () =>
      [...assessments].sort(
        (a, b) => {
          const aDatePart = (a.due_date || "").split("T")[0];
          const bDatePart = (b.due_date || "").split("T")[0];
          const [ay, am, ad] = aDatePart.split("-").map(Number);
          const [by, bm, bd] = bDatePart.split("-").map(Number);
          return new Date(ay, (am || 1) - 1, ad || 1).getTime() - new Date(by, (bm || 1) - 1, bd || 1).getTime();
        },
      ),
    [assessments],
  );

  const hasQuizzes = useMemo(
    () => assessments.some((item) => String(item.assessment_type || "").trim().toLowerCase() === "quiz"),
    [assessments],
  );

  useEffect(() => {
    if (!hasQuizzes && dropLowestQuizCount !== "0") {
      setDropLowestQuizCount("0");
    }
  }, [hasQuizzes, dropLowestQuizCount]);

  const droppedQuizAssessmentIds = useMemo(() => {
    const gradedQuizzes = assessments.filter((item) => {
      const type = String(item.assessment_type || "").trim().toLowerCase();
      const hasGrade =
        item.earned_score !== null &&
        item.earned_score !== undefined &&
        !Number.isNaN(Number(item.earned_score));
      return type === "quiz" && hasGrade;
    });

    if (gradedQuizzes.length < 2) return new Set<string>();

    const requestedCount = Number(dropLowestQuizCount);
    if (Number.isNaN(requestedCount) || requestedCount <= 0) return new Set<string>();

    const maxDroppable = Math.max(0, gradedQuizzes.length - 1);
    const dropCount = Math.min(requestedCount, maxDroppable);
    if (dropCount <= 0) return new Set<string>();

    const sorted = [...gradedQuizzes].sort(
      (a, b) => Number(a.earned_score || 0) - Number(b.earned_score || 0),
    );
    return new Set(sorted.slice(0, dropCount).map((item) => item.id));
  }, [assessments, dropLowestQuizCount]);

  const summary = useMemo(() => {
    const totalCourseWeight = assessments.reduce((sum, item) => sum + Number(item.weight_percentage || 0), 0);
    const droppedWeight = assessments.reduce((sum, item) => {
      if (!droppedQuizAssessmentIds.has(item.id)) return sum;
      return sum + Number(item.weight_percentage || 0);
    }, 0);
    const activeWeight = Math.max(0, totalCourseWeight - droppedWeight);
    const multiplier = activeWeight > 0 ? 100 / activeWeight : 1;

    const scaledWeightById: Record<string, number> = {};
    for (const assessment of assessments) {
      const original = Number(assessment.weight_percentage || 0);
      const isDropped = droppedQuizAssessmentIds.has(assessment.id);
      scaledWeightById[assessment.id] = isDropped ? 0 : original * multiplier;
    }

    const gradedActive = assessments.filter((item) => {
      const hasGrade =
        item.earned_score !== null &&
        item.earned_score !== undefined &&
        !Number.isNaN(Number(item.earned_score));
      return hasGrade && !droppedQuizAssessmentIds.has(item.id);
    });

    const gradedWeight = gradedActive.reduce((sum, item) => sum + (scaledWeightById[item.id] ?? 0), 0);
    const projectedTotal = gradedActive.reduce(
      (sum, item) => sum + (Number(item.earned_score || 0) * Number(scaledWeightById[item.id] ?? 0)) / 100,
      0,
    );
    const currentAverage = gradedWeight > 0 ? projectedTotal / (gradedWeight / 100) : null;

    const targetGrade = Number(targetGradeInput);
    const remainingWeight = assessments.reduce((sum, item) => {
      const hasGrade =
        item.earned_score !== null &&
        item.earned_score !== undefined &&
        !Number.isNaN(Number(item.earned_score));
      if (hasGrade) return sum;
      return sum + (scaledWeightById[item.id] ?? 0);
    }, 0);
    const requiredRemainingAverage =
      remainingWeight > 0 && !Number.isNaN(targetGrade)
        ? (((targetGrade / 100) * 100 - projectedTotal) / remainingWeight) * 100
        : null;

    const { minProjection, maxProjection, whatIfProjection } = calculateProjections(
      projectedTotal,
      gradedWeight,
      remainingWeight,
      whatIfGrade,
    );

    // What-if: if user enters a specific grade, what would their average become?
    const whatIfGradeNum = Number(whatIfGrade);
    const whatIfAverage =
      !Number.isNaN(whatIfGradeNum) && whatIfGrade.trim() !== "" && remainingWeight > 0
        ? (projectedTotal + (whatIfGradeNum / 100) * remainingWeight) / ((gradedWeight + remainingWeight) / 100)
        : null;

    return {
      gradedWeight,
      currentAverage,
      projectedTotal,
      totalCourseWeight,
      droppedWeight,
      activeWeight,
      multiplier,
      scaledWeightById,
      remainingScaledWeight: remainingWeight,
      requiredRemainingAverage,
      targetGrade,
      minProjection,
      maxProjection,
      whatIfProjection,
      whatIfAverage,
    };
  }, [assessments, droppedQuizAssessmentIds, targetGradeInput, whatIfGrade]);

  const handleUploadSyllabus = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !courseId) return;

    const formData = new FormData();
    formData.append("file", file);
    const loadingToastId = toast.loading("Analyzing Syllabus...");

    setUploading(true);
    try {
      const response = await api.post(`/courses/${courseId}/upload-syllabus`, formData);
      await fetchCourseData();
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success(
        response.data?.message
          ? `${response.data.assessments_created ?? 0} assessments created.`
          : "Syllabus processed.",
        { id: loadingToastId },
      );
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to process syllabus.", {
        id: loadingToastId,
      });
      console.error("Failed to upload syllabus:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleClearAllAssessments = async () => {
    if (!courseId) return;
    const confirmed = window.confirm(
      "Clear all assessments for this course? This cannot be undone.",
    );
    if (!confirmed) return;

    setClearingAll(true);
    try {
      await api.delete(`/courses/${courseId}/assessments`);
      setAssessments([]);
      await fetchCourseData();
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success("All assessments cleared");
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear assessments:", error);
      toast.error("Failed to clear assessments");
    } finally {
      setClearingAll(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setDeletingAssessmentId(assessmentId);
    try {
      await api.delete(`/assessments/${assessmentId}`);
      await fetchCourseData();
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success("Assessment removed");
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      toast.error("Failed to delete assessment");
    } finally {
      setDeletingAssessmentId(null);
    }
  };

  const startEditingAssessment = (assessment: Assessment) => {
    setEditingAssessmentId(assessment.id);
    setEditDraft({
      title: assessment.title,
      assessment_type: assessment.assessment_type.toLowerCase(),
      due_date: (assessment.due_date || "").split("T")[0],
      weight_percentage: String(assessment.weight_percentage),
    });
  };

  const cancelEditingAssessment = () => {
    setEditingAssessmentId(null);
    setSavingAssessmentId(null);
    setEditDraft({
      title: "",
      assessment_type: "quiz",
      due_date: "",
      weight_percentage: "",
    });
  };

  const saveAssessmentEdits = async (assessment: Assessment) => {
    if (!editingAssessmentId || editingAssessmentId !== assessment.id) return;
    const trimmedTitle = editDraft.title.trim();
    const parsedWeight = Number(editDraft.weight_percentage);
    if (!trimmedTitle) {
      toast.error("Title cannot be empty");
      return;
    }
    if (!editDraft.due_date) {
      toast.error("Due date is required");
      return;
    }
    if (Number.isNaN(parsedWeight) || parsedWeight < 0 || parsedWeight > 100) {
      toast.error("Weight must be between 0 and 100");
      return;
    }

    const previousAssessments = assessments;
    const optimisticDueDate =
      assessment.due_date && assessment.due_date.includes("T")
        ? `${editDraft.due_date}${assessment.due_date.slice(10)}`
        : editDraft.due_date;

    setAssessments((prev) =>
      prev.map((item) =>
        item.id === assessment.id
          ? {
              ...item,
              title: trimmedTitle,
              assessment_type: editDraft.assessment_type,
              due_date: optimisticDueDate,
              weight_percentage: parsedWeight,
            }
          : item,
      ),
    );

    setSavingAssessmentId(assessment.id);
    try {
      const response = await api.patch<Assessment>(`/assessments/${assessment.id}`, {
        title: trimmedTitle,
        assessment_type: editDraft.assessment_type,
        due_date: editDraft.due_date,
        weight_percentage: parsedWeight,
      });
      setAssessments((prev) => prev.map((item) => (item.id === assessment.id ? response.data : item)));
      setEditingAssessmentId(null);
      toast.success("Assessment updated");
      window.dispatchEvent(new Event("assessments-updated"));
    } catch (error) {
      setAssessments(previousAssessments);
      console.error("Failed to update assessment:", error);
      toast.error("Failed to update assessment");
    } finally {
      setSavingAssessmentId(null);
    }
  };

  const handleAddAssessment = async () => {
    if (!courseId) return;
    setCreatingAssessment(true);
    try {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const response = await api.post<Assessment>("/assessments/", {
        course_id: courseId,
        assessment_type: "Quiz",
        title: "New Quiz",
        due_date: localToday,
        weight_percentage: 0,
      });
      const created = response.data;
      setAssessments((prev) => [...prev, created]);
      startEditingAssessment(created);
      window.dispatchEvent(new Event("assessments-updated"));
      toast.success("Assessment added");
    } catch (error) {
      console.error("Failed to add assessment:", error);
      toast.error("Failed to add assessment");
    } finally {
      setCreatingAssessment(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!courseId) return;
    const count = Number(bulkDraft.count);
    const totalWeight = Number(bulkDraft.totalWeight);
    if (!bulkDraft.baseTitle.trim()) {
      toast.error("Base title is required");
      return;
    }
    if (!bulkDraft.startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!Number.isFinite(count) || count <= 0) {
      toast.error("Count must be greater than 0");
      return;
    }
    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
      toast.error("Total weight must be greater than 0");
      return;
    }

    const perWeight = Number((totalWeight / count).toFixed(2));
    const baseTitle = bulkDraft.baseTitle.trim();
    const titleLower = baseTitle.toLowerCase();
    const assessmentType =
      titleLower.includes("midterm") ? "midterm" : titleLower.includes("exam") ? "exam" : "quiz";
    const itemsSource = previewItems.length > 0 ? previewItems : buildPreviewItems();
    if (itemsSource.length === 0) {
      toast.error("Preview schedule first.");
      return;
    }

    const items = itemsSource.map((item) => ({
      course_id: courseId,
      assessment_type: assessmentType,
      title: item.title,
      due_date: item.due_date,
      weight_percentage: perWeight,
    }));

    setBulkSubmitting(true);
    try {
      const response = await api.post<Assessment[]>("/assessments/bulk", { items });
      setAssessments((prev) => [...prev, ...response.data]);
      setBulkMenuOpen(false);
      toast.success("Assessments created");
    } catch (error) {
      console.error("Failed to bulk add assessments:", error);
      toast.error("Failed to bulk add assessments");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const saveGradeForAssessment = async (assessment: Assessment) => {
    const rawValue = (gradeDraftById[assessment.id] ?? "").trim();
    if (!rawValue) return;
    const parsedGrade = Number(rawValue);
    if (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
      toast.error("Grade must be between 0 and 100");
      return;
    }

    const previousAssessments = assessments;
    setAssessments((prev) =>
      prev.map((item) =>
        item.id === assessment.id
          ? {
              ...item,
              earned_score: parsedGrade,
            }
          : item,
      ),
    );

    setSavingGradeAssessmentId(assessment.id);
    try {
      const response = await api.patch<Assessment>(`/assessments/${assessment.id}`, {
        earned_score: parsedGrade,
      });
      setAssessments((prev) => prev.map((item) => (item.id === assessment.id ? response.data : item)));
    } catch (error) {
      setAssessments(previousAssessments);
      console.error("Failed to save grade:", error);
      toast.error("Failed to save grade");
    } finally {
      setSavingGradeAssessmentId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] p-6 md:p-8">
        <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-8 text-sm text-[#6C757D]">
          Loading course details...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-[1200px] p-6 md:p-8">
        <Link href="/dashboard/courses" className="text-sm font-medium text-black hover:underline">
          Back to Courses
        </Link>
        <div className="mt-4 rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-8 text-sm text-[#6C757D]">
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto w-full max-w-[1200px] space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/courses" className="text-sm font-medium text-black hover:underline">
              Back to Courses
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-black">
              {course.course_code} - {course.course_name}
            </h1>
          </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleClearAllAssessments()}
            disabled={clearingAll || uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {clearingAll ? (
              <span className="material-symbols-outlined animate-spin !text-[18px]">sync</span>
            ) : (
              <Trash2 size={16} />
            )}
            {clearingAll ? "Clearing..." : "Clear All"}
          </button>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              uploading
                ? "bg-[#F8F9FA] text-[#6C757D]"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {uploading ? (
              <span className="material-symbols-outlined animate-spin !text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined !text-[18px]">school</span>
            )}
            {uploading ? "Reading Syllabus..." : "Upload Syllabus (Waterloo Portal)"}
            <input
              type="file"
              accept=".pdf,.html,.htm,text/html,application/pdf"
              onChange={handleUploadSyllabus}
              disabled={uploading || clearingAll}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <section className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        {/* Deliverables Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/courses" className="text-[#6C757D] hover:text-black transition-colors">
              <span className="material-symbols-outlined !text-[20px]">arrow_back</span>
            </Link>
            <h2 className="text-lg font-semibold text-black">Grading Scheme</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkMenuOpen((prev) => !prev)}
              disabled={uploading || clearingAll}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm font-medium text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => void handleAddAssessment()}
              disabled={creatingAssessment || uploading || clearingAll}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} />
              {creatingAssessment ? "Adding..." : "Add"}
            </button>
            {bulkMenuOpen ? (
              <div className="absolute right-0 top-full z-10 mt-2 w-72 rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-3">
                <div className="space-y-2">
                  <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                    Base Title
                    <input
                      type="text"
                      value={bulkDraft.baseTitle}
                      onChange={(event) =>
                        setBulkDraft((prev) => ({ ...prev, baseTitle: event.target.value }))
                      }
                      className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                      Count
                      <input
                        type="number"
                        min={1}
                        step="1"
                        value={bulkDraft.count}
                        onChange={(event) =>
                          setBulkDraft((prev) => ({ ...prev, count: event.target.value }))
                        }
                        className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                      Total Weight
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={bulkDraft.totalWeight}
                        onChange={(event) =>
                          setBulkDraft((prev) => ({ ...prev, totalWeight: event.target.value }))
                        }
                        className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                    Start Date
                    <input
                      type="date"
                      value={bulkDraft.startDate}
                      onChange={(event) =>
                        setBulkDraft((prev) => ({ ...prev, startDate: event.target.value }))
                      }
                      className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[#6C757D]">
                    Frequency
                    <select
                      value={bulkDraft.frequency}
                      onChange={(event) =>
                        setBulkDraft((prev) => ({
                          ...prev,
                          frequency: event.target.value as BulkAddDraft["frequency"],
                        }))
                      }
                      className="rounded-xl border border-[#E9ECEF] bg-white px-2 py-1 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                    </select>
                  </label>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={buildPreviewItems}
                      className="text-xs font-semibold text-[#6C757D] hover:text-black"
                    >
                      Preview Schedule
                    </button>
                    <label className="flex items-center gap-2 text-[11px] text-[#6C757D]">
                      <input
                        type="checkbox"
                        checked={shiftFollowingDates}
                        onChange={(event) => setShiftFollowingDates(event.target.checked)}
                        className="h-3.5 w-3.5 accent-[#288028]"
                      />
                      Shift all following dates
                    </label>
                  </div>
                  {previewItems.length > 0 ? (
                    <div className="mt-2 max-h-40 space-y-2 overflow-auto rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-2">
                      {previewItems.map((item, index) => (
                        <div key={item.title} className="flex items-center justify-between gap-2 text-xs text-[#6C757D]">
                          <span className="truncate">{item.title}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={item.due_date}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                setPreviewItems((prev) => {
                                  const next = [...prev];
                                  const previousDate = prev[index]?.due_date;
                                  next[index] = { ...next[index], due_date: nextValue };
                                  if (shiftFollowingDates && previousDate) {
                                    const [py, pm, pd] = previousDate.split("-").map(Number);
                                    const [ny, nm, nd] = nextValue.split("-").map(Number);
                                    const prevDate = new Date(py, (pm || 1) - 1, pd || 1);
                                    const newDate = new Date(ny, (nm || 1) - 1, nd || 1);
                                    const deltaDays = Math.round(
                                      (newDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
                                    );
                                    for (let i = index + 1; i < next.length; i += 1) {
                                      const [iy, im, id] = next[i].due_date.split("-").map(Number);
                                      const base = new Date(iy, (im || 1) - 1, id || 1);
                                      base.setDate(base.getDate() + deltaDays);
                                      const localDate = new Date(
                                        base.getTime() - base.getTimezoneOffset() * 60 * 1000,
                                      )
                                        .toISOString()
                                        .split("T")[0];
                                      next[i] = { ...next[i], due_date: localDate };
                                    }
                                  }
                                  return next;
                                });
                              }}
                              className={`w-32 rounded-xl border px-2 py-0.5 text-xs text-[#6C757D] outline-none ${
                                isReadingWeekDate(item.due_date)
                                  ? "border-amber-300 bg-amber-50 text-amber-700"
                                  : "border-[#E9ECEF] bg-white"
                              }`}
                            />
                            {isReadingWeekDate(item.due_date) ? (
                              <span className="text-[10px] font-semibold text-amber-700">RW</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkMenuOpen(false)}
                    className="rounded-xl border border-[#E9ECEF] bg-white px-3 py-1 text-xs font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleBulkGenerate()}
                    disabled={bulkSubmitting}
                    className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bulkSubmitting ? "Creating..." : "Confirm & Create"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {sortedAssessments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <span className="material-symbols-outlined !text-4xl text-[#CED4DA]">assignment</span>
            <p className="mt-3 text-sm text-[#6C757D]">
              No assessments found. Upload a syllabus or add items to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* === KPI Cards Row === */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* 1. Overall Average Card with Progress Ring */}
              <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-md">
                <h3 className="text-sm font-semibold text-[#6C757D] mb-4">Overall Average</h3>
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="h-40 w-40">
                    <circle cx="60" cy="60" r="52" fill="transparent" stroke="#E9ECEF" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52"
                      fill="transparent"
                      stroke="#288028"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={
                        summary.currentAverage === null
                          ? 2 * Math.PI * 52
                          : 2 * Math.PI * 52 - (2 * Math.PI * 52 * Math.min(summary.currentAverage, 100)) / 100
                      }
                      className="transition-all duration-700"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-black">
                      {summary.currentAverage === null ? "--" : `${summary.currentAverage.toFixed(1)}`}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-[#6C757D]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#6C757D]">Target</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={targetGradeInput}
                      onChange={(event) => setTargetGradeInput(event.target.value)}
                      className="w-16 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] px-2 py-1 text-center text-xs font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                    />
                    <span>%</span>
                  </div>
                  {hasQuizzes && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6C757D]">Drop</span>
                      <input
                        type="number"
                        min={0}
                        max={Math.max(
                          0,
                          assessments.filter(
                            (item) =>
                              String(item.assessment_type || "").trim().toLowerCase() === "quiz" &&
                              item.earned_score !== null &&
                              item.earned_score !== undefined,
                          ).length,
                        )}
                        step="1"
                        value={dropLowestQuizCount}
                        onChange={(event) => setDropLowestQuizCount(event.target.value)}
                        className="w-12 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] px-2 py-1 text-center text-xs font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[10px] text-[#ADB5BD] text-center leading-relaxed">
                  note that this is an approximation based on {summary.gradedWeight.toFixed(0)}% of graded coursework
                </p>
              </div>

              {/* 2. Grade Calculator Card */}
              <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 transition-all duration-200 hover:shadow-md">
                <h3 className="text-sm font-semibold text-[#6C757D] mb-4">Enter Specific Grade (%)</h3>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={whatIfGrade}
                  onChange={(event) => setWhatIfGrade(event.target.value)}
                  placeholder="e.g. 85"
                  className="w-full rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] px-4 py-3 text-lg font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 placeholder:text-[#CED4DA] transition-colors"
                />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[100, 90, 80, 70, 60, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWhatIfGrade(String(pct))}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        whatIfGrade === String(pct)
                          ? "border-[#288028] bg-[#e8f5e8] text-[#288028]"
                          : "border-[#E9ECEF] bg-white text-[#6C757D] hover:bg-[#F8F9FA] hover:text-black"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD]">Desired Average</p>
                  <p className="mt-1 text-lg font-bold text-black">
                    {summary.whatIfAverage !== null
                      ? `${summary.whatIfAverage.toFixed(1)}%`
                      : summary.remainingScaledWeight <= 0
                        ? "All graded"
                        : "Enter a grade above"}
                  </p>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      summary.requiredRemainingAverage !== null && summary.requiredRemainingAverage > 100
                        ? "text-red-600"
                        : summary.requiredRemainingAverage !== null && summary.requiredRemainingAverage < 50
                          ? "text-[#288028]"
                          : "text-[#6C757D]"
                    }`}
                  >
                    {Number.isNaN(summary.targetGrade)
                      ? "Enter a valid target grade."
                      : summary.remainingScaledWeight <= 0
                        ? "All assessments graded."
                        : summary.requiredRemainingAverage === null
                          ? "Need more graded items."
                          : (
                            <>
                              You need <span className="font-semibold text-black">{summary.requiredRemainingAverage.toFixed(1)}%</span> on remaining work to reach <span className="font-semibold text-black">{summary.targetGrade}%</span>.
                            </>
                          )}
                  </p>
                  {summary.droppedWeight > 0 ? (
                    <p className="mt-1 text-[11px] italic text-[#ADB5BD]">
                      {summary.droppedWeight.toFixed(1)}% dropped. Scaled by {summary.multiplier.toFixed(3)}x.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 3. Projections Card (Min / What-If / Max) */}
              <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 transition-all duration-200 hover:shadow-md">
                <h3 className="text-sm font-semibold text-[#6C757D] mb-6">Projections</h3>
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD]">Min Projection</p>
                    <p className="mt-1 text-3xl font-bold text-black">
                      {summary.gradedWeight > 0 ? `${summary.minProjection.toFixed(1)}%` : "--%"}
                    </p>
                    <p className="mt-1 text-xs text-[#6C757D]">
                      Assuming 0% on all remaining assessments
                    </p>
                  </div>
                  {summary.whatIfProjection !== null && (
                    <div className="rounded-xl border border-[#288028]/30 bg-[#e8f5e8] p-5 transition-all duration-200">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#288028]/60">Your Projection</p>
                      <p className="mt-1 text-3xl font-bold text-[#288028]">
                        {summary.whatIfProjection.toFixed(1)}%
                      </p>
                      <p className="mt-1 text-xs text-[#288028]/80">
                        Assuming {whatIfGrade}% on all remaining assessments
                      </p>
                    </div>
                  )}
                  <div className="rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD]">Max Projection</p>
                    <p className="mt-1 text-3xl font-bold text-black">
                      {summary.gradedWeight > 0 ? `${summary.maxProjection.toFixed(1)}%` : "--%"}
                    </p>
                    <p className="mt-1 text-xs text-[#6C757D]">
                      Assuming 100% on all remaining assessments
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E9ECEF]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6C757D]">Graded Weight</span>
                    <span className="font-semibold text-black">{summary.gradedWeight.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[#6C757D]">Remaining Weight</span>
                    <span className="font-semibold text-black">{summary.remainingScaledWeight.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[#6C757D]">Projected Total</span>
                    <span className="font-semibold text-black">{summary.projectedTotal.toFixed(1)} / 100</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Table Header */}
            <div className="grid grid-cols-12 items-center gap-4 px-6 py-3 border-b border-[#E9ECEF] bg-[#F8F9FA] rounded-t-xl">
              <div className="col-span-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Name</span>
              </div>
              <div className="col-span-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Due Date</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Weight</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Grade</span>
              </div>
              <div className="col-span-1 text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ADB5BD]">Actions</span>
              </div>
            </div>

            {/* Table Rows */}
            {sortedAssessments.map((assessment, index) => (
              (() => {
                const isEditing = editingAssessmentId === assessment.id;
                const isDropped = droppedQuizAssessmentIds.has(assessment.id);
                const originalWeight = Number(assessment.weight_percentage || 0);
                const scaledWeight = Number(summary.scaledWeightById[assessment.id] ?? originalWeight);
                const displayWeight =
                  summary.droppedWeight > 0 ? (isDropped ? 0 : scaledWeight) : originalWeight;
                const styleTarget: Assessment = isEditing
                  ? {
                      ...assessment,
                      assessment_type: editDraft.assessment_type || assessment.assessment_type,
                    }
                  : assessment;
                const style = getAssessmentStyle(styleTarget);

                return isEditing ? (
                  /* ===== EDITING ROW ===== */
                  <div
                    key={assessment.id}
                    className={`px-6 py-5 ${index !== sortedAssessments.length - 1 ? "border-b border-[#E9ECEF]" : ""} bg-[#F8F9FA]/50`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={editDraft.title}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, title: event.target.value }))}
                        className="flex-1 min-w-[200px] rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm font-semibold text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                      <select
                        value={editDraft.assessment_type}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, assessment_type: event.target.value }))}
                        className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide outline-none ${style.badgeClass}`}
                      >
                        <option value="quiz">quiz</option>
                        <option value="midterm">midterm</option>
                        <option value="exam">exam</option>
                      </select>
                      <input
                        type="date"
                        value={editDraft.due_date}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, due_date: event.target.value }))}
                        className="rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          value={editDraft.weight_percentage}
                          onChange={(event) => setEditDraft((prev) => ({ ...prev, weight_percentage: event.target.value }))}
                          className="w-20 rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-xs text-[#6C757D] outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20"
                        />
                        <span className="text-xs text-[#6C757D]">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void saveAssessmentEdits(assessment)}
                        disabled={savingAssessmentId === assessment.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#288028] text-white transition-all duration-200 hover:bg-[#1f6b1f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingAssessmentId === assessment.id ? (
                          <span className="material-symbols-outlined animate-spin !text-[16px]">sync</span>
                        ) : (
                          <Check size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingAssessment}
                        disabled={savingAssessmentId === assessment.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E9ECEF] bg-white text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ===== DISPLAY ROW ===== */
                  <div
                    key={assessment.id}
                    className={`grid grid-cols-12 items-center gap-4 px-6 py-5 ${index !== sortedAssessments.length - 1 ? "border-b border-[#E9ECEF]" : ""} hover:bg-[#F8F9FA]/50 transition-colors ${isDropped ? "opacity-40" : ""}`}
                  >
                    {/* Name */}
                    <div className="col-span-5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="truncate text-sm font-semibold text-black">{assessment.title}</p>
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.badgeClass} ${isDropped ? "grayscale" : ""}`}
                        >
                          {assessment.assessment_type}
                        </span>
                        {isDropped ? (
                          <span className="inline-flex shrink-0 rounded-full bg-[#F8F9FA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6C757D]">
                            Dropped
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-3">
                      <p className="text-sm text-[#6C757D]">{formatDate(assessment.due_date)}</p>
                    </div>

                    {/* Weight */}
                    <div className="col-span-1 text-center">
                      <span
                        className={`text-sm font-semibold ${isDropped ? "line-through text-red-600" : "text-black"}`}
                      >
                        {displayWeight.toFixed(1).replace(/\.0$/, "")}%
                      </span>
                    </div>

                    {/* Grade */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={gradeDraftById[assessment.id] ?? ""}
                        onChange={(event) =>
                          setGradeDraftById((prev) => ({
                            ...prev,
                            [assessment.id]: event.target.value,
                          }))
                        }
                        onBlur={() => void saveGradeForAssessment(assessment)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            (event.currentTarget as HTMLInputElement).blur();
                          }
                        }}
                        className={`w-16 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-colors ${
                          isDropped ? "line-through text-red-600" : "text-black"
                        }`}
                        placeholder="--"
                      />
                      <span className="text-sm text-[#6C757D]">%</span>
                      {savingGradeAssessmentId === assessment.id ? (
                        <span className="material-symbols-outlined animate-spin text-[#6C757D] !text-[14px]">sync</span>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${assessment.title}`}
                        disabled={deletingAssessmentId === assessment.id || savingAssessmentId === assessment.id}
                        onClick={() => startEditingAssessment(assessment)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#CED4DA] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${assessment.title}`}
                        disabled={deletingAssessmentId === assessment.id || savingAssessmentId === assessment.id}
                        onClick={() => void handleDeleteAssessment(assessment.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#CED4DA] transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })()
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
