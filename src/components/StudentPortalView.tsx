import React, { useState } from 'react';
import {
  GraduationCap,
  CalendarCheck2,
  FolderGit2,
  FileCheck2,
  Briefcase,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Github,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudentPortalView: React.FC = () => {
  const {
    currentUser,
    students,
    batches,
    attendance,
    mockTests,
    interviews,
    projects,
    openings,
    applications,
    applyForJob,
  } = useApp();

  // Find student matching currentUser email, or default to first student
  const student =
    students.find((s) => s.email === currentUser.email) || students[0];

  const studentBatch = batches.find((b) => b.id === student?.batchId);

  // Student specific data
  const studentAttendanceRecords = student
    ? attendance.filter((a) => a.studentId === student.id)
    : [];

  const studentTestResults = student
    ? mockTests.flatMap((t) => {
        const res = t.results.find((r) => r.studentId === student.id);
        return res
          ? [{ ...res, testTitle: t.title, testTopic: t.topic, date: t.scheduledDate }]
          : [];
      })
    : [];

  const studentInterviews = student
    ? interviews.filter((i) => i.studentId === student.id)
    : [];

  const studentProject = student
    ? projects.find((p) => p.memberIds.includes(student.id))
    : null;

  const studentApplications = student
    ? applications.filter((a) => a.studentId === student.id)
    : [];

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        No student profile matched with current credentials.
      </div>
    );
  }

  const isAttendanceEligible = student.attendancePercentage >= 75;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
            {student.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                  student.status === 'PLACED'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {student.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Roll No: {student.rollNo} · {student.degree} ({student.college})
            </p>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
              <span>Cohort: <strong className="text-slate-800">{student.batchName}</strong></span>
              <span>·</span>
              <span>Academic CGPA: <strong className="text-indigo-600">{student.cgpa}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right min-w-[130px]">
            <span className="text-[11px] text-slate-400 block font-medium">My Attendance</span>
            <span
              className={`text-xl font-bold font-mono ${
                isAttendanceEligible ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {student.attendancePercentage}%
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5">
              {isAttendanceEligible ? 'Placement Eligible ✓' : 'Deficit (<75%) ⚠'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 3 Key Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Attendance Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">Attendance Log</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Recorded Sessions:</span>
              <span className="font-mono font-bold text-slate-800">
                {studentAttendanceRecords.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Present Sessions:</span>
              <span className="font-mono font-bold text-emerald-600">
                {studentAttendanceRecords.filter((a) => a.status === 'PRESENT').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Placement Threshold:</span>
              <span className="font-mono font-medium text-slate-700">75% Cutoff</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            {isAttendanceEligible ? (
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> All attendance requirements met.
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> Low attendance. Reach out to mentor.
              </span>
            )}
          </div>
        </div>

        {/* Assigned Capstone Project */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">Capstone Project</span>
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
          </div>
          {studentProject ? (
            <div className="text-xs space-y-1.5">
              <span className="font-bold text-slate-900 block truncate">
                {studentProject.title}
              </span>
              <p className="text-[11px] text-indigo-600 font-medium">{studentProject.domain}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Status: <strong className="text-slate-800">{studentProject.status}</strong></span>
                {studentProject.evaluationScore !== undefined && (
                  <span className="font-mono font-bold text-emerald-700">
                    Grade: {studentProject.evaluationScore}/100
                  </span>
                )}
              </div>
              {studentProject.repoUrl && (
                <a
                  href={studentProject.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 mt-1"
                >
                  <Github className="w-3.5 h-3.5" /> Source Repository
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No project group allocated yet.</p>
          )}
        </div>

        {/* Placement Applications Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">My Job Applications</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Active Applications:</span>
              <span className="font-bold text-slate-900 font-mono">
                {studentApplications.length}
              </span>
            </div>
            {studentApplications.length === 0 ? (
              <p className="text-xs text-slate-400">You haven't applied to any drives yet.</p>
            ) : (
              studentApplications.map((app) => (
                <div key={app.id} className="p-2 bg-slate-50 rounded text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{app.companyName}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {app.stage}
                    </span>
                  </div>
                  {app.offeredCtc && (
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Package: {app.offeredCtc}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mock Interviews & Feedback */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>My Mock Interviews & Feedback</span>
          </h2>
          <span className="text-xs text-slate-500">
            {studentInterviews.length} rounds logged
          </span>
        </div>

        {studentInterviews.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No mock interviews scheduled. Speak with your placement trainer to book a slot.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentInterviews.map((int) => (
              <div
                key={int.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{int.round}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {int.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Interviewer: {int.interviewer}</span>
                  <span>·</span>
                  <span className="font-mono">{int.scheduledDate}</span>
                </div>
                {int.score && (
                  <div className="flex items-center gap-1 font-bold text-amber-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Rating: {int.score} / 10</span>
                  </div>
                )}
                {int.feedback && (
                  <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200/80">
                    <strong>Feedback: </strong> {int.feedback}
                  </p>
                )}
                {int.improvements && (
                  <p className="text-[11px] text-rose-700 bg-rose-50/60 p-2 rounded border border-rose-200/60">
                    <strong>Focus Areas: </strong> {int.improvements}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Campus Placement Drives */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>Eligible Campus Placement Openings</span>
          </h2>
          <span className="text-xs text-slate-500">
            {openings.length} Active Drives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openings.map((job) => {
            const hasApplied = studentApplications.some((a) => a.jobId === job.id);
            const isEligible =
              student.attendancePercentage >= job.minAttendance &&
              student.cgpa >= job.minCgpa;

            return (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-indigo-600">{job.jobCode}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {job.ctc}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{job.companyName}</h3>
                  <p className="text-xs font-semibold text-slate-700">{job.role}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{job.location}</p>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{job.description}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Cutoff: {job.minAttendance}% Att / {job.minCgpa} CGPA</span>
                    <span>Deadline: <strong className="font-mono text-slate-700">{job.deadline}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {hasApplied ? (
                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Application Submitted
                    </span>
                  ) : !isEligible ? (
                    <span className="text-xs text-amber-700 font-medium">
                      Ineligible (Cutoff criteria not met)
                    </span>
                  ) : (
                    <button
                      onClick={() => applyForJob(job.id, student.id)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                    >
                      1-Click Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
