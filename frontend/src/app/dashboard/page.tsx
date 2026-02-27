"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  target_grade?: string | number;
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

function getDueText(dateString: string) {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(dateString));
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / MS_PER_DAY);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "In 1 day";
  if (diffDays <= 6) return `In ${diffDays} days`;
  return "Next week";
}

function formatDueDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getBarHeight(index: number, credits: number) {
  const creditBased = Math.min(85, Math.max(18, Math.round(credits * 16)));
  const adjustment = (index % 3) * 6;
  return `${Math.max(15, creditBased - adjustment)}%`;
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
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [questText, setQuestText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
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
    credits: "3",
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

  const courseMap = useMemo(() => {
    return courses.reduce<Record<string, Course>>((acc, course) => {
      acc[course.id] = course;
      return acc;
    }, {});
  }, [courses]);

  const upcomingDeadlines = useMemo(() => {
    return assessments
      .filter((assessment) => !assessment.is_completed)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 3);
  }, [assessments]);

  const todaysSessions = useMemo(() => {
    const todayKey = toLocalDateKey(new Date());
    return studySessions
      .filter((session) => !session.is_completed)
      .filter((session) => toLocalDateKey(new Date(session.start_time)) === todayKey)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [studySessions]);

  const calendarDays = useMemo(() => getCurrentWeekDates(weekOffset), [weekOffset]);

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const expectedWeeklyMinutes = totalCredits > 0 ? totalCredits * 3 * 60 : 1;

  const now = new Date();
  const weekStart = startOfDay(new Date(now));
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = startOfDay(new Date(weekStart));
  weekEnd.setDate(weekStart.getDate() + 7);

  const thisWeekSessions = studySessions.filter((session) => {
    const start = new Date(session.start_time);
    return start >= weekStart && start < weekEnd;
  });
  const thisWeekMinutes = thisWeekSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const thisWeekHours = (thisWeekMinutes / 60).toFixed(1);
  const lastWeekStart = startOfDay(new Date(weekStart));
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekSessions = studySessions.filter((session) => {
    const start = new Date(session.start_time);
    return start >= lastWeekStart && start < weekStart;
  });
  const lastWeekMinutes = lastWeekSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const weeklyDiffHours = ((thisWeekMinutes - lastWeekMinutes) / 60).toFixed(1);
  const diffColor = Number(weeklyDiffHours) >= 0 ? "text-green-500" : "text-red-500";
  const diffSign = Number(weeklyDiffHours) > 0 ? "+" : "";
  const workloadPercentage = Math.min(
    100,
    Math.round((thisWeekMinutes / expectedWeeklyMinutes) * 100),
  );

  const todaysMinutes = todaysSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const remainingDailyHours = Math.max(0, 6 - todaysMinutes / 60).toFixed(1);

  const gaugeCircumference = 364.42;
  const gaugeOffset = gaugeCircumference - (gaugeCircumference * workloadPercentage) / 100;

  const actualHours = Number((thisWeekMinutes / 60).toFixed(1));
  const plannedHours = 24.0;
  const debtHours = (plannedHours - actualHours).toFixed(1);
  const isBehind = plannedHours > actualHours;
  const efficiency = Math.min(100, Math.round((actualHours / plannedHours) * 100));

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingDeadlinesCount = assessments.filter((assessment) => {
    if (assessment.is_completed) return false;
    const dueDate = new Date(assessment.due_date);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  const burnoutPosition =
    upcomingDeadlinesCount >= 3 ? 85 : upcomingDeadlinesCount >= 1 ? 50 : 15;
  const risk =
    upcomingDeadlinesCount >= 3 ? "Elevated" : upcomingDeadlinesCount >= 1 ? "Moderate" : "Low";
  const burnoutTitle =
    risk === "Elevated" ? "High Workload Upcoming" : risk === "Moderate" ? "Manageable Workload" : "Light Workload";
  const targetGPA =
    courses.length > 0
      ? Math.round(
          courses.reduce((acc, curr) => acc + Number(curr.target_grade || 0), 0) / courses.length,
        )
      : 0;

  const badgeConfig =
    workloadPercentage < 50
      ? { label: "Light", className: "bg-blue-100 text-blue-700", dotClass: "bg-blue-500", pace: "light" }
      : workloadPercentage <= 85
        ? { label: "Balanced", className: "bg-green-100 text-green-700", dotClass: "bg-green-500", pace: "sustainable" }
        : { label: "Heavy", className: "bg-red-100 text-red-700", dotClass: "bg-red-500", pace: "heavy" };

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
      credits: "3",
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

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/courses/", {
        course_code: courseForm.course_code.trim(),
        course_name: courseForm.course_name.trim(),
        credits: Number(courseForm.credits),
      });
      closeCourseModal();
      await fetchDashboardData();
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
          credits: 3,
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
        // FastAPI schema expects `date`, not datetime.
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

    try {
      await api.patch(`/assessments/${gradeAssessmentId}/toggle-complete`, {});
      await fetchDashboardData();
      setShowGradeModal(false);
      setGradeAssessmentId("");
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
        const startTime = new Date(endTime.getTime() - 25 * 60 * 1000);

        await api.post("/study-sessions/", {
          course_id: timerCourseId,
          title: "Pomodoro Session",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: 25,
          is_completed: true,
        });

        await fetchDashboardData();
      }
    } catch (error) {
      console.error("Failed to log pomodoro session:", error);
    } finally {
      setTimeLeft(25 * 60);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Hero Section: Workload Status */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-slate-100" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.42" strokeDashoffset={gaugeOffset} strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-900">{workloadPercentage}%</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Load</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">Workload Status</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeConfig.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badgeConfig.dotClass}`}></span>
                {badgeConfig.label}
              </span>
            </div>
            <p className="text-slate-500 max-w-md">Your current study pace is {badgeConfig.pace}. You have approximately {remainingDailyHours} hours remaining today for deep work before reaching your limit.</p>
          </div>
        </div>
        <button
          onClick={handleOptimizeSchedule}
          disabled={isOptimizing}
          className="bg-primary hover:bg-yellow-400 text-background-dark font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 group shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">bolt</span>
          )}
          {isOptimizing ? "Optimizing..." : "Optimize My Schedule"}
        </button>
      </section>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Deadlines List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">event_upcoming</span>
              Upcoming Deadlines
            </h3>
            <div className="flex items-center gap-1">
              <Link href="/dashboard/schedule" className="text-xs font-bold text-primary hover:underline">View All</Link>
              <button onClick={() => setIsAssessmentModalOpen(true)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><span className="material-symbols-outlined !text-[18px]">add</span></button>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {loading ? (
              <p className="text-sm text-slate-500">Loading deadlines...</p>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="p-4 rounded-xl bg-soft-gray text-sm text-slate-500">
                No upcoming deadlines. You&apos;re all caught up.
              </div>
            ) : (
              upcomingDeadlines.map((assessment, index) => {
                const course = courseMap[assessment.course_id];
                const dueText = getDueText(assessment.due_date);
                const dueDate = formatDueDate(assessment.due_date);
                const barClass =
                  index === 0 ? "bg-red-500" : index === 1 ? "bg-primary" : "bg-blue-400";
                const dueClass = index === 0 ? "text-red-500" : "text-slate-600";

                return (
                  <div key={assessment.id} className="flex items-center gap-4 p-3 rounded-xl bg-soft-gray group hover:bg-slate-100 transition-colors">
                    <div className={`h-10 w-1 ${barClass} rounded-full`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{assessment.title}</p>
                      <p className="text-xs text-slate-500">{course?.course_name || course?.course_code || "Unknown Course"}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${dueClass}`}>{dueDate}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{dueText}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleAssessment(assessment.id)} className="flex-shrink-0 text-slate-300 hover:text-green-500 transition-colors"><span className="material-symbols-outlined">radio_button_unchecked</span></button>
                      <button onClick={() => deleteAssessment(assessment.id)} className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Study Sessions Calendar Preview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Study Sessions
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setIsSessionModalOpen(true)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <span className="material-symbols-outlined !text-[18px]">add</span>
              </button>
              <button onClick={() => setWeekOffset((prev) => prev - 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><span className="material-symbols-outlined !text-[18px]">chevron_left</span></button>
              <button onClick={() => setWeekOffset((prev) => prev + 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><span className="material-symbols-outlined !text-[18px]">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">M</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">T</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">W</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">T</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">F</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">S</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">S</span>
            {calendarDays.map((day) => {
              const dayKey = toLocalDateKey(day);
              const todayKey = toLocalDateKey(new Date());
              const isToday = dayKey === todayKey;
              const hasSession = studySessions.some(
                (session) => toLocalDateKey(new Date(session.start_time)) === dayKey,
              );
              const isPast = day < startOfDay(new Date());

              if (isToday) {
                return (
                  <span
                    key={dayKey}
                    className="p-2 text-xs font-bold text-slate-900 bg-primary/20 rounded-lg"
                  >
                    {day.getDate()}
                  </span>
                );
              }

              return (
                <span
                  key={dayKey}
                  className={`p-2 text-xs font-medium rounded-lg relative ${isPast ? "text-slate-400" : "text-slate-900"}`}
                >
                  {day.getDate()}
                  {hasSession ? (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className="space-y-3 mt-auto">
            {loading ? (
              <p className="text-xs text-slate-500">Loading sessions...</p>
            ) : todaysSessions.length === 0 ? (
              <p className="text-xs text-slate-500">No study sessions scheduled for today. Take a break!</p>
            ) : (
              todaysSessions.map((session) => {
                const course = courseMap[session.course_id];

                return (
                  <div
                    key={session.id}
                    className="p-3 bg-primary/5 border-l-2 border-primary rounded-r-lg mb-2 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-primary uppercase">
                        {course?.course_name || course?.course_code || "Study Session"}
                      </p>
                      <p className="text-xs font-bold text-slate-900">{session.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {formatSessionTime(session.start_time)} - {formatSessionTime(session.end_time)} (
                        {session.duration_minutes} min)
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleSession(session.id)} className="flex-shrink-0 text-slate-300 hover:text-green-500 transition-colors"><span className="material-symbols-outlined">radio_button_unchecked</span></button>
                      <button onClick={() => deleteSession(session.id)} className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined !text-[18px]">delete</span></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Course Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">bar_chart</span>
              Course Breakdown
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsCourseModalOpen(true)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><span className="material-symbols-outlined !text-[18px]">add</span></button>
              <button onClick={() => setIsQuestModalOpen(true)} type="button" title="Import from Quest" className="p-1 hover:bg-slate-100 rounded text-slate-400"><span className="material-symbols-outlined !text-[18px]">content_paste_go</span></button>
              <Link href="/dashboard/courses" title="Manage Courses" className="p-1.5 hover:bg-slate-100 rounded text-slate-400 flex items-center"><span className="material-symbols-outlined !text-[18px]">more_horiz</span></Link>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between px-2 gap-4 h-40">
            {loading ? (
              <div className="w-full text-center text-xs text-slate-400">Loading...</div>
            ) : courses.length === 0 ? (
              <div className="w-full text-center text-xs text-slate-400">No courses added yet</div>
            ) : (
              courses.map((course, index) => (
                <div key={course.id} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg ${index % 3 === 0 ? "bg-primary" : index % 3 === 1 ? "bg-primary/40" : "bg-primary/20"}`}
                    style={{ height: getBarHeight(index, course.credits) }}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{course.course_code}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-900">{thisWeekHours}h</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">This Week</p>
            </div>
            <div className="h-6 w-[1px] bg-slate-100"></div>
            <div className="text-center">
              <p className={`text-xs font-bold ${diffColor}`}>{diffSign}{weeklyDiffHours}h</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Vs Last Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCTIVITY HUB --- */}
      <section className="mt-12 space-y-6">
        {/* Hub Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Productivity Hub</h2>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              isOptimizing
                ? "bg-slate-200 text-slate-500"
                : isOptimized
                  ? "bg-green-400 text-green-900"
                  : "bg-[#FFD54F] text-slate-900 hover:bg-[#F3C746]"
            }`}
          >
            {isOptimizing ? (
              <span className="material-symbols-outlined animate-spin !text-[18px]">sync</span>
            ) : isOptimized ? (
              <span className="material-symbols-outlined !text-[18px]">check_circle</span>
            ) : (
              <span className="material-symbols-outlined !text-[18px]">bolt</span>
            )}
            {isOptimizing ? "Analyzing..." : isOptimized ? "Optimized!" : "Optimize My Schedule"}
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 1. Pomodoro Timer (Col 1) */}
          <div className="col-span-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-500">POMODORO TIMER</span>
              <span className="material-symbols-outlined text-slate-400">timer</span>
            </div>
            <div className="mt-6 flex flex-1 flex-col items-center justify-center">
              <h3 className="text-6xl font-bold tracking-tight text-slate-900">{formatTime(timeLeft)}</h3>
              <select
                value={timerCourseId}
                onChange={(event) => setTimerCourseId(event.target.value)}
                className="mt-4 w-32 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-1.5 text-center text-sm font-medium text-slate-700 outline-none"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code}
                  </option>
                ))}
              </select>
              <div className="mt-8 flex items-center gap-4">
                <button onClick={() => setIsRunning(true)} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD54F] text-slate-900 shadow-sm transition-colors hover:bg-[#F3C746]">
                  <span className="material-symbols-outlined !text-[24px]">play_arrow</span>
                </button>
                <button onClick={() => setIsRunning(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined !text-[20px]">pause</span>
                </button>
                <button onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined !text-[20px]">stop</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Study Debt Tracker (Col 2 & 3) */}
          <div className="col-span-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider text-slate-500">STUDY DEBT TRACKER</span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Weekly Commitment Balance</h3>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${isBehind ? "text-red-500" : "text-green-500"}`}>
                  {isBehind
                    ? `-${debtHours}h behind`
                    : `+${Math.abs(Number(debtHours)).toFixed(1)}h ahead`}
                </span>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Required</p>
              </div>
            </div>

            <div className="mt-8 flex-1 space-y-6">
              {/* Planned Progress Bar */}
              <div>
                <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
                  <span>PLANNED PROGRESS</span>
                  <span>24.0 HOURS</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100">
                  <div className="h-3 w-full rounded-full bg-slate-300"></div>
                </div>
              </div>

              {/* Actual Progress Bar */}
              <div>
                <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
                  <span>ACTUAL WORK DONE</span>
                  <span>{actualHours} HOURS</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-[#FFD54F]" style={{ width: `${efficiency}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-[10px] font-bold tracking-wider text-slate-500">TODAY&apos;S TARGET</span>
                <p className="mt-1 text-xl font-bold text-slate-900">4.0h</p>
              </div>
              <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-[10px] font-bold tracking-wider text-slate-500">EFFICIENCY</span>
                <p className="mt-1 text-xl font-bold text-slate-900">{efficiency}%</p>
              </div>
            </div>
          </div>

          {/* 3. GPA Forecaster (Col 1) */}
          <div className="col-span-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-500">GPA FORECASTER</span>
              <span className="material-symbols-outlined text-slate-400">show_chart</span>
            </div>
            <div className="relative mt-6 flex flex-1 flex-col items-center justify-center">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full" style={{ background: "conic-gradient(#FFD54F 82%, #f1f5f9 82%)" }}>
                <div className="absolute inset-[8px] flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-4xl font-bold text-slate-900">--%</span>
                  <span className="mt-1 text-[8px] font-bold tracking-wider text-slate-400">CURRENT FORECAST</span>
                </div>
              </div>
              <p className="mt-6 text-sm font-semibold text-slate-500">Target: <span className="text-slate-900">{targetGPA}%</span></p>
            </div>
          </div>

          {/* 4. Burnout Meter (Col 2) */}
          <div className="col-span-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-500">BURNOUT METER</span>
              <span className="material-symbols-outlined text-slate-400">psychology</span>
            </div>
            <div className="mt-8 flex flex-1 flex-col items-center justify-center">
              <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-orange-400 to-red-500">
                <div className="absolute -bottom-3 -translate-x-1/2 text-[14px] text-slate-800" style={{ left: `${burnoutPosition}%` }}>
                  ◆
                </div>
              </div>
              <div className="mt-8 text-center">
                <h4 className="text-sm font-bold text-slate-900">{burnoutTitle}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">System detected {upcomingDeadlinesCount} upcoming deadlines in the next 7 days. Risk level: {risk}.</p>
              </div>
              <button className="mt-6 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                Adjust Pacing
              </button>
            </div>
          </div>

          {/* (Optional 3rd Column is left empty to match your mockup layout) */}
          <div className="col-span-1 hidden md:block"></div>

          {/* 5. Quick-Add Hub (Full Width Bottom) */}
          <div className="col-span-1 mt-2 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center md:col-span-3">
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-500">QUICK-ADD HUB</span>
              <p className="mt-1 text-sm font-medium text-slate-900">Update your progress instantly</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowGradeModal(true)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span className="material-symbols-outlined !text-[18px]">star</span>
                Log Grade
              </button>
              <button
                onClick={() => setShowDeadlineModal(true)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span className="material-symbols-outlined !text-[18px]">add_task</span>
                Add Deadline
              </button>
              <button
                onClick={() => setShowStudyModal(true)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <span className="material-symbols-outlined !text-[18px]">rocket_launch</span>
                Quick Study
              </button>
            </div>
          </div>
        </div>

        {showDeadlineModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Add Deadline</h3>
              <form onSubmit={handleCreateDeadline} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
                  <select
                    value={newDeadline.course_id}
                    onChange={(e) => setNewDeadline((prev) => ({ ...prev, course_id: e.target.value }))}
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  >
                    <option value="" disabled>
                      Select a course...
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                  <input
                    type="text"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={newDeadline.due_date}
                    onChange={(e) => setNewDeadline((prev) => ({ ...prev, due_date: e.target.value }))}
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Weight</label>
                  <input
                    type="number"
                    value={newDeadline.weight_percentage}
                    onChange={(e) =>
                      setNewDeadline((prev) => ({
                        ...prev,
                        weight_percentage: Number(e.target.value),
                      }))
                    }
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                  <select
                    value={newDeadline.assessment_type}
                    onChange={(e) =>
                      setNewDeadline((prev) => ({ ...prev, assessment_type: e.target.value }))
                    }
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Project">Project</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeadlineModal(false)}
                    className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#FFD54F] px-4 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227]"
                  >
                    Save Deadline
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showStudyModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Log Study Session</h3>
              <form onSubmit={handleQuickStudy} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
                  <select
                    value={quickStudy.course_id}
                    onChange={(e) =>
                      setQuickStudy((prev) => ({ ...prev, course_id: e.target.value }))
                    }
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  >
                    <option value="" disabled>
                      Select a course...
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={quickStudy.duration_minutes}
                    onChange={(e) =>
                      setQuickStudy((prev) => ({
                        ...prev,
                        duration_minutes: Number(e.target.value),
                      }))
                    }
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStudyModal(false)}
                    className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#FFD54F] px-4 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227]"
                  >
                    Save Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showGradeModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Log Grade</h3>
              <form onSubmit={handleLogGrade} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Assessment</label>
                  <select
                    value={gradeAssessmentId}
                    onChange={(e) => setGradeAssessmentId(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  >
                    {assessments.filter((a) => !a.is_completed).length === 0 ? (
                      <option value="" disabled>
                        No pending assessments
                      </option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Select an assessment...
                        </option>
                        {assessments
                          .filter((a) => !a.is_completed)
                          .map((assessment) => (
                            <option key={assessment.id} value={assessment.id}>
                              {assessment.title}
                            </option>
                          ))}
                      </>
                    )}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGradeModal(false)}
                    className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#FFD54F] px-4 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227]"
                  >
                    Mark Completed
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      {isSessionModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Add Study Session</h2>
              <button
                type="button"
                onClick={closeSessionModal}
                aria-label="Close modal"
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label htmlFor="session_course_id" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course
                </label>
                <select
                  id="session_course_id"
                  value={sessionForm.course_id}
                  onChange={(event) =>
                    setSessionForm((prev) => ({ ...prev, course_id: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                >
                  <option value="" disabled>
                    Select a course
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="session_title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="session_title"
                  type="text"
                  value={sessionForm.title}
                  onChange={(event) =>
                    setSessionForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="session_date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date
                </label>
                <input
                  id="session_date"
                  type="date"
                  value={sessionForm.date}
                  onChange={(event) =>
                    setSessionForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="session_start_time" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Start Time
                </label>
                <input
                  id="session_start_time"
                  type="time"
                  value={sessionForm.start_time}
                  onChange={(event) =>
                    setSessionForm((prev) => ({ ...prev, start_time: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="session_duration" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Duration (Minutes)
                </label>
                <input
                  id="session_duration"
                  type="number"
                  min="1"
                  value={sessionForm.duration_minutes}
                  onChange={(event) =>
                    setSessionForm((prev) => ({ ...prev, duration_minutes: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSessionModal}
                  disabled={submitting}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || courses.length === 0}
                  className="h-10 rounded-lg bg-[#FFD54F] px-4 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227] disabled:opacity-60"
                >
                  {submitting ? "Adding..." : "Add Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCourseModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Add Course</h2>
              <button
                type="button"
                onClick={closeCourseModal}
                aria-label="Close modal"
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label htmlFor="course_code" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course Code
                </label>
                <input
                  id="course_code"
                  type="text"
                  value={courseForm.course_code}
                  onChange={(event) =>
                    setCourseForm((prev) => ({ ...prev, course_code: event.target.value }))
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
                  value={courseForm.course_name}
                  onChange={(event) =>
                    setCourseForm((prev) => ({ ...prev, course_name: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="course_credits" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Credits
                </label>
                <input
                  id="course_credits"
                  type="number"
                  min="1"
                  step="0.5"
                  value={courseForm.credits}
                  onChange={(event) =>
                    setCourseForm((prev) => ({ ...prev, credits: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCourseModal}
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

      {isAssessmentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Add Assessment</h2>
              <button
                type="button"
                onClick={closeAssessmentModal}
                aria-label="Close modal"
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label htmlFor="assessment_course" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course
                </label>
                <select
                  id="assessment_course"
                  value={assessmentForm.course_id}
                  onChange={(event) =>
                    setAssessmentForm((prev) => ({ ...prev, course_id: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                >
                  <option value="" disabled>
                    Select a course
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="assessment_title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="assessment_title"
                  type="text"
                  value={assessmentForm.title}
                  onChange={(event) =>
                    setAssessmentForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="assessment_type" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  id="assessment_type"
                  value={assessmentForm.assessment_type}
                  onChange={(event) =>
                    setAssessmentForm((prev) => ({ ...prev, assessment_type: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                >
                  <option value="Exam">Exam</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                </select>
              </div>

              <div>
                <label htmlFor="assessment_due_date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  id="assessment_due_date"
                  type="date"
                  value={assessmentForm.due_date}
                  onChange={(event) =>
                    setAssessmentForm((prev) => ({ ...prev, due_date: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div>
                <label htmlFor="assessment_weight" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Weight Percentage
                </label>
                <input
                  id="assessment_weight"
                  type="number"
                  min="1"
                  max="100"
                  value={assessmentForm.weight_percentage}
                  onChange={(event) =>
                    setAssessmentForm((prev) => ({ ...prev, weight_percentage: event.target.value }))
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAssessmentModal}
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
                  {submitting ? "Adding..." : "Add Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isQuestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Import from Quest</h2>
              <button
                type="button"
                onClick={closeQuestModal}
                aria-label="Close modal"
                disabled={isImporting}
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
              >
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
            <p className="mb-5 text-sm text-slate-500">
              Go to Quest &gt; Enroll &gt; My Class Schedule &gt; List View. Press Ctrl+A to select all, copy, and paste it below.
            </p>
            <form onSubmit={handleImportQuest} className="space-y-4">
              <div>
                <textarea
                  value={questText}
                  onChange={(event) => setQuestText(event.target.value)}
                  placeholder="Paste your Quest List View text here..."
                  className="min-h-[220px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#3A7BD5] focus:ring-2 focus:ring-[#3A7BD5]/20"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeQuestModal}
                  disabled={isImporting}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || questText.trim().length === 0}
                  className="h-10 rounded-lg bg-[#FFD54F] px-4 text-sm font-semibold text-[#1E1E1E] transition-colors hover:bg-[#C9A227] disabled:opacity-60"
                >
                  {isImporting ? "Importing..." : "Import Courses"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}










