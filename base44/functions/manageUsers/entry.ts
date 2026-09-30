import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const USER_FIELDS = ['app_role', 'school_id', 'instructor_id', 'phone', 'id_number', 'date_of_birth', 'address', 'license_number', 'license_level', 'caa_ref', 'instructor_number'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const myRole = user.app_role;
    const isSuper = user.role === 'admin' || myRole === 'super_admin';
    const isSchoolAdmin = myRole === 'school_admin';
    if (!isSuper && !isSchoolAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const op = body.op;
    const sr = base44.asServiceRole;
    const school_id = user.school_id;

    if (op === 'list') {
      const users = isSuper ? await sr.entities.User.list() : await sr.entities.User.filter({ school_id });
      return Response.json({ users });
    }
    if (op === 'invite') {
      if (!body.email) return Response.json({ error: 'Email required' }, { status: 400 });
      await base44.users.inviteUser(body.email, 'user');
      try {
        const found = await sr.entities.User.filter({ email: body.email });
        const u = found && found[0];
        if (u) {
          const fields = {};
          if (body.fields && body.fields.app_role !== undefined) fields.app_role = body.fields.app_role;
          if (body.fields && body.fields.school_id !== undefined) fields.school_id = body.fields.school_id;
          if (!isSuper && fields.school_id !== undefined && fields.school_id !== school_id) delete fields.school_id;
          if (Object.keys(fields).length) await sr.entities.User.update(u.id, fields);
        }
      } catch (e) {}
      return Response.json({ ok: true });
    }
    if (op === 'update') {
      const target = await sr.entities.User.get(body.id);
      if (!isSuper && target.school_id !== school_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const allowed = {};
      for (const k of USER_FIELDS) {
        if (body.fields && body.fields[k] !== undefined) allowed[k] = body.fields[k];
      }
      if (!isSuper && allowed.school_id !== undefined && allowed.school_id !== school_id) delete allowed.school_id;
      await sr.entities.User.update(body.id, allowed);
      return Response.json({ ok: true });
    }
    return Response.json({ error: 'Unknown op' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}