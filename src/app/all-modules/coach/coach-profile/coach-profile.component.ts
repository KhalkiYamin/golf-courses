import { Component, OnInit } from '@angular/core';
import {
    CoachProfileService,
    CoachProfileDetailsResponse,
    UpdateCoachProfileDetailsRequest
} from '../../../services/coach-profile.service';

@Component({
    selector: 'app-coach-profile',
    templateUrl: './coach-profile.component.html',
    styleUrls: ['./coach-profile.component.css']
})
export class CoachProfileComponent implements OnInit {

    profile: CoachProfileDetailsResponse = {
        userId: undefined,
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        imageProfil: '',

        nomUtilisateur: '',
        genre: '',
        dateNaissance: '',
        biographie: '',

        nomClub: '',
        adresseClub: '',
        clubImage: '',

        adresseLigne1: '',
        adresseLigne2: '',
        ville: '',
        etatProvince: '',
        pays: '',
        codePostal: '',

        services: [],
        specialisations: [],

        diplomes: [],
        experiences: [],
        recompenses: []
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
        imageProfil: '',

        nomUtilisateur: '',
        genre: '',
        dateNaissance: '',
        biographie: '',

        nomClub: '',
        adresseClub: '',
        clubImage: '',

        adresseLigne1: '',
        adresseLigne2: '',
        ville: '',
        etatProvince: '',
        pays: '',
        codePostal: ''
    };

    constructor(private coachProfileService: CoachProfileService) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.coachProfileService.getMyProfile().subscribe({
            next: (data: CoachProfileDetailsResponse) => {
                this.profile = {
                    ...this.profile,
                    ...data,
                    services: data.services || [],
                    specialisations: data.specialisations || [],
                    diplomes: data.diplomes || [],
                    experiences: data.experiences || [],
                    recompenses: data.recompenses || []
                };

                this.patchEditFormFromProfile();
                this.patchArraysFromProfile();

                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement profil coach :', error);
                this.errorMessage = 'Impossible de charger le profil du coach.';
                this.isLoading = false;
            }
        });
    }

    patchEditFormFromProfile(): void {
        this.editForm = {
            prenom: this.profile.prenom || '',
            nom: this.profile.nom || '',
            email: this.profile.email || '',
            telephone: this.profile.telephone || '',
            imageProfil: this.profile.imageProfil || '',

            nomUtilisateur: this.profile.nomUtilisateur || '',
            genre: this.profile.genre || '',
            dateNaissance: this.profile.dateNaissance || '',
            biographie: this.profile.biographie || '',

            nomClub: this.profile.nomClub || '',
            adresseClub: this.profile.adresseClub || '',
            clubImage: this.profile.clubImage || '',

            adresseLigne1: this.profile.adresseLigne1 || '',
            adresseLigne2: this.profile.adresseLigne2 || '',
            ville: this.profile.ville || '',
            etatProvince: this.profile.etatProvince || '',
            pays: this.profile.pays || '',
            codePostal: this.profile.codePostal || ''
        };

        this.tagitems = [...(this.profile.services || [])];
        this.tagitemsSpecialization = [...(this.profile.specialisations || [])];
    }

    patchArraysFromProfile(): void {
        this.educations = (this.profile.diplomes && this.profile.diplomes.length > 0)
            ? this.profile.diplomes.map(d => ({
                degree: d.diplome || '',
                institute: d.ecoleInstitut || '',
                year: d.anneeObtention || ''
            }))
            : [{ degree: '', institute: '', year: '' }];

        this.experiences = (this.profile.experiences && this.profile.experiences.length > 0)
            ? this.profile.experiences.map(e => ({
                clubName: e.nomClub || '',
                from: e.dateDebut || '',
                to: e.dateFin || '',
                position: e.poste || ''
            }))
            : [{ clubName: '', from: '', to: '', position: '' }];

        this.awards = (this.profile.recompenses && this.profile.recompenses.length > 0)
            ? this.profile.recompenses.map(r => ({
                title: r.recompense || '',
                year: r.annee || ''
            }))
            : [{ title: '', year: '' }];
    }

    editProfile(): void {
        this.isEditMode = true;
        this.saveSuccessMessage = '';
        this.saveErrorMessage = '';

        this.patchEditFormFromProfile();
        this.patchArraysFromProfile();
    }

    cancelEdit(): void {
        this.isEditMode = false;
        this.saveErrorMessage = '';
        this.saveSuccessMessage = '';
    }

    saveProfile(): void {
        this.isSaving = true;
        this.saveSuccessMessage = '';
        this.saveErrorMessage = '';

        const payload: UpdateCoachProfileDetailsRequest = {
            nom: this.editForm.nom,
            prenom: this.editForm.prenom,
            telephone: this.editForm.telephone,
            imageProfil: this.editForm.imageProfil,

            nomUtilisateur: this.editForm.nomUtilisateur,
            genre: this.editForm.genre,
            dateNaissance: this.editForm.dateNaissance,
            biographie: this.editForm.biographie,

            nomClub: this.editForm.nomClub,
            adresseClub: this.editForm.adresseClub,
            clubImage: this.editForm.clubImage,

            adresseLigne1: this.editForm.adresseLigne1,
            adresseLigne2: this.editForm.adresseLigne2,
            ville: this.editForm.ville,
            etatProvince: this.editForm.etatProvince,
            pays: this.editForm.pays,
            codePostal: this.editForm.codePostal,

            services: [...this.tagitems],
            specialisations: [...this.tagitemsSpecialization],

            diplomes: this.educations
                .filter(e => e.degree || e.institute || e.year)
                .map(e => ({
                    diplome: e.degree,
                    ecoleInstitut: e.institute,
                    anneeObtention: e.year
                })),

            experiences: this.experiences
                .filter(e => e.clubName || e.from || e.to || e.position)
                .map(e => ({
                    nomClub: e.clubName,
                    dateDebut: e.from,
                    dateFin: e.to,
                    poste: e.position
                })),

            recompenses: this.awards
                .filter(a => a.title || a.year)
                .map(a => ({
                    recompense: a.title,
                    annee: a.year
                }))
        };

        this.coachProfileService.updateMyProfile(payload).subscribe({
            next: (updatedProfile: CoachProfileDetailsResponse) => {
                this.profile = {
                    ...this.profile,
                    ...updatedProfile,
                    services: updatedProfile.services || [],
                    specialisations: updatedProfile.specialisations || [],
                    diplomes: updatedProfile.diplomes || [],
                    experiences: updatedProfile.experiences || [],
                    recompenses: updatedProfile.recompenses || []
                };

                this.patchEditFormFromProfile();
                this.patchArraysFromProfile();

                this.isEditMode = false;
                this.isSaving = false;
                this.saveErrorMessage = '';
                this.saveSuccessMessage = 'Profil mis à jour avec succès.';
            },
            error: (error: any) => {
                console.error('Erreur modification profil :', error);
                this.isSaving = false;
                this.saveSuccessMessage = '';
                this.saveErrorMessage = 'Erreur lors de la mise à jour du profil.';
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

        const tags = value.split(',').map(tag => tag.trim()).filter(tag => !!tag);
        tags.forEach(tag => {
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

        const tags = value.split(',').map(tag => tag.trim()).filter(tag => !!tag);
        tags.forEach(tag => {
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