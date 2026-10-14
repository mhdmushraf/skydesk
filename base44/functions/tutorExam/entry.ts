import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { subjectId, answers } = body || {};
    if (!subjectId || !Array.isArray(answers)) return Response.json({ error: 'Invalid payload' }, { status: 400 });

    const subject = await base44.entities.Subject.get(subjectId);
    const questions = await base44.entities.Question.filter({ subject_id: subjectId, school_id: user.school_id });

    const wrong = questions
      .map((q) => {
        const a = answers.find((x) => x.questionId === q.id);
        const sel = a ? a.selectedIndex : -1;
        return { q, sel };
      })
      .filter((x) => x.sel !== x.q.correct_index);

    if (!wrong.length) return Response.json({ items: [] });

    const block = wrong.map((x, i) => {
      const opts = x.q.options.map((o, idx) => `  ${String.fromCharCode(65 + idx)}. ${o}`).join('\n');
      const correctLetter = String.fromCharCode(65 + x.q.correct_index);
      const selLetter = x.sel >= 0 ? String.fromCharCode(65 + x.sel) : '(no answer)';
      return `QUESTION_${i} (id=${x.q.id}):\n${x.q.question_text}\nOptions:\n${opts}\nStudent chose: ${selLetter}\nCorrect answer: ${correctLetter}`;
    }).join('\n\n');

    const prompt =
      'You are a friendly, expert aviation theory tutor for SACAA pilot exams (subject: ' + (subject.name || 'Aviation') + '). ' +
      'A student just finished a mock exam and got the following questions wrong. ' +
      'For EACH question, write a clear, encouraging explanation (2-4 sentences) that: ' +
      '(1) states why the correct answer is right, (2) clarifies the misconception behind the student\'s choice, ' +
      '(3) gives a short memory tip. Use plain language a student pilot can follow. ' +
      'Return ONLY the JSON object matching the schema, with one entry per question id.\n\n' + block;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                explanation: { type: 'string' }
              },
              required: ['questionId', 'explanation']
            }
          }
        },
        required: ['items']
      }
    });

    const items = (llm && Array.isArray(llm.items)) ? llm.items : [];
    const byId = {};
    for (const it of items) {
      if (it && it.questionId) byId[it.questionId] = it.explanation;
    }

    const result = wrong.map((x) => ({
      questionId: x.q.id,
      questionText: x.q.question_text,
      options: x.q.options,
      selectedIndex: x.sel,
      correctIndex: x.q.correct_index,
      explanation: byId[x.q.id] || 'No explanation generated.'
    }));

    return Response.json({ items: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}