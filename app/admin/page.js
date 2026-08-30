'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Unlock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, LogOut, UploadCloud, Trash2, RefreshCw } from 'lucide-react';

export default function AdminUploadPage() {
  const [auth, setAuth] = useState({ hostId: '', hostPassword: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Upload state
  const [form, setForm] = useState({
    title: '',
    subject: '',
    unlockDateTime: '',
    questions: '',
  });
  const [fileInfo, setFileInfo] = useState({ fileData: null, fileName: '', fileType: '' });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Manage papers list
  const [existingPapers, setExistingPapers] = useState([]);
  const [fetchingPapers, setFetchingPapers] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchExistingPapers = async () => {
    setFetchingPapers(true);
    try {
      const res = await fetch('/api/papers');
      const data = await res.json();
      setExistingPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingPapers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchExistingPapers();
    }
  }, [isAuthenticated]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File size must be under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileInfo({
        fileData: reader.result,
        fileName: file.name,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auth),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setIsAuthenticated(true);
      setStatus({ type: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const localUnlockTime = new Date(form.unlockDateTime).toISOString();

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ...fileInfo,
          unlockDateTime: localUnlockTime,
          hostId: auth.hostId,
          hostPassword: auth.hostPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload');

      setStatus({ type: 'success', message: 'Question paper locked and scheduled successfully!' });
      setForm({ title: '', subject: '', unlockDateTime: '', questions: '' });
      setFileInfo({ fileData: null, fileName: '', fileType: '' });
      fetchExistingPapers();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeletePaper = async (paperId) => {
    if (!confirm('Are you sure you want to delete this question paper?')) return;
    setDeletingId(paperId);

    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          hostId: auth.hostId,
          hostPassword: auth.hostPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setStatus({ type: 'success', message: 'Paper deleted successfully.' });
      fetchExistingPapers();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 my-6 sm:my-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Student Portal
        </Link>
        {isAuthenticated && (
          <button
            onClick={() => { setIsAuthenticated(false); setAuth({ hostId: '', hostPassword: '' }); }}
            className="inline-flex items-center text-xs text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
          </button>
        )}
      </div>

      {/* Login & Upload Card */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
            {isAuthenticated ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isAuthenticated ? 'Upload Exam File / Paper' : 'Host Verification'}
            </h1>
            <p className="text-xs text-slate-400">
              {isAuthenticated ? 'Upload a PDF, document, image, or raw text' : 'Enter credentials to access host dashboard'}
            </p>
          </div>
        </div>

        {status.message && (
          <div className={`p-3.5 mb-5 rounded-xl text-xs flex items-center space-x-2 border ${
            status.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Host ID</label>
              <input
                type="text"
                required
                placeholder="Enter Host ID"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                value={auth.hostId}
                onChange={(e) => setAuth({ ...auth, hostId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Host Password</label>
              <input
                type="password"
                required
                placeholder="Enter Host Password"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                value={auth.hostPassword}
                onChange={(e) => setAuth({ ...auth, hostPassword: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 shadow-lg flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{authLoading ? 'Verifying...' : 'Login as Host'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Examination"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Release Date & Time</label>
              <input
                type="datetime-local"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                value={form.unlockDateTime}
                onChange={(e) => setForm({ ...form, unlockDateTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Upload Question Paper File (PDF, Image, Docx)</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center cursor-pointer bg-slate-900/50 relative">
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-300">
                  {fileInfo.fileName ? (
                    <span className="text-emerald-400 font-bold">{fileInfo.fileName} selected</span>
                  ) : (
                    'Tap to browse and upload file'
                  )}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">PDF, PNG, JPG, or DOCX (Max 5MB)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Or Paste Text / Instructions (Optional)</label>
              <textarea
                rows="3"
                placeholder="Optional text instructions..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-rose-500 transition"
                value={form.questions}
                onChange={(e) => setForm({ ...form, questions: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={uploadLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 shadow-lg"
            >
              {uploadLoading ? 'Securing & Scheduling...' : 'Lock & Schedule Paper'}
            </button>
          </form>
        )}
      </div>

      {/* Host Management List: Delete Section */}
      {isAuthenticated && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Active Papers List</h2>
              <p className="text-xs text-slate-400">Remove accidental or incorrect scheduled exams</p>
            </div>
            <button
              onClick={fetchExistingPapers}
              className="p-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition"
              title="Refresh papers list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingPapers ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {fetchingPapers ? (
            <p className="text-xs text-slate-500 text-center py-4">Loading active papers...</p>
          ) : existingPapers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No uploaded papers currently active.</p>
          ) : (
            <div className="space-y-3">
              {existingPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="flex items-center justify-between p-3.5 bg-slate-900/90 border border-slate-700/60 rounded-xl"
                >
                  <div className="truncate pr-3">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {paper.subject}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1 truncate">{paper.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      {paper.isUnlocked ? 'Unlocked' : `Unlocks: ${new Date(paper.unlockTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePaper(paper.id)}
                    disabled={deletingId === paper.id}
                    className="p-2.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 rounded-xl transition disabled:opacity-50 flex items-center space-x-1 shrink-0"
                    title="Delete Paper"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
