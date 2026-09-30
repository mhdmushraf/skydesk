import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { buildCertificatePdf, buildFormPdf, fetchImageAsDataURL } from "../../shared/pdfs.ts";

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

    let correct = 0;
    const detailed = questions.map((q) => {
      const a = answers.find((x) => x.questionId === q.id);
      const sel = a ? a.selectedIndex : -1;
      const ok = sel === q.correct_index;
      if (ok) correct++;
      return { questionId: q.id, selectedIndex: sel, correct: ok };
    });
    const total = questions.length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    const passMark = subject.pass_mark ?? 75;
    const passed = score >= passMark;

    const attempt = await base44.entities.ExamAttempt.create({
      school_id: user.school_id,
      student_id: user.id,
      subject_id: subjectId,
      score,
      total,
      passed,
      answers: detailed,
      completed_date: new Date().toISOString()
    });

    let certificate = null;
    if (passed) {
      const sr = base44.asServiceRole;
      let instructor = null;
      if (user.instructor_id) {
        try { instructor = await sr.entities.User.get(user.instructor_id); } catch (e) {}
      }
      if (!instructor || !instructor.signature_url) {
        const insts = await sr.entities.User.filter({ school_id: user.school_id, app_role: 'instructor' });
        instructor = insts.find((i) => i.signature_url) || insts[0] || null;
      }
      let school = null;
      try { school = user.school_id ? await sr.entities.School.get(user.school_id) : null; } catch (e) {}

      let sigDataUrl = null;
      if (instructor && instructor.signature_url) {
        try {
          let sigUrl = instructor.signature_url;
          if (!/^https?:\/\//i.test(sigUrl)) {
            const signed = await sr.integrations.Core.CreateFileSignedUrl({ file_uri: sigUrl });
            sigUrl = signed.signed_url;
          }
          sigDataUrl = await fetchImageAsDataURL(sigUrl);
        } catch (e) {}
      }

      const certNumber = "SKY-" + (subject.code || "SUB") + "-" + Date.now().toString(36).toUpperCase();
      const certBlob = buildCertificatePdf({ student: user, school, subject, score, instructor, sigDataUrl, certNumber });
      const formBlob = buildFormPdf({ student: user, school, subject, score, instructor, sigDataUrl });

      const certUp = await sr.integrations.Core.UploadPrivateFile({ file: new File([certBlob], "certificate.pdf", { type: "application/pdf" }) });
      const formUp = await sr.integrations.Core.UploadPrivateFile({ file: new File([formBlob], "CA-61-184.pdf", { type: "application/pdf" }) });

      certificate = await base44.entities.Certificate.create({
        school_id: user.school_id,
        student_id: user.id,
        subject_id: subjectId,
        attempt_id: attempt.id,
        instructor_id: instructor ? instructor.id : '',
        certificate_number: certNumber,
        issue_date: new Date().toISOString().slice(0, 10),
        score,
        certificate_file_uri: certUp.file_uri,
        form_file_uri: formUp.file_uri
      });

      waitUntilSafe(sr.integrations.Core.SendEmail({
        to: user.email,
        subject: "Skydesk — Certificate & CA 61-184 for " + subject.name,
        body: "Hi " + (user.full_name || '') + ",\n\nCongratulations on passing the " + subject.name + " exam with a score of " + score + "%. Your certificate and completed SACAA CA 61-184 form are attached.\n\nCertificate number: " + certNumber + "\n\n— Skydesk",
        attachments: [
          { filename: "certificate.pdf", file_url: certUp.file_uri },
          { filename: "CA-61-184.pdf", file_url: formUp.file_uri }
        ]
      }));
    }

    return Response.json({ passed, score, total, attemptId: attempt.id, certificateId: certificate ? certificate.id : null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function waitUntilSafe(p) {
  try {
    const { waitUntil } = require("base44:runtime");
    waitUntil(p);
  } catch (e) {
    p.catch(() => {});
  }
}