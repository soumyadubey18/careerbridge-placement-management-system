import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  UserCheck,
  Building,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Layers,
  Award,
  FileDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, StudentStatus } from '../types';
import { generateCertificatePdf } from '../utils/generateDocumentsPdf';

interface StudentsViewProps {
  onOpenAddModal: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ onOpenAddModal }) => {
  const {
    students,
    batches,
    attendance,
    mockTests,
    interviews,
    projects,
    applications,
    updateStudent,
    deleteStudent,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [onlyAttendanceRisk, setOnlyAttendanceRisk] = useState<boolean>(false);

  // Profile modal / drawer
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'attendance' | 'tests' | 'interviews' | 'placements'>('overview');

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));

      // Batch
      const matchesBatch =
        selectedBatchFilter === 'ALL' || s.batchId === selectedBatchFilter;

      // Status
      const matchesStatus =
        selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;

      // Attendance Risk
      const matchesRisk = !onlyAttendanceRisk || s.attendancePercentage < 75;

      return matchesSearch && matchesBatch && matchesStatus && matchesRisk;
    });
  }, [students, searchQuery, selectedBatchFilter, selectedStatusFilter, onlyAttendanceRisk]);

  const handleStatusChange = (studentId: string, newStatus: StudentStatus) => {
    updateStudent(studentId, { status: newStatus });
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      if (viewingStudent?.id === studentToDelete.id) setViewingStudent(null);
      setStudentToDelete(null);
    }
  };

  // Student specific data for 360 drawer
  const studentAttendanceRecords = viewingStudent
    ? attendance.filter((a) => a.studentId === viewingStudent.id)
    : [];

  const studentTestResults = viewingStudent
    ? mockTests.flatMap((t) => {
        const res = t.results.find((r) => r.studentId === viewingStudent.id);
        return res ? [{ ...res, testTitle: t.title, testTopic: t.topic, date: t.scheduledDate }] : [];
      })
    : [];

  const studentInterviews = viewingStudent
    ? interviews.filter((i) => i.studentId === viewingStudent.id)
    : [];

  const studentProjects = viewingStudent
    ? projects.filter((p) => p.memberIds.includes(viewingStudent.id))
    : [];

  const studentApplications = viewingStudent
    ? applications.filter((a) => a.studentId === viewingStudent.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Students Directory
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage enrolled cohort trainees, skill profiles, academic standing, and placement records.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, roll number, or skill (e.g. React, Java, Docker)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Batch Selector */}
          <div className="w-full md:w-56">
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
            >
              <option value="ALL">All Cohort Batches ({batches.length})</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PLACED">Placed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyAttendanceRisk(!onlyAttendanceRisk)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                onlyAttendanceRisk
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Below 75% Attendance Only
            </button>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of {students.length} students
            </span>
          </div>

          {(searchQuery || selectedBatchFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || onlyAttendanceRisk) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBatchFilter('ALL');
                setSelectedStatusFilter('ALL');
                setOnlyAttendanceRisk(false);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-4">Batch Cohort</th>
                <th className="py-3 px-4">Academic & CGPA</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isLowAttendance = student.attendancePercentage < 75;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setViewingStudent(student)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-slate-600">{student.rollNo}</span>
                          <span>·</span>
                          <span className="truncate max-w-[150px]">{student.email}</span>
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{student.batchName}</div>
                        <div className="text-[11px] text-slate-500">
                          Joined {student.joiningDate}
                        </div>
                      </td>

                      {/* Academic */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 truncate max-w-[180px] font-medium">
                          {student.degree}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>CGPA: <strong className="text-slate-700">{student.cgpa}</strong></span>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">{student.college}</span>
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                isLowAttendance ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, student.attendancePercentage)}%` }}
                            />
                          </div>
                          <span
                            className={`font-semibold font-mono ${
                              isLowAttendance ? 'text-rose-600' : 'text-slate-700'
                            }`}
                          >
                            {student.attendancePercentage}%
                          </span>
                        </div>
                        {isLowAttendance && (
                          <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                            Needs attention (&lt;75%)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <select
                          value={student.status}
                          onChange={(e) =>
                            handleStatusChange(student.id, e.target.value as StudentStatus)
                          }
                          className={`text-[11px] font-medium px-2 py-1 rounded border cursor-pointer ${
                            student.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : student.status === 'PLACED'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : student.status === 'ON_HOLD'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PLACED">PLACED</option>
                          <option value="ON_HOLD">ON HOLD</option>
                          <option value="ALUMNI">ALUMNI</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded cursor-pointer transition-colors"
                          >
                            360° Profile
                          </button>
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student 360° Profile Drawer / Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                  {viewingStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      {viewingStudent.name}
                    </h2>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        viewingStudent.status === 'PLACED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : viewingStudent.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {viewingStudent.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {viewingStudent.rollNo} · {viewingStudent.batchName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const stuBatch = batches.find((b) => b.id === viewingStudent.batchId);
                    generateCertificatePdf({ student: viewingStudent, batch: stuBatch });
                  }}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Accredited Course Completion Certificate PDF"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Certificate PDF</span>
                </button>

                <button
                  onClick={() => setViewingStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 overflow-x-auto bg-white text-xs">
              {[
                { id: 'overview', label: 'Profile Overview' },
                { id: 'attendance', label: `Attendance (${studentAttendanceRecords.length})` },
                { id: 'tests', label: `Assessments (${studentTestResults.length})` },
                { id: 'interviews', label: `Interviews (${studentInterviews.length})` },
                { id: 'placements', label: `Job Applications (${studentApplications.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id as any)}
                  className={`pb-2.5 px-3 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                    profileTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-5 flex-1 space-y-6 text-xs overflow-y-auto">
              {profileTab === 'overview' && (
                <div className="space-y-5">
                  {/* Contact & College Grid */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Email Address</span>
                      <span className="font-medium text-slate-800">{viewingStudent.email}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Phone Number</span>
                      <span className="font-medium text-slate-800">{viewingStudent.phone}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">College / University</span>
                      <span className="font-medium text-slate-800">{viewingStudent.college}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Degree & CGPA</span>
                      <span className="font-medium text-slate-800">
                        {viewingStudent.degree} · <strong className="text-indigo-600">{viewingStudent.cgpa}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Skills Cloud */}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block mb-2">
                      Technical Skills & Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingStudent.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trainer Observations */}
                  {viewingStudent.notes && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                      <span className="text-[11px] font-semibold text-amber-900 block mb-1">
                        Mentor Observations & Notes
                      </span>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {viewingStudent.notes}
                      </p>
                    </div>
                  )}

                  {/* Capstone Projects Enrolled */}
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block mb-2">
                      Capstone Project Assignments
                    </span>
                    {studentProjects.length === 0 ? (
                      <p className="text-slate-400">No project assignments linked yet.</p>
                    ) : (
                      studentProjects.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 border border-slate-200 rounded-lg bg-white space-y-1 mb-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900">{p.title}</span>
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                              {p.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{p.domain}</p>
                          {p.evaluationScore && (
                            <p className="text-[11px] text-emerald-700 font-medium">
                              Evaluation Score: {p.evaluationScore}/100
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {profileTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Overall Attendance Record</span>
                      <span className="text-xl font-bold text-slate-900">
                        {viewingStudent.attendancePercentage}%
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                        viewingStudent.attendancePercentage >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {viewingStudent.attendancePercentage >= 75
                        ? 'Eligible for Campus Placement'
                        : 'Attendance Deficit Warning'}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Session Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Session Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentAttendanceRecords.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-slate-400">
                              No session records found.
                            </td>
                          </tr>
                        ) : (
                          studentAttendanceRecords.map((att) => (
                            <tr key={att.id}>
                              <td className="py-2.5 px-3 font-mono">{att.date}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                    att.status === 'PRESENT'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-rose-50 text-rose-700'
                                  }`}
                                >
                                  {att.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">
                                {att.sessionNotes || 'Regular session'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {profileTab === 'tests' && (
                <div className="space-y-3">
                  {studentTestResults.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      No mock test results evaluated for this student.
                    </p>
                  ) : (
                    studentTestResults.map((tr) => (
                      <div
                        key={tr.id}
                        className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{tr.testTitle}</span>
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {tr.score} / {tr.maxScore} ({tr.percentage}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{tr.testTopic}</p>
                        {tr.feedback && (
                          <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-600 mt-1">
                            <span className="font-medium text-slate-700">Trainer Feedback: </span>
                            {tr.feedback}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {profileTab === 'interviews' && (
                <div className="space-y-3">
                  {studentInterviews.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      No mock interviews recorded.
                    </p>
                  ) : (
                    studentInterviews.map((int) => (
                      <div
                        key={int.id}
                        className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{int.round}</span>
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                            {int.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Interviewer: {int.interviewer}</span>
                          <span>·</span>
                          <span className="font-mono">{int.scheduledDate}</span>
                        </div>
                        {int.score && (
                          <div className="text-xs font-semibold text-slate-800">
                            Rating: {int.score} / 10
                          </div>
                        )}
                        {int.feedback && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                            {int.feedback}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {profileTab === 'placements' && (
                <div className="space-y-3">
                  {studentApplications.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      No active campus placement applications recorded.
                    </p>
                  ) : (
                    studentApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{app.companyName}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              app.stage === 'SELECTED'
                                ? 'bg-emerald-50 text-emerald-800'
                                : app.stage === 'INTERVIEW'
                                ? 'bg-indigo-50 text-indigo-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {app.stage}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">{app.jobTitle}</p>
                        {app.offeredCtc && (
                          <p className="text-[11px] text-emerald-700 font-bold">
                            Offered CTC: {app.offeredCtc}
                          </p>
                        )}
                        {app.notes && (
                          <p className="text-[11px] text-slate-500">{app.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Edit Student Details: {editingStudent.name}
              </h2>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStudent(editingStudent.id, {
                  name: editingStudent.name,
                  email: editingStudent.email,
                  phone: editingStudent.phone,
                  batchId: editingStudent.batchId,
                  cgpa: editingStudent.cgpa,
                  status: editingStudent.status,
                  notes: editingStudent.notes,
                });
                setEditingStudent(null);
              }}
              className="space-y-3.5 mt-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingStudent.email}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.phone}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Batch</label>
                  <select
                    value={editingStudent.batchId}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, batchId: e.target.value })
                    }
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
                  <label className="block text-slate-700 font-medium mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingStudent.cgpa}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        cgpa: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Observations / Notes</label>
                <textarea
                  rows={2}
                  value={editingStudent.notes || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remove Student Directory Record</h3>
                <p className="text-xs text-slate-500">Action is tracked in the institutional audit log</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
              Are you sure you want to permanently remove <strong className="text-slate-900">{studentToDelete.name}</strong> (Roll No: <span className="font-mono text-indigo-600 font-semibold">{studentToDelete.rollNo}</span>) from the training directory?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
