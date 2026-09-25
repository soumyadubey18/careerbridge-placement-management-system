/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { BatchesView } from './components/BatchesView';
import { AttendanceView } from './components/AttendanceView';
import { AssessmentsView } from './components/AssessmentsView';
import { ProjectsView } from './components/ProjectsView';
import { PlacementsView } from './components/PlacementsView';
import { StudentPortalView } from './components/StudentPortalView';
import { AuthPage } from './components/AuthPage';
import { AddStudentModal } from './components/AddStudentModal';
import { AddBatchModal } from './components/AddBatchModal';
import { ExportModal } from './components/ExportModal';
import { BackendDocsModal } from './components/BackendDocsModal';
import { CheckCircle2 } from 'lucide-react';

function MainLayout() {
  const { activeTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackendDocsModal, setShowBackendDocsModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        onOpenExportModal={() => setShowExportModal(true)}
        onOpenBackendDocs={() => setShowBackendDocsModal(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-50">
              <Sidebar onCloseMobileMenu={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddStudentModal={() => setShowAddStudentModal(true)}
              onOpenAddBatchModal={() => setShowAddBatchModal(true)}
              onOpenBackendDocsModal={() => setShowBackendDocsModal(true)}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView onOpenAddModal={() => setShowAddStudentModal(true)} />
          )}

          {activeTab === 'batches' && (
            <BatchesView onOpenAddBatchModal={() => setShowAddBatchModal(true)} />
          )}

          {activeTab === 'attendance' && <AttendanceView />}

          {activeTab === 'assessments' && <AssessmentsView />}

          {activeTab === 'projects' && <ProjectsView />}

          {activeTab === 'placements' && <PlacementsView />}

          {activeTab === 'my-portal' && <StudentPortalView />}
        </main>
      </div>

      {/* Dialog Modals */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
      />

      <AddBatchModal
        isOpen={showAddBatchModal}
        onClose={() => setShowAddBatchModal(false)}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <BackendDocsModal
        isOpen={showBackendDocsModal}
        onClose={() => setShowBackendDocsModal(false)}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, notification } = useApp();

  return (
    <>
      {!isAuthenticated ? <AuthPage /> : <MainLayout />}

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
