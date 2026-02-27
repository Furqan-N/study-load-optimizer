"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

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

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
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

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentsResponse, sessionsResponse] = await Promise.all([
          api.get<Assessment[]>("/assessments/"),
          api.get<StudySession[]>("/study-sessions/"),
        ]);

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

  const assessmentMap = useMemo(() => {
    return assessments.reduce<Record<string, Assessment[]>>((acc, assessment) => {
      const key = toLocalDateKey(new Date(assessment.due_date));
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
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Calendar</h1>
          <p className="mt-1 text-sm text-slate-600">
            Plan your month with assessments and study sessions in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={goPrevMonth}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Next
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">{formatMonthYear(currentDate)}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-600">Loading calendar...</div>
        ) : (
          <div>
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dayKey = toLocalDateKey(day);
                const isToday = toLocalDateKey(day) === toLocalDateKey(today);
                const isCurrentMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
                const isPast = startOfLocalDay(day).getTime() < today.getTime();

                const dayAssessments = assessmentMap[dayKey] ?? [];
                const daySessions = sessionMap[dayKey] ?? [];

                return (
                  <div
                    key={dayKey}
                    className={`min-h-[120px] border-b border-r border-slate-200 p-2 md:p-3 ${
                      isPast ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : isCurrentMonth
                              ? isPast
                                ? "text-slate-400"
                                : "text-slate-800"
                              : "text-slate-300"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {dayAssessments.slice(0, 2).map((assessment) => (
                        <div
                          key={assessment.id}
                          className="truncate rounded-md bg-red-100 px-2 py-1 text-[11px] font-medium text-red-700"
                          title={assessment.title}
                        >
                          {assessment.title}
                        </div>
                      ))}

                      {daySessions.slice(0, 2).map((session) => (
                        <div
                          key={session.id}
                          className="truncate rounded-md bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700"
                          title={session.title}
                        >
                          {session.title}
                        </div>
                      ))}

                      {dayAssessments.length + daySessions.length > 4 ? (
                        <div className="px-1 text-[11px] font-medium text-slate-500">
                          +{dayAssessments.length + daySessions.length - 4} more
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
