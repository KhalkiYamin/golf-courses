import { Injectable } from '@angular/core';
import { CoachAthleteResponse, EvaluationResponse } from './coach-dashboard.service';

export interface ManagedEvaluation {
    athleteId: number;
    athleteName: string;
    sport: string;
    niveau: string;
    technique: number;
    physique: number;
    mental: number;
    discipline: number;
    feedback: string;
    updatedAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class EvaluationBridgeService {
    private readonly storageKey = 'coach-managed-evaluations-v1';

    buildEvaluations(
        athletes: CoachAthleteResponse[],
        apiEvaluations: EvaluationResponse[]
    ): ManagedEvaluation[] {
        const storedMap = this.readStoredMap();
        const apiMap = new Map<number, EvaluationResponse>();

        (apiEvaluations || []).forEach((evaluation: EvaluationResponse) => {
            apiMap.set(Number(evaluation.athleteId), evaluation);
        });

        return (athletes || []).map((athlete: CoachAthleteResponse) => {
            const athleteId = Number(athlete.id || 0);
            const stored = storedMap[athleteId];
            const api = apiMap.get(athleteId);

            const technique = this.resolveScore(stored?.technique, api?.technique, 6);
            const physique = this.resolveScore(stored?.physique, api?.physique, 6);
            const mental = this.resolveScore(stored?.mental, api?.mental, 6);
            const discipline = this.resolveScore(stored?.discipline, undefined, 6);

            return {
                athleteId,
                athleteName: athlete.nomComplet || 'Athlete',
                sport: athlete.sport || '-',
                niveau: athlete.niveau || '-',
                technique,
                physique,
                mental,
                discipline,
                feedback: stored?.feedback || this.defaultFeedback(athlete, technique, physique, mental, discipline),
                updatedAt: stored?.updatedAt || this.formatDate(new Date())
            };
        });
    }

    saveAll(evaluations: ManagedEvaluation[]): void {
        const payload = evaluations.reduce((acc: { [key: number]: ManagedEvaluation }, evaluation: ManagedEvaluation) => {
            acc[evaluation.athleteId] = evaluation;
            return acc;
        }, {});

        localStorage.setItem(this.storageKey, JSON.stringify(payload));
    }

    getAthleteEvaluation(athleteId: number): ManagedEvaluation | null {
        if (!athleteId) {
            return null;
        }

        const map = this.readStoredMap();
        return map[athleteId] || null;
    }

    resolveCurrentAthleteId(): number {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                const raw = user?.athleteId ?? user?.id_utilisateur ?? user?.id;
                const parsed = Number(raw);
                if (Number.isFinite(parsed) && parsed > 0) {
                    return parsed;
                }
            } catch {
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            return 0;
        }

        try {
            const payloadPart = token.split('.')[1];
            if (!payloadPart) {
                return 0;
            }

            const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
            const payload = JSON.parse(atob(padded));
            const raw = payload?.athleteId ?? payload?.id_utilisateur ?? payload?.id ?? payload?.sub;
            const parsed = Number(raw);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
        } catch {
            return 0;
        }
    }

    overall(evaluation: ManagedEvaluation): number {
        const total = evaluation.technique + evaluation.physique + evaluation.mental + evaluation.discipline;
        return Number((total / 4).toFixed(1));
    }

    scoreToPercent(score: number): number {
        const value = Number(score || 0);
        return Math.max(0, Math.min(100, value * 10));
    }

    clampScore(score: number): number {
        return Math.max(1, Math.min(10, Number(score || 0)));
    }

    refreshUpdatedAt(evaluation: ManagedEvaluation): ManagedEvaluation {
        return {
            ...evaluation,
            updatedAt: this.formatDate(new Date())
        };
    }

    private resolveScore(stored?: number, api?: number, fallback?: number): number {
        if (typeof stored === 'number') {
            return this.clampScore(stored);
        }

        if (typeof api === 'number') {
            return this.clampScore(api);
        }

        return this.clampScore(fallback || 6);
    }

    private readStoredMap(): { [key: number]: ManagedEvaluation } {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }

    private defaultFeedback(
        athlete: CoachAthleteResponse,
        technique: number,
        physique: number,
        mental: number,
        discipline: number
    ): string {
        const overall = (technique + physique + mental + discipline) / 4;
        const name = athlete.nomComplet || 'Cet athlete';

        if (overall >= 8) {
            return `${name} montre un tres bon niveau global. Continuer avec des objectifs de precision et de regularite.`;
        }

        if (overall >= 6) {
            return `${name} progresse bien. Travailler surtout la constance mentale et la qualite d execution sous fatigue.`;
        }

        return `${name} a besoin d un accompagnement renforce sur les fondamentaux et la discipline d entrainement.`;
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
}
