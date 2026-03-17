import { Component, OnInit } from '@angular/core';
import {
    CoachDashboardService,
    UpdateCoachProfileRequest
} from 'src/app/services/coach-dashboard.service';

@Component({
    selector: 'app-coach-profile',
    templateUrl: './coach-profile.component.html',
    styleUrls: ['./coach-profile.component.css']
})
export class CoachProfileComponent implements OnInit {

    profile: any = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        specialite: '',
        experience: 0,
        totalAthletes: 0,
        note: '',
        forme: '',
        seances: 0,
        succes: '',
        imageProfil: '',
        bio: ''
    };

    isLoading = true;
    errorMessage = '';
    isEditMode = false;
    isSaving = false;

    editForm: any = {
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        specialite: '',
        experience: 0,
        bio: ''
    };

    constructor(private coachDashboardService: CoachDashboardService) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.coachDashboardService.getCoachProfile().subscribe({
            next: (data) => {
                console.log('Coach profile:', data);
                this.profile = {
                    ...this.profile,
                    ...data
                };
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement profil coach :', error);
                this.errorMessage = 'Impossible de charger le profil du coach.';
                this.isLoading = false;
            }
        });
    }

    editProfile(): void {
        this.isEditMode = true;

        this.editForm = {
            prenom: this.profile.prenom || '',
            nom: this.profile.nom || '',
            email: this.profile.email || '',
            telephone: this.profile.telephone || '',
            specialite: this.profile.specialite || '',
            experience: this.profile.experience || 0,
            bio: this.profile.bio || ''
        };
    }

    cancelEdit(): void {
        this.isEditMode = false;
    }

    saveProfile(): void {
        this.isSaving = true;

        const payload: UpdateCoachProfileRequest = {
            prenom: this.editForm.prenom,
            nom: this.editForm.nom,
            email: this.editForm.email,
            telephone: this.editForm.telephone,
            experience: this.editForm.experience
        };

        this.coachDashboardService.updateCoachProfile(payload).subscribe({
            next: (updatedProfile) => {
                console.log('Profil mis à jour :', updatedProfile);

                this.profile = {
                    ...this.profile,
                    ...updatedProfile
                };

                this.isEditMode = false;
                this.isSaving = false;
            },
            error: (error) => {
                console.error('Erreur modification profil :', error);
                this.isSaving = false;
                alert('Erreur lors de la mise à jour du profil.');
            }
        });
    }
}