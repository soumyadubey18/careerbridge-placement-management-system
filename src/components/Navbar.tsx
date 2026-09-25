import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Briefcase,
  UserCheck,
  RotateCcw,
  Download,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Server,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
  onOpenExportModal: () => void;
  onOpenBackendDocs?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  mobileMenuOpen,
  onOpenExportModal,
  onOpenBackendDocs,
}) => {
  const { currentUser, switchRoleUser, resetAllData, logout } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const roles: { role: Role; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'ADMIN',
      label: 'Admin',
      icon: <Users className="w-4 h-4 text-indigo-600" />,
      desc: 'Full operational administration & directory',
    },
    {
      role: 'TRAINER',
      label: 'Trainer',
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      desc: 'Batches, attendance marking & evaluations',
    },
    {
      role: 'PLACEMENT',
      label: 'Placement Officer',
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
      desc: 'Corporate drives, pipeline & offers',
    },
    {
      role: 'STUDENT',
      label: 'Student',
      icon: <GraduationCap className="w-4 h-4 text-purple-600" />,
      desc: 'Personal attendance, tests, interviews & drives',
    },
  ];

  const handleRoleSelect = (role: Role) => {
    switchRoleUser(role);
    setShowRoleDropdown(false);
  };

  const handleReset = () => {
    if (confirmReset) {
      resetAllData();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Institute Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                CB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 tracking-tight text-base">
                    CareerBridge
                  </span>
                  <span className="text-xs text-slate-500 font-normal hidden sm:inline">
                    TPMS Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block leading-none mt-0.5">
                  Training & Placement Management System
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backend API Explorer Button */}
            {onOpenBackendDocs && (
              <button
                onClick={onOpenBackendDocs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                title="Access Express backend API console"
              >
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Backend API</span>
              </button>
            )}

            {/* CSV Export Button */}
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Export Reports to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                confirmReset
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
              }`}
              title="Reset state to initial seed dataset"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${confirmReset ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {confirmReset ? 'Click to Confirm Reset' : 'Reset Demo'}
              </span>
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center justify-center">
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Role: {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
              </button>

              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 py-2 divide-y divide-slate-100">
                    <div className="px-3.5 py-2">
                      <p className="text-xs font-semibold text-slate-900">Switch Role Viewpoint</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Test system perspectives and permissions
                      </p>
                    </div>

                    <div className="py-1">
                      {roles.map((r) => {
                        const isCurrent = currentUser.role === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => handleRoleSelect(r.role)}
                            className={`w-full flex items-start gap-2.5 px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                              isCurrent ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <span className="mt-0.5">{r.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={isCurrent ? 'text-indigo-950 font-medium' : 'text-slate-900'}>
                                  {r.label}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] text-indigo-600 font-medium bg-indigo-100/60 px-1.5 py-0.2 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                                {r.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-3.5 py-2 text-[11px] text-slate-500 bg-slate-50/50 flex items-center justify-between">
                      <span className="truncate max-w-[170px]">
                        Logged as: <strong className="text-slate-700">{currentUser.email}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          logout();
                        }}
                        className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
