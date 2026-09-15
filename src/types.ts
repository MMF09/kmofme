export interface KmLog {
  id?: string;
  date: string; // YYYY-MM-DD
  km: number;
  note?: string | null;
  createdAt: number;
  userId: string;
}
