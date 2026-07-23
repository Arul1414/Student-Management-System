import { useState, FormEvent } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Database, 
  Info, 
  Server, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';

interface SettingsViewProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function SettingsView({ showToast }: SettingsViewProps) {
  
  // Password Reset States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      await api.resetPassword({ currentPassword, newPassword });
      showToast('Administrator password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6" id="settings-view-section">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Security & Details</h2>
        <p className="text-slate-500 text-xs mt-0.5">Manage credentials, review system metadata, and inspect database parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Password Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100/80 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-gradient-to-tr from-brand-600 to-indigo-600 text-white rounded-xl shadow-md shadow-brand-500/20"><KeyRound className="w-5 h-5" /></div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Change Admin Credentials</h3>
                <p className="text-xs text-slate-400">Update password used to secure REST API endpoints</p>
              </div>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current portal password"
                  className="w-full max-w-md px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden bg-slate-50/50"
                  id="settings-current-pass"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters long"
                  className="w-full max-w-md px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden bg-slate-50/50"
                  id="settings-new-pass"
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full max-w-md px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden bg-slate-50/50"
                  id="settings-confirm-pass"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  id="settings-update-pass-btn"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:bg-slate-400"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isUpdating ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: System Info Metadata */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-slate-400" />
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Server Parameters</h3>
            </div>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Node.js Runtime</span>
                <span className="font-semibold text-slate-800">v22.x</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Core Service Engine</span>
                <span className="font-semibold text-slate-800">Express v4.21</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Database System</span>
                <span className="font-semibold text-slate-800">Persistent JSON File-DB</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Frontend Framework</span>
                <span className="font-semibold text-slate-800">React 19 & Vite 6</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-medium">Authentication</span>
                <span className="font-semibold text-slate-800">JWT Token Auth</span>
              </div>
            </div>
          </div>

          {/* Database Info Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-brand-400" />
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Storage Sync Status</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Academic student databases are synchronized synchronously to a server-side JSON file <span className="font-mono bg-slate-800 text-brand-400 px-1 py-0.5 rounded">database.json</span> on every record insert, modification, or delete event.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Durable File System Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
