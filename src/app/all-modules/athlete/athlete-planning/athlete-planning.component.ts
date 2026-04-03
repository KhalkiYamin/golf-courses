import { Component, OnInit } from '@angular/core';
import { AthleteDashboardService } from 'src/app/services/athlete-dashboard.service';
import { AthleteSeance } from '../../models/athlete-seance.model';

export type SessionStatus = 'upcoming' | 'today' | 'past';

export interface WeekDay {
    date: Date;
    label: string;
    dayNum: number;
    isToday: boolean;
    sessions: PlanningSession[];
}

export interface PlanningSession {
    id: number;
    theme: string;
    date: string;
    heure: string;
    lieu: string;
    coach: string;
    coachInitials: string;
    specialite: string;
    status: SessionStatus;
    dateObj: Date;
}

export interface CalendarDay {
    date: Date | null;
    sessions: PlanningSession[];
    isToday: boolean;
    isCurrentMonth: boolean;
}

@Component({
    selector: 'app-athlete-planning',
    templateUrl: './athlete-planning.component.html',
    styleUrls: ['./athlete-planning.component.css']
})
export class AthletePlanningComponent implements OnInit {

    allSessions: PlanningSession[] = [];
    filteredSessions: PlanningSession[] = [];
    calendarDays: CalendarDay[] = [];

    viewMode: 'list' | 'week' | 'month' = 'week';
    filterStatus: 'all' | SessionStatus = 'all';
    filterSport = '';
    filterDate = '';

    currentCalendarDate = new Date();
    currentWeekStart: Date = this.getMonday(new Date());
    selectedCalendarDay: CalendarDay | null = null;

    today = new Date();

    readonly weekDayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    readonly timeSlots: number[] = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 → 22:00

    constructor(private athleteDashboardService: AthleteDashboardService) { }

    ngOnInit(): void {
        this.loadSessions();
    }

    // ─── Getters ─────────────────────────────────────────────────────────────────

    get upcomingCount(): number {
        return this.allSessions.filter(s => s.status === 'upcoming' || s.status === 'today').length;
    }

    get todayCount(): number {
        return this.allSessions.filter(s => s.status === 'today').length;
    }

    get pastCount(): number {
        return this.allSessions.filter(s => s.status === 'past').length;
    }

    get uniqueCoachesCount(): number {
        return new Set(this.allSessions.map(s => s.coach)).size;
    }

    get availableSports(): string[] {
        const sports = this.allSessions.map(s => s.specialite).filter(s => s && s !== '-');
        return [...new Set(sports)].sort();
    }

