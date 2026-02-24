export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  specialite?: string;
  experience?: number;
  createDate?: string;
}