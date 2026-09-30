import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Building2, Plus } from 'lucide-react';

export default function Schools() {
  const { toast } = useToast();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', country: '', city: '', address: '', contact_email: '', phone: '' });

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.School.list();
      setSchools(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await base44.entities.School.create(form);
      toast({ title: 'School created' });
      setForm({ name: '', country: '', city: '', address: '', contact_email: '', phone: '' });
      load();
    } catch (err) {
      toast({ title: 'Could not create school', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Schools</h1>
      <p className="text-slate-500 text-sm mb-6">Onboard flight schools onto Skydesk.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={create} className="lg:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 space-y-3 h-fit">
          <div className="flex items-center gap-2 font-medium text-slate-800"><Plus className="w-4 h-4" /> New school</div>
          {[
            { k: 'name', l: 'School name', t: 'text' },
            { k: 'country', l: 'Country', t: 'text' },
            { k: 'city', l: 'City', t: 'text' },
            { k: 'contact_email', l: 'Contact email', t: 'email' },
            { k: 'phone', l: 'Phone', t: 'text' },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-xs font-medium text-slate-500">{f.l}</label>
              <input type={f.t} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-500">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" rows={2} />
          </div>
          <button className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">Create school</button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {loading ? <div className="p-8 text-center text-slate-400">Loading…</div> : schools.length === 0 ? (
            <div className="p-8 text-center text-slate-400 rounded-2xl border border-dashed border-slate-200">No schools yet. Create your first one.</div>
          ) : schools.map((s) => (
            <div key={s.id} className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-sky-600" /></div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{s.name}</div>
                <div className="text-sm text-slate-500">{[s.city, s.country].filter(Boolean).join(', ') || 'No location'}</div>
                <div className="text-xs text-slate-400 mt-1">{s.contact_email} {s.phone ? '· ' + s.phone : ''}</div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.active ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}