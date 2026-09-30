import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getSchoolData } from '@/functions/getSchoolData';
import { manageUsers } from '@/functions/manageUsers';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Check, AlertCircle } from 'lucide-react';

export default function Instructors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await getSchoolData()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const doInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSaving(true);
    try {
      await manageUsers({ op: 'invite', email, fields: { app_role: 'instructor', school_id: user.school_id } });
      toast({ title: 'Instructor invited' });
      setEmail('');
      load();
    } catch (err) {
      toast({ title: 'Invite failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const instructors = data?.instructors || [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Instructors</h1>
      <p className="text-slate-500 text-sm mb-6">Invite instructors. Each instructor uploads their signature from their own profile to sign certificates.</p>

      <form onSubmit={doInvite} className="mb-6 p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 font-medium text-slate-800 mr-2"><UserPlus className="w-4 h-4" /> Invite instructor</div>
        <input type="email" placeholder="Instructor email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
        <button disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50">Send invite</button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="p-8 text-center text-slate-400 col-span-full">Loading…</div> : instructors.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 rounded-2xl border border-dashed border-slate-200">No instructors yet.</div>
        ) : instructors.map((i) => (
          <div key={i.id} className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="font-semibold text-slate-900">{i.full_name || i.email}</div>
            <div className="text-sm text-slate-500">{i.email}</div>
            {i.instructor_number && <div className="text-xs text-slate-400 mt-1">Instructor No: {i.instructor_number}</div>}
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              {i.signature_url
                ? <span className="flex items-center gap-1 text-emerald-600 font-medium"><Check className="w-3.5 h-3.5" /> Signature on file</span>
                : <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertCircle className="w-3.5 h-3.5" /> No signature yet</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}