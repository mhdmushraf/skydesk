import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const role = user.app_role;
    const isStaff = role === 'school_admin' || role === 'instructor';
    const isSuper = user.role === 'admin' || role === 'super_admin';
    if (!isStaff && !isSuper) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const op = body.op;
    const sr = base44.asServiceRole;
    const school_id = user.school_id;

    if (op === 'create') {
      const q = await sr.entities.Question.create({
        school_id: isSuper ? (body.school_id || school_id) : school_id,
        subject_id: body.subject_id,
        question_text: body.question_text,
        options: body.options,
        correct_index: body.correct_index,
        explanation: body.explanation || ''
      });
      return Response.json({ question: q });
    }
    if (op === 'update') {
      const existing = await sr.entities.Question.get(body.id);
      if (!isSuper && existing.school_id !== school_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const q = await sr.entities.Question.update(body.id, {
        question_text: body.question_text,
        options: body.options,
        correct_index: body.correct_index,
        explanation: body.explanation || ''
      });
      return Response.json({ question: q });
    }
    if (op === 'delete') {
      const existing = await sr.entities.Question.get(body.id);
      if (!isSuper && existing.school_id !== school_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
      await sr.entities.Question.delete(body.id);
      return Response.json({ ok: true });
    }
    return Response.json({ error: 'Unknown op' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}