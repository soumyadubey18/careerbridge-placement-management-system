import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  Plus,
  Users,
  Award,
  ChevronRight,
  X,
  Edit2,
  CheckCircle2,
  Star,
  MessageSquare,
  CalendarDays,
  AlertTriangle,
  Download,
  Sparkles,
  Share2,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MockTest, Interview, InterviewRound } from '../types';
import { generateIcsInvite, detectInterviewConflicts } from '../utils/calendarUtils';

export const AssessmentsView: React.FC = () => {
  const {
    mockTests,
    interviews,
    batches,
    students,
    addMockTest,
    updateTestScore,
    addInterview,
    updateInterview,
    setNotification,
    logAuditAction,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'tests' | 'interviews' | 'calendar'>('tests');
  const [calendarFilterRound, setCalendarFilterRound] = useState<string>('ALL');

  const { conflictMap, conflictCount } = useMemo(
    () => detectInterviewConflicts(interviews),
    [interviews]
  );

  // Modals
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showAddInterviewModal, setShowAddInterviewModal] = useState(false);
  const [selectedTestForGrading, setSelectedTestForGrading] = useState<MockTest | null>(null);
  const [selectedInterviewForEval, setSelectedInterviewForEval] = useState<Interview | null>(null);

  // Form states for new test
  const [newTest, setNewTest] = useState({
    title: '',
    topic: '',
    batchId: batches[0]?.id || '',
    scheduledDate: new Date().toISOString().split('T')[0],
    maxMarks: 100,
    passingMarks: 60,
  });

  // Form states for new interview
  const [newInterview, setNewInterview] = useState({
    studentId: students[0]?.id || '',
    round: 'Technical 1' as InterviewRound,
    interviewer: 'Vikram Seth (Lead Tech Trainer)',
    scheduledDate: '2026-10-05 11:00',
  });

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === newTest.batchId);
    addMockTest({
      title: newTest.title,
      topic: newTest.topic,
      batchId: newTest.batchId,
      batchName: batch?.name || 'Cohort',
      scheduledDate: newTest.scheduledDate,
      maxMarks: Number(newTest.maxMarks),
      passingMarks: Number(newTest.passingMarks),
      status: 'SCHEDULED',
    });
    setShowAddTestModal(false);
    setNewTest({
      title: '',
      topic: '',
      batchId: batches[0]?.id || '',
      scheduledDate: new Date().toISOString().split('T')[0],
      maxMarks: 100,
      passingMarks: 60,
    });
  };

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === newInterview.studentId);
    if (!stu) return;

    addInterview({
      studentId: stu.id,
      studentName: stu.name,
      batchName: stu.batchName,
      round: newInterview.round,
      interviewer: newInterview.interviewer,
      scheduledDate: newInterview.scheduledDate,
      status: 'SCHEDULED',
    });
    setShowAddInterviewModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Assessments & Mock Interviews
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Conduct timed coding sprint tests, record score distributions, and structure 1-on-1 technical/HR mock interview evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('tests')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'tests'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mock Tests ({mockTests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('interviews')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'interviews'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interview Roster ({interviews.length})
            </button>
            <button
              onClick={() => setActiveSubTab('calendar')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar Engine</span>
              {conflictCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          {activeSubTab === 'tests' ? (
            <button
              onClick={() => setShowAddTestModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Test</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddInterviewModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Interview Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Mock Tests */}
      {activeSubTab === 'tests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockTests.map((test) => {
            const hasResults = test.results && test.results.length > 0;
            const avgScore = hasResults
              ? Math.round(
                  test.results.reduce((acc, r) => acc + r.score, 0) /
                    test.results.length
                )
              : 0;
            const passCount = test.results.filter(
              (r) => r.score >= test.passingMarks
            ).length;

            return (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                      {test.batchName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        test.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{test.topic}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Scheduled Date:</span>
                      <span className="font-mono text-slate-800">{test.scheduledDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Max / Passing:</span>
                      <span className="font-mono text-slate-800">
                        {test.maxMarks} marks (Pass: {test.passingMarks})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Candidates Graded:</span>
                      <span className="font-semibold text-slate-800">
                        {test.results.length} students
                      </span>
                    </div>
                    {hasResults && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Class Average:</span>
                        <span className="font-semibold text-indigo-600 font-mono">
                          {avgScore} / {test.maxMarks} ({passCount} passed)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTestForGrading(test)}
                    className="w-full py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    View & Enter Candidate Scores
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab 2: Mock Interviews */}
      {activeSubTab === 'interviews' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Student Candidate</th>
                  <th className="py-3 px-4">Interview Round</th>
                  <th className="py-3 px-4">Interviewer</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Rating (1-10)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No mock interviews scheduled.
                    </td>
                  </tr>
                ) : (
                  interviews.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {item.studentName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.batchName}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {item.round}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">{item.interviewer}</td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {item.scheduledDate}
                      </td>

                      <td className="py-3 px-4">
                        {item.score ? (
                          <div className="flex items-center gap-1 font-bold text-slate-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{item.score} / 10</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedInterviewForEval(item)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded cursor-pointer transition-colors"
                        >
                          {item.score ? 'View Feedback' : 'Score & Feedback'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Interview Calendar & Scheduling Engine */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-5">
          {/* Calendar Controls & Conflict Analysis Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filter by Round:</span>
              </label>
              <select
                value={calendarFilterRound}
                onChange={(e) => setCalendarFilterRound(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Rounds ({interviews.length})</option>
                <option value="Technical 1">Technical 1</option>
                <option value="Technical 2">Technical 2</option>
                <option value="System Design">System Design</option>
                <option value="HR & Behavioral">HR & Behavioral</option>
                <option value="Director Round">Director Round</option>
              </select>
            </div>

            {/* Conflict Detection Status */}
            <div className="flex items-center gap-2">
              {conflictCount > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{conflictCount} Scheduling Conflict{conflictCount > 1 ? 's' : ''} Detected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Conflict-Free Schedule</span>
                </div>
              )}

              <button
                onClick={() => setShowAddInterviewModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Slot</span>
              </button>
            </div>
          </div>

          {/* Grouped Date-wise Interview Timeline */}
          {(() => {
            const filteredInterviews = interviews.filter(
              (i) => calendarFilterRound === 'ALL' || i.round === calendarFilterRound
            );

            // Group by Date string (e.g. "2026-10-05")
            const dateGroups: Record<string, Interview[]> = {};
            filteredInterviews.forEach((item) => {
              const dateKey = item.scheduledDate.split(' ')[0] || 'Unscheduled';
              if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
              dateGroups[dateKey].push(item);
            });

            const sortedDates = Object.keys(dateGroups).sort();

            if (sortedDates.length === 0) {
              return (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No interview slots match the selected criteria.
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {sortedDates.map((dateStr) => {
                  const daySlots = dateGroups[dateStr];
                  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString(
                    'en-US',
                    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
                  );

                  return (
                    <div key={dateStr} className="space-y-3">
                      {/* Date Header Pill */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {formattedDate}
                          </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {daySlots.length} {daySlots.length === 1 ? 'Session' : 'Sessions'}
                        </span>
                      </div>

                      {/* Slots Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {daySlots.map((item) => {
                          const time = item.scheduledDate.split(' ')[1] || '10:00';
                          const hasConflict = conflictMap[item.id];
                          const student = students.find((s) => s.id === item.studentId);

                          return (
                            <div
                              key={item.id}
                              className={`bg-white rounded-2xl border p-4.5 shadow-2xs hover:border-indigo-300 transition-all card-hover-effect flex flex-col justify-between ${
                                hasConflict
                                  ? 'border-rose-300 bg-rose-50/20'
                                  : 'border-slate-200/90'
                              }`}
                            >
                              <div className="space-y-2.5">
                                {/* Header: Time and Round Badge */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>{time} hrs</span>
                                  </div>

                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {item.round}
                                  </span>
                                </div>

                                {hasConflict && (
                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Time overlap detected with another candidate!</span>
                                  </div>
                                )}

                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                    {item.studentName}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Cohort: {item.batchName}
                                  </p>
                                  {student && (
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                                      <span>Attd: <strong>{student.attendancePercentage}%</strong></span>
                                      <span>·</span>
                                      <span>CGPA: <strong>{student.cgpa}</strong></span>
                                    </div>
                                  )}
                                </div>

                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">Interviewer:</span>
                                    <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                                      {item.interviewer}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">Status:</span>
                                    <span className={`font-semibold ${
                                      item.status === 'COMPLETED' ? 'text-emerald-700' : 'text-blue-700'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                </div>

                                {item.score && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                    <span>Score: {item.score} / 10</span>
                                  </div>
                                )}
                              </div>

                              {/* Card Actions: iCal Export and Evaluation */}
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    generateIcsInvite(item);
                                    setNotification(`Exported .ics calendar invite for ${item.studentName} (${item.round})!`);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                  title="Add to Google Calendar, Apple Calendar, or Outlook (.ics)"
                                >
                                  <Download className="w-3.5 h-3.5 text-slate-500" />
                                  <span>.ics Invite</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedInterviewForEval(item)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  {item.score ? 'Feedback' : 'Evaluate'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Grade / View Test Scores Modal */}
      {selectedTestForGrading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedTestForGrading.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedTestForGrading.batchName} · Max Marks: {selectedTestForGrading.maxMarks} (Pass: {selectedTestForGrading.passingMarks})
                </p>
              </div>
              <button
                onClick={() => setSelectedTestForGrading(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Score / {selectedTestForGrading.maxMarks}</th>
                    <th className="py-2.5 px-3">Percentage</th>
                    <th className="py-2.5 px-3">Qualitative Feedback</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => s.batchId === selectedTestForGrading.batchId)
                    .map((stu) => {
                      const res = selectedTestForGrading.results.find(
                        (r) => r.studentId === stu.id
                      );
                      const currentScore = res?.score || 0;
                      const currentFeedback = res?.feedback || '';

                      return (
                        <tr key={stu.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900 block">{stu.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{stu.rollNo}</span>
                          </td>

                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="0"
                              max={selectedTestForGrading.maxMarks}
                              defaultValue={currentScore}
                              id={`score-input-${stu.id}`}
                              className="w-16 px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                            />
                          </td>

                          <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                            {res ? `${res.percentage}%` : '—'}
                          </td>

                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              placeholder="Feedback on algorithmic approach..."
                              defaultValue={currentFeedback}
                              id={`feedback-input-${stu.id}`}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-slate-700 text-xs"
                            />
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                const scoreEl = document.getElementById(
                                  `score-input-${stu.id}`
                                ) as HTMLInputElement;
                                const fbEl = document.getElementById(
                                  `feedback-input-${stu.id}`
                                ) as HTMLInputElement;
                                const sc = Number(scoreEl?.value) || 0;
                                updateTestScore(
                                  selectedTestForGrading.id,
                                  stu.id,
                                  sc,
                                  fbEl?.value
                                );
                              }}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-medium cursor-pointer"
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTestForGrading(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluate Mock Interview Modal */}
      {selectedInterviewForEval && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Mock Interview Evaluation: {selectedInterviewForEval.studentName}
              </h2>
              <button
                onClick={() => setSelectedInterviewForEval(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateInterview(selectedInterviewForEval.id, {
                  score: selectedInterviewForEval.score,
                  feedback: selectedInterviewForEval.feedback,
                  strengths: selectedInterviewForEval.strengths,
                  improvements: selectedInterviewForEval.improvements,
                  status: 'COMPLETED',
                });
                setSelectedInterviewForEval(null);
              }}
              className="space-y-3.5 mt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Rating Score (1 to 10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={selectedInterviewForEval.score || 8}
                    onChange={(e) =>
                      setSelectedInterviewForEval({
                        ...selectedInterviewForEval,
                        score: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Round</label>
                  <input
                    type="text"
                    disabled
                    value={selectedInterviewForEval.round}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Key Strengths Demonstrated</label>
                <input
                  type="text"
                  placeholder="e.g. Strong data modeling, crisp communication..."
                  value={selectedInterviewForEval.strengths || ''}
                  onChange={(e) =>
                    setSelectedInterviewForEval({
                      ...selectedInterviewForEval,
                      strengths: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Areas for Improvement</label>
                <input
                  type="text"
                  placeholder="e.g. Needs deeper practice with concurrency and deadlock prevention..."
                  value={selectedInterviewForEval.improvements || ''}
                  onChange={(e) =>
                    setSelectedInterviewForEval({
                      ...selectedInterviewForEval,
                      improvements: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Comprehensive Mentor Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed notes on problem solving, questions asked, and readiness..."
                  value={selectedInterviewForEval.feedback || ''}
                  onChange={(e) =>
                    setSelectedInterviewForEval({
                      ...selectedInterviewForEval,
                      feedback: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInterviewForEval(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
                >
                  Submit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule New Test Modal */}
      {showAddTestModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Schedule Mock Assessment</h2>
              <button
                onClick={() => setShowAddTestModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Docker Containerization"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Topics Covered</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microservices, REST contracts, Kafka, Dockerfile optimization"
                  value={newTest.topic}
                  onChange={(e) => setNewTest({ ...newTest, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Cohort</label>
                  <select
                    value={newTest.batchId}
                    onChange={(e) => setNewTest({ ...newTest, batchId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={newTest.scheduledDate}
                    onChange={(e) => setNewTest({ ...newTest, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Max Marks</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={newTest.maxMarks}
                    onChange={(e) => setNewTest({ ...newTest, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Passing Marks Cutoff</label>
                  <input
                    type="number"
                    min="1"
                    max={newTest.maxMarks}
                    required
                    value={newTest.passingMarks}
                    onChange={(e) =>
                      setNewTest({ ...newTest, passingMarks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTestModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
                >
                  Schedule Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule New Interview Modal */}
      {showAddInterviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Schedule Mock Interview Slot</h2>
              <button
                onClick={() => setShowAddInterviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Candidate Student</label>
                <select
                  value={newInterview.studentId}
                  onChange={(e) =>
                    setNewInterview({ ...newInterview, studentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo} · {s.batchName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Interview Round</label>
                  <select
                    value={newInterview.round}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        round: e.target.value as InterviewRound,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Technical 1">Technical 1</option>
                    <option value="Technical 2">Technical 2</option>
                    <option value="System Design">System Design</option>
                    <option value="HR & Behavioral">HR & Behavioral</option>
                    <option value="Director Round">Director Round</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date & Time Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM-DD HH:MM"
                    value={newInterview.scheduledDate}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, scheduledDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Designated Interviewer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Seth (Senior Tech Lead)"
                  value={newInterview.interviewer}
                  onChange={(e) =>
                    setNewInterview({ ...newInterview, interviewer: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddInterviewModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
