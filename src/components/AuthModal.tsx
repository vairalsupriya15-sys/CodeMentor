import React, { useState } from 'react';
import { User } from '../types';
import { X, GraduationCap, LogIn, UserPlus, KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  currentUser: User | null;
  allUsers: User[];
  onClose: () => void;
  onSwitchUser: (userId: string) => Promise<void>;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    college: string;
    role: string;
  }) => Promise<void>;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  allUsers,
  onClose,
  onSwitchUser,
  onLogin,
  onRegister,
  onLogout,
}) => {
  // Mode: 'demo' | 'login' | 'register'
  const [authMode, setAuthMode] = useState<'demo' | 'login' | 'register'>('demo');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('supriya.v@college.edu');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regRole, setRegRole] = useState('Computer Science Student');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(loginEmail.trim(), loginPassword.trim());
      setSuccessMessage('Signed in successfully! Session token stored.');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Name, email, and password are required.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const cleanUsername = regUsername.trim()
      ? (regUsername.startsWith('@') ? regUsername : `@${regUsername}`)
      : `@${regName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    setIsLoading(true);
    try {
      await onRegister({
        name: regName.trim(),
        username: cleanUsername,
        email: regEmail.trim(),
        password: regPassword,
        college: regCollege.trim() || 'Engineering College',
        role: regRole,
      });
      setSuccessMessage('Student account created and authenticated!');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSwitch = async (userId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onSwitchUser(userId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to switch persona.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Student Authentication & Personas
              </h3>
              <p className="text-xs text-slate-500">
                Peer Code Review Platform · JWT & Bcrypt Protected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => { setAuthMode('demo'); setErrorMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              authMode === 'demo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1-Click Demo Switcher
          </button>
          <button
            onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              authMode === 'login'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sign In (Password)
          </button>
          <button
            onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              authMode === 'register'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Register Student
          </button>
        </div>

        {/* Feedback message banner */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: 1-Click Demo Switcher */}
          {authMode === 'demo' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Viva & Evaluation Fast-Switcher
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Instant JWT Session
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any student account below to test code reviews, author permissions, upvoting, and status updates as that reviewer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {allUsers.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleDemoSwitch(u.id)}
                      disabled={isLoading}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {u.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-blue-600 font-mono font-medium truncate">
                          {u.username}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {u.college}
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono font-medium mt-0.5">
                          ★ {u.reputation} pts · {u.reviewsCount} reviews
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentUser && onLogout && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Logged in as: <strong className="text-slate-800">{currentUser.name}</strong>
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Sign In (Email + Password) */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>College Demo Credentials:</span>
                </div>
                <div className="font-mono text-[11px]">
                  Email: <strong>supriya.v@college.edu</strong> | Password: <strong>password123</strong>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  College Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. supriya.v@college.edu"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In with Password'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: Register New Student Account */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supriya Vairal"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @supriya_v"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  College / Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@pict.edu"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password (min. 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Create a secure password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    College / Institute
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering College"
                    value={regCollege}
                    onChange={e => setRegCollege(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Degree / Year
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Computer Science (4th Year)">Computer Science (4th Year)</option>
                    <option value="IT Engineering (3rd Year)">IT Engineering (3rd Year)</option>
                    <option value="Software Engineering (2nd Year)">Software Engineering (2nd Year)</option>
                    <option value="MCA Student">MCA Student</option>
                    <option value="Peer Mentor">Peer Mentor</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Hashing Password & Registering...' : 'Create Student Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
