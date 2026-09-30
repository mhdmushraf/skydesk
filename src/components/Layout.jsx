import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getRole, isSuper, isStaff, roleLabel } from '@/lib/roles';
import { base44 } from '@/api/base44Client';
import { Plane, LayoutDashboard, Building2, Users, GraduationCap, BookOpen, FileCheck2, ClipboardList, UserCircle, LogOut, Menu, X } from 'lucide-react';

function navFor(role) {
  const base = [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
  if (role === 'super_admin') {
    return [...base, { to: '/admin/schools', label: 'Schools', icon: Building2 }, { to: '/admin/users', label: 'Users', icon: Users }];
  }
  if (role === 'school_admin') {
    return [...base, { to: '/school/students', label: 'Students', icon: GraduationCap }, { to: '/school/instructors', label: 'Instructors', icon: Users }, { to: '/school/questions', label: 'Question Banks', icon: BookOpen }, { to: '/certificates', label: 'Certificates', icon: FileCheck2 }];
  }
  if (role === 'instructor') {
    return [...base, { to: '/school/students', label: 'Students', icon: GraduationCap }, { to: '/school/questions', label: 'Question Banks', icon: BookOpen }, { to: '/certificates', label: 'Certificates', icon: FileCheck2 }, { to: '/profile', label: 'My Profile', icon: UserCircle }];
  }
  return [...base, { to: '/exams', label: 'Exams', icon: ClipboardList }, { to: '/certificates', label: 'Certificates', icon: FileCheck2 }, { to: '/profile', label: 'My Profile', icon: UserCircle }];
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = getRole(user);
  const items = navFor(role);

  const handleLogout = async () => {
    await logout(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 tracking-tight">Skydesk</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-slate-400">Signed in as</div>
            <div className="text-sm font-medium text-slate-700 truncate">{user?.full_name || user?.email}</div>
            <div className="text-xs text-sky-600 mt-0.5">{roleLabel[role]}</div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <Link to="/dashboard" className="text-sm text-slate-400 hidden lg:block">Flight school theory exams, end to end</Link>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">{roleLabel[role]}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}