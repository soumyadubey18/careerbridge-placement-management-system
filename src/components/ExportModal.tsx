import React from 'react';
import { X, Download, FileSpreadsheet, Users, CalendarCheck2, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { exportCsv, students, attendance, applications } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Export Institutional Reports</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs">
          <p className="text-slate-500">
            Select a report dataset to download in clean standard CSV format for spreadsheet analysis or accreditation records:
          </p>

          {/* Option 1: Students */}
          <div className="p-3.5 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">
                  Students Master Directory
                </span>
                <span className="text-[11px] text-slate-500">
                  {students.length} students · Contact, CGPA, Attendance %
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                exportCsv('students');
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Download
            </button>
          </div>

          {/* Option 2: Attendance */}
          <div className="p-3.5 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">
                  Attendance Audit Ledger
                </span>
                <span className="text-[11px] text-slate-500">
                  {attendance.length} session logs · Present vs Absent breakdown
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                exportCsv('attendance');
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Download
            </button>
          </div>

          {/* Option 3: Placements */}
          <div className="p-3.5 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">
                  Placement Pipeline & Offers
                </span>
                <span className="text-[11px] text-slate-500">
                  {applications.length} applications · Offers, stages & CTC
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                exportCsv('placements');
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
