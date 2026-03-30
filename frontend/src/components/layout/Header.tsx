'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { readStoredSelectedTermId } from '@/lib/selectedTermStorage';

interface User {
  full_name: string;
  email: string;
}

interface SearchCourse {
  id: string;
  course_code: string;
  course_name: string;
}

interface SearchAssessment {
  id: string;
  title: string;
  assessment_type: string;
  due_date: string;
  course_id: string;
}

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/schedule": "Schedule",
  "/dashboard/courses": "Courses",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
  "/dashboard/assessments": "Assessments",
  "/dashboard/calendar": "Calendar",
};

interface Term {
  id: string;
  season: string;
  year: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    courses: SearchCourse[];
    assessments: SearchAssessment[];
  }>({ courses: [], assessments: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTermLabel, setSelectedTermLabel] = useState<string | null>(null);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [allAssessments, setAllAssessments] = useState<SearchAssessment[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch assessments and courses for notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessRes, coursesRes] = await Promise.all([
          api.get<SearchAssessment[]>('/assessments/'),
          api.get<Course[]>('/courses/'),
        ]);
        setAllAssessments(assessRes.data);
        setAllCourses(coursesRes.data);
      } catch {
        // ignore
      }
    };
    void fetchData();

    const handleUpdate = () => void fetchData();
    window.addEventListener("assessments-updated", handleUpdate);
    window.addEventListener("courses-updated", handleUpdate);
    return () => {
      window.removeEventListener("assessments-updated", handleUpdate);
      window.removeEventListener("courses-updated", handleUpdate);
    };
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const termsRef = useRef<Term[]>([]);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await api.get<Term[]>('/terms/');
        termsRef.current = response.data;
        const stored = readStoredSelectedTermId();
        if (stored) {
          const term = response.data.find((t) => t.id === stored);
          if (term) {
            setSelectedTermLabel(`${term.season} ${term.year}`);
          }
        }
      } catch {
        // ignore
      }
    };
    void fetchTerms();

    const handleTermChange = (e: Event) => {
      const termId = (e as CustomEvent<string | null>).detail;
      if (!termId) {
        setSelectedTermLabel(null);
        return;
      }
      const term = termsRef.current.find((t) => t.id === termId);
      if (term) {
        setSelectedTermLabel(`${term.season} ${term.year}`);
      }
    };
    window.addEventListener("term-selected", handleTermChange as EventListener);
    return () => {
      window.removeEventListener("term-selected", handleTermChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ courses: [], assessments: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const [coursesResponse, assessmentsResponse] = await Promise.all([
          api.get<SearchCourse[]>('/courses/'),
          api.get<SearchAssessment[]>('/assessments/'),
        ]);

        const query = searchQuery.toLowerCase();
        const courses = coursesResponse.data.filter(
          (course) =>
            course.course_code.toLowerCase().includes(query) ||
            course.course_name.toLowerCase().includes(query),
        );
        const assessments = assessmentsResponse.data.filter(
          (assessment) =>
            assessment.title.toLowerCase().includes(query) ||
            assessment.assessment_type.toLowerCase().includes(query),
        );

        setSearchResults({ courses, assessments });
      } catch (error) {
        console.error("Failed to search data:", error);
        setSearchResults({ courses: [], assessments: [] });
      } finally {
        setIsSearching(false);
      }
    };

    void runSearch();
  }, [searchQuery]);

  const displayName = user?.full_name || user?.email || 'Loading...';
  const hasResults = searchResults.courses.length > 0 || searchResults.assessments.length > 0;

  // Build breadcrumb
  const currentPage = breadcrumbMap[pathname] || (pathname.includes("/courses/") ? "Course Detail" : "Page");

  // Upcoming notifications: assessments due within 7 days
  const courseMap = useMemo(() => {
    const map: Record<string, Course> = {};
    allCourses.forEach((c) => { map[c.id] = c; });
    return map;
  }, [allCourses]);

  const upcomingNotifications = useMemo(() => {
    const today = startOfDay(new Date());
    const inSevenDays = new Date(today);
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    return allAssessments
      .filter((a) => {
        const due = new Date(a.due_date);
        return due >= today && due <= inSevenDays;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [allAssessments]);

  const formatNotifDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDay = startOfDay(date);

    if (dueDay.getTime() === today.getTime()) return "Today";
    if (dueDay.getTime() === tomorrow.getTime()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <header className="h-14 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-[#6C757D] hover:text-black transition-colors">Home</Link>
        <span className="text-[#CED4DA]">&rsaquo;</span>
        <span className="text-[#6C757D]">{selectedTermLabel ?? "No Term"}</span>
        <span className="text-[#CED4DA]">&rsaquo;</span>
        <span className="font-semibold text-black">{currentPage}</span>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D] group-focus-within:text-[#2B5EA7] !text-[18px]">search</span>
          <input
            className="w-64 pl-9 pr-4 py-1.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2B5EA7]/20 focus:border-[#2B5EA7] placeholder:text-[#ADB5BD] transition-colors"
            placeholder="Search..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length >= 2 ? (
            <div className="absolute top-full mt-2 w-full max-w-md rounded-xl border border-[#E9ECEF] bg-white p-2 shadow-lg z-50">
              {isSearching ? (
                <p className="px-2 py-2 text-sm text-[#6C757D]">Searching...</p>
              ) : !hasResults ? (
                <p className="px-2 py-2 text-sm text-[#6C757D]">No results for &quot;{searchQuery}&quot;</p>
              ) : (
                <div className="space-y-1">
                  {searchResults.courses.map((course) => (
                    <button
                      key={`course-${course.id}`}
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults({ courses: [], assessments: [] });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#6C757D] !text-[18px]">book_5</span>
                      <span className="text-sm text-black">{course.course_code}</span>
                    </button>
                  ))}
                  {searchResults.assessments.map((assessment) => (
                    <button
                      key={`assessment-${assessment.id}`}
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults({ courses: [], assessments: [] });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#6C757D] !text-[18px]">add_task</span>
                      <span className="text-sm text-black">{assessment.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative text-[#6C757D] hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined !text-[22px]">notifications</span>
            {upcomingNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2B5EA7] text-[9px] font-bold text-white">
                {upcomingNotifications.length > 9 ? "9+" : upcomingNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[#E9ECEF] bg-white shadow-lg z-50">
              <div className="px-4 py-3 border-b border-[#E9ECEF]">
                <p className="text-sm font-semibold text-black">Upcoming Deadlines</p>
                <p className="text-[10px] text-[#6C757D]">Next 7 days</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {upcomingNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <span className="material-symbols-outlined text-[#CED4DA] !text-[32px]">check_circle</span>
                    <p className="mt-2 text-sm text-[#6C757D]">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  upcomingNotifications.map((assessment) => {
                    const course = courseMap[assessment.course_id];
                    return (
                      <div
                        key={assessment.id}
                        className="flex items-start gap-3 px-4 py-3 border-b border-[#E9ECEF] last:border-0 hover:bg-[#F8F9FA] transition-colors"
                      >
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-[#2B5EA7] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black truncate">{assessment.title}</p>
                          <p className="text-[11px] text-[#6C757D]">{course?.course_code || "Unknown"}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#6C757D] shrink-0">
                          {formatNotifDate(assessment.due_date)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              {upcomingNotifications.length > 0 && (
                <div className="px-4 py-2 border-t border-[#E9ECEF]">
                  <Link
                    href="/dashboard/schedule"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[#2B5EA7] hover:underline"
                  >
                    View all deadlines
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User — click to go to settings */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="h-8 w-8 rounded-full overflow-hidden border border-[#E9ECEF]">
            <img
              alt="User Profile"
              className="h-full w-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2B5EA7&color=ffffff&size=32`}
            />
          </div>
          <span className="text-sm font-medium text-black hidden lg:block">{displayName}</span>
        </button>
      </div>
    </header>
  );
}
