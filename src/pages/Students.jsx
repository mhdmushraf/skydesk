import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getSchoolData } from '@/functions/getSchoolData';
import { manageUsers } from '@/functions/manageUsers';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, GraduationCap, X } from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [assign, setAssign] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await getSchoolData()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const instructors = data?.instructors || [];
  const students = data?.students || [];
  const attempts = data?.attempts || [];
  const certs = data?.certificates || [];

  const instName = (id) => instructors.find((i) => i.id === id)?.full_name || '—';
  const studentStats = (sid) => {
    const a = attempts.filter((x) => x.student_id === sid);
    const c = certs.filter((x) => x.student_id === sid);
    return { attempts: a.length, passed: a.filter((x) => x.passed).length, certs: c.length };
  };

  const doInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSaving(true);
    try {
      await manageUsers({ op: 'invite', email: inviteEmail, fields: { app_role: 'student', school_id: user.school_id } });
      toast({ title: 'Student invited' });
      setInviteEmail('');
      load();
    } catch (err) {
      toast({ title: 'Invite failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const saveAssign = async () => {
    setSaving(true);
    try {
      await manageUsers({ op: 'update', id: assign.id, fields: { instructor_id: assign.instructor_id } });
      toast({ title: 'Instructor assigned' });
      setAssign(null);
      load();
    } catch (err) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Students</h1>
      <p className="text-slate-500 text-sm mb-6">Invite students and assign them to instructors.</p>

      <form onSubmit={doInvite} className="mb-6 p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 font-medium text-slate-800 mr-2"><UserPlus className="w-4 h-4" /> Invite student</div>
        <input type="email" placeholder="Student email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
          className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
        <button disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50">Send invite</button>
      </form>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-400">Loading…</div> : students.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No students yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Instructor</th>
                <th className="text-left px-5 py-3 font-medium">Attempts</th>
                <th className="text-left px-5 py-3 font-medium">Passed</th>
                <th className="text-left px-5 py-3 font-medium">Certs</th>
                <th className="text-right px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => {
                const st = studentStats(s.id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-800">{s.full_name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{s.email}</td>
                    <td className="px-5 py-3 text-slate-600">{instName(s.instructor_id)}</td>
                    <td className="px-5 py-3 text-slate-600">{st.attempts}</td>
                    <td className="px-5 py-3 text-slate-600">{st.passed}</td>
                    <td className="px-5 py-3 text-slate-600">{st.certs}</td>
                    <td className="px-5 py-3 text-right"><button onClick={() => setAssign({ id: s.id, instructor_id: s.instructor_id || '' })} className="text-sky-600 font-medium hover:underline">Assign</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {assign && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4" onClick={() => setAssign(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Assign instructor</h3><button onClick={() => setAssign(null)}><X className="w-4 h-4 text-slate-400" /></button></div>
            <select value={assign.instructor_id} onChange={(e) => setAssign({ ...assign, instructor_id: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              <option value="">— None —</option>
              {instructors.map((i) => <option key={i.id} value={i.id}>{i.full_name || i.email}</option>)}
            </select>
            <button disabled={saving} onClick={saveAssign} className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}