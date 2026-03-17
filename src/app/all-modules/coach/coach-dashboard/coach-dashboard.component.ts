import { Component, OnInit } from '@angular/core';
import {
    CoachDashboardService,
    CoachProfileResponse,
    CoachAthleteResponse
} from 'src/app/services/coach-dashboard.service';

interface DashboardLabels {
    heroWelcome: string;
    heroTitle: string;
    heroText: string;
    nextSessionLabel: string;
    sessionsTitle: string;
    sessionsSubtitle: string;
    athletesTitle: string;
    athletesSubtitle: string;
    planningTitle: string;
    planningSubtitle: string;
    notificationsTitle: string;
    notificationsSubtitle: string;
    presenceTitle: string;
    presenceSubtitle: string;
    quickActionsTitle: string;
    quickActionsSubtitle: string;
    startActionLabel: string;
    detailsActionLabel: string;
    attendanceActionLabel: string;
    profileActionLabel: string;
    markAttendanceLabel: string;
    viewAllLabel: string;
    createSessionLabel: string;
    viewPlanningLabel: string;
    quickActions: string[];
}

interface NextSession {
    title: string;
    group: string;
    time: string;
    location: string;
}

interface StatCard {
    icon: string;
    value: number | string;
    label: string;
    subLabel: string;
    colorClass: string;
}

interface TodaySession {
    time: string;
    title: string;
    group: string;
    location: string;
    status: string;
    statusClass: string;
}

interface Athlete {
    name: string;
    sport: string;
    level: string;
    presence: string;
    presenceClass: string;
}

interface PlanningItem {
    day: string;
    detail: string;
    hour: string;
}

interface PresenceSummary {
    present: number;
    absent: number;
    late: number;
}

@Component({
    selector: 'app-coach-dashboard',
    templateUrl: './coach-dashboard.component.html',
    styleUrls: ['./coach-dashboard.component.css']
})
export class CoachDashboardComponent implements OnInit {

    coachName: string = 'Coach';
    coachInitial: string = 'C';
    coachAvatarUrl: string = '';
    coachSpecialite: string = 'Coach';
    coachExperience: string = '0 an';
    totalAthletes: number = 0;
    coachRating: string = '0/5';

    coachForme: string = '-';
    coachSessions: number = 0;
    coachSuccess: string = '0%';

    selectedFile: File | null = null;

    isLoadingProfile: boolean = true;
    isLoadingAthletes: boolean = true;
    profileError: boolean = false;
    athletesError: boolean = false;

    labels: DashboardLabels = {
        heroWelcome: 'Bonjour Coach, bienvenue sur votre espace',
        heroTitle: 'Dashboard Coach',
        heroText: 'Gérez vos séances, vos athlètes et votre planning facilement.',
        nextSessionLabel: 'Prochaine séance',
        sessionsTitle: 'Séances du jour',
        sessionsSubtitle: 'Vos entraînements programmés aujourd’hui',
        athletesTitle: 'Mes athlètes',
        athletesSubtitle: 'Liste rapide des athlètes suivis',
        planningTitle: 'Planning rapide',
        planningSubtitle: 'Vos prochaines activités',
        notificationsTitle: 'Notifications',
        notificationsSubtitle: 'Dernières mises à jour',
        presenceTitle: 'Présences du jour',
        presenceSubtitle: 'Résumé rapide',
        quickActionsTitle: 'Actions rapides',
        quickActionsSubtitle: 'Accès direct',
        startActionLabel: 'Démarrer',
        detailsActionLabel: 'Détails',
        attendanceActionLabel: 'Présence',
        profileActionLabel: 'Voir profil',
        markAttendanceLabel: 'Marquer présence',
        viewAllLabel: 'Voir tout',
        createSessionLabel: '+ Nouvelle séance',
        viewPlanningLabel: 'Voir planning',
        quickActions: ['Ajouter séance', 'Voir athlètes', 'Ouvrir planning', 'Envoyer message']
    };

    nextSession: NextSession = {
        title: 'Technique Football',
        group: 'Groupe U17',
        time: '15:00',
        location: 'Terrain B'
    };

    statsCards: StatCard[] = [
        {
            icon: '🏋️',
            value: 8,
            label: 'Séances aujourd’hui',
            subLabel: '2 de plus que hier',
            colorClass: 'blue'
        },
        {
            icon: '👥',
            value: 0,
            label: 'Athlètes actifs',
            subLabel: 'Suivi en cours',
            colorClass: 'cyan'
        },
        {
            icon: '📈',
            value: '92%',
            label: 'Présence moyenne',
            subLabel: 'Très bon taux',
            colorClass: 'violet'
        },
        {
            icon: '✉️',
            value: 5,
            label: 'Messages non lus',
            subLabel: 'À consulter',
            colorClass: 'indigo'
        }
    ];

