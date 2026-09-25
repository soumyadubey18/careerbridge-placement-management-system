import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarCheck2,
  FileCheck2,
  FolderGit2,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobileMenu }) => {
  const {
    activeTab,
    setActiveTab,
    students,
    batches,
    projects,
    openings,
    currentUser,
  } = useApp();

  const lowAttendanceCount = students.filter((s) => s.attendancePercentage < 75).length;
  const pendingProjectsCount = projects.filter(
    (p) => p.status === 'SUBMITTED' && !p.evaluationScore
  ).length;
  const openDrivesCount = openings.filter((o) => o.status === 'OPEN').length;

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      visibleTo: ['ADMIN', 'TRAINER', 'PLACEMENT', 'STUDENT'],
    },
    {
      id: 'students',
      label: 'Students Directory',
      icon: Users,
      badge: `${students.length}`,
      visibleTo: ['ADMIN', 'TRAINER', 'PLACEMENT'],
    },
    {
      id: 'batches',
      label: 'Cohorts & Batches',
      icon: Layers,
      badge: `${batches.length}`,
      visibleTo: ['ADMIN', 'TRAINER', 'PLACEMENT'],
    },
    {
      id: 'attendance',
      label: 'Daily Attendance',
      icon: CalendarCheck2,
      badge: lowAttendanceCount > 0 ? `${lowAttendanceCount} alert` : null,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      visibleTo: ['ADMIN', 'TRAINER'],
    },
    {
      id: 'assessments',
      label: 'Mock Assessments',
      icon: FileCheck2,
      badge: null,
      visibleTo: ['ADMIN', 'TRAINER', 'PLACEMENT'],
    },
    {
      id: 'projects',
      label: 'Capstone Projects',
      icon: FolderGit2,
      badge: pendingProjectsCount > 0 ? `${pendingProjectsCount} review` : null,
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      visibleTo: ['ADMIN', 'TRAINER'],
    },
    {
      id: 'placements',
      label: 'Placement Drives',
      icon: Briefcase,
      badge: openDrivesCount > 0 ? `${openDrivesCount} open` : null,
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      visibleTo: ['ADMIN', 'PLACEMENT', 'TRAINER'],
    },
    {
      id: 'my-portal',
      label: 'Student Portal',
      icon: GraduationCap,
      badge: currentUser.role === 'STUDENT' ? 'Active' : 'Preview',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      visibleTo: ['ADMIN', 'TRAINER', 'PLACEMENT', 'STUDENT'],
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation list */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-3">
            Operations Workspace
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                        item.badgeColor ||
                        (isActive
                          ? 'bg-indigo-100/70 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Institute Cohort Summary Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-700 mb-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold">NorthStar Institute</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
            Main Campus Hub · Training & Corporate Placement Office
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-200/60 pt-2 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Active Cohorts</span>
              <span className="font-semibold text-slate-800">{batches.length} Batches</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Trainees</span>
              <span className="font-semibold text-slate-800">{students.length} Enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-900 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500 font-mono truncate">
              {currentUser.email}
            </div>
          </div>
          <span className="text-[10px] uppercase font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
            {currentUser.role}
          </span>
        </div>
      </div>
    </aside>
  );
};
