'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminUploadPage() {
  const [form, setForm] = useState({
    hostId: '',
    hostPassword: '',
    title: '',
    subject: '',
    unlockDateTime: '',
    questions: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload');

      setStatus({ type: 'success', message: 'Question paper locked and scheduled successfully!' });
      setForm({ hostId: '', hostPassword: '', title: '', subject: '', unlockDateTime: '', questions: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 my-6 sm:my-10">
      <Link href="/" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Student Portal
      </Link>

      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Host Exam Uploader</h1>
            <p className="text-xs text-slate-400">Lock and schedule release timestamps</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Host ID</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                value={form.hostId}
                onChange={(e) => setForm({ ...form, hostId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Host Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                value={form.hostPassword}
                onChange={(e) => setForm({ ...form, hostPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exam Title</label>
              <input
                type="text"
                required
                placeholder="e.g. End Semester Exam"
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
                placeholder="e.g. Operating Systems"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Question Paper Content</label>
            <textarea
              rows="6"
              required
              placeholder="Paste complete question paper text or markdown here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-rose-500 transition"
              value={form.questions}
              onChange={(e) => setForm({ ...form, questions: e.target.value })}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Securing & Scheduling...' : 'Lock & Schedule Paper'}
          </button>
        </form>
      </div>
    </div>
  );
    }
                  
