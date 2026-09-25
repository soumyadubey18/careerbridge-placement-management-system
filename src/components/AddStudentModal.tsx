import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { batches, addStudent } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batchId: batches[0]?.id || '',
    college: 'National Institute of Technology',
    degree: 'B.Tech Computer Science',
    cgpa: 8.2,
    skills: 'React, Node.js, TypeScript',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    addStudent({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      batchId: formData.batchId,
      college: formData.college,
      degree: formData.degree,
      cgpa: Number(formData.cgpa),
      skills: skillsArray,
      notes: formData.notes,
    });

    onClose();
    setFormData({
      name: '',
      email: '',
      phone: '',
      batchId: batches[0]?.id || '',
      college: 'National Institute of Technology',
      degree: 'B.Tech Computer Science',
      cgpa: 8.2,
      skills: 'React, Node.js, TypeScript',
      notes: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Enroll New Trainee Student</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aryan Malhotra"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="aryan.m@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Assigned Cohort *</label>
              <select
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">CGPA (out of 10) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Degree / Branch</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">College</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Java, Spring Boot, MySQL, Docker"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Initial Mentor Notes</label>
            <textarea
              rows={2}
              placeholder="Background notes, learning speed, special interests..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
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
              Confirm Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