    todaySessions: TodaySession[] = [
        {
            time: '08:30',
            title: 'Préparation physique',
            group: 'Groupe A',
            location: 'Salle 1',
            status: 'Terminé',
            statusClass: 'status-done'
        },
        {
            time: '11:00',
            title: 'Cardio intensif',
            group: 'Groupe B',
            location: 'Gymnase',
            status: 'En cours',
            statusClass: 'status-progress'
        },
        {
            time: '15:00',
            title: 'Technique Football',
            group: 'U17',
            location: 'Terrain B',
            status: 'À venir',
            statusClass: 'status-soon'
        }
    ];

    athletes: Athlete[] = [];

    weeklyPlanning: PlanningItem[] = [
        {
            day: 'Lundi',
            detail: 'Cardio & récupération',
            hour: '09:00'
        },
        {
            day: 'Mardi',
            detail: 'Technique individuelle',
            hour: '14:00'
        },
        {
            day: 'Jeudi',
            detail: 'Séance tactique',
            hour: '16:30'
        },
        {
            day: 'Vendredi',
            detail: 'Match d’entraînement',
            hour: '17:00'
        }
    ];

    notifications: string[] = [
        'Un nouvel athlète a été affecté à votre groupe.',
        'La séance de 15:00 a été confirmée par l’administration.',
        'Deux absences ont été signalées aujourd’hui.',
        'Le planning du vendredi a été mis à jour.'
    ];

    presenceSummary: PresenceSummary = {
        present: 18,
        absent: 4,
        late: 2
    };

    constructor(private coachDashboardService: CoachDashboardService) { }

    ngOnInit(): void {
        this.loadCoachProfile();
        this.loadMyAthletes();
    }

    onFileSelected(event: any): void {
        const file = event?.target?.files?.[0];

        if (!file) {
            return;
        }

        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = () => {
            this.coachAvatarUrl = reader.result as string;
        };
        reader.readAsDataURL(file);

        this.coachDashboardService.uploadCoachPhoto(file).subscribe({
            next: (profile: CoachProfileResponse) => {
                this.coachAvatarUrl = profile.imageProfil
                    ? `http://localhost:8081/${profile.imageProfil}`
                    : '';
            },
            error: (error: any) => {
                console.error('Erreur upload photo:', error);
            }
        });
    }

    private loadCoachProfile(): void {
        this.isLoadingProfile = true;
        this.profileError = false;

        this.coachDashboardService.getCoachProfile().subscribe({
            next: (profile: CoachProfileResponse) => {
                console.log('Coach profile API:', profile);

                this.coachName = `${profile.prenom || ''} ${profile.nom || ''}`.trim() || 'Coach';
                this.coachInitial = this.extractCoachInitial(this.coachName);
                this.coachAvatarUrl = profile.imageProfil
                    ? `http://localhost:8081/${profile.imageProfil}`
                    : '';
                this.coachSpecialite = profile.specialite || 'Coach';
                this.coachExperience = profile.experience ? `${profile.experience} ans` : '0 an';
                this.coachRating = profile.note || '0/5';
                this.coachForme = profile.forme || '-';
                this.coachSessions = profile.seances || 0;
                this.coachSuccess = profile.succes || '0%';

                this.labels.heroWelcome = `Bonjour ${this.coachName}, bienvenue sur votre espace`;
                this.labels.heroTitle = `Dashboard ${this.coachSpecialite}`;

                this.isLoadingProfile = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement profile coach:', error);
                this.profileError = true;
                this.isLoadingProfile = false;
            }
        });
    }

    private loadMyAthletes(): void {
        this.isLoadingAthletes = true;
        this.athletesError = false;

        this.coachDashboardService.getMyAthletes().subscribe({
            next: (athletes: CoachAthleteResponse[]) => {
                console.log('Athlètes API:', athletes);
                console.log('Nombre API:', athletes?.length);

                this.athletes = (athletes || []).map((athlete) => ({
                    name: athlete.nomComplet || 'Athlète',
                    sport: athlete.sport || '',
                    level: athlete.niveau || '',
                    presence: athlete.statutPresence || 'En attente',
                    presenceClass: this.mapPresenceClass(athlete.statutPresence)
                }));

                this.totalAthletes = this.athletes.length;
                this.updateAthleteStatCard();

                this.isLoadingAthletes = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement athlètes:', error);
                this.athletes = [];
                this.totalAthletes = 0;
                this.athletesError = true;
                this.isLoadingAthletes = false;
                this.updateAthleteStatCard();
            }
        });
    }

    private updateAthleteStatCard(): void {
        const athleteStatCard = this.statsCards.find(card =>
            card.label.toLowerCase().includes('athlètes')
        );

        if (athleteStatCard) {
            athleteStatCard.value = this.athletes.length;
        }
    }

    private mapPresenceClass(status: string): string {
        const normalized = (status || '').toLowerCase();

        if (normalized.includes('présent') || normalized.includes('present')) {
            return 'present';
        }

        if (normalized.includes('absent')) {
            return 'absent';
        }

        return 'pending';
    }

    private extractCoachInitial(name: string): string {
        if (!name || !name.trim()) {
            return 'C';
        }

        return name.trim().charAt(0).toUpperCase();
    }
}