import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage: React.FC = () => {
  const { login, register, batches } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state - clean defaults
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    batchId: batches[0]?.id || 'b-1',
    college: '',
    degree: 'B.Tech Computer Science',
    cgpa: 8.5,
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await register({
        name: signupData.name.trim(),
        email: signupData.email.trim(),
        password: signupData.password,
        phone: signupData.phone.trim(),
        batchId: signupData.batchId,
        college: signupData.college.trim(),
        degree: signupData.degree.trim(),
        cgpa: Number(signupData.cgpa),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            CB
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            CareerBridge
          </span>
        </div>

        <h2 className="mt-3 text-center text-sm font-semibold text-slate-300">
          Training & Placement Management System
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Integrated operational workspace for training institutes, trainers, and hiring partners
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80 sm:px-10 text-xs">
          {/* Segmented Auth Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-900/80 rounded-xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Registration
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-slate-400 hover:text-slate-300 cursor-pointer text-[11px]">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="pt-4 border-t border-slate-700/50 flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Protected by role-based access control</span>
              </div>
            </form>
          ) : (
            /* Student Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={signupData.phone}
                    onChange={(e) =>
                      setSignupData({ ...signupData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Select Cohort *
                  </label>
                  <select
                    value={signupData.batchId}
                    onChange={(e) =>
                      setSignupData({ ...signupData, batchId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BMSIT Bengaluru"
                    value={signupData.college}
                    onChange={(e) =>
                      setSignupData({ ...signupData, college: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Academic CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={signupData.cgpa}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        cgpa: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'Enroll & Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
