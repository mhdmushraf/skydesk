import { jsPDF } from "npm:jspdf@4.0.0";

export async function fetchImageAsDataURL(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return "data:image/png;base64," + btoa(bin);
}

export function buildCertificatePdf({ student, school, subject, score, instructor, sigDataUrl, certNumber }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const schoolName = (school && school.name) || "Flight School";

  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(3);
  doc.rect(24, 24, W - 48, H - 48);
  doc.setLineWidth(0.5);
  doc.setDrawColor(180, 160, 110);
  doc.rect(34, 34, W - 68, H - 68);

  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(schoolName.toUpperCase(), W / 2, 90, { align: "center" });
  doc.setFontSize(24);
  doc.text("Certificate of Theoretical Knowledge", W / 2, 138, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(90);
  doc.setFontSize(11);
  doc.text("This is to certify that", W / 2, 182, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(20);
  doc.text(student.full_name || student.email, W / 2, 215, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text("has successfully passed the", W / 2, 245, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 58, 95);
  doc.text(subject.name, W / 2, 272, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text("Score: " + score + "%    |    Pass mark: " + (subject.pass_mark ?? 75) + "%", W / 2, 300, { align: "center" });
  doc.text("Date: " + new Date().toLocaleDateString(), W / 2, 320, { align: "center" });

  let sigY = 410;
  if (sigDataUrl) {
    try {
      doc.addImage(sigDataUrl, "PNG", W / 2 - 80, sigY - 50, 160, 50);
    } catch (e) {}
  }
  doc.setDrawColor(120);
  doc.line(W / 2 - 110, sigY, W / 2 + 110, sigY);
  doc.setFontSize(10);
  doc.text(instructor?.full_name || "Authorized Instructor", W / 2, sigY + 14, { align: "center" });
  doc.text("Instructor No: " + (instructor?.instructor_number || "—"), W / 2, sigY + 28, { align: "center" });
  doc.text("Authorized Instructor", W / 2, sigY + 44, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Certificate No: " + certNumber, W / 2, H - 56, { align: "center" });
  doc.text("Issued by Skydesk", W / 2, H - 40, { align: "center" });

  return doc.output("blob");
}

export function buildFormPdf({ student, school, subject, score, instructor, sigDataUrl }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("SACAA CA 61-184", W / 2, 56, { align: "center" });
  doc.setFontSize(11);
  doc.text("Proof of Theoretical Knowledge Instruction", W / 2, 76, { align: "center" });
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(1);
  doc.line(40, 90, W - 40, 90);

  const d = student || {};
  const rows = [
    ["School", (school && school.name) || "—"],
    ["Student Name", student.full_name || "—"],
    ["ID / Passport Number", d.id_number || "—"],
    ["Date of Birth", d.date_of_birth || "—"],
    ["Address", d.address || "—"],
    ["License Number", d.license_number || "—"],
    ["License Level", d.license_level || "—"],
    ["CAA Reference", d.caa_ref || "—"],
    ["Subject", subject.name],
    ["Subject Code", subject.code || "—"],
    ["Score", score + "%"],
    ["Pass Mark", (subject.pass_mark ?? 75) + "%"],
    ["Date Completed", new Date().toLocaleDateString()]
  ];

  let y = 124;
  doc.setFontSize(11);
  for (const [k, v] of rows) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(k + ":", 50, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v), 230, y);
    doc.setDrawColor(225);
    doc.line(45, y + 6, W - 45, y + 6);
    y += 22;
  }

  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 95);
  doc.text("Instructor Declaration", 50, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30);
  doc.text("Instructor: " + (instructor?.full_name || "—") + "    Instructor No: " + (instructor?.instructor_number || "—"), 50, y);
  y += 26;
  if (sigDataUrl) {
    try {
      doc.addImage(sigDataUrl, "PNG", 50, y, 140, 45);
    } catch (e) {}
  }
  doc.setDrawColor(120);
  doc.line(50, y + 50, 190, y + 50);
  doc.setFontSize(9);
  doc.text("Instructor Signature", 50, y + 62);

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Issued via Skydesk on " + new Date().toLocaleDateString(), 50, H - 50);

  return doc.output("blob");
}