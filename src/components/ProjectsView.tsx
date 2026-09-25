import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Users,
  Calendar,
  ExternalLink,
  Github,
  Award,
  Edit2,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus } from '../types';

export const ProjectsView: React.FC = () => {
  const { projects, batches, students, addProject, evaluateProject, updateProject } =
    useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [evaluatingProject, setEvaluatingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // New project state
  const [newProject, setNewProject] = useState({
    title: '',
    batchId: batches[0]?.id || '',
    domain: 'Full Stack Web & Microservices',
    description: '',
    deadline: '2026-11-15',
    repoUrl: '',
    demoUrl: '',
    memberIds: [] as string[],
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === newProject.batchId);
    addProject({
      title: newProject.title,
      batchId: newProject.batchId,
      batchName: batch?.name || 'Cohort',
      domain: newProject.domain,
      description: newProject.description,
      deadline: newProject.deadline,
      status: 'IN_PROGRESS',
      repoUrl: newProject.repoUrl || undefined,
      demoUrl: newProject.demoUrl || undefined,
      memberIds: newProject.memberIds,
    });
    setShowAddModal(false);
    setNewProject({
      title: '',
      batchId: batches[0]?.id || '',
      domain: 'Full Stack Web & Microservices',
      description: '',
      deadline: '2026-11-15',
      repoUrl: '',
      demoUrl: '',
      memberIds: [],
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Capstone Team Projects
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track industry-grade team capstones, code repository submissions, and trainer evaluation rubrics.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {projects.map((proj) => {
          return (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                    {proj.batchName}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      proj.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : proj.status === 'SUBMITTED'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {proj.title}
                </h3>
                <p className="text-xs text-indigo-700 font-medium mt-0.5">{proj.domain}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Team Members */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Team Members ({proj.members.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.members.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200/80 rounded-md text-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links & Deadline */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {proj.deadline}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source</span>
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Demo</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Evaluation Rubric Result */}
                {proj.evaluationScore !== undefined && (
                  <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-950">
                      <span>Trainer Evaluation Grade</span>
                      <span className="font-mono text-sm">{proj.evaluationScore} / 100</span>
                    </div>
                    {proj.evaluatorFeedback && (
                      <p className="text-[11px] text-emerald-800">
                        {proj.evaluatorFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEvaluatingProject(proj)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                >
                  {proj.evaluationScore !== undefined ? 'Re-Evaluate Rubric' : 'Evaluate Project'}
                </button>

                <div className="flex items-center gap-1">
                  <select
                    value={proj.status}
                    onChange={(e) =>
                      updateProject(proj.id, {
                        status: e.target.value as ProjectStatus,
                      })
                    }
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-700"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evaluate Project Modal */}
      {evaluatingProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Evaluation Rubric: {evaluatingProject.title}
              </h2>
              <button
                onClick={() => setEvaluatingProject(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const score = Number(
                  (document.getElementById('eval-score') as HTMLInputElement)?.value || 80
                );
                const feedback = (
                  document.getElementById('eval-feedback') as HTMLTextAreaElement
                )?.value || '';
                evaluateProject(evaluatingProject.id, score, feedback);
                setEvaluatingProject(null);
              }}
              className="space-y-3.5 mt-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Evaluation Score (0 to 100)
                </label>
                <input
                  id="eval-score"
                  type="number"
                  min="0"
                  max="100"
                  required
                  defaultValue={evaluatingProject.evaluationScore || 85}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Code Review & Architectural Feedback
                </label>
                <textarea
                  id="eval-feedback"
                  rows={4}
                  required
                  defaultValue={
                    evaluatingProject.evaluatorFeedback ||
                    'Architectural pattern adhered to well. Clean test coverage and Docker setup.'
                  }
                  placeholder="Detail strengths in code modularity, API robustness, and team contributions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEvaluatingProject(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
                >
                  Submit Rubric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Create Capstone Project</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Event-Driven Message Broker"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cohort Batch</label>
                  <select
                    value={newProject.batchId}
                    onChange={(e) =>
                      setNewProject({ ...newProject, batchId: e.target.value })
                    }
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
                  <label className="block text-slate-700 font-medium mb-1">Domain</label>
                  <input
                    type="text"
                    required
                    value={newProject.domain}
                    onChange={(e) =>
                      setNewProject({ ...newProject, domain: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Outline key deliverables, tech stack, and evaluation milestones..."
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newProject.repoUrl}
                    onChange={(e) =>
                      setNewProject({ ...newProject, repoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    required
                    value={newProject.deadline}
                    onChange={(e) =>
                      setNewProject({ ...newProject, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Assign Team Members (Enrolled Students)
                </label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {students
                    .filter((s) => s.batchId === newProject.batchId)
                    .map((s) => {
                      const isSelected = newProject.memberIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 text-slate-800 p-1 hover:bg-slate-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewProject({
                                  ...newProject,
                                  memberIds: [...newProject.memberIds, s.id],
                                });
                              } else {
                                setNewProject({
                                  ...newProject,
                                  memberIds: newProject.memberIds.filter(
                                    (id) => id !== s.id
                                  ),
                                });
                              }
                            }}
                          />
                          <span>{s.name} ({s.rollNo})</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
