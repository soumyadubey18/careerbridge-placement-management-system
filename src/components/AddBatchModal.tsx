import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({ isOpen, onClose }) => {
  const { addBatch } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    course: '',
    trainerName: 'Vikram Seth',
    trainerEmail: 'trainer@northstar.dev',
    schedule: 'Mon - Fri · 09:30 AM - 01:00 PM',
    mode: 'In-Person' as const,
    startDate: '2026-10-01',
    endDate: '2027-03-30',
    capacity: 35,
    classroom: 'Lab 302',
    status: 'ACTIVE' as const,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBatch({
      name: formData.name,
      code: formData.code || `COHORT-${Date.now().toString().slice(-4)}`,
      course: formData.course,
      trainerName: formData.trainerName,
      trainerEmail: formData.trainerEmail,
      schedule: formData.schedule,
      mode: formData.mode,
      startDate: formData.startDate,
      endDate: formData.endDate,
      capacity: Number(formData.capacity),
      classroom: formData.classroom,
      status: formData.status,
    });
    onClose();
    setFormData({
      name: '',
      code: '',
      course: '',
      trainerName: 'Vikram Seth',
      trainerEmail: 'trainer@northstar.dev',
      schedule: 'Mon - Fri · 09:30 AM - 01:00 PM',
      mode: 'In-Person',
      startDate: '2026-10-01',
      endDate: '2027-03-30',
      capacity: 35,
      classroom: 'Lab 302',
      status: 'ACTIVE',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Create New Cohort Batch</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Cohort Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. CyberSecurity & SRE"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Batch Code</label>
              <input
                type="text"
                placeholder="e.g. CYBER-2026-A"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Course Curriculum</label>
            <input
              type="text"
              required
              placeholder="e.g. Network Defense, Penetration Testing & Cloud Security"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Lead Trainer Name</label>
              <input
                type="text"
                required
                value={formData.trainerName}
                onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Instruction Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="In-Person">In-Person</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Schedule & Hours</label>
              <input
                type="text"
                required
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Max Capacity (Seats)</label>
              <input
                type="number"
                min="5"
                max="100"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Target End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
            >
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
