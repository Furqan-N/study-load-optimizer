'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
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

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    courses: SearchCourse[];
    assessments: SearchAssessment[];
  }>({ courses: [], assessments: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTermLabel, setSelectedTermLabel] = useState<string | null>(null);

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

  return (
    <header className="h-14 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-[#6C757D] hover:text-black transition-colors">Home</Link>
        <span className="text-[#CED4DA]">›</span>
        <span className="text-[#6C757D]">{selectedTermLabel ?? "No Term"}</span>
        <span className="text-[#CED4DA]">›</span>
        <span className="font-semibold text-black">{currentPage}</span>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D] group-focus-within:text-[#288028] !text-[18px]">search</span>
          <input
            className="w-64 pl-9 pr-4 py-1.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#288028]/20 focus:border-[#288028] placeholder:text-[#ADB5BD] transition-colors"
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
        <button
          type="button"
          className="relative text-[#6C757D] hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined !text-[22px]">notifications</span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full overflow-hidden border border-[#E9ECEF]">
            <img
              alt="User Profile"
              className="h-full w-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=288028&color=ffffff&size=32`}
            />
          </div>
          <span className="text-sm font-medium text-black hidden lg:block">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
