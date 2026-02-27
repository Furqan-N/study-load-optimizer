'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api'; // Using your configured Axios instance

// Define the shape of your user data based on your FastAPI backend
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

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    courses: SearchCourse[];
    assessments: SearchAssessment[];
  }>({ courses: [], assessments: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch the current user. The Axios interceptor automatically attaches your JWT token!
        const response = await api.get('/auth/me'); // Update this path if your FastAPI route is different
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
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

  // Use the fetched name, or fallback to 'Student' while it loads
  const displayName = user?.full_name || user?.email || 'Loading...';
  const hasResults = searchResults.courses.length > 0 || searchResults.assessments.length > 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      <div className="w-96">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-soft-gray border-none focus:outline-none rounded-lg text-sm focus:ring-2 focus:ring-primary placeholder:text-slate-400"
            placeholder="Search courses, sessions or tasks..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length >= 2 ? (
            <div className="absolute top-full mt-2 w-full max-w-md rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              {isSearching ? (
                <p className="px-2 py-2 text-sm text-slate-500">Searching...</p>
              ) : !hasResults ? (
                <p className="px-2 py-2 text-sm text-slate-500">No results found for &quot;{searchQuery}&quot;</p>
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
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-slate-500 !text-[18px]">book_5</span>
                      <span className="text-sm text-slate-700">{course.course_code}</span>
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
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-slate-500 !text-[18px]">add_task</span>
                      <span className="text-sm text-slate-700">{assessment.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnread ? (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            ) : null}
          </button>

          {showNotifications ? (
            <div className="absolute right-0 top-10 z-20 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <button
                  type="button"
                  onClick={() => setHasUnread(false)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="px-4 py-5">
                <p className="text-sm text-slate-500">No new notifications. You&apos;re all caught up!</p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="h-8 w-[1px] bg-slate-200"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            {/* Inject dynamic name here */}
            <p className="text-sm font-semibold text-slate-900 leading-none">{displayName}</p>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter mt-1">Student</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary/40 overflow-hidden">
            {/* Dynamically generate the avatar based on the user's fetched name */}
            <img 
              alt="User Profile" 
              className="h-full w-full object-cover" 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ffd54d&color=1E1E1E`} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
