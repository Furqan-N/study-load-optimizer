"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRelativeDateLabel } from "@/app/utils/dateHelpers";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { persistSelectedTermId } from "@/lib/selectedTermStorage";

type Course = {
  id: string;
  term_id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade?: string | number;
  daily_target_hours?: number | null;
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

type StudySession = {
  id: string;
  course_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_completed: boolean;
};

type StudySessionForm = {
  course_id: string;
  title: string;
  date: string;
  start_time: string;
  duration_minutes: string;
};

type CourseStudyTime = {
  course_id: string;
  hours: number;
};

type CourseForm = {
  course_code: string;
  course_name: string;
  credits: string;
};

type AssessmentForm = {
  course_id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  weight_percentage: string;
};

type Term = {
  id: string;
  season: "Winter" | "Spring" | "Fall";
  year: number;
  is_current: boolean;
  is_archived: boolean;
  course_count: number;
  status: "Active" | "Archived";
  sort_order: number;
};

function getSeasonIcon(season: string): string {
  switch (season) {
    case "Winter":
      return "ac_unit";
    case "Fall":
      return "park";
    case "Spring":
      return "light_mode";
    default:
      return "calendar_today";
  }
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString.replace(/-/g, "/"));
  }
  return new Date(dateString);
}

function getDueText(dateString: string) {
  return getRelativeDateLabel(dateString);
}

function formatDueDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatSessionTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function getCurrentWeekDates(weekOffset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [courseStudyTime, setCourseStudyTime] = useState<CourseStudyTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showPacingModal, setShowPacingModal] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [termForm, setTermForm] = useState<{ season: Term["season"]; year: string }>({ season: "Fall", year: String(new Date().getFullYear()) });
  const [termSubmitting, setTermSubmitting] = useState(false);
  const [isEditTermModalOpen, setIsEditTermModalOpen] = useState(false);
  const [editTermId, setEditTermId] = useState<string | null>(null);
  const [editTermForm, setEditTermForm] = useState<{ season: Term["season"]; year: string; is_archived: boolean }>({ season: "Fall", year: "", is_archived: false });
  const [editTermCourseIds, setEditTermCourseIds] = useState<Set<string>>(new Set());
  const [editTermSubmitting, setEditTermSubmitting] = useState(false);
  const [editTermNewCourses, setEditTermNewCourses] = useState<Array<{ course_code: string; course_name: string; credits: string; target_grade: string }>>([]);
  const [dragTermId, setDragTermId] = useState<string | null>(null);
  const [dragOverTermId, setDragOverTermId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [questText, setQuestText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [pomodoroDurationMinutes, setPomodoroDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerCourseId, setTimerCourseId] = useState("");
  const [sessionForm, setSessionForm] = useState<StudySessionForm>({
    course_id: "",
    title: "",
    date: "",
    start_time: "",
    duration_minutes: "60",
  });
  const [courseForm, setCourseForm] = useState<CourseForm>({
    course_code: "",
    course_name: "",
    credits: "0.5",
  });
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>({
    course_id: "",
    title: "",
    assessment_type: "Exam",
    due_date: "",
    weight_percentage: "10",
  });
  const [newDeadline, setNewDeadline] = useState({
    title: "",
    course_id: "",
    due_date: "",
    weight_percentage: 0,
    assessment_type: "Assignment",
  });
  const [quickStudy, setQuickStudy] = useState({ course_id: "", duration_minutes: 60 });
  const [gradeAssessmentId, setGradeAssessmentId] = useState("");
  const [earnedScore, setEarnedScore] = useState<number | "">("");
  const [pacingTargetInput, setPacingTargetInput] = useState("4.0");

  const fetchDashboardData = useCallback(async () => {
    try {
      const [coursesResponse, assessmentsResponse, studySessionsResponse] = await Promise.all([
        api.get<Course[]>("/courses/"),
        api.get<Assessment[]>("/assessments/"),
        api.get<StudySession[]>("/study-sessions/"),
      ]);

      setCourses(coursesResponse.data);
      setAssessments(assessmentsResponse.data);
      setStudySessions(studySessionsResponse.data);

      try {
        const studyTimeResponse = await api.get<CourseStudyTime[]>("/analytics/study-time");
        setCourseStudyTime(studyTimeResponse.data || []);
      } catch (error) {
        console.warn("Failed to load course study time analytics (non-blocking):", error);

        const now = new Date();
        const weekStart = startOfDay(new Date(now));
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = startOfDay(new Date(weekStart));
        weekEnd.setDate(weekStart.getDate() + 7);

        const minutesByCourseId = studySessionsResponse.data.reduce<Record<string, number>>(
          (acc, session) => {
            const start = new Date(session.start_time);
            if (start >= weekStart && start < weekEnd) {
              acc[session.course_id] = (acc[session.course_id] ?? 0) + Number(session.duration_minutes || 0);
            }
            return acc;
          },
          {},
        );

        setCourseStudyTime(
          (coursesResponse.data || []).map((course) => ({
            course_id: course.id,
            hours: Number(((minutesByCourseId[course.id] ?? 0) / 60).toFixed(1)),
          })),
        );
      }

      // Fetch terms and auto-select the current one (or first) if nothing is selected yet.
      try {
        const termsResponse = await api.get<Term[]>("/terms/");
        const fetchedTerms: Term[] = termsResponse.data || [];
        setTerms(fetchedTerms);
        setSelectedTermId((prev) => {
          if (prev && fetchedTerms.some((t) => t.id === prev)) return prev;
          const current = fetchedTerms.find((t) => t.is_current);
          return current?.id ?? fetchedTerms[0]?.id ?? null;
        });
      } catch {
        setTerms([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    persistSelectedTermId(selectedTermId);
    window.dispatchEvent(new CustomEvent("term-selected", { detail: selectedTermId }));
  }, [selectedTermId]);

  useEffect(() => {
    const handleAssessmentsUpdated = () => {
      void fetchDashboardData();
    };
    window.addEventListener("assessments-updated", handleAssessmentsUpdated);
    return () => {
      window.removeEventListener("assessments-updated", handleAssessmentsUpdated);
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!timerCourseId && courses.length > 0) {
      setTimerCourseId(courses[0].id);
    }
  }, [courses, timerCourseId]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      void handleTimerComplete();
    }
  }, [isRunning, timeLeft]);

  useEffect(() => {
    setTimeLeft(pomodoroDurationMinutes * 60);
  }, [pomodoroDurationMinutes]);

  const courseMap = useMemo(() => {
    return courses.reduce<Record<string, Course>>((acc, course) => {
      acc[course.id] = course;
      return acc;
    }, {});
  }, [courses]);

  // Filter courses + assessments + sessions by selected term
  const filteredCourses = useMemo(() => {
    if (!selectedTermId) return courses;
    return courses.filter((c) => c.term_id === selectedTermId);
  }, [courses, selectedTermId]);

  const filteredCourseIds = useMemo(() => new Set(filteredCourses.map((c) => c.id)), [filteredCourses]);

  const filteredAssessments = useMemo(() => {
    if (!selectedTermId) return assessments;
    return assessments.filter((a) => filteredCourseIds.has(a.course_id));
  }, [assessments, selectedTermId, filteredCourseIds]);

  const filteredStudySessions = useMemo(() => {
    if (!selectedTermId) return studySessions;
    return studySessions.filter((s) => filteredCourseIds.has(s.course_id));
  }, [studySessions, selectedTermId, filteredCourseIds]);

  const studyTimeByCourseId = useMemo(() => {
    return courseStudyTime.reduce<Record<string, number>>((acc, entry) => {
      const id = String(entry.course_id || "").trim();
      if (!id) return acc;
      acc[id] = Number(entry.hours || 0);
      return acc;
    }, {});
  }, [courseStudyTime]);

  const maxCourseHoursRaw = useMemo(() => {
    return filteredCourses.reduce((acc, course) => Math.max(acc, studyTimeByCourseId[course.id] ?? 0), 0);
  }, [filteredCourses, studyTimeByCourseId]);

  const maxCourseHours = maxCourseHoursRaw > 0 ? maxCourseHoursRaw : 1;

  const upcomingDeadlines = useMemo(() => {
    const today = startOfDay(new Date());
    const inSevenDays = startOfDay(new Date());
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    return filteredAssessments
      .filter((assessment) => !assessment.is_completed)
      .filter((assessment) => assessment.earned_score === null || assessment.earned_score === undefined)
      .filter((assessment) => {
        const dueDate = startOfDay(parseLocalDate(assessment.due_date));
        return dueDate >= today && dueDate <= inSevenDays;
      })
      .sort((a, b) => parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime())
      .slice(0, 5);
  }, [filteredAssessments]);

  const todaysSessions = useMemo(() => {
    const todayKey = toLocalDateKey(new Date());
    return filteredStudySessions
      .filter((session) => !session.is_completed)
      .filter((session) => toLocalDateKey(new Date(session.start_time)) === todayKey)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [filteredStudySessions]);

  const calendarDays = useMemo(() => getCurrentWeekDates(weekOffset), [weekOffset]);
  const HOURS_PER_CREDIT_MULTIPLIER = 24 / 18;
  const totalCredits = filteredCourses.reduce((sum, course) => sum + course.credits, 0);
  const expectedWeeklyMinutes = totalCredits > 0 ? totalCredits * HOURS_PER_CREDIT_MULTIPLIER * 60 : 1;
  const targetCourse = filteredCourses.length > 0 ? filteredCourses[0] : null;
  const dailyTargetHours = Number(targetCourse?.daily_target_hours ?? 4.0);

  const now = new Date();
  const weekStart = startOfDay(new Date(now));
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = startOfDay(new Date(weekStart));
  weekEnd.setDate(weekStart.getDate() + 7);

  const thisWeekSessions = filteredStudySessions.filter((session) => {
    const start = new Date(session.start_time);
    return start >= weekStart && start < weekEnd;
  });
  const thisWeekMinutes = thisWeekSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const thisWeekHours = (thisWeekMinutes / 60).toFixed(1);
  const lastWeekStart = startOfDay(new Date(weekStart));
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekSessions = filteredStudySessions.filter((session) => {
    const start = new Date(session.start_time);
    return start >= lastWeekStart && start < weekStart;
  });
  const lastWeekMinutes = lastWeekSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const weeklyDiffHours = ((thisWeekMinutes - lastWeekMinutes) / 60).toFixed(1);
  const diffColor = Number(weeklyDiffHours) >= 0 ? "text-black" : "text-[#6C757D]";
  const diffSign = Number(weeklyDiffHours) > 0 ? "+" : "";
  const diffIcon = Number(weeklyDiffHours) >= 0 ? "trending_up" : "trending_down";
  const workloadPercentage = Math.min(
    100,
    Math.round((thisWeekMinutes / expectedWeeklyMinutes) * 100),
  );

  const todaysMinutes = todaysSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const remainingDailyHours = Math.max(0, 6 - todaysMinutes / 60).toFixed(1);

  const gaugeCircumference = 364.42;
  const gaugeOffset = gaugeCircumference - (gaugeCircumference * workloadPercentage) / 100;

  const actualHours = Number((thisWeekMinutes / 60).toFixed(1));
  const plannedHours = Number((totalCredits * HOURS_PER_CREDIT_MULTIPLIER).toFixed(1));
  const safePlannedHours = plannedHours > 0 ? plannedHours : 1;
  const efficiency = actualHours <= 0 ? 0 : Math.min(100, Math.round((actualHours / safePlannedHours) * 100));
  const hasLoggedThisWeek = thisWeekSessions.length > 0;
  const daysElapsedThisWeek = Math.min(
    7,
    Math.max(1, Math.floor((startOfDay(new Date()).getTime() - weekStart.getTime()) / MS_PER_DAY) + 1),
  );
  const expectedByNow = (safePlannedHours / 7) * daysElapsedThisWeek;
  const showInitialNeutral = !hasLoggedThisWeek && actualHours === 0;
  const isBehindDailyTarget = !showInitialNeutral && actualHours < expectedByNow;
  const debtDisplay = showInitialNeutral
    ? "0h balance"
    : isBehindDailyTarget
      ? `-${(expectedByNow - actualHours).toFixed(1)}h behind`
      : `+${(actualHours - expectedByNow).toFixed(1)}h ahead`;
  const debtColorClass = showInitialNeutral
    ? "text-[#6C757D]"
    : isBehindDailyTarget
      ? "text-[#6C757D]"
      : "text-black";
  const debtStatusLabel = showInitialNeutral
    ? "NEUTRAL"
    : isBehindDailyTarget
      ? "ACTION REQUIRED"
      : "ON TRACK";

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  // KPI: Term Average
  const totalTargetCredits = filteredCourses.reduce((acc, curr) => acc + Number(curr.credits || 0), 0);
  const weightedTargetSum = filteredCourses.reduce(
    (acc, curr) => acc + Number(curr.target_grade || 0) * Number(curr.credits || 0),
    0,
  );
  const targetGPA = totalTargetCredits > 0 ? Math.round(weightedTargetSum / totalTargetCredits) : 0;
  const gradedAssessments = filteredAssessments.filter(
    (a) => a.is_completed && a.earned_score !== null && a.earned_score !== undefined,
  );
  let totalEarned = 0;
  let totalWeight = 0;
  gradedAssessments.forEach((a) => {
    totalEarned += a.earned_score! * (a.weight_percentage / 100);
    totalWeight += a.weight_percentage;
  });
  const currentGPA: number | null = totalWeight > 0 ? Math.round((totalEarned / totalWeight) * 100) : null;

  // KPI: Deliverables Due (next 7 days)
  const deliverablesDue = filteredAssessments.filter((assessment) => {
    if (assessment.is_completed) return false;
    const dueDate = parseLocalDate(assessment.due_date);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  const badgeConfig =
    workloadPercentage < 50
      ? { label: "Light", className: "bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D]", dotClass: "bg-[#6C757D]", pace: "light" }
      : workloadPercentage <= 85
        ? { label: "Balanced", className: "bg-[#F8F9FA] border border-[#E9ECEF] text-black", dotClass: "bg-[#288028]", pace: "sustainable" }
        : { label: "Heavy", className: "bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D]", dotClass: "bg-[#6C757D]", pace: "heavy" };

  useEffect(() => {
    if (!showPacingModal) {
      setPacingTargetInput(dailyTargetHours.toFixed(1));
    }
  }, [dailyTargetHours, showPacingModal]);

  const closeSessionModal = () => {
    if (submitting) return;
    setIsSessionModalOpen(false);
    setSessionForm({
      course_id: "",
      title: "",
      date: "",
      start_time: "",
      duration_minutes: "60",
    });
  };

  const closeCourseModal = () => {
    if (submitting) return;
    setIsCourseModalOpen(false);
    setCourseForm({
      course_code: "",
      course_name: "",
      credits: "0.5",
    });
  };

  const closeAssessmentModal = () => {
    if (submitting) return;
    setIsAssessmentModalOpen(false);
    setAssessmentForm({
      course_id: "",
      title: "",
      assessment_type: "Exam",
      due_date: "",
      weight_percentage: "10",
    });
  };

  const closeQuestModal = () => {
    if (isImporting) return;
    setIsQuestModalOpen(false);
    setQuestText("");
  };

  const handleCreateSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const [year, month, day] = sessionForm.date.split("-").map(Number);
      const [hours, minutes] = sessionForm.start_time.split(":").map(Number);
      const durationMinutes = Number(sessionForm.duration_minutes);

      const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

      const payload = {
        course_id: sessionForm.course_id,
        title: sessionForm.title.trim(),
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_minutes: durationMinutes,
      };

      const response = await api.post<StudySession>("/study-sessions/", payload);
      setStudySessions((prev) => [response.data, ...prev]);
      closeSessionModal();
    } catch (error) {
      console.error("Failed to create study session:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTarget = async (value: number) => {
    if (!targetCourse) {
      throw new Error("No course available to persist daily target.");
    }
    if (Number.isNaN(value) || value < 0 || value > 12) {
      return;
    }

    try {
      await api.patch<Course>(`/courses/${targetCourse.id}`, {
        daily_target_hours: value,
      });
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to update daily target:", error);
      throw error;
    }
  };

  const handleSubmitPacingTarget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(pacingTargetInput);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 12) {
      alert("Please enter a target between 0 and 12 hours.");
      return;
    }
    if (!targetCourse) {
      alert("Add at least one course before setting a daily target.");
      return;
    }

    try {
      await handleSaveTarget(parsed);
      setShowPacingModal(false);
    } catch {
      alert("Failed to update pacing target. Please try again.");
    }
  };

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTermId) return;
    setSubmitting(true);

    try {
      await api.post("/courses/", {
        term_id: selectedTermId,
        course_code: courseForm.course_code.trim(),
        course_name: courseForm.course_name.trim(),
        credits: Number(courseForm.credits),
      });
      closeCourseModal();
      await fetchDashboardData();
      window.dispatchEvent(new Event("courses-updated"));
    } catch (error) {
      console.error("Failed to create course:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAssessment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/assessments/", {
        course_id: assessmentForm.course_id,
        title: assessmentForm.title.trim(),
        assessment_type: assessmentForm.assessment_type,
        due_date: assessmentForm.due_date,
        weight_percentage: Number(assessmentForm.weight_percentage),
      });
      closeAssessmentModal();
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to create assessment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeTermModal = () => {
    setIsTermModalOpen(false);
    setTermForm({ season: "Fall", year: String(new Date().getFullYear()) });
  };

  const handleCreateTerm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedYear = Number(termForm.year);
    if (!Number.isFinite(parsedYear) || parsedYear < 2000 || parsedYear > 2100) return;

    setTermSubmitting(true);
    try {
      const response = await api.post<Term>("/terms/", { season: termForm.season, year: parsedYear });
      closeTermModal();
      // Auto-select the newly created term
      if (response.data?.id) {
        setSelectedTermId(response.data.id);
      }
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to create term:", error);
    } finally {
      setTermSubmitting(false);
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    const term = terms.find((t) => t.id === termId);
    if (!term) return;
    const confirmed = window.confirm(
      `Delete ${term.season} '${String(term.year).slice(2)}? This will also remove all courses in this term.`
    );
    if (!confirmed) return;
    try {
      await api.delete(`/terms/${termId}`);
      if (selectedTermId === termId) setSelectedTermId(null);
      await fetchDashboardData();
      window.dispatchEvent(new Event("courses-updated"));
    } catch (error) {
      console.error("Failed to delete term:", error);
    }
  };

  const handleTermDrop = async (targetTermId: string) => {
    if (!dragTermId || dragTermId === targetTermId) {
      setDragTermId(null);
      setDragOverTermId(null);
      return;
    }
    const oldIndex = terms.findIndex((t) => t.id === dragTermId);
    const newIndex = terms.findIndex((t) => t.id === targetTermId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...terms];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setTerms(reordered);
    setDragTermId(null);
    setDragOverTermId(null);

    try {
      const response = await api.put<Term[]>("/terms/reorder", {
        term_ids: reordered.map((t) => t.id),
      });
      setTerms(response.data);
    } catch (error) {
      console.error("Failed to reorder terms:", error);
      await fetchDashboardData();
    }
  };

  const openEditTermModal = (termId: string) => {
    const term = terms.find((t) => t.id === termId);
    if (!term) return;
    setEditTermId(termId);
    setEditTermForm({ season: term.season, year: String(term.year), is_archived: term.is_archived });
    // Pre-select courses currently assigned to this term
    const assigned = courses.filter((c) => c.term_id === termId).map((c) => c.id);
    setEditTermCourseIds(new Set(assigned));
    setEditTermNewCourses([]);
    setIsEditTermModalOpen(true);
  };

  const closeEditTermModal = () => {
    setIsEditTermModalOpen(false);
    setEditTermId(null);
    setEditTermNewCourses([]);
  };

  const handleEditTerm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTermId) return;
    const parsedYear = Number(editTermForm.year);
    if (!Number.isFinite(parsedYear) || parsedYear < 2000 || parsedYear > 2100) return;

    setEditTermSubmitting(true);
    try {
      // Update the term name (season + year)
      await api.patch(`/terms/${editTermId}`, { season: editTermForm.season, year: parsedYear, is_archived: editTermForm.is_archived });

      // Delete courses that were unchecked (removed from this term)
      const originalIds = courses.filter((c) => c.term_id === editTermId).map((c) => c.id);
      const removedIds = originalIds.filter((id) => !editTermCourseIds.has(id));
      const promises: Promise<unknown>[] = [];
      for (const courseId of removedIds) {
        promises.push(api.delete(`/courses/${courseId}`));
      }

      // Create new courses added inline
      for (const nc of editTermNewCourses) {
        if (nc.course_code.trim() && nc.course_name.trim()) {
          promises.push(api.post("/courses/", {
            course_code: nc.course_code.trim(),
            course_name: nc.course_name.trim(),
            credits: Number(nc.credits) || 3,
            target_grade: nc.target_grade || "A",
            term_id: editTermId,
          }));
        }
      }

      await Promise.all(promises);
      closeEditTermModal();
      await fetchDashboardData();
      window.dispatchEvent(new Event("courses-updated"));
    } catch (error) {
      console.error("Failed to update term:", error);
    } finally {
      setEditTermSubmitting(false);
    }
  };

  const handleImportQuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsImporting(true);

    try {
      const regex = /([A-Z]{2,4}\s+\d{3}[A-Z]?)\s+-\s+([^\n]+)/g;
      const matches = [...questText.matchAll(regex)];
      const seenCourseCodes = new Set<string>();
      const parsedCourses: Array<{ course_code: string; course_name: string; credits: number; target_grade: string }> = [];

      for (const match of matches) {
        const course_code = (match[1] ?? "").trim().replace(/\s+/g, " ");
        const course_name = (match[2] ?? "").trim();

        if (!course_code || !course_name || seenCourseCodes.has(course_code)) {
          continue;
        }

        seenCourseCodes.add(course_code);
        parsedCourses.push({
          course_code,
          course_name,
          credits: 0.5,
          target_grade: "85",
        });
      }

      if (parsedCourses.length === 0) {
        alert("No courses found. Please make sure you copied the List View from Quest.");
        return;
      }

      await Promise.all(parsedCourses.map((course) => api.post("/courses/", course)));

      closeQuestModal();
      setQuestText("");
      await fetchDashboardData();
      window.dispatchEvent(new Event("courses-updated"));
      alert(`Imported ${parsedCourses.length} course${parsedCourses.length === 1 ? "" : "s"}.`);
    } catch (error) {
      console.error("Failed to import courses from Quest:", error);
      alert("Failed to import courses. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleOptimizeSchedule = async () => {
    try {
      setIsOptimizing(true);
      const response = await api.post<{ message?: string }>("/plan/generate");
      await fetchDashboardData();
      alert(response.data?.message ?? "Schedule optimized!");
    } catch (error) {
      console.error("Failed to optimize schedule:", error);
      alert("Failed to optimize schedule. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setIsOptimized(false);

    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);

      setTimeout(() => {
        setIsOptimized(false);
      }, 3000);
    }, 2000);
  };

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newDeadline.title.trim(),
        course_id: newDeadline.course_id,
        assessment_type: newDeadline.assessment_type.trim(),
        weight_percentage: Number(newDeadline.weight_percentage),
        due_date: newDeadline.due_date,
      };

      await api.post("/assessments/", payload);
      await fetchDashboardData();
      setShowDeadlineModal(false);
      setNewDeadline({
        title: "",
        course_id: "",
        due_date: "",
        weight_percentage: 0,
        assessment_type: "Assignment",
      });
    } catch (error: any) {
      console.error("Failed to create deadline:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((err: any) => `${err.loc?.[err.loc.length - 1]}: ${err.msg}`)
          .join("\n");
        alert(`Backend rejected the data:\n${messages}`);
      } else if (detail) {
        alert(`Failed to save: ${JSON.stringify(detail)}`);
      } else {
        alert(`Failed to save: ${error?.message ?? "Unknown error"}`);
      }
    }
  };

  const handleQuickStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStudy.course_id) {
      alert("Please select a course.");
      return;
    }

    try {
      const end_time = new Date();
      const start_time = new Date(Date.now() - Number(quickStudy.duration_minutes) * 60000);
      const payload = {
        title: "Manual Study Session",
        course_id: quickStudy.course_id,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        duration_minutes: Number(quickStudy.duration_minutes),
        is_completed: true,
      };

      await api.post("/study-sessions/", payload);
      await fetchDashboardData();
      setShowStudyModal(false);
      setQuickStudy({ course_id: "", duration_minutes: 60 });
    } catch (error: any) {
      console.error("Failed to create quick study session:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((err: any) => `${err.loc?.[err.loc.length - 1]}: ${err.msg}`)
          .join("\n");
        alert(`Backend rejected the data:\n${messages}`);
      } else if (detail) {
        alert(`Failed to save: ${JSON.stringify(detail)}`);
      } else {
        alert(`Failed to save: ${error?.message ?? "Unknown error"}`);
      }
    }
  };

  const handleLogGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeAssessmentId) {
      alert("Please select an assessment.");
      return;
    }
    if (earnedScore === "") {
      alert("Please enter a score.");
      return;
    }

    try {
      await api.patch(`/assessments/${gradeAssessmentId}/toggle-complete`, {
        earned_score: Number(earnedScore),
      });
      await fetchDashboardData();
      setShowGradeModal(false);
      setGradeAssessmentId("");
      setEarnedScore("");
    } catch (error: any) {
      console.error("Failed to log grade:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((err: any) => `${err.loc?.[err.loc.length - 1]}: ${err.msg}`)
          .join("\n");
        alert(`Backend rejected the data:\n${messages}`);
      } else if (detail) {
        alert(`Failed to save: ${JSON.stringify(detail)}`);
      } else {
        alert(`Failed to save: ${error?.message ?? "Unknown error"}`);
      }
    }
  };

  const toggleAssessment = async (id: string) => {
    try {
      await api.patch(`/assessments/${id}/toggle-complete`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to toggle assessment:", error);
    }
  };

  const toggleSession = async (id: string) => {
    try {
      await api.patch(`/study-sessions/${id}/toggle-complete`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to toggle session:", error);
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this deadline?");
      if (!confirmed) return;
      await api.delete(`/assessments/${id}`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to delete assessment:", error);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this study session?");
      if (!confirmed) return;
      await api.delete(`/study-sessions/${id}`);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleTimerComplete = async () => {
    alert("Pomodoro complete! Great job.");

    try {
      if (timerCourseId) {
        const endTime = new Date();
        const durationMs = pomodoroDurationMinutes * 60 * 1000;
        const startTime = new Date(endTime.getTime() - durationMs);

        await api.post("/study-sessions/", {
          course_id: timerCourseId,
          title: "Pomodoro Session",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: pomodoroDurationMinutes,
          is_completed: true,
        });

        await fetchDashboardData();
      }
    } catch (error) {
      console.error("Failed to log pomodoro session:", error);
    } finally {
      setTimeLeft(pomodoroDurationMinutes * 60);
    }
  };

  // Shared modal/input class constants
  const inputClass = "h-10 w-full rounded-xl border border-[#E9ECEF] bg-white px-3 text-sm text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 transition-all duration-200";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#6C757D]";
  const cancelBtnClass = "h-10 rounded-xl border border-[#E9ECEF] px-4 text-sm font-medium text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] disabled:opacity-60";
  const submitBtnClass = "h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-60";
  const modalOverlayClass = "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4";
  const modalPanelClass = "w-full max-w-lg rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm";

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Hero Section: Workload Status */}
      <section className="bg-white rounded-xl p-8 border border-[#E9ECEF] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-[#E9ECEF]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-[#288028]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.42" strokeDashoffset={gaugeOffset} strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-black">{workloadPercentage}%</span>
              <span className="text-[10px] font-semibold text-[#6C757D] uppercase tracking-widest">Load</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-black">Workload Status</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-bold ${badgeConfig.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badgeConfig.dotClass}`}></span>
                {badgeConfig.label}
              </span>
            </div>
            <p className="text-[#6C757D] max-w-md">Your current study pace is {badgeConfig.pace}. You have approximately {remainingDailyHours} hours remaining today for deep work.</p>
          </div>
        </div>
        <button
          onClick={handleOptimizeSchedule}
          disabled={isOptimizing}
          className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 flex items-center gap-2 group shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">bolt</span>
          )}
          {isOptimizing ? "Optimizing..." : "Optimize My Schedule"}
        </button>
      </section>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Term Average</span>
          <p className="mt-2 text-4xl font-bold text-[#288028]">{currentGPA === null ? "--%" : `${currentGPA}%`}</p>
          <p className="mt-1 text-xs text-[#6C757D]">Target: {targetGPA > 0 ? `${targetGPA}%` : "--"}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Deliverables Due</span>
          <p className="mt-2 text-4xl font-bold text-black">{deliverablesDue}</p>
          <p className="mt-1 text-xs text-[#6C757D]">Next 7 days</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">GPA Projection</span>
          <div className="relative mt-2 flex items-center gap-3">
            <p className="text-4xl font-bold text-[#288028]">{currentGPA === null ? "--%" : `${currentGPA}%`}</p>
          </div>
          <p className="mt-1 text-xs text-[#6C757D]">Based on {gradedAssessments.length} graded items</p>
        </div>
      </div>

      {/* Course Calendar */}
      <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#288028]">calendar_month</span>
            <h3 className="text-lg font-semibold text-black">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] p-0.5">
              <button type="button" className="h-8 rounded-lg px-3 text-xs font-semibold bg-white text-black shadow-sm border border-[#E9ECEF]">Week</button>
              <button type="button" className="h-8 rounded-lg px-3 text-xs font-semibold text-[#6C757D] hover:text-black transition-colors">Month</button>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] transition-colors">
                <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
              </button>
              <Link href="/dashboard/schedule" className="h-8 rounded-lg px-3 text-xs font-semibold text-[#6C757D] hover:bg-[#F8F9FA] transition-colors flex items-center">
                Today
              </Link>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] transition-colors">
                <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-widest text-[#ADB5BD] py-2">{day}</div>
          ))}
        </div>
        {/* Calendar Week View — current week */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day) => {
            const dayKey = toLocalDateKey(day);
            const todayKey = toLocalDateKey(new Date());
            const isToday = dayKey === todayKey;
            const hasDeliverable = filteredAssessments.some((a) => {
              if (a.is_completed) return false;
              const dueKey = a.due_date.split("T")[0];
              return dueKey === dayKey;
            });
            const hasSession = filteredStudySessions.some(
              (session) => toLocalDateKey(new Date(session.start_time)) === dayKey,
            );
            const isPast = day < startOfDay(new Date());

            return (
              <div
                key={dayKey}
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-colors ${
                  isToday ? "bg-[#288028] text-white" : isPast ? "text-[#CED4DA]" : "text-black"
                }`}
              >
                <span className={`text-lg font-semibold ${isToday ? "text-white" : ""}`}>{day.getDate()}</span>
                <div className="flex items-center gap-1 mt-1 h-2">
                  {hasDeliverable ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-[#288028]"}`}></span>
                  ) : null}
                  {hasSession ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white/60" : "bg-[#ADB5BD]"}`}></span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-6 text-xs text-[#6C757D]">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#288028]"></span> Deliverable due</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ADB5BD]"></span> Study session</div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Deadlines List */}
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6C757D]">event_upcoming</span>
              Upcoming Deadlines
            </h3>
            <div className="flex items-center gap-1">
              <Link href="/dashboard/schedule" className="text-xs font-bold text-[#6C757D] hover:text-black transition-all duration-200">View All</Link>
              <button onClick={() => setIsAssessmentModalOpen(true)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">add</span></button>
            </div>
          </div>
          <div className="space-y-0 flex-1">
            {loading ? (
              <p className="text-sm text-[#6C757D]">Loading deadlines...</p>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#F8F9FA] text-sm text-[#6C757D]">
                You&apos;re all caught up! No upcoming deadlines for the next 7 days.
              </div>
            ) : (
              upcomingDeadlines.map((assessment) => {
                const course = courseMap[assessment.course_id];
                const dueText = getDueText(assessment.due_date);
                const dueDate = formatDueDate(assessment.due_date);
                const dueTextClass =
                  dueText === "TODAY" || dueText === "OVERDUE" ? "text-black" : "text-[#6C757D]";

                return (
                  <div key={assessment.id} className="flex items-center gap-4 p-3 border-b border-[#E9ECEF] group hover:bg-[#F8F9FA] transition-all duration-200">
                    <div className="h-10 w-1 bg-[#288028] rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{assessment.title}</p>
                      <p className="text-xs text-[#6C757D]">{course?.course_name || course?.course_code || "Unknown Course"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#6C757D]">{dueDate}</p>
                      <p className={`text-[10px] font-bold uppercase ${dueTextClass}`}>{dueText}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleAssessment(assessment.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined">radio_button_unchecked</span></button>
                      <button onClick={() => deleteAssessment(assessment.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Study Sessions Calendar Preview */}
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6C757D]">calendar_month</span>
              Study Sessions
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"
              >
                <span className="material-symbols-outlined !text-[18px]">add</span>
              </button>
              <button onClick={() => setWeekOffset((prev) => prev - 1)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">chevron_left</span></button>
              <button onClick={() => setWeekOffset((prev) => prev + 1)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <span key={`${d}-${i}`} className="text-[10px] font-bold text-[#ADB5BD] uppercase">{d}</span>
            ))}
            {calendarDays.map((day) => {
              const dayKey = toLocalDateKey(day);
              const todayKey = toLocalDateKey(new Date());
              const isToday = dayKey === todayKey;
              const hasSession = filteredStudySessions.some(
                (session) => toLocalDateKey(new Date(session.start_time)) === dayKey,
              );
              const isPast = day < startOfDay(new Date());

              if (isToday) {
                return (
                  <span
                    key={dayKey}
                    className="p-2 text-xs font-bold text-white bg-black rounded-xl"
                  >
                    {day.getDate()}
                  </span>
                );
              }

              return (
                <span
                  key={dayKey}
                  className={`p-2 text-xs font-medium rounded-xl relative ${isPast ? "text-[#ADB5BD]" : "text-[#6C757D]"}`}
                >
                  {day.getDate()}
                  {hasSession ? (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#288028] rounded-full"></span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className="space-y-3 mt-auto">
            {loading ? (
              <p className="text-xs text-[#6C757D]">Loading sessions...</p>
            ) : todaysSessions.length === 0 ? (
              <p className="text-xs text-[#6C757D]">No study sessions scheduled for today.</p>
            ) : (
              todaysSessions.map((session) => {
                const course = courseMap[session.course_id];

                return (
                  <div
                    key={session.id}
                    className="p-3 bg-[#F8F9FA] border-l-2 border-[#288028] rounded-r-xl mb-2 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#6C757D] uppercase">
                        {course?.course_name || course?.course_code || "Study Session"}
                      </p>
                      <p className="text-xs font-bold text-black">{session.title}</p>
                      <p className="text-[10px] text-[#6C757D]">
                        {formatSessionTime(session.start_time)} - {formatSessionTime(session.end_time)} (
                        {session.duration_minutes} min)
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleSession(session.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined">radio_button_unchecked</span></button>
                      <button onClick={() => deleteSession(session.id)} className="flex-shrink-0 text-[#ADB5BD] hover:text-black transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Course Breakdown Bar Chart */}
        <div className="bg-white rounded-xl p-6 border border-[#E9ECEF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6C757D]">bar_chart</span>
              Course Breakdown
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsCourseModalOpen(true)} className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">add</span></button>
              <button onClick={() => setIsQuestModalOpen(true)} type="button" title="Import from Quest" className="p-1 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">content_paste_go</span></button>
              <Link href="/dashboard/courses" title="Manage Courses" className="p-1.5 hover:bg-[#F8F9FA] rounded-xl text-[#6C757D] flex items-center transition-all duration-200"><span className="material-symbols-outlined !text-[18px]">more_horiz</span></Link>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between px-2 gap-4 h-40">
            {loading ? (
              <div className="w-full text-center text-xs text-[#6C757D]">Loading...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="w-full text-center text-xs text-[#6C757D]">No courses added yet</div>
            ) : maxCourseHoursRaw <= 0 ? (
              <div className="w-full text-center text-xs text-[#6C757D]">Start a timer to see your breakdown.</div>
            ) : (
              filteredCourses.map((course) => {
                const hours = studyTimeByCourseId[course.id] ?? 0;
                const heightPct = Math.max(0, Math.min(100, Math.round((hours / maxCourseHours) * 100)));
                const barClass = hours <= 0 ? "bg-[#E9ECEF]" : "bg-[#288028]";
                const barHeightStyle =
                  hours <= 0 ? { height: "6%" } : { height: `${heightPct}%` };

                return (
                  <div key={course.id} className="flex-1 flex flex-col items-center gap-2 min-w-0 self-stretch">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        title={`${hours.toFixed(1)}h`}
                        className={`w-full rounded-t-xl transition-all duration-500 ${barClass}`}
                        style={barHeightStyle}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#6C757D] uppercase truncate w-full text-center">
                      {course.course_code}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-[#E9ECEF] flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs font-bold text-black">{thisWeekHours}h</p>
              <p className="text-[10px] text-[#6C757D] uppercase font-medium">This Week</p>
            </div>
            <div className="h-6 w-[1px] bg-[#E9ECEF]"></div>
            <div className="text-center">
              <p className={`text-xs font-bold ${diffColor} inline-flex items-center gap-1`}>
                <span className="material-symbols-outlined !text-[16px]">{diffIcon}</span>
                {diffSign}
                {weeklyDiffHours}h
              </p>
              <p className="text-[10px] text-[#6C757D] uppercase font-medium">Vs Last Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCTIVITY HUB --- */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-black">Productivity Hub</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 1. Pomodoro Timer */}
          <div className="col-span-1 flex flex-col rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">POMODORO TIMER</span>
              <span className="material-symbols-outlined text-[#ADB5BD]">timer</span>
            </div>
            <div className="mt-6 flex flex-1 flex-col items-center justify-center">
              <h3 className="text-6xl font-bold tracking-tight text-black">{formatTime(timeLeft)}</h3>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <label htmlFor="pomodoro-minutes" className="text-xs font-medium text-[#6C757D]">
                  Duration (min)
                </label>
                <input
                  id="pomodoro-minutes"
                  type="number"
                  min={1}
                  max={180}
                  step={1}
                  value={pomodoroDurationMinutes}
                  disabled={isRunning}
                  onChange={(event) => {
                    const raw = parseInt(event.target.value, 10);
                    if (Number.isNaN(raw)) return;
                    setPomodoroDurationMinutes(Math.min(180, Math.max(1, raw)));
                  }}
                  className="w-16 rounded-lg border border-[#E9ECEF] bg-white px-2 py-1.5 text-center text-sm font-semibold text-black outline-none transition-colors focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 disabled:cursor-not-allowed disabled:bg-[#F8F9FA] disabled:text-[#ADB5BD]"
                />
              </div>
              <select
                value={timerCourseId}
                onChange={(event) => setTimerCourseId(event.target.value)}
                disabled={filteredCourses.length === 0}
                className="mt-4 w-32 cursor-pointer appearance-none rounded-xl border border-[#E9ECEF] bg-white px-4 py-1.5 text-center text-sm font-medium text-[#6C757D] outline-none transition-all duration-200"
              >
                {filteredCourses.length === 0 ? (
                  <option value="" disabled>No courses</option>
                ) : (
                  <>
                    <option value="" disabled>Select course</option>
                    {filteredCourses.map((course) => (
                      <option key={course.id} value={course.id}>{course.course_code}</option>
                    ))}
                  </>
                )}
              </select>
              <div className="mt-8 flex items-center gap-4">
                <button onClick={() => setIsRunning(true)} className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-all duration-200 hover:bg-gray-800">
                  <span className="material-symbols-outlined !text-[24px]">play_arrow</span>
                </button>
                <button onClick={() => setIsRunning(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F9FA] text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]">
                  <span className="material-symbols-outlined !text-[20px]">pause</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(pomodoroDurationMinutes * 60);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F9FA] text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]"
                >
                  <span className="material-symbols-outlined !text-[20px]">stop</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Study Debt Tracker */}
          <div className="col-span-1 flex flex-col rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm md:col-span-2 transition-all duration-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">STUDY DEBT TRACKER</span>
                <h3 className="mt-1 text-lg font-bold text-black">Weekly Commitment Balance</h3>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${debtColorClass}`}>{debtDisplay}</span>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6C757D]">{debtStatusLabel}</p>
              </div>
            </div>

            <div className="mt-8 flex-1 space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">
                  <span>PLANNED PROGRESS</span>
                  <span>24.0 HOURS</span>
                </div>
                <div className="h-3 w-full rounded-xl bg-[#E9ECEF]">
                  <div className="h-3 w-full rounded-xl bg-[#ADB5BD]"></div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">
                  <span>ACTUAL WORK DONE</span>
                  <span>{actualHours} HOURS</span>
                </div>
                <div className="h-3 w-full rounded-xl bg-[#E9ECEF]">
                  <div className="h-3 rounded-xl bg-[#288028]" style={{ width: `${efficiency}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <div className="flex-1 rounded-xl border border-[#E9ECEF] bg-white p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">TODAY&apos;S TARGET</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!targetCourse) {
                      alert("Add at least one course before setting a daily target.");
                      return;
                    }
                    setPacingTargetInput(dailyTargetHours.toFixed(1));
                    setShowPacingModal(true);
                  }}
                  className="mt-1 inline-flex items-center gap-1 rounded-xl px-1 -mx-1 text-xl font-bold text-black transition-all duration-200 hover:bg-[#F8F9FA]"
                >
                  {dailyTargetHours.toFixed(1)}h
                  <span className="material-symbols-outlined !text-[14px] text-[#6C757D]">edit</span>
                </button>
              </div>
              <div className="flex-1 rounded-xl border border-[#E9ECEF] bg-white p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">EFFICIENCY</span>
                <p className="mt-1 text-xl font-bold text-black">{efficiency}%</p>
              </div>
            </div>
          </div>

          {/* 3. Term Archive — Dynamic */}
          <div className="col-span-1 md:col-span-3 rounded-2xl border border-[#E9ECEF] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">TERM ARCHIVE</span>
                <p className="mt-0.5 text-sm font-semibold text-black">Browse previous terms</p>
              </div>
              <Link href="/dashboard/courses" className="text-xs font-bold text-[#6C757D] hover:text-black transition-colors">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {terms.map((term) => {
                const isSelected = term.id === selectedTermId;
                return (
                <div
                  key={term.id}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragTermId(term.id); }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverTermId(term.id); }}
                  onDragLeave={() => setDragOverTermId((prev) => prev === term.id ? null : prev)}
                  onDrop={(e) => { e.preventDefault(); handleTermDrop(term.id); }}
                  onDragEnd={() => { setDragTermId(null); setDragOverTermId(null); }}
                  onClick={() => setSelectedTermId(term.id)}
                  onDoubleClick={(e) => {
                    if ((e.target as HTMLElement).closest(".term-card-actions")) return;
                    setSelectedTermId(term.id);
                    persistSelectedTermId(term.id);
                    window.dispatchEvent(new CustomEvent("term-selected", { detail: term.id }));
                    router.push("/dashboard/courses");
                  }}
                  className={`term-card relative p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    dragOverTermId === term.id && dragTermId !== term.id
                      ? "ring-2 ring-green-400 scale-105"
                      : dragTermId === term.id
                        ? "opacity-50 scale-95"
                        : "hover:scale-105"
                  } ${
                    isSelected
                      ? "bg-green-50 border-2 border-green-600"
                      : "bg-white border border-slate-200 hover:border-green-600"
                  }`}
                >
                  <div className="term-card-actions absolute top-2 right-2 flex gap-0.5 opacity-0 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openEditTermModal(term.id); }}
                      className="p-0.5 rounded-full hover:bg-blue-100"
                      title="Edit term"
                    >
                      <span className="material-symbols-outlined !text-[16px] text-[#ADB5BD] hover:text-blue-500">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteTerm(term.id); }}
                      className="p-0.5 rounded-full hover:bg-red-100"
                      title="Delete term"
                    >
                      <span className="material-symbols-outlined !text-[16px] text-[#ADB5BD] hover:text-red-500">close</span>
                    </button>
                  </div>
                  <span
                    className={`material-symbols-outlined !text-[28px] mb-2 ${
                      isSelected ? "text-green-700" : "text-[#ADB5BD]"
                    }`}
                  >
                    {getSeasonIcon(term.season)}
                  </span>
                  <p className={`text-sm font-bold ${isSelected ? "text-green-800" : "text-black"}`}>
                    {term.season} &apos;{String(term.year).slice(2)}
                  </p>
                  <p className={`text-[10px] uppercase font-semibold mt-1 ${
                    isSelected ? "text-green-600" : "text-[#6C757D]"
                  }`}>
                    {term.course_count} course{term.course_count !== 1 ? "s" : ""}
                  </p>
                  {term.is_archived && (
                    <span className="mt-1.5 inline-block rounded-full bg-[#E9ECEF] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#6C757D]">Archived</span>
                  )}
                </div>
                );
              })}

              {/* Add Term Button — always last */}
              <button
                type="button"
                onClick={() => setIsTermModalOpen(true)}
                className="p-6 rounded-2xl border-2 border-dashed border-[#E9ECEF] bg-[#F8F9FA] flex flex-col items-center justify-center text-center transition-transform hover:scale-105 hover:border-green-600 hover:bg-green-50 cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[#CED4DA] !text-[32px] group-hover:text-green-600 transition-colors">add</span>
                <p className="text-xs font-semibold text-[#ADB5BD] mt-1 group-hover:text-green-600 transition-colors">Add Term</p>
              </button>
            </div>
          </div>

          {/* 5. Quick-Add Hub */}
          <div className="col-span-1 mt-2 flex flex-col justify-between gap-4 rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm sm:flex-row sm:items-center md:col-span-3 transition-all duration-200 hover:shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">QUICK-ADD HUB</span>
              <p className="mt-1 text-sm font-medium text-black">Update your progress instantly</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowGradeModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]"
              >
                <span className="material-symbols-outlined !text-[18px]">star</span>
                Log Grade
              </button>
              <button
                onClick={() => setShowDeadlineModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]"
              >
                <span className="material-symbols-outlined !text-[18px]">add_task</span>
                Add Deadline
              </button>
              <button
                onClick={() => setShowStudyModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E9ECEF] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#6C757D] transition-all duration-200 hover:bg-[#E9ECEF]"
              >
                <span className="material-symbols-outlined !text-[18px]">rocket_launch</span>
                Quick Study
              </button>
            </div>
          </div>
        </div>

        {/* ===== MODALS ===== */}

        {showDeadlineModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Add Deadline</h3>
              <form onSubmit={handleCreateDeadline} className="space-y-4">
                <div>
                  <label className={labelClass}>Course</label>
                  <select value={newDeadline.course_id} onChange={(e) => setNewDeadline((prev) => ({ ...prev, course_id: e.target.value }))} required className={inputClass}>
                    <option value="" disabled>Select a course...</option>
                    {filteredCourses.map((course) => (<option key={course.id} value={course.id}>{course.course_code}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" value={newDeadline.title} onChange={(e) => setNewDeadline((prev) => ({ ...prev, title: e.target.value }))} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input type="date" value={newDeadline.due_date} onChange={(e) => setNewDeadline((prev) => ({ ...prev, due_date: e.target.value }))} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Weight</label>
                  <input type="number" value={newDeadline.weight_percentage} onChange={(e) => setNewDeadline((prev) => ({ ...prev, weight_percentage: Number(e.target.value) }))} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select value={newDeadline.assessment_type} onChange={(e) => setNewDeadline((prev) => ({ ...prev, assessment_type: e.target.value }))} required className={inputClass}>
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowDeadlineModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" className={submitBtnClass}>Save Deadline</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showStudyModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Log Study Session</h3>
              <form onSubmit={handleQuickStudy} className="space-y-4">
                <div>
                  <label className={labelClass}>Course</label>
                  <select value={quickStudy.course_id} onChange={(e) => setQuickStudy((prev) => ({ ...prev, course_id: e.target.value }))} required className={inputClass}>
                    <option value="" disabled>Select a course...</option>
                    {filteredCourses.map((course) => (<option key={course.id} value={course.id}>{course.course_code}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Duration (Minutes)</label>
                  <input type="number" min="1" value={quickStudy.duration_minutes} onChange={(e) => setQuickStudy((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))} required className={inputClass} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowStudyModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" className={submitBtnClass}>Save Session</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showGradeModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Log Grade</h3>
              <form onSubmit={handleLogGrade} className="space-y-4">
                <div>
                  <label className={labelClass}>Assessment</label>
                  <select value={gradeAssessmentId} onChange={(e) => setGradeAssessmentId(e.target.value)} required className={inputClass}>
                    {filteredAssessments.filter((a) => !a.is_completed).length === 0 ? (
                      <option value="" disabled>No pending assessments</option>
                    ) : (
                      <>
                        <option value="" disabled>Select an assessment...</option>
                        {filteredAssessments.filter((a) => !a.is_completed).map((assessment) => (
                          <option key={assessment.id} value={assessment.id}>{assessment.title}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Score (%)</label>
                  <input type="number" min="0" max="100" value={earnedScore} onChange={(e) => setEarnedScore(e.target.value === "" ? "" : Number(e.target.value))} required className={inputClass} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowGradeModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" className={submitBtnClass}>Mark Completed</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showPacingModal ? (
          <div className={modalOverlayClass}>
            <div className="w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-black">Adjust Pacing</h3>
              <form onSubmit={handleSubmitPacingTarget} className="space-y-4">
                {!targetCourse ? (
                  <p className="rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm text-[#6C757D]">
                    Add at least one course before setting a daily target.
                  </p>
                ) : null}
                <div>
                  <label className={labelClass}>Today&apos;s Target (Hours)</label>
                  <input type="range" min="0" max="12" step="0.5" value={Number(pacingTargetInput)} onChange={(event) => setPacingTargetInput(event.target.value)} className="w-full accent-[#288028]" />
                  <input type="number" min="0" max="12" step="0.5" value={pacingTargetInput} onChange={(event) => setPacingTargetInput(event.target.value)} className={`mt-3 ${inputClass}`} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowPacingModal(false)} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" disabled={!targetCourse} className={submitBtnClass}>Save Target</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      {isSessionModalOpen ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Study Session</h2>
              <button type="button" onClick={closeSessionModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label htmlFor="session_course_id" className={labelClass}>Course</label>
                <select id="session_course_id" value={sessionForm.course_id} onChange={(event) => setSessionForm((prev) => ({ ...prev, course_id: event.target.value }))} required className={inputClass}>
                  <option value="" disabled>Select a course</option>
                  {filteredCourses.map((course) => (<option key={course.id} value={course.id}>{course.course_code} - {course.course_name}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="session_title" className={labelClass}>Title</label>
                <input id="session_title" type="text" value={sessionForm.title} onChange={(event) => setSessionForm((prev) => ({ ...prev, title: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="session_date" className={labelClass}>Date</label>
                <input id="session_date" type="date" value={sessionForm.date} onChange={(event) => setSessionForm((prev) => ({ ...prev, date: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="session_start_time" className={labelClass}>Start Time</label>
                <input id="session_start_time" type="time" value={sessionForm.start_time} onChange={(event) => setSessionForm((prev) => ({ ...prev, start_time: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="session_duration" className={labelClass}>Duration (Minutes)</label>
                <input id="session_duration" type="number" min="1" value={sessionForm.duration_minutes} onChange={(event) => setSessionForm((prev) => ({ ...prev, duration_minutes: event.target.value }))} required className={inputClass} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeSessionModal} disabled={submitting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={submitting || filteredCourses.length === 0} className={submitBtnClass}>{submitting ? "Adding..." : "Add Session"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCourseModalOpen ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Course</h2>
              <button type="button" onClick={closeCourseModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            {terms.length === 0 ? (
              <div className="space-y-4 text-center py-4">
                <span className="material-symbols-outlined !text-[40px] text-[#ADB5BD]">event_note</span>
                <p className="text-sm text-[#6C757D]">Please add a term first before creating courses.</p>
                <button
                  type="button"
                  onClick={() => { closeCourseModal(); setIsTermModalOpen(true); }}
                  className={submitBtnClass}
                >
                  Add Term
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label htmlFor="course_code" className={labelClass}>Course Code</label>
                  <input id="course_code" type="text" value={courseForm.course_code} onChange={(event) => setCourseForm((prev) => ({ ...prev, course_code: event.target.value }))} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="course_name" className={labelClass}>Course Name</label>
                  <input id="course_name" type="text" value={courseForm.course_name} onChange={(event) => setCourseForm((prev) => ({ ...prev, course_name: event.target.value }))} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="course_credits" className={labelClass}>Credits</label>
                  <input id="course_credits" type="number" min="0" step="0.5" value={courseForm.credits} onChange={(event) => setCourseForm((prev) => ({ ...prev, credits: event.target.value }))} required className={inputClass} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={closeCourseModal} disabled={submitting} className={cancelBtnClass}>Cancel</button>
                  <button type="submit" disabled={submitting} className={submitBtnClass}>{submitting ? "Adding..." : "Add Course"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {isAssessmentModalOpen ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Assessment</h2>
              <button type="button" onClick={closeAssessmentModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label htmlFor="assessment_course" className={labelClass}>Course</label>
                <select id="assessment_course" value={assessmentForm.course_id} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, course_id: event.target.value }))} required className={inputClass}>
                  <option value="" disabled>Select a course</option>
                  {filteredCourses.map((course) => (<option key={course.id} value={course.id}>{course.course_code} - {course.course_name}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="assessment_title" className={labelClass}>Title</label>
                <input id="assessment_title" type="text" value={assessmentForm.title} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, title: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="assessment_type" className={labelClass}>Type</label>
                <select id="assessment_type" value={assessmentForm.assessment_type} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, assessment_type: event.target.value }))} required className={inputClass}>
                  <option value="Exam">Exam</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                </select>
              </div>
              <div>
                <label htmlFor="assessment_due_date" className={labelClass}>Due Date</label>
                <input id="assessment_due_date" type="date" value={assessmentForm.due_date} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, due_date: event.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="assessment_weight" className={labelClass}>Weight Percentage</label>
                <input id="assessment_weight" type="number" min="1" max="100" value={assessmentForm.weight_percentage} onChange={(event) => setAssessmentForm((prev) => ({ ...prev, weight_percentage: event.target.value }))} required className={inputClass} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeAssessmentModal} disabled={submitting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={submitting} className={submitBtnClass}>{submitting ? "Adding..." : "Add Assessment"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isQuestModalOpen ? (
        <div className={modalOverlayClass}>
          <div className="w-full max-w-2xl rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Import from Quest</h2>
              <button type="button" onClick={closeQuestModal} aria-label="Close modal" disabled={isImporting} className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black disabled:opacity-60">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <p className="mb-5 text-sm text-[#6C757D]">
              Go to Quest &gt; Enroll &gt; My Class Schedule &gt; List View. Press Ctrl+A to select all, copy, and paste it below.
            </p>
            <form onSubmit={handleImportQuest} className="space-y-4">
              <div>
                <textarea value={questText} onChange={(event) => setQuestText(event.target.value)} placeholder="Paste your Quest List View text here..." className="min-h-[220px] w-full rounded-xl border border-[#E9ECEF] bg-white px-3 py-2 text-sm text-black outline-none focus:border-[#288028] focus:ring-2 focus:ring-[#288028]/20 placeholder:text-[#ADB5BD] transition-all duration-200" required />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeQuestModal} disabled={isImporting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={isImporting || questText.trim().length === 0} className={submitBtnClass}>{isImporting ? "Importing..." : "Import Courses"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isTermModalOpen ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Add Term</h2>
              <button type="button" onClick={closeTermModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateTerm} className="space-y-4">
              <div>
                <label htmlFor="term_season" className={labelClass}>Season</label>
                <select
                  id="term_season"
                  value={termForm.season}
                  onChange={(event) => setTermForm((prev) => ({ ...prev, season: event.target.value as Term["season"] }))}
                  required
                  className={inputClass}
                >
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
              <div>
                <label htmlFor="term_year" className={labelClass}>Year</label>
                <input
                  id="term_year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={termForm.year}
                  onChange={(event) => setTermForm((prev) => ({ ...prev, year: event.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeTermModal} disabled={termSubmitting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={termSubmitting} className={submitBtnClass}>{termSubmitting ? "Adding..." : "Add Term"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isEditTermModalOpen && editTermId ? (
        <div className={modalOverlayClass}>
          <div className={modalPanelClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Edit Term</h2>
              <button type="button" onClick={closeEditTermModal} aria-label="Close modal" className="rounded-xl p-1 text-[#6C757D] transition-all duration-200 hover:bg-[#F8F9FA] hover:text-black">
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleEditTerm} className="space-y-4">
              <div>
                <label htmlFor="edit_term_season" className={labelClass}>Season</label>
                <select
                  id="edit_term_season"
                  value={editTermForm.season}
                  onChange={(event) => setEditTermForm((prev) => ({ ...prev, season: event.target.value as Term["season"] }))}
                  required
                  className={inputClass}
                >
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit_term_year" className={labelClass}>Year</label>
                <input
                  id="edit_term_year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={editTermForm.year}
                  onChange={(event) => setEditTermForm((prev) => ({ ...prev, year: event.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-[#E9ECEF] px-4 py-3 transition-colors hover:bg-[#F8F9FA]">
                  <input
                    type="checkbox"
                    checked={editTermForm.is_archived}
                    onChange={(e) => setEditTermForm((prev) => ({ ...prev, is_archived: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#E9ECEF] text-[#6C757D] focus:ring-[#6C757D]"
                  />
                  <div>
                    <span className="text-sm font-medium text-black">Archive this term</span>
                    <p className="text-xs text-[#ADB5BD]">Archived terms and their courses will appear greyed out</p>
                  </div>
                </label>
              </div>
              <div>
                <label className={labelClass}>Courses in this term</label>
                {(() => {
                  const termCourses = courses.filter((c) => c.term_id === editTermId);
                  if (termCourses.length === 0) {
                    return <p className="text-sm text-[#ADB5BD]">No courses in this term.</p>;
                  }
                  return (
                    <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border border-[#E9ECEF] p-3">
                      {termCourses.map((course) => {
                        const isChecked = editTermCourseIds.has(course.id);
                        return (
                          <label key={course.id} className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-[#F8F9FA] transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setEditTermCourseIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(course.id)) next.delete(course.id);
                                  else next.add(course.id);
                                  return next;
                                });
                              }}
                              className="h-4 w-4 rounded border-[#E9ECEF] text-[#288028] focus:ring-[#288028]"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-black">{course.course_code}</span>
                              <span className="text-sm text-[#6C757D] ml-1.5">{course.course_name}</span>
                            </div>
                            {!isChecked && (
                              <span className="text-[10px] font-medium text-red-400 shrink-0">will be removed</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  );
                })()}
                {editTermNewCourses.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {editTermNewCourses.map((nc, idx) => (
                      <div key={idx} className="rounded-xl border border-dashed border-[#288028] bg-green-50/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#288028]">New Course</span>
                          <button
                            type="button"
                            onClick={() => setEditTermNewCourses((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-0.5 rounded-full hover:bg-red-100"
                          >
                            <span className="material-symbols-outlined !text-[16px] text-[#ADB5BD] hover:text-red-500">close</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Course code"
                            value={nc.course_code}
                            onChange={(e) => setEditTermNewCourses((prev) => prev.map((c, i) => i === idx ? { ...c, course_code: e.target.value } : c))}
                            required
                            className={inputClass}
                          />
                          <input
                            type="text"
                            placeholder="Course name"
                            value={nc.course_name}
                            onChange={(e) => setEditTermNewCourses((prev) => prev.map((c, i) => i === idx ? { ...c, course_name: e.target.value } : c))}
                            required
                            className={inputClass}
                          />
                          <div className="relative">
                            <input
                              type="number"
                              placeholder=" "
                              min="0"
                              step="0.5"
                              value={nc.credits}
                              onChange={(e) => setEditTermNewCourses((prev) => prev.map((c, i) => i === idx ? { ...c, credits: e.target.value } : c))}
                              required
                              className={`${inputClass} peer`}
                            />
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#ADB5BD] transition-opacity peer-[:not(:placeholder-shown)]:opacity-0">Credits</span>
                          </div>
                          <div className="relative">
                            <select
                              value={nc.target_grade}
                              onChange={(e) => setEditTermNewCourses((prev) => prev.map((c, i) => i === idx ? { ...c, target_grade: e.target.value } : c))}
                              className={`${inputClass} peer`}
                            >
                              {["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"].map((g) => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setEditTermNewCourses((prev) => [...prev, { course_code: "", course_name: "", credits: "3", target_grade: "A" }])}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#ADB5BD] py-2 text-sm font-medium text-[#6C757D] transition-colors hover:border-[#288028] hover:text-[#288028]"
                >
                  <span className="material-symbols-outlined !text-[18px]">add</span>
                  Add Course
                </button>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditTermModal} disabled={editTermSubmitting} className={cancelBtnClass}>Cancel</button>
                <button type="submit" disabled={editTermSubmitting} className={submitBtnClass}>{editTermSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
