import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { isStaff, getRole } from '@/lib/roles';
import { base44 } from '@/api/base44Client';
import { getSchoolData } from '@/functions/getSchoolData';
import { useToast } from '@/components/ui/use-toast';
import { FileCheck2, Download, FileText } from 'lucide-react';

export default function Certificates() {
  const { user } = useAuth();
  const role = getRole(user);
  const { toast } = useToast();
  const [certs, setCerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const subs = await base44.entities.Subject.list();
        const map = {};
        subs.forEach((s) => { map[s.id] = s; });
        setSubjects(map);
        if (isStaff(user)) {
          const d = await getSchoolData();
          setCerts(d.certificates);
          setStudents(d.students);
        } else {
          const c = await base44.entities.Certificate.filter({ student_id: user.id });
          setCerts(c);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const studentName = (sid) => students.find((s) => s.id === sid)?.full_name || '—';

  const download = async (uri, name) => {
    if (!uri) return;
    setBusy(name);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      window.open(signed_url, '_blank');
    } catch (err) {
      toast({ title: 'Could not open file', description: err.message, variant: 'destructive' });
    } finally { setBusy(null); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Certificates</h1>
      <p className="text-slate-500 text-sm mb-6">{isStaff(user) ? 'All certificates issued by your school.' : 'Your issued certificates and CA 61-184 forms.'}</p>

      {loading ? <div className="p-10 text-center text-slate-400">Loading…</div> : certs.length === 0 ? (
        <div className="p-10 text-center text-slate-400 rounded-2xl border border-dashed border-slate-200">
          <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No certificates yet.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                {isStaff(user) && <th className="text-left px-5 py-3 font-medium">Student</th>}
                <th className="text-left px-5 py-3 font-medium">Subject</th>
                <th className="text-left px-5 py-3 font-medium">Cert No.</th>
                <th className="text-left px-5 py-3 font-medium">Score</th>
                <th className="text-left px-5 py-3 font-medium">Issued</th>
                <th className="text-right px-5 py-3 font-medium">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  {isStaff(user) && <td className="px-5 py-3 text-slate-800">{studentName(c.student_id)}</td>}
                  <td className="px-5 py-3 text-slate-700">{subjects[c.subject_id]?.name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{c.certificate_number}</td>
                  <td className="px-5 py-3 text-slate-700">{c.score}%</td>
                  <td className="px-5 py-3 text-slate-500">{c.issue_date ? new Date(c.issue_date).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button disabled={busy === c.id + 'c'} onClick={() => download(c.certificate_file_uri, c.id + 'c')} className="inline-flex items-center gap-1.5 text-sky-600 font-medium hover:underline disabled:opacity-50">
                        <FileCheck2 className="w-4 h-4" /> Certificate
                      </button>
                      <button disabled={busy === c.id + 'f'} onClick={() => download(c.form_file_uri, c.id + 'f')} className="inline-flex items-center gap-1.5 text-slate-600 font-medium hover:underline disabled:opacity-50">
                        <FileText className="w-4 h-4" /> CA 61-184
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}