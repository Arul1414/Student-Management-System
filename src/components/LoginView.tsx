import { useState, FormEvent } from 'react';
import { 
  Lock, 
  Mail, 
  GraduationCap, 
  ArrowRight, 
  AlertCircle, 
  HelpCircle,
  Eye,
  EyeOff,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: { email: string; fullName: string }) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function LoginView({ onLoginSuccess, showToast }: LoginViewProps) {
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password Recovery states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Submit Login
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !password) {
      setLoginError('Please enter both your registered email and password.');
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError('Please enter a valid administrative email address.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setLoginError(err.message || 'The email or password entered is incorrect.');
      showToast(err.message || 'Login credentials incorrect.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password
  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotMessage('');

    if (!forgotEmail) {
      showToast('Please enter your administrator email.', 'error');
      return;
    }

    setIsForgotLoading(true);
    try {
      const data = await api.forgotPassword(forgotEmail);
      setForgotMessage(data.message);
      showToast('Recovery instructions calculated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to locate administrator email.', 'error');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden" id="auth-login-screen">
      {/* Background Ambience Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-800/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-800/15 blur-[120px] pointer-events-none" />

      {/* Main Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10"
      >
        {/* Top Header Section */}
        <div className="bg-slate-900 px-8 py-7 flex flex-col items-center text-center text-white">
          <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-xl shadow-brand-900/40 mb-3.5">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">EduPulse Systems</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Administrator Identity Authentication Portal</p>
        </div>

        {/* Dynamic Forms Body */}
        <div className="p-8">
          {!isForgotPassword ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-5" id="login-form-box">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{loginError}</span>
                </motion.div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="w-full pl-10.5 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden bg-slate-50/50 focus:bg-white transition-all font-medium"
                    id="login-email-field"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10.5 pr-11 py-2.5 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden bg-slate-50/50 focus:bg-white transition-all font-medium"
                    id="login-password-field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                id="login-submit-btn"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:bg-slate-400"
              >
                <span>{isLoading ? 'Authenticating Credentials...' : 'Authenticate Portal'}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>

              {/* Quick 1-Click Admin Access */}
              <button
                type="button"
                onClick={async () => {
                  setEmail('admin@school.edu');
                  setPassword('adminpassword');
                  setIsLoading(true);
                  try {
                    const data = await api.login({ email: 'admin@school.edu', password: 'adminpassword' });
                    showToast(`Welcome back, ${data.user.fullName}!`, 'success');
                    onLoginSuccess(data.token, data.user);
                  } catch (err: any) {
                    setLoginError(err.message || 'Login failed.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                id="quick-demo-login-btn"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-brand-600" />
                <span>1-Click Quick Admin Login</span>
              </button>

              {/* Credentials Hint Helper block */}
              <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-slate-400 text-xs bg-slate-50 p-3 rounded-2xl">
                <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-500 block">Default Admin Credentials</span>
                  <span className="text-[10px] block mt-0.5 leading-relaxed">
                    Email: <span className="font-mono font-semibold text-slate-600">admin@school.edu</span><br />
                    Password: <span className="font-mono font-semibold text-slate-600">adminpassword</span>
                  </span>
                </div>
              </div>
            </form>
          ) : (
            /* --- FORGOT PASSWORD MODULE --- */
            <form onSubmit={handleForgotSubmit} className="space-y-5" id="forgot-form-box">
              <div className="space-y-1 text-center pb-1">
                <h3 className="text-sm font-bold text-slate-800">Credentials Self-Recovery</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Provide your administrator identity email to calculate recovery options.</p>
              </div>

              {forgotMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-brand-50 border border-brand-100 rounded-xl text-brand-900 text-xs leading-relaxed"
                >
                  <span className="font-semibold block text-brand-800">Instructions Recalculated:</span>
                  <span className="mt-1 block font-medium">{forgotMessage}</span>
                </motion.div>
              )}

              {/* Recover email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="w-full pl-10.5 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden bg-slate-50/50 focus:bg-white transition-all font-medium"
                    id="forgot-email-field"
                  />
                </div>
              </div>

              {/* Submit forgot */}
              <button
                type="submit"
                disabled={isForgotLoading}
                id="forgot-submit-btn"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isForgotLoading ? 'Processing Request...' : 'Calculate Password Recovery'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setForgotMessage('');
                }}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mt-2"
              >
                Back to Authentication Panel
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* Portal Footer credit */}
      <p className="text-[10px] text-slate-500 font-medium absolute bottom-6 z-10">
        EduPulse Systems © 2026 • Secure School Administration
      </p>
    </div>
  );
}
