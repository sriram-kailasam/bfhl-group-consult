export type Doctor = {
  name: string;
  hprId: string;
  gender?: string;
  fees: number;
  speciality: string;
  languages: string[];
  experience: number;
}