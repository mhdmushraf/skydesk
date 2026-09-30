import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, ShieldCheck, FileCheck2, GraduationCap, BookOpen, Mail, ArrowRight, Check } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Skydesk</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#subjects" className="hover:text-slate-900">Subjects</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">Sign in</Link>
            <Link to="/login" className="px-4 py-2 text-sm font-medium bg-sky-600 text-white rounded-lg hover:bg-sky-700">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> Built for SACAA CPL & PPL theory exams
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-tight">
          Run your flight school's<br />theory exams, end to end.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed">
          Skydesk lets your students sit mock SACAA theory exams per subject. When they pass, a certificate and a completed CA 61-184 form are generated, signed by their instructor, and emailed automatically.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700">
            Sign in to Skydesk <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#features" className="px-5 py-3 text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50">See how it works</a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Everything a flight school needs</h2>
          <p className="mt-3 text-slate-500">One platform for students, instructors, and school administrators.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, title: 'Student mock exams', desc: 'Students log in and take timed mock theory exams per SACAA subject, with instant grading and pass/fail results.' },
            { icon: FileCheck2, title: 'Auto-generated certificates', desc: 'On a pass, a branded certificate and a filled CA 61-184 (Proof of Theoretical Knowledge Instruction) are produced with the instructor\u2019s digital signature.' },
            { icon: Mail, title: 'Emailed automatically', desc: 'Both PDFs are emailed to the student the moment they pass \u2014 no paperwork, no delay.' },
            { icon: BookOpen, title: 'Per-school question banks', desc: 'Each school manages its own question bank per subject. Instructors add and edit questions; students only see their school\u2019s exams.' },
            { icon: ShieldCheck, title: 'Digital instructor signatures', desc: 'Instructors upload their signature once. It is applied to every certificate and CA 61-184 they authorize.' },
            { icon: Plane, title: 'Multi-school ready', desc: 'Skydesk is sold to many flight schools. A platform super-admin onboards each school, which then runs itself.' }
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">How it works</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: '01', t: 'Onboard', d: 'A platform admin invites your school and creates a School Admin.' },
            { n: '02', t: 'Set up', d: 'Add instructors (with signatures) and students, and build your question bank per subject.' },
            { n: '03', t: 'Examine', d: 'Students take mock theory exams; Skydesk grades instantly.' },
            { n: '04', t: 'Certify', d: 'On a pass, a certificate and CA 61-184 are generated, signed, and emailed.' }
          ].map((s) => (
            <div key={s.n} className="p-6 rounded-2xl bg-slate-50">
              <div className="text-xs font-semibold text-sky-600 mb-2">{s.n}</div>
              <h3 className="font-semibold text-slate-900">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">SACAA subjects, ready to go</h2>
          <p className="mt-3 text-slate-500">Skydesk ships with the standard CPL/PPL theory subjects. Each school adds its own questions.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {['Air Law', 'Aviation Meteorology', 'Human Performance', 'Aircraft Technical', 'Navigation', 'Flight Planning', 'Principles of Flight', 'Instruments', 'Radio Telephony'].map((s) => (
            <div key={s} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700">
              <Check className="w-4 h-4 text-sky-600" /> {s}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center border-t border-slate-100">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Ready to modernize your theory exams?</h2>
        <p className="mt-3 text-slate-500">Sign in to manage your flight school on Skydesk.</p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700">
          Sign in to Skydesk <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-600 flex items-center justify-center">
              <Plane className="w-3 h-3 text-white" />
            </div>
            <span>Skydesk</span>
          </div>
          <span>For flight schools & their students.</span>
        </div>
      </footer>
    </div>
  );
}