import { base44 } from '@/api/base44Client';

export async function manageUsers(payload) {
  const res = await base44.functions.invoke('manageUsers', payload);
  return res.data;
}