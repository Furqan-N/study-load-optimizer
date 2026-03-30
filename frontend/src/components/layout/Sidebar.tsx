"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { readStoredSelectedTermId } from "@/lib/selectedTermStorage";

type Course = {
  id: string;
  term_id: string;
  course_code: string;
  course_name: string;
};

const navLinks = [
  { href: "/dashboard", icon: "grid_view", label: "Home" },
  { href: "/dashboard/schedule", icon: "calendar_today", label: "Schedule" },
  { href: "/dashboard/insights", icon: "analytics", label: "Insights" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const courses = selectedTermId
    ? allCourses.filter((c) => c.term_id === selectedTermId)
    : allCourses;

  useEffect(() => {
    const stored = readStoredSelectedTermId();
    if (stored) setSelectedTermId(stored);

    const fetchCourses = async () => {
      try {
        const response = await api.get<Course[]>("/courses/");
        setAllCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses for sidebar:", error);
      }
    };
    fetchCourses();

    const handleUpdate = () => void fetchCourses();
    window.addEventListener("courses-updated", handleUpdate);
    window.addEventListener("assessments-updated", handleUpdate);

    const handleTermChange = (e: Event) => {
      const termId = (e as CustomEvent<string | null>).detail;
      setSelectedTermId(termId);
    };
    window.addEventListener("term-selected", handleTermChange as EventListener);

    return () => {
      window.removeEventListener("courses-updated", handleUpdate);
      window.removeEventListener("assessments-updated", handleUpdate);
      window.removeEventListener("term-selected", handleTermChange as EventListener);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isCourseActive = (courseId: string) =>
    pathname === `/dashboard/courses/${courseId}`;

  const allCoursesActive =
    pathname.startsWith("/dashboard/courses") &&
    !courses.some((c) => isCourseActive(c.id));

  const labelTx =
    "transition-[opacity,transform,width] duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]";
  const labelOn = "opacity-100 translate-x-0 w-auto";
  const labelOff =
    "opacity-0 -translate-x-3 w-0 pointer-events-none overflow-hidden";

  const ease = "cubic-bezier(0.25, 0.1, 0.25, 1)";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/10 lg:hidden transition-opacity duration-300 ${
          expanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setExpanded(false)}
      />

      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          width: expanded ? 300 : 200,
          transition: `width 400ms ${ease}`,
        }}
        className="bg-white border-r border-[#E9ECEF] flex flex-col items-start shrink-0 z-40 overflow-hidden"
      >
        {/* ─────────────────────── Logo ─────────────────────── */}
        <div className={`flex justify-start items-center gap-3 px-6 w-full transition-all duration-[400ms] ${expanded ? 'pt-4 pb-2' : 'pt-4 pb-3'}`}>
          {/* Logo fills the available width minus padding, no fixed px size */}
          <div className={`shrink-0 rounded-lg overflow-hidden transition-all duration-[400ms] ${expanded ? 'max-w-[36px]' : 'max-w-[40px]'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/syllabi-logo.svg"
              alt="Syllabi"
              className="w-full h-auto object-contain"
            />
          </div>
          <div
            className={`flex flex-col justify-center whitespace-nowrap min-w-0 shrink-0 ${labelTx} ${
              expanded ? labelOn : labelOff
            }`}
          >
            <span className="text-[16px] font-semibold text-slate-800 leading-none">
              Syllabi
            </span>
            <span className="text-[11px] font-normal text-slate-400 mt-1">
              Study Planner
            </span>
          </div>
        </div>

        {/* ─────────────────────── Nav ─────────────────────── */}
        <nav className="flex flex-col space-y-1 px-6 w-full">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden
                  transition-[background-color,color] duration-150 ease-out
                  text-slate-500 hover:bg-[#F0FDF4] hover:text-slate-800
                `}
              >
                <span className="absolute left-0 inset-y-0 w-[4px] rounded-r-full bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

                <span className="pl-3 shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">
                    {link.icon}
                  </span>
                </span>

                <span
                  className={`text-[13px] font-medium whitespace-nowrap ${labelTx} ${
                    expanded ? labelOn : labelOff
                  }`}
                >
                  {link.label}
                </span>

                {!expanded && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ─────────────────────── Divider ─────────────────────── */}
        <div className="h-px bg-slate-100 my-4 mx-6 w-[calc(100%-48px)]" />

        {/* ─────────────────────── Courses ─────────────────────── */}
        <div className="flex flex-col space-y-1 flex-1 overflow-y-auto overflow-x-hidden px-6 w-full">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 pl-3">
            {expanded ? "Courses" : "•••"}
          </span>

          {courses.map((course) => {
            const active = isCourseActive(course.id);
            return (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className={`
                  group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden
                  transition-[background-color,color] duration-150 ease-out
                  text-slate-500 hover:bg-[#F0FDF4] hover:text-slate-800
                `}
              >
                <span className="absolute left-0 inset-y-0 w-[4px] rounded-r-full bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

                <span className="pl-3 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    {course.course_code.replace(/\s+/g, "").slice(0, 7)}
                  </span>
                </span>

                <span
                  className={`text-[12px] font-normal text-slate-400 truncate min-w-0 ${labelTx} ${
                    expanded ? labelOn : labelOff
                  }`}
                >
                  {course.course_name}
                </span>

                {!expanded && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                    {course.course_code}
                  </span>
                )}
              </Link>
            );
          })}

          {courses.length === 0 && (
            <Link
              href="/dashboard/courses"
              className="group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden text-slate-500 hover:bg-[#F0FDF4] hover:text-slate-800 transition-[background-color,color] duration-150 ease-out"
            >
              <span className="absolute left-0 inset-y-0 w-[4px] rounded-r-full bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              <span className="pl-3 shrink-0">
                <span className="material-symbols-outlined !text-[20px] transition-transform duration-200 group-hover:rotate-90">
                  add
                </span>
              </span>
              <span
                className={`text-[13px] font-medium whitespace-nowrap ${labelTx} ${
                  expanded ? labelOn : labelOff
                }`}
              >
                Add courses
              </span>
              {!expanded && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                  Add courses
                </span>
              )}
            </Link>
          )}
        </div>

        {/* ─────────────────────── Bottom: All Courses ─────────────────────── */}
        <div className="px-6 pb-4 pt-2 w-full">
          <Link
            href="/dashboard/courses"
            className={`
              group relative flex justify-start items-center gap-4 h-10 rounded-lg overflow-hidden
              transition-[background-color,color] duration-150 ease-out
              text-slate-500 hover:bg-[#F0FDF4] hover:text-slate-800
            `}
          >
            <span className="absolute left-0 inset-y-0 w-[4px] rounded-r-full bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            <span className="pl-3 shrink-0">
              <span className="material-symbols-outlined !text-[20px]">
                book_5
              </span>
            </span>
            <span
              className={`text-[13px] font-medium whitespace-nowrap ${labelTx} ${
                expanded ? labelOn : labelOff
              }`}
            >
              All Courses
            </span>
            {!expanded && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50">
                All Courses
              </span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
