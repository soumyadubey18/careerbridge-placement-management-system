import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  GraduationCap,
  CalendarCheck2,
  Briefcase,
  AlertTriangle,
  FileText,
  Lock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditCategory, AuditActionType, AuditLogEntry } from '../types';

export const AuditLogView: React.FC = () => {
  const {
    currentUser,
    auditLogs,
    exportAuditLogsToCsv,
    clearAuditLogs,
    setActiveTab,
    switchRoleUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedActionType, setSelectedActionType] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Security Gate: Visible ONLY to Admins
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Administrator Privilege Required
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          The Institutional Security & Audit Trail contains confidential activity records, roll calls, and profile mutation history. Access is restricted to system administrators.
        </p>

        <div className="inline-flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => switchRoleUser('ADMIN')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Admin Viewpoint</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Return to Overview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Category filter
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }

      // Action type filter
      if (selectedActionType !== 'ALL' && log.action !== selectedActionType) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = log.description?.toLowerCase().includes(q);
        const actorMatch = log.performedBy?.name?.toLowerCase().includes(q) ||
                           log.performedBy?.email?.toLowerCase().includes(q);
        const entityMatch = log.targetEntityName?.toLowerCase().includes(q) ||
                            log.targetEntityId?.toLowerCase().includes(q);
        const actionMatch = log.action?.toLowerCase().includes(q);
        return descMatch || actorMatch || entityMatch || actionMatch;
      }

      return true;
    });
  }, [auditLogs, selectedCategory, selectedActionType, searchQuery]);

  // Metric counts
  const studentOpsCount = auditLogs.filter((l) => l.category === 'STUDENT').length;
  const batchOpsCount = auditLogs.filter((l) => l.category === 'BATCH').length;
  const attendanceOpsCount = auditLogs.filter((l) => l.category === 'ATTENDANCE').length;
  const placementOpsCount = auditLogs.filter((l) => l.category === 'PLACEMENT').length;

  const getActionBadgeColor = (action: AuditActionType) => {
    switch (action) {
      case 'STUDENT_ADDED':
      case 'BATCH_CREATED':
      case 'PROJECT_CREATED':
      case 'JOB_OPENING_POSTED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'PROFILE_UPDATED':
      case 'STUDENT_UPDATED':
      case 'BATCH_UPDATED':
      case 'APPLICATION_STAGE_CHANGED':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'ATTENDANCE_RECORDED':
      case 'MOCK_TEST_SCHEDULED':
      case 'TEST_SCORE_RECORDED':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'PROJECT_EVALUATED':
      case 'INTERVIEW_EVALUATED':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'STUDENT_DELETED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'SYSTEM_RESET':
        return 'text-slate-700 bg-slate-100 border-slate-300';
      default:
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    }
  };

  const getCategoryIcon = (category: AuditCategory) => {
    switch (category) {
      case 'STUDENT':
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />;
      case 'BATCH':
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case 'ATTENDANCE':
        return <CalendarCheck2 className="w-3.5 h-3.5 text-amber-500" />;
      case 'ACADEMIC':
        return <FileText className="w-3.5 h-3.5 text-purple-500" />;
      case 'PLACEMENT':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-500" />;
      case 'SECURITY':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        formatted: date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
        iso: isoString,
      };
    } catch {
      return { formatted: isoString, iso: isoString };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Institutional Audit & Governance Log
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable system record of student enrollments, batch scheduling, attendance submissions, and profile updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportAuditLogsToCsv}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the audit log trail? This action cannot be undone.')) {
                clearAuditLogs();
              }
            }}
            className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-600 hover:text-rose-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Total Logged Events
            </span>
            <span className="text-xl font-bold text-slate-900">{auditLogs.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Student Actions
            </span>
            <span className="text-xl font-bold text-slate-900">{studentOpsCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Cohort Changes
            </span>
            <span className="text-xl font-bold text-slate-900">{batchOpsCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Roll Call Audits
            </span>
            <span className="text-xl font-bold text-slate-900">{attendanceOpsCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, description, student name, roll number, or actor..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="STUDENT">Student Lifecycle</option>
              <option value="BATCH">Cohort Management</option>
              <option value="ATTENDANCE">Roll Call & Audits</option>
              <option value="ACADEMIC">Assessments & Projects</option>
              <option value="PLACEMENT">Campus Drives</option>
              <option value="SECURITY">Security & System</option>
            </select>

            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Action Types</option>
              <option value="STUDENT_ADDED">Student Enrolled</option>
              <option value="PROFILE_UPDATED">Profile Updated</option>
              <option value="STUDENT_DELETED">Student Deleted</option>
              <option value="BATCH_CREATED">Cohort Created</option>
              <option value="BATCH_UPDATED">Cohort Updated</option>
              <option value="ATTENDANCE_RECORDED">Roll Call Recorded</option>
              <option value="PROJECT_EVALUATED">Project Evaluated</option>
              <option value="JOB_OPENING_POSTED">Drive Posted</option>
              <option value="SYSTEM_RESET">System Reset</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(selectedCategory !== 'ALL' || selectedActionType !== 'ALL' || searchQuery.trim()) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {filteredLogs.length} of {auditLogs.length} logged events
            </span>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedActionType('ALL');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Audit Log Timeline Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Audit Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No activity logs match your current filter parameters. Try adjusting your search query or category filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const time = formatTimestamp(log.timestamp);
              const isExpanded = expandedLogId === log.id;
              const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Category Icon & Action Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                        {getCategoryIcon(log.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>

                          <span className="text-[11px] font-medium text-slate-400">
                            •
                          </span>

                          <span className="text-[11px] font-mono text-slate-500">
                            {log.id}
                          </span>

                          {log.targetEntityName && (
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Target: {log.targetEntityName}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {log.description}
                        </p>

                        {/* Actor details */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                              {log.performedBy.name?.charAt(0) || 'A'}
                            </div>
                            <span className="font-semibold text-slate-700">
                              {log.performedBy.name}
                            </span>
                            <span className="text-slate-400">
                              ({log.performedBy.role})
                            </span>
                          </div>

                          <span>•</span>

                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <time dateTime={time.iso} title={time.iso}>
                              {time.formatted}
                            </time>
                          </div>

                          {hasMetadata && (
                            <>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedLogId(isExpanded ? null : log.id)
                                }
                                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5 cursor-pointer text-[11px]"
                              >
                                <span>{isExpanded ? 'Hide Payload' : 'Inspect Payload'}</span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable JSON Payload Inspector */}
                  {isExpanded && hasMetadata && (
                    <div className="mt-3.5 ml-11 p-3 bg-slate-900 text-slate-200 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between text-slate-400 mb-2 border-b border-slate-800 pb-1 text-[10px]">
                        <span>EVENT_PAYLOAD_SCHEMA // JSON</span>
                        <span>ACTOR: {log.performedBy.email}</span>
                      </div>
                      <pre className="text-indigo-300">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
