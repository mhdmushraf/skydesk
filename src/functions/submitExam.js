import { base44 } from '@/api/base44Client';

export async function submitExam(payload) {
  const res = await base44.functions.invoke('submitExam', payload);
  return res.data;
}