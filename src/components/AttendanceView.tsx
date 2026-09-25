import React, { useState } from 'react';
import {
  CalendarCheck2,
  Check,
  X,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Search,
  Filter,
  UserCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';

export const AttendanceView: React.FC = () => {
  const {
    batches,
    students,
    attendance,
    recordBatchAttendance,
    getStudentAttendanceStats,
    exportCsv,
  } = useApp();

  // Mode: 'mark' or 'health'
  const [viewMode, setViewMode] = useState<'mark' | 'health'>('mark');

  // Attendance Marking State
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Enrolled students in current selected batch
  const batchStudents = students.filter((s) => s.batchId === selectedBatchId);

  // Initialize marked state for students
  const [dailyMarks, setDailyMarks] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >({});

  // When batch or date changes, prefill existing attendance for that date if already logged
  React.useEffect(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
    batchStudents.forEach((s) => {
      const existing = attendance.find(
        (a) => a.studentId === s.id && a.date === sessionDate
      );
      initial[s.id] = {
        status: existing ? existing.status : 'PRESENT',
        notes: existing?.sessionNotes || '',
      };
    });
    setDailyMarks(initial);
  }, [selectedBatchId, sessionDate, batchStudents.length]);

  const handleToggleStatus = (studentId: string, status: AttendanceStatus) => {
    setDailyMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setDailyMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    batchStudents.forEach((s) => {
      updated[s.id] = {
        status,
        notes: dailyMarks[s.id]?.notes || '',
      };
    });
    setDailyMarks(updated);
  };

  const handleSaveSession = () => {
    const entries = batchStudents.map((s) => ({
      studentId: s.id,
      status: dailyMarks[s.id]?.status || 'PRESENT',
      notes: dailyMarks[s.id]?.notes,
    }));

    recordBatchAttendance(selectedBatchId, sessionDate, entries);
  };

  // Health Table Filters
  const [searchHealth, setSearchHealth] = useState('');
  const [healthBatchFilter, setHealthBatchFilter] = useState('ALL');
  const [onlyBelowThreshold, setOnlyBelowThreshold] = useState(false);

  const filteredHealthStudents = students.filter((s) => {
    const matchesSearch =
      searchHealth === '' ||
      s.name.toLowerCase().includes(searchHealth.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchHealth.toLowerCase());

    const matchesBatch =
      healthBatchFilter === 'ALL' || s.batchId === healthBatchFilter;

    const matchesThreshold = !onlyBelowThreshold || s.attendancePercentage < 75;

    return matchesSearch && matchesBatch && matchesThreshold;
  });

  const belowThresholdCount = students.filter((s) => s.attendancePercentage < 75).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Attendance & Health Monitoring
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Conduct daily roll calls by cohort, audit attendance percentages, and flag students at risk of placement disqualification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('mark')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'mark'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Take Roll Call
            </button>
            <button
              onClick={() => setViewMode('health')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'health'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit & Reports
            </button>
          </div>

          <button
            onClick={() => exportCsv('attendance')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">CSV Report</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Daily Roll Call */}
      {viewMode === 'mark' && (
        <div className="space-y-4">
          {/* Batch & Date Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Select Cohort Batch
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.trainerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Bulk actions */}
            <div className="flex items-center gap-2 self-start md:self-end">
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                Mark All Absent
              </button>
              <button
                type="button"
                onClick={handleSaveSession}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Save Daily Session
              </button>
            </div>
          </div>

          {/* Roll Call Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Enrolled Trainees: {batchStudents.length} Students
              </span>
              <span className="text-xs text-slate-500">
                Session Date: <strong className="font-mono text-slate-700">{sessionDate}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Student & Roll No</th>
                    <th className="py-3 px-4">Historical Attendance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Session Remarks / Absence Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">
                        No students enrolled in this batch.
                      </td>
                    </tr>
                  ) : (
                    batchStudents.map((student) => {
                      const currentStatus =
                        dailyMarks[student.id]?.status || 'PRESENT';
                      const currentNotes = dailyMarks[student.id]?.notes || '';

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">
                              {student.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {student.rollNo}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold font-mono ${
                                  student.attendancePercentage < 75
                                    ? 'text-rose-600'
                                    : 'text-slate-700'
                                }`}
                              >
                                {student.attendancePercentage}%
                              </span>
                              {student.attendancePercentage < 75 && (
                                <span className="text-[10px] text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  At Risk
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Present / Absent Segmented Toggle */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(student.id, 'PRESENT')
                                }
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(student.id, 'ABSENT')
                                }
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>

                          {/* Remarks */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="e.g. Approved leave, Sick, Arrived 30m late..."
                              value={currentNotes}
                              onChange={(e) =>
                                handleNotesChange(student.id, e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSession}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Save Daily Attendance Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Audit & Health Monitoring */}
      {viewMode === 'health' && (
        <div className="space-y-4">
          {/* Threshold Alert Banner */}
          {belowThresholdCount > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-900 block">
                  Attendance Deficit Notice ({belowThresholdCount} students below 75% cutoff)
                </span>
                <p className="text-amber-800 mt-0.5">
                  Institute policy requires a minimum of 75% attendance for students to remain eligible for campus placement drives and mock interview scheduling.
                </p>
              </div>
            </div>
          )}

          {/* Health Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchHealth}
                onChange={(e) => setSearchHealth(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="w-full md:w-56">
              <select
                value={healthBatchFilter}
                onChange={(e) => setHealthBatchFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 bg-white"
              >
                <option value="ALL">All Cohort Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setOnlyBelowThreshold(!onlyBelowThreshold)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border whitespace-nowrap cursor-pointer transition-colors ${
                onlyBelowThreshold
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Filter &lt;75% Attendance Only
            </button>
          </div>

          {/* Health Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Student Name & Roll No</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4 text-center">Sessions Logged</th>
                    <th className="py-3 px-4 text-center">Present</th>
                    <th className="py-3 px-4 text-center">Absent</th>
                    <th className="py-3 px-4">Overall Attendance</th>
                    <th className="py-3 px-4">Placement Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHealthStudents.map((s) => {
                    const stats = getStudentAttendanceStats(s.id);
                    const isBelow = stats.percentage < 75;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{s.name}</span>
                          <span className="text-[11px] font-mono text-slate-500">{s.rollNo}</span>
                        </td>

                        <td className="py-3 px-4 text-slate-600">{s.batchName}</td>

                        <td className="py-3 px-4 text-center font-mono font-medium text-slate-800">
                          {stats.total}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-emerald-600 font-semibold">
                          {stats.present}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-rose-600 font-semibold">
                          {stats.absent}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  isBelow ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, stats.percentage)}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono font-bold ${
                                isBelow ? 'text-rose-600' : 'text-slate-800'
                              }`}
                            >
                              {stats.percentage}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isBelow ? (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Disqualified (&lt;75%)
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Eligible (75%+ Passed)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