    get calendarMonthLabel(): string {
        return this.currentCalendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    get currentWeekLabel(): string {
        const end = new Date(this.currentWeekStart);
        end.setDate(end.getDate() + 6);
        const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        return `${fmt(this.currentWeekStart)} – ${fmt(end)} ${end.getFullYear()}`;
    }

    get currentWeekDays(): WeekDay[] {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + i);
            const dateStr = this.toLocalDateString(date);
            return {
                date,
                label: this.weekDayNames[i],
                dayNum: date.getDate(),
                isToday: date.toDateString() === this.today.toDateString(),
                sessions: this.allSessions.filter(s => s.date.startsWith(dateStr))
            };
        });
    }

    get nextSessions(): PlanningSession[] {
        return this.allSessions
            .filter(s => s.status === 'upcoming' || s.status === 'today')
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
            .slice(0, 5);
    }

    get hasActiveFilters(): boolean {
        return this.filterStatus !== 'all' || !!this.filterSport || !!this.filterDate;
    }

    // ─── Status helpers ───────────────────────────────────────────────────────────

    getStatusLabel(status: SessionStatus): string {
        const map: Record<SessionStatus, string> = {
            upcoming: 'Planifiee',
            today: 'Confirmee',
            past: 'Terminee'
        };
        return map[status] || status;
    }

    // ─── Filters ─────────────────────────────────────────────────────────────────

    setQuickFilter(status: 'all' | SessionStatus): void {
        this.filterStatus = status;
        this.applyFilters();
    }

    applyFilters(): void {
        this.filteredSessions = this.allSessions.filter(s => {
            const matchStatus = this.filterStatus === 'all' || s.status === this.filterStatus;
            const matchSport = !this.filterSport || s.specialite === this.filterSport;
            const matchDate = !this.filterDate || s.date.startsWith(this.filterDate);
            return matchStatus && matchSport && matchDate;
        });
    }

    clearFilters(): void {
        this.filterStatus = 'all';
        this.filterSport = '';
        this.filterDate = '';
        this.applyFilters();
    }

    // ─── Calendar (Month) ─────────────────────────────────────────────────────────

    buildCalendar(): void {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const days: CalendarDay[] = [];

        for (let i = 0; i < startOffset; i++) {
            days.push({ date: null, sessions: [], isToday: false, isCurrentMonth: false });
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const dateStr = this.toLocalDateString(date);
            days.push({
                date,
                sessions: this.allSessions.filter(s => s.date.startsWith(dateStr)),
                isToday: date.toDateString() === this.today.toDateString(),
                isCurrentMonth: true
            });
        }
        const remainder = days.length % 7;
        if (remainder !== 0) {
            for (let i = 0; i < 7 - remainder; i++) {
                days.push({ date: null, sessions: [], isToday: false, isCurrentMonth: false });
            }
        }
        this.calendarDays = days;
        this.selectedCalendarDay = null;
    }

    prevMonth(): void {
        const d = new Date(this.currentCalendarDate);
        d.setMonth(d.getMonth() - 1);
        this.currentCalendarDate = d;
        this.buildCalendar();
    }

    nextMonth(): void {
        const d = new Date(this.currentCalendarDate);
        d.setMonth(d.getMonth() + 1);
        this.currentCalendarDate = d;
        this.buildCalendar();
    }

    goToToday(): void {
        this.currentCalendarDate = new Date();
        this.buildCalendar();
    }

    selectCalendarDay(day: CalendarDay): void {
        if (!day.date) return;
        this.selectedCalendarDay =
            this.selectedCalendarDay?.date?.toDateString() === day.date.toDateString() ? null : day;
    }

    // ─── Week helpers ─────────────────────────────────────────────────────────────

    getSessionsForDayAndHour(day: WeekDay, hour: number): PlanningSession[] {
        return day.sessions.filter(s => this.parseHour(s.heure) === hour);
    }

    private parseHour(heure: string): number {
        if (!heure || heure === '-') return -1;
        return parseInt(heure.split(':')[0], 10);
    }

    // ─── Week Navigation ──────────────────────────────────────────────────────────

    prevWeek(): void {
        const d = new Date(this.currentWeekStart);
        d.setDate(d.getDate() - 7);
        this.currentWeekStart = d;
    }

    nextWeek(): void {
        const d = new Date(this.currentWeekStart);
        d.setDate(d.getDate() + 7);
        this.currentWeekStart = d;
    }

    goToCurrentWeek(): void {
        this.currentWeekStart = this.getMonday(new Date());
    }

    // ─── Data Loading ─────────────────────────────────────────────────────────────

    private loadSessions(): void {
        this.athleteDashboardService.getAthleteSeances().subscribe({
            next: (data: AthleteSeance[]) => {
                this.allSessions = (data || []).map(item => this.mapSession(item));
                this.applyFilters();
                this.buildCalendar();
            },
            error: () => {
                this.allSessions = [];
                this.filteredSessions = [];
                this.buildCalendar();
            }
        });
    }

    private mapSession(item: AthleteSeance): PlanningSession {
        const dateObj = this.parseDate(item.dateSeance);
        return {
            id: item.id,
            theme: item.theme || '-',
            date: item.dateSeance || '-',
            heure: item.heureSeance || '-',
            lieu: item.lieu || '-',
            coach: item.coachNomComplet || 'Coach inconnu',
            coachInitials: this.getInitials(item.coachNomComplet),
            specialite: item.specialite || '-',
            status: this.getStatus(dateObj),
            dateObj
        };
    }

    private parseDate(dateStr: string): Date {
        if (!dateStr || dateStr === '-') return new Date(NaN);
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date(NaN) : d;
    }

    private getStatus(date: Date): SessionStatus {
        if (isNaN(date.getTime())) return 'upcoming';
        if (date.toDateString() === this.today.toDateString()) return 'today';
        return date > this.today ? 'upcoming' : 'past';
    }

    private getInitials(name: string): string {
        if (!name || name === 'Coach inconnu') return '--';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    private getMonday(d: Date): Date {
        const date = new Date(d);
        const diff = (date.getDay() + 6) % 7;
        date.setDate(date.getDate() - diff);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    private toLocalDateString(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
}


