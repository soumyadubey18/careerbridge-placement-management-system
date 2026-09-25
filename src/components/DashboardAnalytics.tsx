import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Layers,
  Briefcase,
  Users,
  CalendarCheck2,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardAnalytics: React.FC = () => {
  const { students, batches, mockTests, applications, openings, projects } = useApp();

  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'performance' | 'batches' | 'placements'>('all');

  // 1. Student Performance Data per Assessment
  const assessmentData = mockTests.map((t) => {
    const scores = t.results.map((r) => r.percentage);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const passThreshold = Math.round((t.passingMarks / t.maxMarks) * 100);

    return {
      name: t.title.length > 20 ? t.title.slice(0, 18) + '...' : t.title,
      fullName: t.title,
      batch: t.batchName,
      avgScore,
      maxScore,
      minScore,
      passThreshold,
      candidatesCount: t.results.length,
    };
  });

  // 2. Batch Completion & Progress Rates
  const batchProgressData = batches.map((b) => {
    const batchStudents = students.filter((s) => s.batchId === b.id);
    const totalEnrolled = batchStudents.length;
    const capacityPct = Math.round((totalEnrolled / b.capacity) * 100);

    // Batch average attendance
    const avgAttendance =
      totalEnrolled > 0
        ? Math.round(batchStudents.reduce((acc, s) => acc + s.attendancePercentage, 0) / totalEnrolled)
        : 0;

    // Batch projects completed or submitted
    const batchProjects = projects.filter((p) => p.batchId === b.id);
    const completedProjects = batchProjects.filter((p) => p.status === 'COMPLETED' || p.status === 'SUBMITTED').length;
    const projectCompletionRate = batchProjects.length > 0 ? Math.round((completedProjects / batchProjects.length) * 100) : 0;

    return {
      name: b.name.length > 18 ? b.name.slice(0, 16) + '...' : b.name,
      fullName: b.name,
      trainer: b.trainerName,
      enrolled: totalEnrolled,
      capacityPct,
      avgAttendance,
      projectCompletionRate,
    };
  });

  // 3. Placement Trends & Pipeline Progression
  const stageData = [
    {
      stage: 'Applied',
      count: applications.filter((a) => a.stage === 'APPLIED').length,
      fill: '#94a3b8',
    },
    {
      stage: 'Screening',
      count: applications.filter((a) => a.stage === 'SCREENING').length,
      fill: '#38bdf8',
    },
    {
      stage: 'Interviewing',
      count: applications.filter((a) => a.stage === 'INTERVIEW').length,
      fill: '#6366f1',
    },
    {
      stage: 'Offered / Selected',
      count: applications.filter((a) => a.stage === 'SELECTED').length,
      fill: '#10b981',
    },
  ];

  // CTC Package Distribution
  const ctcDistributionData = [
    { tier: '6 - 8 LPA', count: 1, color: '#93c5fd' },
    { tier: '8 - 10 LPA', count: 2, color: '#60a5fa' },
    { tier: '10 - 12 LPA', count: 1, color: '#3b82f6' },
    { tier: '12+ LPA', count: 2, color: '#1d4ed8' },
  ];

  // Top Key Stats
  const topPackage = '14.0 LPA';
  const avgPackage = '9.8 LPA';
  const highestTestScore = Math.max(...mockTests.flatMap((t) => t.results.map((r) => r.percentage)), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Institutional Performance & Placement Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual telemetry across assessment benchmarks, batch milestones, and placement conversion funnels
          </p>
        </div>

        {/* Segmented Filter */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveMetricTab('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeMetricTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Analytics
          </button>
          <button
            onClick={() => setActiveMetricTab('performance')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeMetricTab === 'performance'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Tests
          </button>
          <button
            onClick={() => setActiveMetricTab('batches')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeMetricTab === 'batches'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Progress
          </button>
          <button
            onClick={() => setActiveMetricTab('placements')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeMetricTab === 'placements'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Placement Funnel
          </button>
        </div>
      </div>

      {/* Analytics Highlights Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <span className="text-[11px] text-slate-500 block font-medium">Highest Test Score</span>
          <div className="text-xl font-bold font-mono text-indigo-600 mt-1">{highestTestScore}%</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">DSA & React Benchmarks</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <span className="text-[11px] text-slate-500 block font-medium">Average Cohort Attendance</span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">82%</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Across 3 active cohorts</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <span className="text-[11px] text-slate-500 block font-medium">Average CTC Offered</span>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">{avgPackage}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Product & Cloud Roles</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <span className="text-[11px] text-slate-500 block font-medium">Peak Campus Package</span>
          <div className="text-xl font-bold font-mono text-purple-600 mt-1">{topPackage}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Razorpay Dev Hub</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Assessment Benchmarks */}
        {(activeMetricTab === 'all' || activeMetricTab === 'performance') && (
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  Mock Assessment Performance Benchmark (%)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {mockTests.length} tests evaluated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Comparison of Class Average vs Highest Candidate Score and Passing Threshold
              </p>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assessmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        padding: '8px 12px',
                      }}
                      formatter={(val: any) => [`${val}%`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="avgScore" name="Class Average %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maxScore" name="Highest Score %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passThreshold" name="Passing Cutoff %" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 flex items-center justify-between">
              <span>Top Assessment: React Architecture (96% Peak)</span>
              <span className="text-emerald-600 font-medium">85% Aggregate Pass Rate</span>
            </div>
          </div>
        )}

        {/* Chart 2: Batch Completion & Milestones */}
        {(activeMetricTab === 'all' || activeMetricTab === 'batches') && (
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  Cohort Milestone & Completion Health
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {batches.length} active cohorts
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Enrolled Capacity vs Attendance Health % and Capstone Project Submissions
              </p>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={batchProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        padding: '8px 12px',
                      }}
                      formatter={(val: any) => [`${val}%`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="avgAttendance" name="Attendance Average %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="projectCompletionRate" name="Project Completion %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacityPct" name="Seat Capacity Filled %" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 flex items-center justify-between">
              <span>Leading Cohort: Full Stack Java (96% Attendance)</span>
              <span className="text-indigo-600 font-medium">100% Capstone Progress</span>
            </div>
          </div>
        )}

        {/* Chart 3: Placement Pipeline Funnel */}
        {(activeMetricTab === 'all' || activeMetricTab === 'placements') && (
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  Campus Placement Pipeline Conversion Funnel
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {applications.length} applications logged
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Progressive candidate volume from Initial Application through Formal Offer
              </p>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={stageData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 500 }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        padding: '8px 12px',
                      }}
                      formatter={(val: any) => [`${val} Candidates`, 'Volume']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 flex items-center justify-between">
              <span>Conversion to Offer: 33% of applicants selected</span>
              <span className="text-emerald-700 font-medium">Juspay & Tata Elxsi</span>
            </div>
          </div>
        )}

        {/* Chart 4: Annual CTC Package Tier Distribution */}
        {(activeMetricTab === 'all' || activeMetricTab === 'placements') && (
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  Annual Package (CTC) Tier Distribution
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {openings.length} Campus Drives
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Compensation tiers for software engineering, cloud, and machine learning roles
              </p>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={ctcDistributionData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorCtc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="tier"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        padding: '8px 12px',
                      }}
                      formatter={(val: any) => [`${val} Open Roles`, 'Available Openings']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCtc)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 flex items-center justify-between">
              <span>Top Tier: Razorpay (14.0 LPA)</span>
              <span className="text-blue-600 font-medium">30+ Total Job Openings</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
