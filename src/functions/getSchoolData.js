import { base44 } from '@/api/base44Client';

export async function getSchoolData(params = {}) {
  const res = await base44.functions.invoke('getSchoolData', params);
  return res.data;
}