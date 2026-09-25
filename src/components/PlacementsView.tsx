import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Filter,
  Download,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JobOpening, ApplicationStage } from '../types';

export const PlacementsView: React.FC = () => {
  const {
    openings,
    applications,
    students,
    addJobOpening,
    applyForJob,
    updateApplicationStage,
    exportCsv,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'openings' | 'pipeline'>('openings');
  const [showAddOpeningModal, setShowAddOpeningModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<JobOpening | null>(null);
  const [selectedStudentToApply, setSelectedStudentToApply] = useState<string>('');

  // Selected candidate offer modal
  const [offerModalApp, setOfferModalApp] = useState<{ id: string; name: string; company: string } | null>(null);
  const [offeredCtcInput, setOfferedCtcInput] = useState('10.0 LPA');

  // New Opening Form
  const [newOpening, setNewOpening] = useState({
    companyName: '',
    jobCode: '',
    role: '',
    location: 'Bengaluru, Karnataka',
    jobType: 'Full-Time' as const,
    ctc: '9.0 LPA',
    deadline: '2026-10-31',
    minAttendance: 75,
    minCgpa: 7.5,
    openingsCount: 5,
    description: '',
  });

  const handleCreateOpening = (e: React.FormEvent) => {
    e.preventDefault();
    addJobOpening({
      companyId: `comp-${Date.now()}`,
      companyName: newOpening.companyName,
      jobCode: newOpening.jobCode || `JOB-${Date.now().toString().slice(-4)}`,
      role: newOpening.role,
      location: newOpening.location,
      jobType: newOpening.jobType,
      ctc: newOpening.ctc,
      deadline: newOpening.deadline,
      minAttendance: Number(newOpening.minAttendance),
      minCgpa: Number(newOpening.minCgpa),
      openingsCount: Number(newOpening.openingsCount),
      status: 'OPEN',
      description: newOpening.description,
    });
    setShowAddOpeningModal(false);
    setNewOpening({
      companyName: '',
      jobCode: '',
      role: '',
      location: 'Bengaluru, Karnataka',
      jobType: 'Full-Time',
      ctc: '9.0 LPA',
      deadline: '2026-10-31',
      minAttendance: 75,
      minCgpa: 7.5,
      openingsCount: 5,
      description: '',
    });
  };

  const handleApplyStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal || !selectedStudentToApply) return;
    applyForJob(showApplyModal.id, selectedStudentToApply);
    setShowApplyModal(null);
    setSelectedStudentToApply('');
  };

  // Pipeline stages
  const stages: ApplicationStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'SELECTED', 'REJECTED'];

  const [pipelineStageFilter, setPipelineStageFilter] = useState<string>('ALL');

  const filteredApplications = applications.filter(
    (a) => pipelineStageFilter === 'ALL' || a.stage === pipelineStageFilter
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Campus Placement Drives & Pipeline
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage hiring partner drives, enforce minimum attendance/CGPA eligibility cutoffs, and track applications through offer letters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('openings')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'openings'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hiring Drives ({openings.length})
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Application Pipeline ({applications.length})
            </button>
          </div>

          <button
            onClick={() => exportCsv('placements')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Placements</span>
          </button>

          <button
            onClick={() => setShowAddOpeningModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opening</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Hiring Drives */}
      {activeTab === 'openings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {openings.map((job) => {
            const driveApps = applications.filter((a) => a.jobId === job.id);
            const selectedCount = driveApps.filter((a) => a.stage === 'SELECTED').length;

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                      {job.jobCode}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        job.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {job.companyName}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">{job.role}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <div className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{job.ctc}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Eligibility criteria requirements */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                    <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Eligibility Cutoffs
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                      <div>
                        <span>Min Attendance: </span>
                        <strong className="text-slate-900">{job.minAttendance}%</strong>
                      </div>
                      <div>
                        <span>Min CGPA: </span>
                        <strong className="text-slate-900">{job.minCgpa}</strong>
                      </div>
                      <div>
                        <span>Target Openings: </span>
                        <strong className="text-slate-900">{job.openingsCount} Seats</strong>
                      </div>
                      <div>
                        <span>Deadline: </span>
                        <strong className="text-slate-900 font-mono">{job.deadline}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{driveApps.length}</span> applied ·{' '}
                    <span className="font-semibold text-emerald-700">{selectedCount}</span> offered
                  </div>

                  <button
                    onClick={() => setShowApplyModal(job)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Nominate Student</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Application Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Stage Filter */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium mr-1">Filter Stage:</span>
              <button
                onClick={() => setPipelineStageFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  pipelineStageFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Stages ({applications.length})
              </button>
              {stages.map((stage) => {
                const count = applications.filter((a) => a.stage === stage).length;
                return (
                  <button
                    key={stage}
                    onClick={() => setPipelineStageFilter(stage)}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                      pipelineStageFilter === stage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {stage} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Candidate Student</th>
                    <th className="py-3 px-4">Target Company & Role</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Offer / CTC Details</th>
                    <th className="py-3 px-4 text-right">Progress Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No applications in this stage.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {app.studentName}
                          </span>
                          <span className="text-[11px] text-slate-500">{app.batchName}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">
                            {app.companyName}
                          </span>
                          <span className="text-[11px] text-slate-500">{app.jobTitle}</span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600">
                          {app.appliedDate}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                              app.stage === 'SELECTED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : app.stage === 'INTERVIEW'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : app.stage === 'SCREENING'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : app.stage === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {app.stage}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {app.offeredCtc ? (
                            <div>
                              <span className="font-bold text-emerald-700 font-mono">
                                {app.offeredCtc}
                              </span>
                              {app.offerDate && (
                                <span className="block text-[10px] text-slate-400">
                                  Issued: {app.offerDate}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">In Process</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {app.stage !== 'SELECTED' && app.stage !== 'REJECTED' && (
                              <>
                                {app.stage === 'APPLIED' && (
                                  <button
                                    onClick={() =>
                                      updateApplicationStage(app.id, 'SCREENING')
                                    }
                                    className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                                  >
                                    Screening →
                                  </button>
                                )}
                                {app.stage === 'SCREENING' && (
                                  <button
                                    onClick={() =>
                                      updateApplicationStage(app.id, 'INTERVIEW')
                                    }
                                    className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded cursor-pointer"
                                  >
                                    Interview →
                                  </button>
                                )}
                                {app.stage === 'INTERVIEW' && (
                                  <button
                                    onClick={() =>
                                      setOfferModalApp({
                                        id: app.id,
                                        name: app.studentName,
                                        company: app.companyName,
                                      })
                                    }
                                    className="px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded cursor-pointer"
                                  >
                                    Roll Offer ★
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    updateApplicationStage(app.id, 'REJECTED')
                                  }
                                  className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {app.stage === 'SELECTED' && (
                              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Offered
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Offer Letter CTC Modal */}
      {offerModalApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-sm font-bold text-slate-900">
              Record Offer for {offerModalApp.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Company: {offerModalApp.company}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateApplicationStage(offerModalApp.id, 'SELECTED', offeredCtcInput);
                setOfferModalApp(null);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Annual Package / CTC
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11.5 LPA"
                  value={offeredCtcInput}
                  onChange={(e) => setOfferedCtcInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOfferModalApp(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm Offer & CTC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nominate Student Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Nominate Candidate: {showApplyModal.companyName}
              </h2>
              <button
                onClick={() => setShowApplyModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyStudent} className="space-y-3.5 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-200">
                <div className="font-semibold text-slate-900">{showApplyModal.role}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Min Attendance: {showApplyModal.minAttendance}% · Min CGPA: {showApplyModal.minCgpa}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Select Enrolled Student
                </label>
                <select
                  required
                  value={selectedStudentToApply}
                  onChange={(e) => setSelectedStudentToApply(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                >
                  <option value="">-- Choose Candidate --</option>
                  {students.map((s) => {
                    const isAttEligible = s.attendancePercentage >= showApplyModal.minAttendance;
                    const isCgpaEligible = s.cgpa >= showApplyModal.minCgpa;
                    const isEligible = isAttEligible && isCgpaEligible;

                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNo} · {s.attendancePercentage}% Att · {s.cgpa} CGPA) -{' '}
                        {isEligible ? 'Eligible ✓' : 'Cutoff Warning ⚠'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentToApply}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Opening Modal */}
      {showAddOpeningModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Post New Campus Drive Opening</h2>
              <button
                onClick={() => setShowAddOpeningModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpening} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Goldman Sachs"
                    value={newOpening.companyName}
                    onChange={(e) =>
                      setNewOpening({ ...newOpening, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Job Code</label>
                  <input
                    type="text"
                    placeholder="e.g. GS-SWE-2026"
                    value={newOpening.jobCode}
                    onChange={(e) =>
                      setNewOpening({ ...newOpening, jobCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Job Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Development Engineer - Cloud"
                  value={newOpening.role}
                  onChange={(e) =>
                    setNewOpening({ ...newOpening, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newOpening.location}
                    onChange={(e) =>
                      setNewOpening({ ...newOpening, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Package (CTC)</label>
                  <input
                    type="text"
                    required
                    value={newOpening.ctc}
                    onChange={(e) =>
                      setNewOpening({ ...newOpening, ctc: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Min Att %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newOpening.minAttendance}
                    onChange={(e) =>
                      setNewOpening({
                        ...newOpening,
                        minAttendance: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newOpening.minCgpa}
                    onChange={(e) =>
                      setNewOpening({
                        ...newOpening,
                        minCgpa: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={newOpening.openingsCount}
                    onChange={(e) =>
                      setNewOpening({
                        ...newOpening,
                        openingsCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Job Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Key responsibilities and interview rounds format..."
                  value={newOpening.description}
                  onChange={(e) =>
                    setNewOpening({ ...newOpening, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOpeningModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
