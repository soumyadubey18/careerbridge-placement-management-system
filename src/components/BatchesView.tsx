import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Users,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  CheckCircle2,
  UserCheck,
  X,
  FileDown,
  FileText,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Download,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Batch } from '../types';
import { generateBatchPerformancePdf } from '../utils/generateBatchPdf';

interface BatchesViewProps {
  onOpenAddBatchModal: () => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({ onOpenAddBatchModal }) => {
  const {
    batches,
    students,
    mockTests,
    projects,
    applications,
    openings,
    updateBatch,
    setActiveTab,
    setNotification,
    logAuditAction,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'cohorts' | 'reports'>('cohorts');
  const [selectedBatchForRoster, setSelectedBatchForRoster] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [selectedReportBatchId, setSelectedReportBatchId] = useState<string>(
    batches[0]?.id || ''
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Selected batch for the reports section
  const currentReportBatch = batches.find((b) => b.id === selectedReportBatchId) || batches[0];
  const reportBatchStudents = students.filter((s) => s.batchId === currentReportBatch?.id);

  // Helper to trigger PDF download for any batch
  const handleDownloadBatchPdf = async (batch: Batch) => {
    try {
      setIsGeneratingPdf(true);
      const batchStudents = students.filter((s) => s.batchId === batch.id);

      generateBatchPerformancePdf({
        batch,
        students: batchStudents,
        mockTests,
        projects,
        applications,
        openings,
      });

      setNotification(`Downloaded PDF Performance Summary for ${batch.name}.`);

      if (logAuditAction) {
        logAuditAction({
          action: 'BATCH_UPDATED',
          category: 'BATCH',
          description: `Generated and downloaded PDF Performance Summary report for cohort "${batch.name}" [${batch.code}].`,
          targetEntityId: batch.id,
          targetEntityName: batch.name,
          metadata: {
            batchCode: batch.code,
            enrolledStudents: batchStudents.length,
            fileType: 'PDF',
          },
        });
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setNotification('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper to export CSV for the current report batch
  const handleExportBatchCsv = (batch: Batch) => {
    const batchStudents = students.filter((s) => s.batchId === batch.id);
    const headers = [
      'Roll No',
      'Name',
      'Email',
      'Phone',
      'College',
      'Degree',
      'CGPA',
      'Attendance %',
      'Status',
      'Placed Company',
      'Placed Salary',
    ];
    const rows = batchStudents.map((s) => {
      const placedApp = applications.find(
        (a) => a.studentId === s.id && a.stage === 'SELECTED'
      );
      const comp = s.placedCompany || placedApp?.companyName || 'N/A';
      const sal = s.placedSalary || placedApp?.offeredCtc || 'N/A';
      return [
        s.rollNo,
        `"${s.name}"`,
        s.email,
        s.phone,
        `"${s.college}"`,
        `"${s.degree}"`,
        s.cgpa || 8.0,
        `${s.attendancePercentage}%`,
        s.status,
        `"${comp}"`,
        `"${sal}"`,
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${batch.code}_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification(`Exported CSV roster for ${batch.name}.`);
  };

  // Report statistics for selected batch
  const enrolledCount = reportBatchStudents.length;
  const capacityPct = currentReportBatch ? Math.round((enrolledCount / currentReportBatch.capacity) * 100) : 0;
  const avgAttendance = enrolledCount > 0
    ? Math.round(reportBatchStudents.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / enrolledCount)
    : 0;
  const lowAttendanceCount = reportBatchStudents.filter((s) => s.attendancePercentage < 75).length;
  const placedCount = reportBatchStudents.filter((s) => s.status === 'PLACED').length;
  const placementRate = enrolledCount > 0 ? Math.round((placedCount / enrolledCount) * 100) : 0;

  // Mock test statistics for this batch
  const batchMockTests = mockTests.filter((t) => t.batchId === currentReportBatch?.id);
  let totalScorePct = 0;
  let testCount = 0;
  batchMockTests.forEach((t) => {
    const res = t.results || [];
    if (res.length > 0) {
      const avg = res.reduce((sum, r) => sum + (r.percentage || 0), 0) / res.length;
      totalScorePct += avg;
      testCount++;
    }
  });
  const avgTestScore = testCount > 0 ? Math.round(totalScorePct / testCount) : 78;

  // Capstone project count
  const batchProjects = projects.filter((p) => p.batchId === currentReportBatch?.id);

  return (
    <div className="space-y-5">
      {/* Header with Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Cohorts & Batch Management
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {batches.length} Programs
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Configure curriculum programs, designated lead trainers, lab schedules, and download certified performance audit reports.
          </p>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveSubTab('cohorts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'cohorts'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Active Cohorts</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubTab === 'cohorts' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {batches.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('reports')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Performance Reports</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 text-current font-bold uppercase tracking-wider">
                PDF
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeSubTab === 'reports' && currentReportBatch && (
            <button
              onClick={() => handleDownloadBatchPdf(currentReportBatch)}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Summary PDF'}</span>
            </button>
          )}

          <button
            onClick={onOpenAddBatchModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Cohort</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ACTIVE COHORTS GRID ================= */}
      {activeSubTab === 'cohorts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((batch) => {
            const enrolled = students.filter((s) => s.batchId === batch.id);
            const capacityPct = Math.round((enrolled.length / batch.capacity) * 100);
            const batchPlaced = enrolled.filter((s) => s.status === 'PLACED').length;

            return (
              <div
                key={batch.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
              >
                <div>
                  {/* Header tag */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {batch.code}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        batch.mode === 'In-Person'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : batch.mode === 'Hybrid'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {batch.mode}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {batch.course}
                  </p>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Trainer: <strong className="text-slate-800">{batch.trainerName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.schedule}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {batch.startDate} to {batch.endDate}
                      </span>
                    </div>

                    {batch.classroom && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{batch.classroom}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity meter */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Seat Capacity</span>
                      <span className="font-semibold text-slate-800">
                        {enrolled.length} / {batch.capacity} ({capacityPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          capacityPct > 90 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, capacityPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBatchForRoster(batch)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Roster ({enrolled.length})
                    </button>

                    <button
                      onClick={() => handleDownloadBatchPdf(batch)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download Cohort Performance Summary PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedReportBatchId(batch.id);
                        setActiveSubTab('reports');
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-indigo-50 cursor-pointer"
                      title="Inspect Batch Performance Report"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingBatch(batch)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-50 cursor-pointer"
                      title="Edit Cohort"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TAB 2: REPORTS SECTION ================= */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {/* Cohort Selector & Quick Actions Control Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Cohort for Audit Report:</span>
              </label>
              <select
                value={selectedReportBatchId}
                onChange={(e) => setSelectedReportBatchId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — {b.course}
                  </option>
                ))}
              </select>
            </div>

            {currentReportBatch && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportBatchCsv(currentReportBatch)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Roster CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadBatchPdf(currentReportBatch)}
                  disabled={isGeneratingPdf}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Summary PDF</span>
                </button>
              </div>
            )}
          </div>

          {currentReportBatch && (
            <>
              {/* Cohort Overview Card */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {currentReportBatch.code}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {currentReportBatch.mode}
                      </span>
                      <span className="text-xs text-slate-400">
                        {currentReportBatch.startDate} to {currentReportBatch.endDate}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {currentReportBatch.name}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                      {currentReportBatch.course}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Lead Trainer: <strong className="text-white">{currentReportBatch.trainerName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{currentReportBatch.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{currentReportBatch.classroom || 'Lab Alpha'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 min-w-[200px] flex-shrink-0">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                      Executive Clearance
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${lowAttendanceCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span className="text-xs font-bold text-slate-200">
                        {lowAttendanceCount === 0 ? 'Fully Compliant (100% ≥ 75%)' : `${lowAttendanceCount} Under 75% Cutoff`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Placement eligibility enforced on campus drives
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Enrollment */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Enrollment</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">{enrolledCount}</span>
                    <span className="text-xs text-slate-500">/ {currentReportBatch.capacity} seats</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Capacity Filled</span>
                    <span className="font-semibold text-slate-700">{capacityPct}%</span>
                  </div>
                </div>

                {/* 2. Attendance */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Cohort Attendance</span>
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold ${avgAttendance < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {avgAttendance}%
                    </span>
                    <span className="text-xs text-slate-500">class avg</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>At-Risk (&lt;75%)</span>
                    <span className={`font-semibold ${lowAttendanceCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {lowAttendanceCount} candidates
                    </span>
                  </div>
                </div>

                {/* 3. Assessment Average */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Assessment Benchmark</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">{avgTestScore}%</span>
                    <span className="text-xs text-slate-500">avg mark</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Evaluated Tests</span>
                    <span className="font-semibold text-slate-700">{batchMockTests.length} tests</span>
                  </div>
                </div>

                {/* 4. Placement Rate */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Placement Conversion</span>
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-purple-700">{placementRate}%</span>
                    <span className="text-xs text-slate-500">conversion</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Placed</span>
                    <span className="font-semibold text-slate-700">{placedCount} of {enrolledCount}</span>
                  </div>
                </div>
              </div>

              {/* Student Performance Roster Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Trainee Academic & Placement Performance Roster
                    </h3>
                    <p className="text-xs text-slate-500">
                      Individual evaluation metrics included in the official certified PDF report.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 self-start sm:self-auto">
                    {reportBatchStudents.length} Students Enrolled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Student & College</th>
                        <th className="py-3 px-4">Attendance</th>
                        <th className="py-3 px-4">CGPA</th>
                        <th className="py-3 px-4">Primary Skills</th>
                        <th className="py-3 px-4">Placement Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportBatchStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No students enrolled in this cohort yet.
                          </td>
                        </tr>
                      ) : (
                        reportBatchStudents.map((stu) => (
                          <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-slate-600">
                              {stu.rollNo}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{stu.name}</span>
                              <span className="text-[11px] text-slate-500 block">
                                {stu.degree} · {stu.college}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                                  stu.attendancePercentage < 75
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {stu.attendancePercentage < 75 && (
                                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                                )}
                                {stu.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {stu.cgpa ? stu.cgpa.toFixed(1) : '8.0'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {stu.skills?.slice(0, 3).map((skill, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {stu.status === 'PLACED' ? (() => {
                                const placedApp = applications.find(
                                  (a) => a.studentId === stu.id && a.stage === 'SELECTED'
                                );
                                const comp = stu.placedCompany || placedApp?.companyName || 'Campus Placement';
                                const sal = stu.placedSalary || placedApp?.offeredCtc || '8.5 LPA';
                                return (
                                  <div>
                                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                                      Placed: {comp}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                                      {sal}
                                    </span>
                                  </div>
                                );
                              })() : (
                                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                  {stu.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with instant PDF trigger */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Summary verified for <strong>{reportBatchStudents.length}</strong> registered students.
                  </span>
                  <button
                    onClick={() => handleDownloadBatchPdf(currentReportBatch)}
                    disabled={isGeneratingPdf}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Official PDF Document</span>
                  </button>
                </div>
              </div>

              {/* All Cohorts Comparison Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Multi-Cohort Performance Comparison
                    </h3>
                    <p className="text-xs text-slate-500">
                      Download individual summary reports for all running batches across programs.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Batch Code</th>
                        <th className="py-2.5 px-3">Program Name</th>
                        <th className="py-2.5 px-3">Lead Trainer</th>
                        <th className="py-2.5 px-3">Enrolled</th>
                        <th className="py-2.5 px-3">Avg Attendance</th>
                        <th className="py-2.5 px-3">Placed Count</th>
                        <th className="py-2.5 px-3 text-right">PDF Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batches.map((b) => {
                        const bStudents = students.filter((s) => s.batchId === b.id);
                        const bAvgAtt = bStudents.length > 0
                          ? Math.round(bStudents.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / bStudents.length)
                          : 0;
                        const bPlaced = bStudents.filter((s) => s.status === 'PLACED').length;

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600">
                              {b.code}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {b.name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {b.trainerName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {bStudents.length} / {b.capacity}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`font-semibold ${
                                  bAvgAtt < 75 ? 'text-rose-600' : 'text-slate-800'
                                }`}
                              >
                                {bAvgAtt}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-purple-700">
                                {bPlaced} Placed
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleDownloadBatchPdf(b)}
                                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Cohort Roster Modal */}
      {selectedBatchForRoster && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Cohort Roster: {selectedBatchForRoster.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lead Trainer: {selectedBatchForRoster.trainerName} · Schedule: {selectedBatchForRoster.schedule}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchForRoster(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Attendance</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.filter((s) => s.batchId === selectedBatchForRoster.id).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No students enrolled in this cohort yet.
                      </td>
                    </tr>
                  ) : (
                    students
                      .filter((s) => s.batchId === selectedBatchForRoster.id)
                      .map((stu) => (
                        <tr key={stu.id}>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{stu.rollNo}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800">{stu.name}</span>
                            <span className="block text-[11px] text-slate-400">{stu.email}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`font-semibold ${
                                stu.attendancePercentage < 75 ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {stu.attendancePercentage}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                stu.status === 'PLACED'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {stu.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDownloadBatchPdf(selectedBatchForRoster)}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Roster PDF</span>
              </button>

              <button
                onClick={() => {
                  setSelectedBatchForRoster(null);
                  setActiveTab('attendance');
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 cursor-pointer"
              >
                Mark Attendance for This Cohort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Edit Cohort: {editingBatch.name}
              </h2>
              <button
                onClick={() => setEditingBatch(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBatch(editingBatch.id, editingBatch);
                setEditingBatch(null);
              }}
              className="space-y-3 mt-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-medium mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={editingBatch.name}
                  onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Course Description</label>
                <input
                  type="text"
                  required
                  value={editingBatch.course}
                  onChange={(e) => setEditingBatch({ ...editingBatch, course: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lead Trainer</label>
                  <input
                    type="text"
                    required
                    value={editingBatch.trainerName}
                    onChange={(e) =>
                      setEditingBatch({ ...editingBatch, trainerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mode</label>
                  <select
                    value={editingBatch.mode}
                    onChange={(e) =>
                      setEditingBatch({ ...editingBatch, mode: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Schedule & Hours</label>
                <input
                  type="text"
                  required
                  value={editingBatch.schedule}
                  onChange={(e) => setEditingBatch({ ...editingBatch, schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium cursor-pointer"
                >
                  Update Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
