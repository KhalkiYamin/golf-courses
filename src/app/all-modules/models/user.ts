import { Category } from "./category";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  specialite?: Category;
  experience?: number;
  createDate?: string;
  enabled?: boolean;
  adminApproved?: boolean;
}