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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Batch } from '../types';

interface BatchesViewProps {
  onOpenAddBatchModal: () => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({ onOpenAddBatchModal }) => {
  const { batches, students, updateBatch, setActiveTab } = useApp();
  const [selectedBatchForRoster, setSelectedBatchForRoster] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cohorts & Batch Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Configure curriculum programs, designated lead trainers, lab schedules, and enrolled student capacity.
          </p>
        </div>

        <button
          onClick={onOpenAddBatchModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Cohort</span>
        </button>
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {batches.map((batch) => {
          const enrolled = students.filter((s) => s.batchId === batch.id);
          const capacityPct = Math.round((enrolled.length / batch.capacity) * 100);

          return (
            <div
              key={batch.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
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
                <button
                  onClick={() => setSelectedBatchForRoster(batch)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  View Enrolled Trainees ({enrolled.length})
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
          );
        })}
      </div>

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

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
