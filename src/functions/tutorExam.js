import { base44 } from '@/api/base44Client';

export async function tutorExam(payload) {
  const res = await base44.functions.invoke('tutorExam', payload);
  return res.data;
}