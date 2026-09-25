import React, { useState, useMemo } from 'react';
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
  ArrowLeft,
  Filter,
  Download,
  X,
  FileCheck,
  Sparkles,
  Columns3,
  List,
  FileDown,
  AlertTriangle,
  GraduationCap,
  Users,
  Target,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JobOpening, ApplicationStage, Student } from '../types';
import { calculateCandidateMatch, rankCandidatesForOpening } from '../utils/skillMatcher';
import { generateOfferLetterPdf } from '../utils/generateDocumentsPdf';

export const PlacementsView: React.FC = () => {
  const {
    openings,
    applications,
    students,
    batches,
    addJobOpening,
    applyForJob,
    updateApplicationStage,
    exportCsv,
    setNotification,
    logAuditAction,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'openings' | 'pipeline'>('openings');
  const [pipelineViewMode, setPipelineViewMode] = useState<'kanban' | 'table'>('kanban');

  // Modals
  const [showAddOpeningModal, setShowAddOpeningModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<JobOpening | null>(null);
  const [selectedStudentToApply, setSelectedStudentToApply] = useState<string>('');

  // Selected Opening for Skill Matcher
  const [selectedOpeningForMatcher, setSelectedOpeningForMatcher] = useState<JobOpening | null>(
    null
  );

  // Selected candidate offer modal
  const [offerModalApp, setOfferModalApp] = useState<{
    id: string;
    studentId: string;
    name: string;
    company: string;
  } | null>(null);
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
    requiredSkillsInput: 'React, TypeScript, Node.js, SQL',
  });

  const handleCreateOpening = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = newOpening.requiredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

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
      requiredSkills: skills.length > 0 ? skills : ['JavaScript', 'React', 'Problem Solving'],
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
      requiredSkillsInput: 'React, TypeScript, Node.js, SQL',
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
  const [pipelineSearch, setPipelineSearch] = useState('');

  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      const matchesStage = pipelineStageFilter === 'ALL' || a.stage === pipelineStageFilter;
      const matchesSearch =
        pipelineSearch === '' ||
        a.studentName.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
        a.companyName.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
        a.jobTitle.toLowerCase().includes(pipelineSearch.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [applications, pipelineStageFilter, pipelineSearch]);

  // Stage advance / retreat helper
  const handleMoveStage = (applicationId: string, currentStage: ApplicationStage, direction: 'prev' | 'next') => {
    const currentIndex = stages.indexOf(currentStage);
    if (direction === 'next' && currentIndex < stages.length - 2) { // up to SELECTED
      const nextStage = stages[currentIndex + 1];
      updateApplicationStage(applicationId, nextStage);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevStage = stages[currentIndex - 1];
      updateApplicationStage(applicationId, prevStage);
    }
  };

  // Trigger Offer Letter PDF
  const handleDownloadOfferPdf = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    const student = students.find((s) => s.id === app.studentId);
    if (!student) return;
    const opening = openings.find((o) => o.id === app.jobId);

    generateOfferLetterPdf({
      student,
      application: app,
      opening,
    });

    setNotification(`Generated and downloaded Placement Offer Letter for ${student.name}.`);

    if (logAuditAction) {
      logAuditAction({
        action: 'APPLICATION_STAGE_CHANGED',
        category: 'PLACEMENT',
        description: `Generated official employment offer letter for ${student.name} with ${app.companyName} [${app.offeredCtc || '8.5 LPA'}].`,
        targetEntityId: app.id,
        targetEntityName: `${student.name} - ${app.companyName}`,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Campus Placement Drives & Pipeline
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {openings.length} Active Drives
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Manage hiring partner drives, run AI-assisted candidate eligibility matching, advance recruitment kanban pipelines, and generate certified offer letters.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('openings')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'openings'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hiring Drives ({openings.length})
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recruiter Kanban ({applications.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddOpeningModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Hiring Drive</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: HIRING DRIVES ================= */}
      {activeTab === 'openings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {openings.map((job) => {
            const driveApps = applications.filter((a) => a.jobId === job.id);
            const selectedCount = driveApps.filter((a) => a.stage === 'SELECTED').length;
            const requiredSkills = job.requiredSkills || [
              'JavaScript',
              'React',
              'Problem Solving',
            ];

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-2xs card-hover-effect"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                        {job.jobCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {job.role}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-semibold text-slate-800">
                          {job.companyName}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
                        job.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-lg">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{job.ctc}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.jobType}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[140px]">{job.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Tech Skills */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                      Required Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {requiredSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-md border border-slate-200/60"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Eligibility criteria requirements */}
                  <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
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

                {/* Card footer with Skill Matcher CTA */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-900">{driveApps.length}</span> candidates ·{' '}
                    <span className="font-bold text-emerald-700">{selectedCount}</span> offered
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOpeningForMatcher(job)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors cursor-pointer"
                      title="Run Skill Matcher to find best candidate fit"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Skill Matcher</span>
                    </button>

                    <button
                      onClick={() => setShowApplyModal(job)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Nominate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TAB 2: PIPELINE (KANBAN & TABLE) ================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <input
                type="text"
                placeholder="Search candidate, role, or company..."
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />

              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                <button
                  onClick={() => setPipelineStageFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                    pipelineStageFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({applications.length})
                </button>
                {stages.map((stage) => {
                  const count = applications.filter((a) => a.stage === stage).length;
                  return (
                    <button
                      key={stage}
                      onClick={() => setPipelineStageFilter(stage)}
                      className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
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

            {/* View Switcher: Kanban vs Table */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs self-start sm:self-auto">
              <button
                onClick={() => setPipelineViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  pipelineViewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setPipelineViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  pipelineViewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          {/* Kanban Board View */}
          {pipelineViewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {stages.map((stage) => {
                const stageApps = filteredApplications.filter((a) => a.stage === stage);
                const stageColor =
                  stage === 'APPLIED'
                    ? 'border-t-slate-500 bg-slate-50/50'
                    : stage === 'SCREENING'
                    ? 'border-t-blue-500 bg-blue-50/30'
                    : stage === 'INTERVIEW'
                    ? 'border-t-indigo-500 bg-indigo-50/30'
                    : stage === 'SELECTED'
                    ? 'border-t-purple-600 bg-purple-50/30'
                    : 'border-t-rose-500 bg-rose-50/30';

                return (
                  <div
                    key={stage}
                    className={`bg-white rounded-2xl border border-slate-200 border-t-4 p-3.5 min-h-[500px] flex flex-col ${stageColor}`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {stage === 'SELECTED' ? 'OFFER EXTENDED' : stage}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {stageApps.length} {stageApps.length === 1 ? 'candidate' : 'candidates'}
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {stageApps.length}
                      </span>
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {stageApps.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                          No candidates
                        </div>
                      ) : (
                        stageApps.map((app) => {
                          const student = students.find((s) => s.id === app.studentId);
                          const opening = openings.find((o) => o.id === app.jobId);
                          const matchInfo =
                            student && opening
                              ? calculateCandidateMatch(student, opening)
                              : null;

                          return (
                            <div
                              key={app.id}
                              className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-bold text-slate-900 text-xs block leading-tight">
                                    {app.studentName}
                                  </span>
                                  {matchInfo && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                      {matchInfo.matchScore}%
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 block">
                                  {app.batchName}
                                </span>
                              </div>

                              <div className="p-2 bg-slate-50 rounded-lg text-xs space-y-0.5">
                                <span className="font-semibold text-slate-800 block text-[11px]">
                                  {app.companyName}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {app.jobTitle}
                                </span>
                              </div>

                              {student && (
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                  <span>Attd: <strong>{student.attendancePercentage}%</strong></span>
                                  <span>CGPA: <strong>{student.cgpa}</strong></span>
                                </div>
                              )}

                              {/* If Selected: Offer CTC & Download Offer Letter button */}
                              {app.stage === 'SELECTED' && (
                                <div className="pt-2 border-t border-purple-100 space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">Offered CTC:</span>
                                    <span className="font-bold text-purple-700 font-mono">
                                      {app.offeredCtc || '10.0 LPA'}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadOfferPdf(app.id)}
                                    className="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                    <span>Download Offer PDF</span>
                                  </button>
                                </div>
                              )}

                              {/* Stage movement controls */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                                {stage !== 'APPLIED' ? (
                                  <button
                                    onClick={() => handleMoveStage(app.id, app.stage, 'prev')}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                                    title="Move back"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                ) : <div />}

                                <select
                                  value={app.stage}
                                  onChange={(e) => {
                                    const newSt = e.target.value as ApplicationStage;
                                    if (newSt === 'SELECTED') {
                                      setOfferModalApp({
                                        id: app.id,
                                        studentId: app.studentId,
                                        name: app.studentName,
                                        company: app.companyName,
                                      });
                                    } else {
                                      updateApplicationStage(app.id, newSt);
                                    }
                                  }}
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
                                >
                                  {stages.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>

                                {stage !== 'SELECTED' && stage !== 'REJECTED' ? (
                                  <button
                                    onClick={() => handleMoveStage(app.id, app.stage, 'next')}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                                    title="Advance stage"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                ) : <div />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {pipelineViewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                      <th className="py-3 px-4">Candidate Student</th>
                      <th className="py-3 px-4">Target Company & Role</th>
                      <th className="py-3 px-4">Match %</th>
                      <th className="py-3 px-4">Current Stage</th>
                      <th className="py-3 px-4">Offer / CTC Details</th>
                      <th className="py-3 px-4 text-right">Offer & Stage Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          No applications matched.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const student = students.find((s) => s.id === app.studentId);
                        const opening = openings.find((o) => o.id === app.jobId);
                        const matchInfo =
                          student && opening
                            ? calculateCandidateMatch(student, opening)
                            : null;

                        return (
                          <tr key={app.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-900 block">
                                {app.studentName}
                              </span>
                              <span className="text-[11px] text-slate-500">{app.batchName}</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-900 block">
                                {app.companyName}
                              </span>
                              <span className="text-[11px] text-slate-500">{app.jobTitle}</span>
                            </td>

                            <td className="py-3 px-4">
                              {matchInfo ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                                  {matchInfo.matchScore}%
                                </span>
                              ) : (
                                <span className="text-slate-400">--</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={app.stage}
                                onChange={(e) => {
                                  const newStage = e.target.value as ApplicationStage;
                                  if (newStage === 'SELECTED') {
                                    setOfferModalApp({
                                      id: app.id,
                                      studentId: app.studentId,
                                      name: app.studentName,
                                      company: app.companyName,
                                    });
                                  } else {
                                    updateApplicationStage(app.id, newStage);
                                  }
                                }}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                                  app.stage === 'SELECTED'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : app.stage === 'INTERVIEW'
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    : app.stage === 'SCREENING'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : app.stage === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}
                              >
                                {stages.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-4">
                              {app.stage === 'SELECTED' ? (
                                <div>
                                  <span className="font-bold text-purple-700 block font-mono">
                                    {app.offeredCtc || '8.5 LPA'}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    Offered on {app.offerDate || '2026-09-12'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">In Review</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {app.stage === 'SELECTED' ? (
                                <button
                                  onClick={() => handleDownloadOfferPdf(app.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer transition-colors"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                  <span>Offer Letter PDF</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMoveStage(app.id, app.stage, 'next')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: SKILL-TO-JOB ELIGIBILITY MATCHER ================= */}
      {selectedOpeningForMatcher && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    AI Skill-to-Job Eligibility Matcher
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Matching candidates for <strong className="text-slate-800">{selectedOpeningForMatcher.role}</strong> at{' '}
                  <strong className="text-slate-800">{selectedOpeningForMatcher.companyName}</strong> ({selectedOpeningForMatcher.ctc})
                </p>
              </div>

              <button
                onClick={() => setSelectedOpeningForMatcher(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Job Criteria Overview */}
            <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Required Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedOpeningForMatcher.requiredSkills || ['React', 'TypeScript', 'Node.js']).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-semibold text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-600 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Min Attendance</span>
                  <span className="font-bold text-slate-900">{selectedOpeningForMatcher.minAttendance}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Min CGPA</span>
                  <span className="font-bold text-slate-900">{selectedOpeningForMatcher.minCgpa}</span>
                </div>
              </div>
            </div>

            {/* Ranked Candidates Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Rank & Student</th>
                    <th className="py-2.5 px-3">Overall Match</th>
                    <th className="py-2.5 px-3">Matched Skills</th>
                    <th className="py-2.5 px-3">Missing Skills</th>
                    <th className="py-2.5 px-3">Eligibility Check</th>
                    <th className="py-2.5 px-3 text-right">Shortlist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankCandidatesForOpening(students, selectedOpeningForMatcher).map((match, idx) => {
                    const isAlreadyApplied = applications.some(
                      (a) => a.jobId === selectedOpeningForMatcher.id && a.studentId === match.student.id
                    );

                    return (
                      <tr key={match.student.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-600 text-[10px] flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block">{match.student.name}</span>
                              <span className="text-[10px] text-slate-500">{match.student.batchName}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  match.matchScore >= 80 ? 'bg-emerald-500' : match.matchScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${match.matchScore}%` }}
                              />
                            </div>
                            <span className="font-black text-slate-900 text-xs">{match.matchScore}%</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {match.matchedSkills.length === 0 ? (
                              <span className="text-slate-400">None</span>
                            ) : (
                              match.matchedSkills.map((sk, i) => (
                                <span key={i} className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                  ✓ {sk}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {match.missingSkills.length === 0 ? (
                              <span className="text-emerald-600 font-bold text-[10px]">100% Skills Matched</span>
                            ) : (
                              match.missingSkills.map((sk, i) => (
                                <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                                  {sk}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="space-y-0.5 text-[11px]">
                            <span className={match.isAttendanceEligible ? 'text-emerald-700 font-medium' : 'text-rose-600 font-bold'}>
                              Attd: {match.student.attendancePercentage}% {match.isAttendanceEligible ? '✓' : '⚠'}
                            </span>
                            <span className="block text-slate-500">
                              CGPA: {match.student.cgpa} {match.isCgpaEligible ? '✓' : '⚠'}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          {isAlreadyApplied ? (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg">
                              In Pipeline
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                applyForJob(selectedOpeningForMatcher.id, match.student.id);
                                setNotification(`Nominated ${match.student.name} to ${selectedOpeningForMatcher.companyName}!`);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition-colors shadow-2xs"
                            >
                              Fast-Track
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setSelectedOpeningForMatcher(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Matcher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: OFFER CTC CONFIRMATION ================= */}
      {offerModalApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Extend Formal Offer to {offerModalApp.name}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Confirm hiring package for {offerModalApp.company}.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateApplicationStage(offerModalApp.id, 'SELECTED', offeredCtcInput);
                setOfferModalApp(null);
                setNotification(`Offer finalized for ${offerModalApp.name} at ${offeredCtcInput}.`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Offered Annual CTC (e.g. 12.5 LPA)
                </label>
                <input
                  type="text"
                  required
                  value={offeredCtcInput}
                  onChange={(e) => setOfferedCtcInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOfferModalApp(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Finalize Offer & Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NOMINATE STUDENT ================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Nominate Candidate to {showApplyModal.companyName}
              </h3>
              <button
                onClick={() => setShowApplyModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyStudent} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Candidate</label>
                <select
                  required
                  value={selectedStudentToApply}
                  onChange={(e) => setSelectedStudentToApply(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                >
                  <option value="">-- Choose Candidate --</option>
                  {students.map((stu) => {
                    const match = calculateCandidateMatch(stu, showApplyModal);
                    return (
                      <option key={stu.id} value={stu.id}>
                        {stu.name} ({stu.rollNo}) — {match.matchScore}% Match · Attd: {stu.attendancePercentage}%
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST HIRING DRIVE ================= */}
      {showAddOpeningModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Create New Campus Placement Opening
              </h3>
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
                    placeholder="e.g. Amazon AWS"
                    value={newOpening.companyName}
                    onChange={(e) => setNewOpening({ ...newOpening, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE-1 Cloud"
                    value={newOpening.role}
                    onChange={(e) => setNewOpening({ ...newOpening, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Annual CTC Package</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14.5 LPA"
                    value={newOpening.ctc}
                    onChange={(e) => setNewOpening({ ...newOpening, ctc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newOpening.location}
                    onChange={(e) => setNewOpening({ ...newOpening, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Required Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, TypeScript, Python, Docker"
                  value={newOpening.requiredSkillsInput}
                  onChange={(e) => setNewOpening({ ...newOpening, requiredSkillsInput: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Min Attendance %</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newOpening.minAttendance}
                    onChange={(e) => setNewOpening({ ...newOpening, minAttendance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
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
                    onChange={(e) => setNewOpening({ ...newOpening, minCgpa: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Seats</label>
                  <input
                    type="number"
                    required
                    value={newOpening.openingsCount}
                    onChange={(e) => setNewOpening({ ...newOpening, openingsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Role Description</label>
                <textarea
                  rows={2}
                  value={newOpening.description}
                  onChange={(e) => setNewOpening({ ...newOpening, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOpeningModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Post Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
