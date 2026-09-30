import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { manageUsers } from '@/functions/manageUsers';
import { useToast } from '@/components/ui/use-toast';
import { roleLabel } from '@/lib/roles';
import { UserPlus, X } from 'lucide-react';

const APP_ROLES = ['school_admin', 'instructor', 'student'];

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('school_admin');
  const [inviteSchool, setInviteSchool] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [res, s] = await Promise.all([manageUsers({ op: 'list' }), base44.entities.School.list()]);
      setUsers(res.users);
      setSchools(s);
      if (s.length && !inviteSchool) setInviteSchool(s[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const schoolName = (id) => schools.find((s) => s.id === id)?.name || '—';

  const doInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSaving(true);
    try {
      await manageUsers({ op: 'invite', email: inviteEmail, fields: { app_role: inviteRole, school_id: inviteSchool } });
      toast({ title: 'Invitation sent' });
      setInviteEmail('');
      load();
    } catch (err) {
      toast({ title: 'Invite failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await manageUsers({ op: 'update', id: edit.id, fields: edit.fields });
      toast({ title: 'User updated' });
      setEdit(null);
      load();
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Users</h1>
      <p className="text-slate-500 text-sm mb-6">Invite school admins, instructors, and students. Assign roles and schools.</p>

      <form onSubmit={doInvite} className="mb-6 p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 font-medium text-slate-800 mr-2"><UserPlus className="w-4 h-4" /> Invite</div>
        <div className="flex-1 min-w-[200px]">
          <input type="email" placeholder="Email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
          {APP_ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
        </select>
        <select value={inviteSchool} onChange={(e) => setInviteSchool(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white max-w-[180px]">
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50">Send invite</button>
      </form>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-400">Loading…</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">School</th>
                <th className="text-right px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800">{u.full_name || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-medium">{roleLabel[u.app_role] || u.app_role || '—'}</span></td>
                  <td className="px-5 py-3 text-slate-600">{schoolName(u.school_id)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setEdit({ id: u.id, fields: { app_role: u.app_role || 'student', school_id: u.school_id || '' } })} className="text-sky-600 font-medium hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {edit && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4" onClick={() => setEdit(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Edit user</h3><button onClick={() => setEdit(null)}><X className="w-4 h-4 text-slate-400" /></button></div>
            <div>
              <label className="text-xs font-medium text-slate-500">Role</label>
              <select value={edit.fields.app_role} onChange={(e) => setEdit({ ...edit, fields: { ...edit.fields, app_role: e.target.value } })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                {APP_ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">School</label>
              <select value={edit.fields.school_id} onChange={(e) => setEdit({ ...edit, fields: { ...edit.fields, school_id: e.target.value } })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                <option value="">— None —</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button disabled={saving} onClick={saveEdit} className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}