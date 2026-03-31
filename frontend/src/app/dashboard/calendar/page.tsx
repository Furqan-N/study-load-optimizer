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

type DayEvent = { id: string; timestamp: number; label: string; pillClass: string };

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
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString.replace(/-/g, "/"));
  }
  return new Date(dateString);
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
}

function getOptionalTimeLabel(value: string) {
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
  for (let i = leadingPadding; i > 0; i -= 1) days.push(new Date(year, month, 1 - i));
  for (let day = 1; day <= totalDaysInMonth; day += 1) days.push(new Date(year, month, day));
  const trailingPadding = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailingPadding; i += 1) days.push(new Date(year, month + 1, i));
  return days;
}

function generateWeekDays(anchorDate: Date) {
  const day = anchorDate.getDay();
  const sunday = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i));
}

function formatWeekRange(days: Date[]) {
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${fmt.format(days[0])} – ${fmt.format(days[6])}, ${days[6].getFullYear()}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function buildDayEvents(
  dayKey: string,
  assessmentMap: Record<string, Assessment[]>,
  sessionMap: Record<string, StudySession[]>,
  courseCodeById: Record<string, string>,
): DayEvent[] {
  const dayAssessments = assessmentMap[dayKey] ?? [];
  const daySessions = sessionMap[dayKey] ?? [];
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
        ? "bg-rose-50 text-rose-700 border-rose-400"
        : titleLower.includes("midterm") || typeLower.includes("midterm")
          ? "bg-amber-50 text-amber-700 border-amber-400"
          : "bg-[#e8f0fa] text-[#2B5EA7] border-[#2B5EA7]";
    events.push({ id: `a-${assessment.id}`, timestamp: Number.isNaN(when.getTime()) ? 0 : when.getTime(), label, pillClass });
  }

  for (const session of daySessions) {
    const courseCode = courseCodeById[session.course_id] ?? "";
    const start = new Date(session.start_time);
    const timeLabel = Number.isNaN(start.getTime()) ? "" : formatTime(start);
    const head = courseCode ? `${timeLabel} - ${courseCode}` : timeLabel;
    const label = head ? `${head} - ${session.title}` : session.title;
    events.push({ id: `s-${session.id}`, timestamp: Number.isNaN(start.getTime()) ? 0 : start.getTime(), label, pillClass: "bg-gray-50 text-[#6C757D] border-[#CED4DA]" });
  }

  events.sort((a, b) => a.timestamp - b.timestamp);
  return events;
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
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
        const [coursesRes, assessmentsRes, sessionsRes] = await Promise.all([
          api.get<Course[]>("/courses/"),
          api.get<Assessment[]>("/assessments/"),
          api.get<StudySession[]>("/study-sessions/"),
        ]);
        setCourses(coursesRes.data);
        setAssessments(assessmentsRes.data);
        setStudySessions(sessionsRes.data);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate]);
  const weekDays = useMemo(() => generateWeekDays(currentDate), [currentDate]);
  const courseCodeById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const course of courses) map[course.id] = course.course_code;
    return map;
  }, [courses]);

  const assessmentMap = useMemo(() => {
    return assessments.reduce<Record<string, Assessment[]>>((acc, a) => {
      const key = toLocalDateKey(parseLocalDate(a.due_date));
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});
  }, [assessments]);

  const sessionMap = useMemo(() => {
    return studySessions.reduce<Record<string, StudySession[]>>((acc, s) => {
      const key = toLocalDateKey(new Date(s.start_time));
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
  }, [studySessions]);

  const today = startOfLocalDay(new Date());
  const todayKey = toLocalDateKey(today);
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  // Navigation handlers per view mode
  const goPrev = () => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      if (viewMode === "week") return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7);
      return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1);
    });
  };
  const goNext = () => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      if (viewMode === "week") return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7);
      return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
    });
  };
  const goToday = () => {
    const now = new Date();
    if (viewMode === "month") {
      setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    } else {
      setCurrentDate(startOfLocalDay(now));
    }
  };

  // Sidebar mini-calendar always uses month-level nav
  const goPrevMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goNextMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  // Heading text per view mode
  const mainHeading = viewMode === "month"
    ? formatMonthYear(currentDate)
    : viewMode === "week"
      ? formatWeekRange(weekDays)
      : formatFullDate(currentDate);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Calendar Overview</h1>
          <p className="mt-1 text-sm text-[#6C757D]">View your assessments and study sessions at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-[#E9ECEF] bg-white p-1 shadow-sm">
            {(["month", "week", "day"] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setViewMode(mode)} className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${viewMode === mode ? "bg-[#F8F9FA] text-black" : "text-[#6C757D] hover:bg-[#F8F9FA]"}`}>
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
            <span className="material-symbols-outlined !text-[18px]">add</span>
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#E9ECEF] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <button type="button" onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)); setViewMode("month"); }} className="text-lg font-semibold text-black hover:text-[#2B5EA7] transition-colors cursor-pointer">
                {formatMonthYear(currentDate)}
              </button>
              <div className="flex items-center gap-1">
                <button type="button" onClick={goPrevMonth} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Previous month">
                  <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
                </button>
                <button type="button" onClick={goNextMonth} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Next month">
                  <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD]">
              {["S","M","T","W","T","F","S"].map((d, idx) => <span key={`${d}-${idx}`}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#6C757D]">
              {calendarDays.slice(0, 35).map((day) => {
                const key = toLocalDateKey(day);
                const isToday = key === todayKey;
                const inMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
                const hasEvents = !!(assessmentMap[key]?.length || sessionMap[key]?.length);
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => { setCurrentDate(startOfLocalDay(day)); setViewMode("day"); }}
                    className={`py-1 rounded-lg transition-colors cursor-pointer ${!inMonth ? "text-[#DEE2E6]" : ""} ${isToday ? "bg-[#2B5EA7] text-white font-bold" : "hover:bg-[#e8f0fa]"} ${hasEvents && !isToday ? "font-bold" : ""}`}
                  >
                    {day.getDate()}
                    {hasEvents && <span className="block mx-auto mt-0.5 h-1 w-1 rounded-full bg-[#2B5EA7]" style={isToday ? { backgroundColor: "white" } : {}} />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-[#E9ECEF] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-black">Event Types</h3>
            <div className="mt-4 space-y-3 text-sm text-[#6C757D]">
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-[#2B5EA7]" /><span>Quizzes</span></div>
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-amber-500" /><span>Midterms</span></div>
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-rose-500" /><span>Exams</span></div>
              <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-[#ADB5BD]" /><span>Study Sessions</span></div>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-[#E9ECEF] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">{mainHeading}</h2>
            <div className="flex items-center rounded-xl border border-[#E9ECEF] bg-white p-1 shadow-sm">
              <button type="button" onClick={goPrev} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Previous">
                <span className="material-symbols-outlined !text-[20px]">chevron_left</span>
              </button>
              <button type="button" onClick={goToday} className="mx-1 h-9 rounded-lg px-3 text-xs font-semibold text-[#6C757D] transition-colors hover:bg-[#F8F9FA]">Today</button>
              <button type="button" onClick={goNext} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6C757D] transition-colors hover:bg-[#F8F9FA]" aria-label="Next">
                <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-[#6C757D]">Loading calendar...</div>
          ) : viewMode === "month" ? (
            /* ── Month View ─────────────────────────────────────────── */
            <>
              <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-[#E9ECEF]">
                {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((day) => (
                  <div key={day} className="border-r border-[#E9ECEF] py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD] last:border-r-0">{day}</div>
                ))}
              </div>
              <div className="mt-0 grid grid-cols-7 auto-rows-fr overflow-hidden rounded-b-xl border border-t-0 border-[#E9ECEF]">
                {calendarDays.map((day) => {
                  const dayKey = toLocalDateKey(day);
                  const isToday = dayKey === todayKey;
                  const isCurrentMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
                  const events = buildDayEvents(dayKey, assessmentMap, sessionMap, courseCodeById);
                  const visible = events.slice(0, 3);
                  const extraCount = Math.max(0, events.length - visible.length);
                  const cellBorderRight = day.getDay() !== 6 ? "border-r border-[#E9ECEF]" : "";

                  return (
                    <div
                      key={dayKey}
                      onClick={() => { setCurrentDate(startOfLocalDay(day)); setViewMode("day"); }}
                      className={`calendar-grid-cell border-b border-[#E9ECEF] p-3 cursor-pointer transition-colors ${cellBorderRight} ${isCurrentMonth ? "bg-white hover:bg-[#e8f0fa]" : "bg-[#F8F9FA] hover:bg-[#E9ECEF]"}`}
                    >
                      <div className="flex items-start justify-between">
                        {isToday ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2B5EA7] text-[11px] font-bold text-white">{day.getDate()}</span>
                        ) : (
                          <span className={`text-xs font-semibold ${isCurrentMonth ? "text-[#6C757D]" : "text-[#DEE2E6]"}`}>{day.getDate()}</span>
                        )}
                      </div>
                      <div className="mt-2">
                        {visible.map((event) => (
                          <div key={event.id} className={`mb-1 truncate rounded-r-md border-l-[4px] px-2 py-1 text-[10px] font-semibold ${event.pillClass}`} title={event.label}>{event.label}</div>
                        ))}
                        {extraCount > 0 ? <div className="mt-1 text-[10px] font-medium text-[#ADB5BD]">+{extraCount} more</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : viewMode === "week" ? (
            /* ── Week View ──────────────────────────────────────────── */
            <div className="overflow-auto">
              {/* Day header row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#E9ECEF]">
                <div />
                {weekDays.map((day) => {
                  const key = toLocalDateKey(day);
                  const isToday = key === todayKey;
                  const dayAbbr = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day).toUpperCase();
                  return (
                    <div key={key} className="border-l border-[#E9ECEF] py-3 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD]">{dayAbbr}</div>
                      <div className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-[#2B5EA7] text-white" : "text-[#6C757D]"}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* All-day / untimed events strip */}
              {(() => {
                const hasAllDay = weekDays.some((day) => {
                  const events = buildDayEvents(toLocalDateKey(day), assessmentMap, sessionMap, courseCodeById);
                  return events.some((e) => e.timestamp === 0);
                });
                if (!hasAllDay) return null;
                return (
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#E9ECEF]">
                    <div className="py-2 pr-2 text-right text-[10px] font-semibold text-[#ADB5BD]">ALL DAY</div>
                    {weekDays.map((day) => {
                      const dayKey = toLocalDateKey(day);
                      const events = buildDayEvents(dayKey, assessmentMap, sessionMap, courseCodeById).filter((e) => e.timestamp === 0);
                      return (
                        <div key={dayKey} className="border-l border-[#E9ECEF] p-1">
                          {events.map((event) => (
                            <div key={event.id} className={`mb-1 truncate rounded-r-md border-l-[4px] px-2 py-1 text-[10px] font-semibold ${event.pillClass}`} title={event.label}>{event.label}</div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              {/* Hourly time grid */}
              <div className="max-h-[600px] overflow-y-auto">
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#E9ECEF]">
                    <div className="py-3 pr-2 text-right text-[10px] font-semibold text-[#ADB5BD]">{formatHourLabel(hour)}</div>
                    {weekDays.map((day) => {
                      const dayKey = toLocalDateKey(day);
                      const events = buildDayEvents(dayKey, assessmentMap, sessionMap, courseCodeById).filter((e) => {
                        if (e.timestamp === 0) return false;
                        return new Date(e.timestamp).getHours() === hour;
                      });
                      return (
                        <div key={`${dayKey}-${hour}`} className="min-h-[48px] border-l border-[#E9ECEF] p-1">
                          {events.map((event) => (
                            <div key={event.id} className={`mb-1 truncate rounded-r-md border-l-[4px] px-2 py-1 text-[10px] font-semibold ${event.pillClass}`} title={event.label}>{event.label}</div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Day View ───────────────────────────────────────────── */
            <div className="overflow-auto">
              {/* All-day strip */}
              {(() => {
                const dayKey = toLocalDateKey(currentDate);
                const allDayEvents = buildDayEvents(dayKey, assessmentMap, sessionMap, courseCodeById).filter((e) => e.timestamp === 0);
                if (allDayEvents.length === 0) return null;
                return (
                  <div className="mb-2 flex items-start gap-3 border-b border-[#E9ECEF] pb-3">
                    <span className="w-[60px] shrink-0 py-2 text-right text-[10px] font-semibold text-[#ADB5BD]">ALL DAY</span>
                    <div className="flex flex-wrap gap-2">
                      {allDayEvents.map((event) => (
                        <div key={event.id} className={`truncate rounded-r-md border-l-[4px] px-3 py-2 text-xs font-semibold ${event.pillClass}`} title={event.label}>{event.label}</div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {/* Hourly rows */}
              <div className="max-h-[600px] overflow-y-auto">
                {HOURS.map((hour) => {
                  const dayKey = toLocalDateKey(currentDate);
                  const events = buildDayEvents(dayKey, assessmentMap, sessionMap, courseCodeById).filter((e) => {
                    if (e.timestamp === 0) return false;
                    return new Date(e.timestamp).getHours() === hour;
                  });
                  return (
                    <div key={hour} className="flex border-b border-[#E9ECEF]">
                      <div className="w-[60px] shrink-0 py-3 pr-2 text-right text-[10px] font-semibold text-[#ADB5BD]">{formatHourLabel(hour)}</div>
                      <div className="min-h-[48px] flex-1 border-l border-[#E9ECEF] p-2">
                        {events.map((event) => (
                          <div key={event.id} className={`mb-1 truncate rounded-r-md border-l-[4px] px-3 py-2 text-xs font-semibold ${event.pillClass}`} title={event.label}>{event.label}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
