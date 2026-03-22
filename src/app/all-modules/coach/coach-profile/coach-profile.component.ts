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
    saveSuccessMessage = '';
    saveErrorMessage = '';
    files: File[] = [];
    tagitems: string[] = [];
    tagitemsSpecialization: string[] = [];
    servicesInput = '';
    specializationInput = '';
    educations: Array<{ degree: string; institute: string; year: string }> = [
        { degree: '', institute: '', year: '' }
    ];
    experiences: Array<{ clubName: string; from: string; to: string; position: string }> = [
        { clubName: '', from: '', to: '', position: '' }
    ];
    awards: Array<{ title: string; year: string }> = [
        { title: '', year: '' }
    ];

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
                this.editForm = {
                    prenom: this.profile.prenom || '',
                    nom: this.profile.nom || '',
                    email: this.profile.email || '',
                    telephone: this.profile.telephone || '',
                    specialite: this.profile.specialite || '',
                    experience: this.profile.experience || 0,
                    bio: this.profile.bio || ''
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
                this.saveErrorMessage = '';
                this.saveSuccessMessage = 'Profil mis a jour avec succes.';
            },
            error: (error) => {
                console.error('Erreur modification profil :', error);
                this.isSaving = false;
                this.saveSuccessMessage = '';
                this.saveErrorMessage = 'Erreur lors de la mise a jour du profil.';
            }
        });
    }

    onSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }
        this.files.push(...Array.from(input.files));
    }

    onRemove(file: File): void {
        this.files = this.files.filter((f) => f !== file);
    }

    addEducation(): void {
        this.educations.push({ degree: '', institute: '', year: '' });
    }

    removeEducation(index: number): void {
        if (this.educations.length === 1) {
            return;
        }
        this.educations.splice(index, 1);
    }

    addExperience(): void {
        this.experiences.push({ clubName: '', from: '', to: '', position: '' });
    }

    removeExperience(index: number): void {
        if (this.experiences.length === 1) {
            return;
        }
        this.experiences.splice(index, 1);
    }

    addAward(): void {
        this.awards.push({ title: '', year: '' });
    }

    removeAward(index: number): void {
        if (this.awards.length === 1) {
            return;
        }
        this.awards.splice(index, 1);
    }

    addServiceTag(): void {
        const value = this.servicesInput.trim();
        if (!value) {
            return;
        }

        const tags = value.split(',').map((tag) => tag.trim()).filter((tag) => !!tag);
        tags.forEach((tag) => {
            if (!this.tagitems.includes(tag)) {
                this.tagitems.push(tag);
            }
        });
        this.servicesInput = '';
    }

    removeServiceTag(index: number): void {
        this.tagitems.splice(index, 1);
    }

    addSpecializationTag(): void {
        const value = this.specializationInput.trim();
        if (!value) {
            return;
        }

        const tags = value.split(',').map((tag) => tag.trim()).filter((tag) => !!tag);
        tags.forEach((tag) => {
            if (!this.tagitemsSpecialization.includes(tag)) {
                this.tagitemsSpecialization.push(tag);
            }
        });
        this.specializationInput = '';
    }

    removeSpecializationTag(index: number): void {
        this.tagitemsSpecialization.splice(index, 1);
    }
}