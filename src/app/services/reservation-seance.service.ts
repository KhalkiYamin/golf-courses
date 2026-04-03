import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ReservationSeanceDto {
    id: number | null;
    seanceId: number;
    theme: string;
    dateSeance: string;
    heureSeance: string;
    lieu: string;

    athleteId: number;
    athleteNomComplet: string;
    athleteEmail: string;

    coachId?: number;
    coachNomComplet?: string;
    coachNom?: string;
    coachName?: string;

    statut: string;
    dateReservation: string | null;

    nombreAthletesCoachEtSeance?: number;
    complet?: boolean;

    seanceStatut?: string;
    annuleeMoinsDe24h?: boolean;
    messageAnnulation?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReservationSeanceService {
    private apiUrl = 'http://localhost:8081/api/reservations';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getSeancesDisponiblesPourAthlete(): Observable<ReservationSeanceDto[]> {
        return this.http.get<any>(
            `${this.apiUrl}/athlete/disponibles`,
            { headers: this.getHeaders() }
        ).pipe(
            map((response) => this.normalizeCollection(response, 'NON_RESERVEE'))
        );
    }

    reserverSeance(seanceId: number, coachId: number): Observable<ReservationSeanceDto> {
        return this.http.post<ReservationSeanceDto>(
            `${this.apiUrl}/seance/${seanceId}?coachId=${coachId}`,
            {},
            { headers: this.getHeaders() }
        );
    }

    getMesReservations(): Observable<ReservationSeanceDto[]> {
        return this.http.get<any>(
            `${this.apiUrl}/athlete/me`,
            { headers: this.getHeaders() }
        ).pipe(
            map((response) => this.normalizeCollection(response, 'EN_ATTENTE'))
        );
    }

    getReservationsBySeance(seanceId: number): Observable<ReservationSeanceDto[]> {
        return this.http.get<any>(
            `${this.apiUrl}/seance/${seanceId}`,
            { headers: this.getHeaders() }
        ).pipe(
            map((response) => this.normalizeCollection(response, 'EN_ATTENTE'))
        );
    }

    getReservationsByCoachAndSeance(seanceId: number, coachId: number): Observable<ReservationSeanceDto[]> {
        return this.http.get<any>(
            `${this.apiUrl}/seance/${seanceId}/coach/${coachId}`,
            { headers: this.getHeaders() }
        ).pipe(
            map((response) => this.normalizeCollection(response, 'EN_ATTENTE'))
        );
    }

    getCount(seanceId: number, coachId: number): Observable<number> {
        return this.http.get<number>(
            `${this.apiUrl}/seance/${seanceId}/coach/${coachId}/count`,
            { headers: this.getHeaders() }
        );
    }

    isComplete(seanceId: number, coachId: number): Observable<boolean> {
        return this.http.get<boolean>(
            `${this.apiUrl}/seance/${seanceId}/coach/${coachId}/complete`,
            { headers: this.getHeaders() }
        );
    }

    accepterReservation(reservationId: number): Observable<ReservationSeanceDto> {
        return this.http.put<ReservationSeanceDto>(
            `${this.apiUrl}/${reservationId}/accepter`,
            {},
            { headers: this.getHeaders() }
        );
    }

    refuserReservation(reservationId: number): Observable<ReservationSeanceDto> {
        return this.http.put<ReservationSeanceDto>(
            `${this.apiUrl}/${reservationId}/refuser`,
            {},
            { headers: this.getHeaders() }
        );
    }

    private normalizeCollection(response: any, defaultStatus: string): ReservationSeanceDto[] {
        const rawCollection = Array.isArray(response)
            ? response
            : response?.content || response?.data || response?.reservations || response?.seances || [];

        if (!Array.isArray(rawCollection)) {
            return [];
        }

        return rawCollection.map((item: any) => this.normalizeItem(item, defaultStatus));
    }

    private normalizeItem(item: any, defaultStatus: string): ReservationSeanceDto {
        const normalizedStatus = this.normalizeStatus(item?.statut || item?.status || defaultStatus);

        const coachNomComplet =
            item?.coachNomComplet ||
            item?.coach?.nomComplet ||
            item?.seance?.coachNomComplet ||
            item?.seance?.coach?.nomComplet ||
            item?.coachFullName ||
            item?.seance?.coachFullName ||
            `${item?.coach?.prenom || item?.seance?.coach?.prenom || ''} ${item?.coach?.nom || item?.seance?.coach?.nom || ''}`.trim();

        const coachNom =
            item?.coachNom ||
            item?.coach?.nom ||
            item?.seance?.coachNom ||
            item?.seance?.coach?.nom;

        const coachName =
            item?.coachName ||
            item?.coach?.name ||
            item?.seance?.coachName ||
            item?.seance?.coach?.name;

        const seanceId = Number(
            item?.seanceId ??
            item?.idSeance ??
            item?.seance?.id ??
            item?.sessionId ??
            item?.id
        ) || 0;

        return {
            id: Number(item?.id ?? item?.reservationId ?? null) || null,
            seanceId,
            theme: item?.theme || item?.titre || item?.seance?.theme || '',
            dateSeance: item?.dateSeance || item?.date || item?.seance?.dateSeance || '',
            heureSeance: item?.heureSeance || item?.heure || item?.seance?.heureSeance || '',
            lieu: item?.lieu || item?.adresse || item?.seance?.lieu || '',
            athleteId: Number(item?.athleteId ?? item?.athlete?.id ?? 0) || 0,
            athleteNomComplet: item?.athleteNomComplet || item?.athlete?.nomComplet || item?.athleteName || '',
            athleteEmail: item?.athleteEmail || item?.athlete?.email || '',
            coachId: Number(item?.coachId ?? item?.coach?.id ?? 0) || undefined,
            coachNomComplet: coachNomComplet || undefined,
            coachNom: coachNom || undefined,
            coachName: coachName || undefined,
            statut: normalizedStatus,
            dateReservation: item?.dateReservation || item?.createdAt || null,
            nombreAthletesCoachEtSeance: Number(item?.nombreAthletesCoachEtSeance ?? 0),
            complet: item?.complet ?? false,
            seanceStatut: item?.seanceStatut ?? item?.seance?.statut ?? '',
            annuleeMoinsDe24h: item?.annuleeMoinsDe24h ?? false,
            messageAnnulation: item?.messageAnnulation ?? ''
        };
    }

    private normalizeStatus(rawStatus: string): string {
        const value = (rawStatus || '')
            .toString()
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_')
            .replace(/É/g, 'E');

        if (value === 'DISPONIBLE') {
            return 'NON_RESERVEE';
        }

        if (value === 'RESERVEE') {
            return 'EN_ATTENTE';
        }

        return value || 'EN_ATTENTE';
    }
}