import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { submitExam } from '@/functions/submitExam';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, CheckCircle2, XCircle, FileCheck2, Loader2 } from 'lucide-react';

export default function ExamRunner() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await base44.entities.Subject.get(subjectId);
        setSubject(s);
        const q = await base44.entities.Question.filter({ subject_id: subjectId });
        setQuestions(q);
      } catch (e) {
        toast({ title: 'Could not load exam', variant: 'destructive' });
        navigate('/exams');
      } finally { setLoading(false); }
    })();
  }, [subjectId]);

  const setAns = (qid, idx) => setAnswers((a) => ({ ...a, [qid]: idx }));

  const submit = async () => {
    if (questions.some((q) => answers[q.id] === undefined)) {
      toast({ title: 'Answer all questions before submitting', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] }));
      const res = await submitExam({ subjectId, answers: payload });
      setResult(res);
      toast({ title: res.passed ? 'Passed!' : 'Not passed', variant: res.passed ? 'default' : 'destructive' });
    } catch (err) {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading exam…</div>;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${result.passed ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            {result.passed ? <CheckCircle2 className="w-9 h-9 text-emerald-500" /> : <XCircle className="w-9 h-9 text-rose-500" />}
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mt-4">{result.passed ? 'Congratulations — you passed!' : 'Not passed this time'}</h2>
          <p className="text-slate-500 mt-1">{subject.name}</p>
          <div className="mt-4 text-4xl font-semibold text-slate-900">{result.score}%</div>
          <p className="text-sm text-slate-500 mt-1">Pass mark: {subject.pass_mark ?? 75}% · {result.total} questions</p>

          {result.passed && result.certificateId && (
            <div className="mt-6 p-4 rounded-xl bg-sky-50 border border-sky-100 text-left">
              <div className="flex items-center gap-2 text-sky-700 font-medium text-sm"><FileCheck2 className="w-4 h-4" /> Certificate & CA 61-184 issued</div>
              <p className="text-sm text-slate-500 mt-1">Both documents have been emailed to you and saved under Certificates.</p>
              <Link to="/certificates" className="mt-3 inline-flex items-center gap-1.5 text-sm text-sky-600 font-medium hover:text-sky-700">View certificates →</Link>
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/exams" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Back to subjects</Link>
            <button onClick={() => { setResult(null); setAnswers({}); }} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">Retake</button>
          </div>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/exams" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"><ArrowLeft className="w-4 h-4" /> All subjects</Link>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{subject.name}</h1>
          <p className="text-sm text-slate-500">{questions.length} questions · answered {answered}/{questions.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="text-xs font-semibold text-slate-400 mb-1">Question {i + 1}</div>
            <div className="font-medium text-slate-900">{q.question_text}</div>
            <div className="mt-3 space-y-2">
              {q.options.map((o, idx) => {
                const sel = answers[q.id] === idx;
                return (
                  <button key={idx} onClick={() => setAns(q.id, idx)} className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${sel ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 sticky bottom-4">
        <button disabled={submitting || answered < questions.length} onClick={submit} className="w-full px-5 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : `Submit exam (${answered}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}