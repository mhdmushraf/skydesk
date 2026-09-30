import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getRole, isStaff, roleLabel } from '@/lib/roles';
import { base44 } from '@/api/base44Client';
import { getSchoolData } from '@/functions/getSchoolData';
import { manageUsers } from '@/functions/manageUsers';
import { Link } from 'react-router-dom';
import { Building2, Users, GraduationCap, FileCheck2, BookOpen, ClipboardList, Award } from 'lucide-react';

function Stat({ icon: Icon, label, value, to }) {
  const inner = (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-sm transition">
      <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-sky-600" />
      </div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = getRole(user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (role === 'super_admin') {
          const schools = await base44.entities.School.list();
          const res = await manageUsers({ op: 'list' });
          setStats({ schools: schools.length, users: res.users.length });
        } else if (isStaff(user)) {
          const d = await getSchoolData();
          setStats({ students: d.students.length, instructors: d.instructors.length, attempts: d.attempts.length, certificates: d.certificates.length, questions: d.questions.length });
        } else {
          const attempts = await base44.entities.ExamAttempt.list('-completed_date', 50);
          const certs = await base44.entities.Certificate.list('-issue_date', 50);
          const subjects = await base44.entities.Subject.list();
          setStats({ attempts: attempts.length, certs: certs.length, subjects: subjects.length, passed: attempts.filter((a) => a.passed).length });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back{user?.full_name ? ', ' + user.full_name.split(' ')[0] : ''}</h1>
        <p className="text-slate-500 text-sm mt-1">You're signed in as {roleLabel[role]}.</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {role === 'super_admin' && (
            <>
              <Stat icon={Building2} label="Schools" value={stats?.schools ?? 0} to="/admin/schools" />
              <Stat icon={Users} label="Total users" value={stats?.users ?? 0} to="/admin/users" />
            </>
          )}
          {isStaff(user) && (
            <>
              <Stat icon={GraduationCap} label="Students" value={stats?.students ?? 0} to="/school/students" />
              <Stat icon={Users} label="Instructors" value={stats?.instructors ?? 0} to="/school/instructors" />
              <Stat icon={BookOpen} label="Questions" value={stats?.questions ?? 0} to="/school/questions" />
              <Stat icon={ClipboardList} label="Exam attempts" value={stats?.attempts ?? 0} />
              <Stat icon={FileCheck2} label="Certificates" value={stats?.certificates ?? 0} to="/certificates" />
            </>
          )}
          {role === 'student' && (
            <>
              <Stat icon={ClipboardList} label="Subjects" value={stats?.subjects ?? 0} to="/exams" />
              <Stat icon={Award} label="Exams passed" value={stats?.passed ?? 0} />
              <Stat icon={FileCheck2} label="Certificates" value={stats?.certs ?? 0} to="/certificates" />
              <Stat icon={ClipboardList} label="Attempts" value={stats?.attempts ?? 0} />
            </>
          )}
        </div>
      )}

      {role === 'student' && (
        <div className="mt-8">
          <Link to="/exams" className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700">
            <ClipboardList className="w-4 h-4" /> Take a mock exam
          </Link>
        </div>
      )}
    </div>
  );
}