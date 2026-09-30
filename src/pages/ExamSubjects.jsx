import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight, Award, Clock } from 'lucide-react';

export default function ExamSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [subs, atts] = await Promise.all([
          base44.entities.Subject.list(),
          base44.entities.ExamAttempt.list('-completed_date', 100)
        ]);
        setSubjects(subs);
        setAttempts(atts);
        const c = {};
        for (const s of subs) {
          const q = await base44.entities.Question.filter({ subject_id: s.id, school_id: user.school_id });
          c[s.id] = q.length;
        }
        setCounts(c);
      } finally { setLoading(false); }
    })();
  }, []);

  const bestScore = (sid) => {
    const a = attempts.filter((x) => x.subject_id === sid);
    if (!a.length) return null;
    return Math.max(...a.map((x) => x.score));
  };
  const lastDate = (sid) => {
    const a = attempts.filter((x) => x.subject_id === sid);
    if (!a.length) return null;
    return a[0].completed_date;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Mock Exams</h1>
      <p className="text-slate-500 text-sm mb-6">Choose a SACAA subject to start a theory exam.</p>

      {loading ? <div className="p-10 text-center text-slate-400">Loading…</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => {
            const best = bestScore(s.id);
            const last = lastDate(s.id);
            const ready = (counts[s.id] || 0) > 0;
            return (
              <div key={s.id} className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-sky-600 uppercase">{s.license_level}</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{s.name}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">{counts[s.id] || 0} Q</span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  {best !== null ? <span className="flex items-center gap-1 text-emerald-600 font-medium"><Award className="w-3.5 h-3.5" /> Best {best}%</span> : <span className="text-slate-400">Not attempted</span>}
                  {last && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(last).toLocaleDateString()}</span>}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link to={`/exams/${s.id}`} className={`inline-flex items-center gap-1.5 text-sm font-medium ${ready ? 'text-sky-600 hover:text-sky-700' : 'text-slate-300 pointer-events-none'}`}>
                    {ready ? <>Start exam <ChevronRight className="w-4 h-4" /></> : 'No questions yet'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}