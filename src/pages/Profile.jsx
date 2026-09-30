import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getRole } from '@/lib/roles';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Save, Upload, PenTool, Loader2, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, checkUserAuth } = useAuth();
  const role = getRole(user);
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        id_number: user.id_number || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        license_number: user.license_number || '',
        license_level: user.license_level || '',
        caa_ref: user.caa_ref || '',
        instructor_number: user.instructor_number || '',
      });
    }
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      await checkUserAuth();
      toast({ title: 'Profile saved' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const onSignature = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: f });
      await base44.auth.updateMe({ signature_url: file_uri });
      await checkUserAuth();
      toast({ title: 'Signature uploaded' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const fields = [
    { k: 'phone', l: 'Phone' },
    { k: 'id_number', l: 'ID / Passport number' },
    { k: 'date_of_birth', l: 'Date of birth', type: 'date' },
    { k: 'license_number', l: 'License number' },
    { k: 'caa_ref', l: 'CAA reference' },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">My profile</h1>
      <p className="text-slate-500 text-sm mb-6">{role === 'instructor' ? 'Your instructor details and signature.' : 'These details appear on your certificate and CA 61-184 form.'}</p>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
          <h2 className="font-semibold text-slate-900">Personal details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500">Full name</label>
              <input value={user?.full_name || ''} disabled className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50" />
            </div>
            {fields.map((f) => (
              <div key={f.k}>
                <label className="text-xs font-medium text-slate-500">{f.l}</label>
                <input type={f.type || 'text'} value={form[f.k] || ''} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-slate-500">License level</label>
              <select value={form.license_level || ''} onChange={(e) => setForm({ ...form, license_level: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                <option value="">—</option>
                <option value="PPL">PPL</option>
                <option value="CPL">CPL</option>
                <option value="ATPL">ATPL</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500">Address</label>
              <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save details
          </button>
        </div>

        {role === 'instructor' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><PenTool className="w-4 h-4 text-sky-600" /> Instructor signature</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Instructor number</label>
                <input value={form.instructor_number || ''} onChange={(e) => setForm({ ...form, instructor_number: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
            <div>
              {user?.signature_url ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2"><CheckCircle2 className="w-4 h-4" /> Signature on file</div>
              ) : (
                <p className="text-sm text-slate-500 mb-2">Upload a transparent PNG of your signature. It will be applied to certificates and CA 61-184 forms.</p>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {user?.signature_url ? 'Replace signature' : 'Upload signature'}
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onSignature} disabled={uploading} />
              </label>
            </div>
            <p className="text-xs text-slate-400">Signatures are stored privately — no public URL, so access follows your app's permissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}