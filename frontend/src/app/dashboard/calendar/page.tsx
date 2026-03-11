"use client";

import { useEffect, useMemo, useState } from "react";
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

type StudySession = {
  id: string;
  course_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_completed: boolean;
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateString: string) {
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dateString)) {
    return new Date(dateString.replace(/-/g, "/"));
  }
  return new Date(dateString);
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getOptionalTimeLabel(value: string) {
  // Only show a time when the backend actually includes a time component.
  if (!value || !value.includes("T")) return null;
  const parsed = parseLocalDate(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatTime(parsed);
}

function generateCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const leadingPadding = firstOfMonth.getDay();
  const totalDaysInMonth = lastOfMonth.getDate();

  const days: Date[] = [];

  for (let i = leadingPadding; i > 0; i -= 1) {
    days.push(new Date(year, month, 1 - i));
  }

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  const trailingPadding = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailingPadding; i += 1) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function getAssessmentPillClasses(assessment: Assessment) {
  const type = String(assessment.assessment_type || "").trim().toLowerCase();
  const title = String(assessment.title || "").trim().toLowerCase();

  if (title.includes("final")) {
    return "bg-rose-50/50 text-rose-700 border-rose-500";
  }
  if (title.includes("midterm") || type.includes("midterm")) {
    return "bg-orange-50/50 text-orange-700 border-orange-500";
  }
  if (type === "quiz" || title.includes("quiz")) {
    return "bg-indigo-50/50 text-indigo-700 border-indigo-500";
  }
  if (type === "exam") {
    return "bg-rose-50/50 text-rose-700 border-rose-500";
  }
  return "bg-slate-50/50 text-slate-700 border-slate-300";
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, assessmentsResponse, sessionsResponse] = await Promise.all([
          api.get<Course[]>("/courses/"),
          api.get<Assessment[]>("/assessments/"),
          api.get<StudySession[]>("/study-sessions/"),
        ]);
        setCourses(coursesResponse.data);
        setAssessments(assessmentsResponse.data);
        setStudySessions(sessionsResponse.data);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

  const courseCodeById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const course of courses) {
      map[course.id] = course.course_code;
    }
    return map;
  }, [courses]);

  const assessmentMap = useMemo(() => {
    return assessments.reduce<Record<string, Assessment[]>>((acc, assessment) => {
      const key = toLocalDateKey(parseLocalDate(assessment.due_date));
      if (!acc[key]) acc[key] = [];
      acc[key].push(assessment);
      return acc;
    }, {});
  }, [assessments]);

  const sessionMap = useMemo(() => {
    return studySessions.reduce<Record<string, StudySession[]>>((acc, session) => {
      const key = toLocalDateKey(new Date(session.start_time));
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    }, {});
  }, [studySessions]);

  const today = startOfLocalDay(new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  const goPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">
            Home <span className="px-2 text-slate-300">›</span>{" "}
            <span className="text-primary">Schedule</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Calendar Overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(["month", "week", "day"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
                  viewMode === mode ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background-dark shadow-sm transition-colors hover:bg-[#C9A227]"
          >
            <span className="material-symbols-outlined !text-[18px]">add</span>
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{formatMonthYear(currentDate)}</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Previous month"
                >
                  <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Next month"
                >
                  <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                <span key={`${d}-${idx}`}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-700">
              {calendarDays.slice(0, 35).map((day) => {
                const key = toLocalDateKey(day);
                const isToday = key === toLocalDateKey(startOfLocalDay(new Date()));
                const inMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
                return (
                  <span
                    key={key}
                    className={`py-1 ${!inMonth ? "text-slate-200" : ""} ${
                      isToday ? "rounded-lg bg-primary text-background-dark font-bold" : ""
                    }`}
                  >
                    {day.getDate()}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Event Types</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#3A7BD5]" />
                <span>Quizzes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-primary" />
                <span>Midterms</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span>Exams</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-slate-400" />
                <span>Study Sessions</span>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{formatMonthYear(currentDate)}</h2>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={goPrevMonth}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined !text-[20px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={goToday}
                className="mx-1 h-9 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                Today
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-slate-600">Loading calendar...</div>
          ) : (
            <>
              <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <div
                    key={day}
                    className="border-r border-slate-200 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-0 grid grid-cols-7 auto-rows-fr overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-slate-100/30">
                {calendarDays.map((day) => {
                  const dayKey = toLocalDateKey(day);
                  const isToday = dayKey === toLocalDateKey(today);
                  const isCurrentMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;

                  const dayAssessments = assessmentMap[dayKey] ?? [];
                  const daySessions = sessionMap[dayKey] ?? [];

                  type DayEvent = {
                    id: string;
                    timestamp: number;
                    label: string;
                    pillClass: string;
                  };

                  const events: DayEvent[] = [];

                  for (const assessment of dayAssessments) {
                    const courseCode = courseCodeById[assessment.course_id] ?? "";
                    const timeLabel = getOptionalTimeLabel(assessment.due_date);
                    const when = parseLocalDate(assessment.due_date);
                    const prefix = timeLabel ? `${timeLabel} - ` : "";
                    const head = courseCode ? `${prefix}${courseCode}` : prefix.trim();
                    const label = head ? `${head} - ${assessment.title}` : assessment.title;
                    const typeLower = String(assessment.assessment_type || "").trim().toLowerCase();
                    const titleLower = String(assessment.title || "").trim().toLowerCase();
                    const pillClass =
                      titleLower.includes("final") || typeLower === "exam"
                        ? "bg-rose-50/60 text-rose-700 border-rose-500"
                        : titleLower.includes("midterm") || typeLower.includes("midterm")
                          ? "bg-primary/20 text-slate-900 border-primary"
                          : "bg-[#3A7BD5]/10 text-[#3A7BD5] border-[#3A7BD5]";
                    events.push({
                      id: `a-${assessment.id}`,
                      timestamp: Number.isNaN(when.getTime()) ? 0 : when.getTime(),
                      label,
                      pillClass,
                    });
                  }

                  for (const session of daySessions) {
                    const courseCode = courseCodeById[session.course_id] ?? "";
                    const start = new Date(session.start_time);
                    const timeLabel = Number.isNaN(start.getTime()) ? "" : formatTime(start);
                    const head = courseCode ? `${timeLabel} - ${courseCode}` : timeLabel;
                    const label = head ? `${head} - ${session.title}` : session.title;
                    events.push({
                      id: `s-${session.id}`,
                      timestamp: Number.isNaN(start.getTime()) ? 0 : start.getTime(),
                      label,
                      pillClass: "bg-slate-100 text-slate-700 border-slate-400",
                    });
                  }

                  events.sort((a, b) => a.timestamp - b.timestamp);
                  const visible = events.slice(0, 3);
                  const extraCount = Math.max(0, events.length - visible.length);

                  const cellBorderRight = day.getDay() !== 6 ? "border-r border-slate-200" : "";

                  return (
                    <div
                      key={dayKey}
                      className={`calendar-grid-cell border-b border-slate-200 p-3 ${cellBorderRight} ${
                        isCurrentMonth ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        {isToday ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-background-dark">
                            {day.getDate()}
                          </span>
                        ) : (
                          <span className={`text-xs font-semibold ${isCurrentMonth ? "text-slate-500" : "text-slate-200"}`}>
                            {day.getDate()}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        {visible.map((event) => (
                          <div
                            key={event.id}
                            className={`mb-1 truncate rounded-r-md border-l-[4px] px-2 py-1 text-[10px] font-semibold ${event.pillClass}`}
                            title={event.label}
                          >
                            {event.label}
                          </div>
                        ))}

                        {extraCount > 0 ? (
                          <div className="mt-1 text-[10px] font-medium text-slate-400">
                            +{extraCount} more
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
