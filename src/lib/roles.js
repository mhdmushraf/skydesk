export const ROLES = { SUPER: 'super_admin', SCHOOL: 'school_admin', INSTRUCTOR: 'instructor', STUDENT: 'student' };

export const roleLabel = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  instructor: 'Instructor',
  student: 'Student'
};

export function getRole(user) {
  if (!user) return null;
  if (user.app_role) return user.app_role;
  return user.role === 'admin' ? 'super_admin' : 'student';
}

export function isSuper(user) {
  return user?.role === 'admin' || getRole(user) === 'super_admin';
}

export function isStaff(user) {
  const r = getRole(user);
  return r === 'school_admin' || r === 'instructor';
}