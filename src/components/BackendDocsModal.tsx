import React, { useState } from 'react';
import {
  X,
  Server,
  Terminal,
  Code2,
  Copy,
  Check,
  Play,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStoredToken } from '../api/client';

interface BackendDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendDocsModal: React.FC<BackendDocsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useApp();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Interactive Live Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/dashboard');
  const [selectedMethod, setSelectedMethod] = useState<string>('GET');
  const [requestPayload, setRequestPayload] = useState<string>('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<number | null>(null);

  if (!isOpen) return null;

  const token = getStoredToken() || 'YOUR_JWT_BEARER_TOKEN';

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/login',
      auth: false,
      desc: 'Verify credentials and generate JWT token',
      sampleBody: JSON.stringify({ email: 'dubeysoumya8@gmail.com', password: 'demo123' }, null, 2),
    },
    {
      method: 'POST',
      path: '/api/auth/register',
      auth: false,
      desc: 'Register a new student account and create database profile',
      sampleBody: JSON.stringify(
        {
          name: 'Aman Sharma',
          email: 'aman@example.com',
          password: 'password123',
          phone: '+91 98000 00020',
          college: 'IIT Delhi',
          degree: 'B.Tech CSE',
          cgpa: 8.8,
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/api/dashboard',
      auth: false,
      desc: 'Aggregate institutional metrics, attention items, and upcoming tests/interviews',
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/students',
      auth: false,
      desc: 'Query students directory with optional ?q= & ?batchId= & ?status= filters',
      sampleBody: '',
    },
    {
      method: 'POST',
      path: '/api/students',
      auth: true,
      desc: 'Enroll a new student into a cohort batch',
      sampleBody: JSON.stringify(
        {
          name: 'Neha Kapoor',
          email: 'neha@example.com',
          phone: '+91 98000 00021',
          batchId: 'b-1',
          college: 'BITS Pilani',
          degree: 'B.E CSE',
          cgpa: 9.0,
          skills: ['React', 'TypeScript', 'Node.js'],
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/api/batches',
      auth: false,
      desc: 'List all cohorts with enrolled student counts and trainer assignments',
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/attendance',
      auth: false,
      desc: 'Retrieve recorded attendance history and calculate percentage statistics',
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/mock-tests',
      auth: false,
      desc: 'List all scheduled coding tests with individual student score results',
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/interviews',
      auth: false,
      desc: 'List technical and HR mock interviews with scores and feedback',
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/projects',
      auth: false,
      desc: 'List team capstone projects with evaluator marks and repo links',
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/placements',
      auth: false,
      desc: 'List active corporate hiring drives and student application pipeline stages',
      sampleBody: '',
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleSelectEndpoint = (ep: (typeof endpoints)[0]) => {
    setSelectedEndpoint(ep.path);
    setSelectedMethod(ep.method);
    setRequestPayload(ep.sampleBody || '');
    setTestResponse(null);
    setTestStatus(null);
  };

  const executeLiveRequest = async () => {
    setTestLoading(true);
    setTestResponse(null);
    setTestStatus(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method: selectedMethod,
        headers,
      };

      if (selectedMethod !== 'GET' && requestPayload) {
        options.body = requestPayload;
      }

      const res = await fetch(selectedEndpoint, options);
      setTestStatus(res.status);
      const data = await res.json();
      setTestResponse(data);
    } catch (err: any) {
      setTestStatus(500);
      setTestResponse({ error: err.message || 'Request failed' });
    } finally {
      setTestLoading(false);
    }
  };

  const sampleCurl = `curl -X GET "http://localhost:3000/api/dashboard" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`;

  const sampleFetch = `// JavaScript / TypeScript Fetch Example:
const token = localStorage.getItem('careerbridge_auth_token');

const response = await fetch('/api/dashboard', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Express Backend API & Integration Guide</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  PORT 3000 · ONLINE
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-Stack architecture running Express 4.x, Node.js Scrypt salted hashing, and JWT Bearer security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Section 1: How to Access the Backend */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <span className="font-bold text-indigo-950 text-xs block">
              1. How to Connect to the Backend
            </span>
            <p className="text-indigo-900 text-xs leading-relaxed">
              The backend is hosted directly inside this applet container on <strong>port 3000</strong> using <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] border border-indigo-200">server.ts</code>. Express serves all REST endpoints prefixed with <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] border border-indigo-200">/api/*</code> and simultaneously mounts Vite in single-page middleware mode.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-indigo-900 font-mono">
              <div className="p-2 bg-white rounded border border-indigo-100">
                <span className="text-slate-400 block text-[10px] uppercase">Base URL</span>
                <strong>http://localhost:3000/api</strong>
              </div>
              <div className="p-2 bg-white rounded border border-indigo-100">
                <span className="text-slate-400 block text-[10px] uppercase">Auth Header</span>
                <strong>Authorization: Bearer &lt;token&gt;</strong>
              </div>
              <div className="p-2 bg-white rounded border border-indigo-100">
                <span className="text-slate-400 block text-[10px] uppercase">Format</span>
                <strong>application/json</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Live Endpoint Tester */}
          <div className="bg-slate-900 rounded-xl p-4 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-indigo-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Interactive Live API Tester (Execute real requests to Express backend)</span>
              </span>
              {testStatus && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    testStatus >= 200 && testStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  HTTP {testStatus}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs w-full sm:w-auto"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="flex-1 w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
              />

              <button
                onClick={executeLiveRequest}
                disabled={testLoading}
                className="w-full sm:w-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{testLoading ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            {selectedMethod !== 'GET' && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Request JSON Body:</span>
                <textarea
                  rows={3}
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 font-mono text-xs text-slate-300 rounded border border-slate-800 focus:outline-none"
                />
              </div>
            )}

            {testResponse && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Live Backend Response:</span>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Section 3: REST API Catalog */}
          <div>
            <span className="font-bold text-slate-900 text-xs block mb-2">
              REST Endpoints Reference Catalog
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {endpoints.map((ep, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectEndpoint(ep)}
                  className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : ep.method === 'POST'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-800 font-semibold">{ep.path}</span>
                    <span className="text-slate-500 truncate hidden md:inline">· {ep.desc}</span>
                  </div>

                  <span className="text-[11px] text-indigo-600 font-medium flex-shrink-0">
                    Test in Console →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Copyable Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>cURL Command</span>
                </span>
                <button
                  onClick={() => handleCopy(sampleCurl, 1)}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 1 ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="p-2.5 bg-slate-900 text-slate-200 rounded font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                {sampleCurl}
              </pre>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>JavaScript Fetch Snippet</span>
                </span>
                <button
                  onClick={() => handleCopy(sampleFetch, 2)}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 2 ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-2.5 bg-slate-900 text-slate-200 rounded font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                {sampleFetch}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 rounded-b-2xl flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Current Authenticated User: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.email})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
