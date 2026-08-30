'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Unlock, Clock, ShieldCheck, RefreshCw, Download, FileText } from 'lucide-react';

function CountdownTimer({ targetTime, onUnlock }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        if (onUnlock) onUnlock();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTime, onUnlock]);

  return <span className="font-mono text-sm font-bold text-amber-400">{timeLeft}</span>;
}

export default function StudentPortalPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPapers = async () => {
    try {
      const res = await fetch('/api/papers');
      const data = await res.json();
      setPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 my-6 sm:my-10">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-black text-white">Timed Exam Locker</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Questions and files unlock automatically at the scheduled time</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPapers}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin"
            className="text-xs px-3.5 py-2 bg-rose-600/20 border border-rose-500/40 text-rose-300 rounded-xl hover:bg-rose-600/30 transition font-medium"
          >
            Host Portal
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm animate-pulse">Checking scheduled exams...</div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
          No question papers are scheduled right now.
        </div>
      ) : (
        <div className="space-y-5">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-lg backdrop-blur-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-700 text-slate-300">
                    {paper.subject}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-2">{paper.title}</h2>
                </div>
                <div>
                  {paper.isUnlocked ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Unlock className="w-3.5 h-3.5 mr-1" /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Lock className="w-3.5 h-3.5 mr-1" /> Locked 🔒
                    </span>
                  )}
                </div>
              </div>

              {!paper.isUnlocked ? (
                <div className="mt-4 p-3.5 bg-slate-900/90 border border-slate-700/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Unlocks In:</span>
                  </div>
                  <CountdownTimer targetTime={paper.unlockTime} onUnlock={fetchPapers} />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {paper.fileData && (
                    <div className="p-3.5 sm:p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {paper.fileName || 'Question Paper File'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Attached document ready for download</p>
                        </div>
                      </div>

                      <a
                        href={paper.fileData}
                        download={paper.fileName || 'question_paper'}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow transition shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Paper</span>
                      </a>
                    </div>
                  )}

                  {paper.questions && (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                      {paper.questions}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
