import { Component, OnInit } from '@angular/core';

interface CoachNotification {
    id: number;
    title: string;
    message: string;
    date: string;
    time: string;
    type: 'SESSION' | 'ATHLETE' | 'REMINDER';
    typeLabel: string;
    icon: string;
    read: boolean;
}

@Component({
    selector: 'app-coach-notifications',
    templateUrl: './coach-notifications.component.html',
    styleUrls: ['./coach-notifications.component.css']
})
export class CoachNotificationsComponent implements OnInit {

    searchTerm: string = '';
    selectedFilter: string = 'ALL';

    notifications: CoachNotification[] = [
        {
            id: 1,
            title: 'Nouvel athlète assigné',
            message: 'Un nouvel athlète a été ajouté à votre groupe d’entraînement.',
            date: 'Aujourd’hui',
            time: '09:15',
            type: 'ATHLETE',
            typeLabel: 'Athlète',
            icon: '👤',
            read: false
        },
        {
            id: 2,
            title: 'Séance confirmée',
            message: 'Votre séance de jeudi a été confirmée avec succès.',
            date: 'Hier',
            time: '16:40',
            type: 'SESSION',
            typeLabel: 'Séance',
            icon: '📅',
            read: false
        },
        {
            id: 3,
            title: 'Rappel évaluation',
            message: 'N’oubliez pas de compléter les évaluations hebdomadaires de vos athlètes.',
            date: 'Il y a 2 jours',
            time: '10:00',
            type: 'REMINDER',
            typeLabel: 'Rappel',
            icon: '⏰',
            read: true
        }
    ];

    constructor() { }

    ngOnInit(): void { }

    get filteredNotifications(): CoachNotification[] {
        return this.notifications.filter(notif => {
            const matchesSearch =
                notif.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                notif.message.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesFilter =
                this.selectedFilter === 'ALL' || notif.type === this.selectedFilter;

            return matchesSearch && matchesFilter;
        });
    }

    get unreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    get todayCount(): number {
        return this.notifications.filter(n => n.date === 'Aujourd’hui').length;
    }

    setFilter(filter: string): void {
        this.selectedFilter = filter;
    }

    markAsRead(notification: CoachNotification): void {
        notification.read = true;
    }

    markAllAsRead(): void {
        this.notifications.forEach(notif => notif.read = true);
    }

    deleteNotification(id: number): void {
        this.notifications = this.notifications.filter(notif => notif.id !== id);
    }
}