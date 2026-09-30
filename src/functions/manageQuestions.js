import { base44 } from '@/api/base44Client';

export async function manageQuestions(payload) {
  const res = await base44.functions.invoke('manageQuestions', payload);
  return res.data;
}