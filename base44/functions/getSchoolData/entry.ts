import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const myRole = user.app_role;
    const isSuper = user.role === 'admin' || myRole === 'super_admin';
    const isStaff = myRole === 'school_admin' || myRole === 'instructor';
    if (!isSuper && !isStaff) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(req.url);
    let school_id;
    if (isSuper && url.searchParams.get('school_id')) school_id = url.searchParams.get('school_id');
    else school_id = user.school_id;

    const sr = base44.asServiceRole;
    const [users, attempts, certificates, questions] = await Promise.all([
      sr.entities.User.filter({ school_id }),
      sr.entities.ExamAttempt.filter({ school_id }),
      sr.entities.Certificate.filter({ school_id }),
      sr.entities.Question.filter({ school_id })
    ]);
    const students = users.filter((u) => u.app_role === 'student');
    const instructors = users.filter((u) => u.app_role === 'instructor');
    return Response.json({ school_id, students, instructors, attempts, certificates, questions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}