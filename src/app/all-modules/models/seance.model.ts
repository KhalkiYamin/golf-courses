export interface Seance {
    id?: number;
    theme: string;
    description: string;
    dateSeance: string;
    heureSeance: string;
    lieu: string;
    nombreAthletes: number;
    statut: string;
    duree: string;
    objectif: string;
    coachId: number;
    coachNom?: string;
}