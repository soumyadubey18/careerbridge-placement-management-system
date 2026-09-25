import React from 'react';
import {
  Users,
  Layers,
  CalendarCheck2,
  Briefcase,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Server,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DashboardAnalytics } from './DashboardAnalytics';

interface DashboardViewProps {
  onOpenAddStudentModal: () => void;
  onOpenAddBatchModal: () => void;
  onOpenBackendDocsModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddStudentModal,
  onOpenAddBatchModal,
  onOpenBackendDocsModal,
}) => {
  const {
    students,
    batches,
    attendance,
    projects,
    openings,
    applications,
    mockTests,
    interviews,
    attentionItems,
    setActiveTab,
    currentUser,
  } = useApp();

  // Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'ACTIVE').length;
  const placedStudents = students.filter((s) => s.status === 'PLACED').length;
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  // Average attendance calculation
  const totalAttendancePct = students.reduce((acc, s) => acc + s.attendancePercentage, 0);
  const averageAttendance = totalStudents > 0 ? Math.round(totalAttendancePct / totalStudents) : 0;
  const criticalAttendanceCount = students.filter((s) => s.attendancePercentage < 75).length;

  // Placement pipeline counts
  const stageCounts = {
    APPLIED: applications.filter((a) => a.stage === 'APPLIED').length,
    SCREENING: applications.filter((a) => a.stage === 'SCREENING').length,
    INTERVIEW: applications.filter((a) => a.stage === 'INTERVIEW').length,
    SELECTED: applications.filter((a) => a.stage === 'SELECTED').length,
    REJECTED: applications.filter((a) => a.stage === 'REJECTED').length,
  };

  const upcomingTests = mockTests.filter((t) => t.status === 'SCHEDULED');
  const upcomingInterviews = interviews.filter((i) => i.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      {/* Welcome & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Operational Command Center
            </h1>
            <span className="text-xs text-slate-500">· {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Welcome back, <span className="font-semibold text-slate-900">{currentUser.name}</span>. Real-time overview of cohort learning milestones, attendance thresholds, assessment evaluations, and campus placement drives.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAddStudentModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Mark Attendance</span>
          </button>

          <button
            onClick={onOpenAddBatchModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Create Batch</span>
          </button>

          {onOpenBackendDocsModal && (
            <button
              onClick={onOpenBackendDocsModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title="Access Express backend API console & endpoints"
            >
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Backend API</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-emerald-600 font-medium">{activeStudents} Active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>{batches.length} Active Cohorts</span>
            <span className="group-hover:translate-x-0.5 transition-transform flex items-center text-indigo-600">
              Directory <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Batches */}
        <div
          onClick={() => setActiveTab('batches')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Cohorts</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{batches.length}</span>
            <span className="text-xs text-slate-500">Ongoing Sessions</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Capacity 105 Seats</span>
            <span className="group-hover:translate-x-0.5 transition-transform flex items-center text-blue-600">
              Batches <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Attendance Health */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Attendance Average</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{averageAttendance}%</span>
            {criticalAttendanceCount > 0 ? (
              <span className="text-xs text-amber-700 font-medium">
                {criticalAttendanceCount} Below 75%
              </span>
            ) : (
              <span className="text-xs text-emerald-600 font-medium">Healthy</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>{attendance.length} Logged Sessions</span>
            <span className="group-hover:translate-x-0.5 transition-transform flex items-center text-emerald-600">
              Audit <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Placements */}
        <div
          onClick={() => setActiveTab('placements')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Placed Candidates</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{placedStudents}</span>
            <span className="text-xs text-purple-700 font-medium">{placementRate}% Conversion</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>{openings.length} Campus Drives</span>
            <span className="group-hover:translate-x-0.5 transition-transform flex items-center text-purple-600">
              Pipeline <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section (Recharts) */}
      <DashboardAnalytics />

      {/* Main Grid: Attention Feed & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attention Items & Critical Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Operational Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Operational Attention Items
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {attentionItems.length} items require review
              </span>
            </div>

            {attentionItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All cohort thresholds, evaluations, and attendance health are in order!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.severity === 'high'
                              ? 'bg-rose-500'
                              : item.severity === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-medium text-slate-900 truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-4">{item.subtitle}</p>
                    </div>

                    <button
                      onClick={() => setActiveTab(item.targetTab)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/60 px-2 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <span>Take Action</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedule: Mock Tests & Mock Interviews */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Upcoming Assessments & Interviews
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('assessments')}
                className="text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upcoming Tests */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Scheduled Mock Tests</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {upcomingTests.length} tests
                  </span>
                </div>
                {upcomingTests.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No mock tests scheduled.</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingTests.slice(0, 2).map((t) => (
                      <div key={t.id} className="text-xs bg-white p-2 rounded border border-slate-200/80">
                        <div className="font-medium text-slate-900 truncate">{t.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{t.batchName}</span>
                          <span>·</span>
                          <span className="font-mono text-indigo-600">{t.scheduledDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Interviews */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Mock Interviews</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {upcomingInterviews.length} slots
                  </span>
                </div>
                {upcomingInterviews.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No mock interviews scheduled.</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingInterviews.slice(0, 2).map((i) => (
                      <div key={i.id} className="text-xs bg-white p-2 rounded border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{i.studentName}</span>
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
                            {i.round}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="truncate">{i.interviewer}</span>
                          <span>·</span>
                          <span className="font-mono text-slate-600">{i.scheduledDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Placement Pipeline Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Placement Pipeline
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('placements')}
                className="text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Applied</span>
                  <span className="font-semibold text-slate-900">{stageCounts.APPLIED}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-slate-400 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, stageCounts.APPLIED * 20)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Screening</span>
                  <span className="font-semibold text-slate-900">{stageCounts.SCREENING}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, stageCounts.SCREENING * 25)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Interviewing</span>
                  <span className="font-semibold text-slate-900">{stageCounts.INTERVIEW}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, stageCounts.INTERVIEW * 30)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Selected & Offered</span>
                  <span className="font-semibold text-emerald-700">{stageCounts.SELECTED}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, stageCounts.SELECTED * 35)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Placed Candidates */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Recent Offers Rolled Out
              </span>
              <div className="space-y-2">
                {applications
                  .filter((a) => a.stage === 'SELECTED')
                  .slice(0, 3)
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100/80 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-emerald-950">{app.studentName}</span>
                        <span className="font-semibold text-emerald-700">{app.offeredCtc}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700/80 mt-0.5">
                        {app.companyName} · {app.jobTitle}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Quick Cohort Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Cohort Distribution
            </h2>
            <div className="space-y-2.5 text-xs">
              {batches.map((b) => {
                const count = students.filter((s) => s.batchId === b.id).length;
                return (
                  <div key={b.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="font-medium text-slate-800">{b.name}</span>
                      <span className="block text-[11px] text-slate-500">{b.trainerName}</span>
                    </div>
                    <span className="text-slate-600 font-mono">
                      {count} / {b.capacity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
