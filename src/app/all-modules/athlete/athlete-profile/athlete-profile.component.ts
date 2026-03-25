import { Component, OnInit } from '@angular/core';
import { AthleteDashboardService } from '../../../services/athlete-dashboard.service';

interface AthleteProfile {
    nom: string;
    prenom: string;
    email: string;
    sport: string;
    niveau: string;
    telephone: string;
}

@Component({
    selector: 'app-athlete-profile',
    templateUrl: './athlete-profile.component.html',
    styleUrls: ['./athlete-profile.component.css']
})
export class AthleteProfileComponent implements OnInit {

    profile: AthleteProfile = {
        nom: '',
        prenom: '',
        email: '',
        sport: '',
        niveau: '',
        telephone: ''
    };

    editProfile = {
        nom: '',
        prenom: '',
        telephone: '',
        niveau: ''
    };

    loading = false;
    saving = false;
    errorMessage = '';
    successMessage = '';
    isEditing = false;

    constructor(private athleteDashboardService: AthleteDashboardService) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.athleteDashboardService.getAthleteProfile().subscribe({
            next: (data: AthleteProfile) => {
                this.profile = data;
                this.editProfile = {
                    nom: data.nom,
                    prenom: data.prenom,
                    telephone: data.telephone,
                    niveau: data.niveau
                };
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement profil athlete', error);
                this.errorMessage = 'Impossible de charger le profil.';
                this.loading = false;
            }
        });
    }

    startEdit(): void {
        this.isEditing = true;
        this.successMessage = '';
        this.errorMessage = '';
        this.editProfile = {
            prenom: this.profile.prenom,
            nom: this.profile.nom,
            telephone: this.profile.telephone,
            niveau: this.profile.niveau
        };
    }

    cancelEdit(): void {
        this.isEditing = false;
    }

    saveProfile(): void {
        if (this.saving) return;

        this.saving = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.athleteDashboardService.updateAthleteProfile(this.editProfile).subscribe({
            next: (data: AthleteProfile) => {
                this.profile = data;
                this.isEditing = false;
                this.saving = false;
                this.successMessage = 'Profil modifié avec succès.';
            },
            error: (error: any) => {
                console.error('Erreur modification profil athlete', error);
                this.errorMessage = 'Impossible de modifier le profil.';
                this.saving = false;
            }
        });
    }
}