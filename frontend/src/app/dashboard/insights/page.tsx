"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Course = {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
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

const PIE_COLORS = ["#3A7BD5", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

export default function InsightsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Failed to load insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const timePerCourseData = useMemo(() => {
    return courses.map((course) => {
      const totalMinutes = studySessions
        .filter((session) => session.course_id === course.id)
        .reduce((sum, session) => sum + session.duration_minutes, 0);

      return {
        name: course.course_code,
        minutes: totalMinutes,
      };
    });
  }, [courses, studySessions]);

  const assessmentsPerCourseData = useMemo(() => {
    return courses.map((course) => {
      const count = assessments.filter(
        (assessment) => assessment.course_id === course.id && !assessment.is_completed,
      ).length;

      return {
        name: course.course_code,
        count,
      };
    });
  }, [courses, assessments]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 p-6 md:p-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Study Insights</h1>
        <p className="mt-1 text-sm text-slate-600">
          Visualize where your time goes and which courses have the most pending deadlines.
        </p>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
          Loading insights...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Total Study Time per Course</h2>
            <div className="mt-4 h-[300px]">
              {timePerCourseData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No course data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePerCourseData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                      contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
                    />
                    <Bar dataKey="minutes" fill="#FFD54F" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Pending Deadlines by Course</h2>
            <div className="mt-4 h-[300px]">
              {assessmentsPerCourseData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No assessment data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assessmentsPerCourseData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      paddingAngle={3}
                    >
                      {assessmentsPerCourseData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
