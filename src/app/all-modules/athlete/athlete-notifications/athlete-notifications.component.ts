import { Component, OnInit } from '@angular/core';

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'session' | 'resource' | 'program' | 'message' | 'payment';
    read: boolean;
}

@Component({
    selector: 'app-athlete-notifications',
    templateUrl: './athlete-notifications.component.html',
    styleUrls: ['./athlete-notifications.component.css']
})
export class AthleteNotificationsComponent implements OnInit {

    notifications: NotificationItem[] = [];
    filteredNotifications: NotificationItem[] = [];
    selectedFilter: 'all' | 'unread' | 'read' = 'all';

    ngOnInit(): void {
        this.loadNotifications();
        this.applyFilter();
    }

    loadNotifications(): void {
        this.notifications = [
            {
                id: 1,
                title: 'Séance confirmée',
                message: 'Votre séance de mercredi a été confirmée.',
                time: 'Aujourd’hui',
                type: 'session',
                read: false
            },
            {
                id: 2,
                title: 'Nouvelle ressource',
                message: 'Votre coach a ajouté une nouvelle ressource pour votre entraînement.',
                time: 'Hier',
                type: 'resource',
                read: false
            },
            {
                id: 3,
                title: 'Programme mis à jour',
                message: 'Votre programme de travail a été mis à jour.',
                time: 'Il y a 2 jours',
                type: 'program',
                read: true
            },
            {
                id: 4,
                title: 'Nouveau message',
                message: 'Votre coach vous a envoyé un message.',
                time: 'Il y a 3 jours',
                type: 'message',
                read: true
            }
        ];
    }

    applyFilter(): void {
        if (this.selectedFilter === 'all') {
            this.filteredNotifications = [...this.notifications];
        } else if (this.selectedFilter === 'unread') {
            this.filteredNotifications = this.notifications.filter(notif => !notif.read);
        } else if (this.selectedFilter === 'read') {
            this.filteredNotifications = this.notifications.filter(notif => notif.read);
        }
    }

    setFilter(filter: 'all' | 'unread' | 'read'): void {
        this.selectedFilter = filter;
        this.applyFilter();
    }

    markAsRead(notification: NotificationItem): void {
        notification.read = true;
        this.applyFilter();
    }

    markAsUnread(notification: NotificationItem): void {
        notification.read = false;
        this.applyFilter();
    }

    markAllAsRead(): void {
        this.notifications = this.notifications.map(notif => ({
            ...notif,
            read: true
        }));
        this.applyFilter();
    }

    deleteNotification(id: number): void {
        this.notifications = this.notifications.filter(notif => notif.id !== id);
        this.applyFilter();
    }

    getUnreadCount(): number {
        return this.notifications.filter(notif => !notif.read).length;
    }

    getIcon(type: string): string {
        switch (type) {
            case 'session':
                return 'fas fa-calendar-check';
            case 'resource':
                return 'fas fa-book-open';
            case 'program':
                return 'fas fa-tasks';
            case 'message':
                return 'fas fa-envelope';
            case 'payment':
                return 'fas fa-credit-card';
            default:
                return 'fas fa-bell';
        }
    }

    trackByNotificationId(index: number, notification: NotificationItem): number {
        return notification.id;
    }
}