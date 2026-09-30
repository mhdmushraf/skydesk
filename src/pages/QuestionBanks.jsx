import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { manageQuestions } from '@/functions/manageQuestions';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Plus, Pencil, Trash2, X, ChevronRight } from 'lucide-react';

const emptyQ = { question_text: '', options: ['', '', '', ''], correct_index: 0, explanation: '' };

export default function QuestionBanks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [active, setActive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qLoading, setQLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await base44.entities.Subject.list();
        setSubjects(s);
        if (s.length) setActive(s[0].id);
      } finally { setLoading(false); }
    })();
  }, []);

  const loadQuestions = async (sid) => {
    setQLoading(true);
    try {
      const q = await base44.entities.Question.filter({ subject_id: sid, school_id: user.school_id });
      setQuestions(q);
    } finally { setQLoading(false); }
  };
  useEffect(() => { if (active) loadQuestions(active); }, [active]);

  const openNew = () => setEdit({ id: null, ...emptyQ });
  const openEdit = (q) => setEdit({ id: q.id, question_text: q.question_text, options: [...q.options], correct_index: q.correct_index, explanation: q.explanation || '' });

  const save = async () => {
    if (!edit.question_text || edit.options.some((o) => !o.trim())) {
      toast({ title: 'Fill the question and all options', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (edit.id) {
        await manageQuestions({ op: 'update', id: edit.id, subject_id: active, question_text: edit.question_text, options: edit.options, correct_index: edit.correct_index, explanation: edit.explanation });
      } else {
        await manageQuestions({ op: 'create', subject_id: active, question_text: edit.question_text, options: edit.options, correct_index: edit.correct_index, explanation: edit.explanation });
      }
      toast({ title: 'Question saved' });
      setEdit(null);
      loadQuestions(active);
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const remove = async (q) => {
    if (!confirm('Delete this question?')) return;
    try {
      await manageQuestions({ op: 'delete', id: q.id });
      toast({ title: 'Question deleted' });
      loadQuestions(active);
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const activeSubject = subjects.find((s) => s.id === active);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Question Banks</h1>
      <p className="text-slate-500 text-sm mb-6">Build your school's question bank per SACAA subject.</p>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Subjects */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">Subjects</div>
          {loading ? <div className="p-6 text-center text-slate-400">Loading…</div> : subjects.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} className={`w-full text-left px-4 py-3 flex items-center justify-between border-b border-slate-50 ${active === s.id ? 'bg-sky-50 text-sky-700' : 'hover:bg-slate-50 text-slate-700'}`}>
              <span className="text-sm font-medium">{s.name}</span>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-500">{activeSubject?.name} — {questions.length} questions</div>
            <button onClick={openNew} className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"><Plus className="w-4 h-4" /> Add question</button>
          </div>
          {qLoading ? <div className="p-8 text-center text-slate-400">Loading…</div> : questions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No questions yet for this subject.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-400">Q{idx + 1}</div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="font-medium text-slate-900 mt-1">{q.question_text}</div>
                  <ol className="mt-3 space-y-1 text-sm">
                    {q.options.map((o, i) => (
                      <li key={i} className={`px-3 py-1.5 rounded-lg ${i === q.correct_index ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}. {o} {i === q.correct_index && '✓'}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4" onClick={() => setEdit(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">{edit.id ? 'Edit question' : 'New question'}</h3><button onClick={() => setEdit(null)}><X className="w-4 h-4 text-slate-400" /></button></div>
            <div>
              <label className="text-xs font-medium text-slate-500">Question</label>
              <textarea value={edit.question_text} onChange={(e) => setEdit({ ...edit, question_text: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Options (select the correct one)</label>
              {edit.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" checked={edit.correct_index === i} onChange={() => setEdit({ ...edit, correct_index: i })} className="accent-sky-600" />
                  <input value={o} onChange={(e) => { const opts = [...edit.options]; opts[i] = e.target.value; setEdit({ ...edit, options: opts }); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Explanation (optional)</label>
              <input value={edit.explanation} onChange={(e) => setEdit({ ...edit, explanation: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <button disabled={saving} onClick={save} className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50">Save question</button>
          </div>
        </div>
      )}
    </div>
  );
}