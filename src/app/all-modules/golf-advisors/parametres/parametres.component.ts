import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { Settings, ChangePasswordRequest } from '../../models/settings.model';

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css']
})
export class ParametresComponent implements OnInit {

  successMessage = '';
  errorMessage = '';

  academy = {
    nom: '',
    adresse: '',
    email: '',
    telephone: '',
    logo: ''
  };

  inscription = {
    inscriptionActive: true,
    validationCoachAutomatique: false
  };

  securite = {
    dureeSession: 30,
    emailAdmin: 'admin@academie.com',
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmerMotDePasse: ''
  };

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (data: Settings) => {
        this.academy.nom = data.academyName;
        this.academy.adresse = data.academyAddress;
        this.academy.email = data.academyEmail;
        this.academy.telephone = data.academyPhone;
        this.academy.logo = data.academyLogo;

        this.inscription.inscriptionActive = data.inscriptionActive;
        this.inscription.validationCoachAutomatique = data.autoApproveCoach;

        this.securite.dureeSession = data.sessionDuration;
      },
      error: (err) => {
        console.error('Erreur chargement settings', err);
        this.showError('Erreur lors du chargement des paramètres');
      }
    });
  }

  saveAcademySettings(): void {
    const payload: Settings = {
      academyName: this.academy.nom,
      academyAddress: this.academy.adresse,
      academyEmail: this.academy.email,
      academyPhone: this.academy.telephone,
      academyLogo: this.academy.logo,
      inscriptionActive: this.inscription.inscriptionActive,
      autoApproveCoach: this.inscription.validationCoachAutomatique,
      sessionDuration: this.securite.dureeSession
    };

    this.settingsService.updateAcademy(payload).subscribe({
      next: () => this.showSuccess('Paramètres académie enregistrés avec succès'),
      error: (err) => {
        console.error(err);
        this.showError('Erreur lors de l’enregistrement des paramètres académie');
      }
    });
  }

  saveInscriptionSettings(): void {
    const payload: Settings = {
      academyName: this.academy.nom,
      academyAddress: this.academy.adresse,
      academyEmail: this.academy.email,
      academyPhone: this.academy.telephone,
      academyLogo: this.academy.logo,
      inscriptionActive: this.inscription.inscriptionActive,
      autoApproveCoach: this.inscription.validationCoachAutomatique,
      sessionDuration: this.securite.dureeSession
    };

    this.settingsService.updateInscription(payload).subscribe({
      next: () => this.showSuccess('Paramètres inscription enregistrés avec succès'),
      error: (err) => {
        console.error(err);
        this.showError('Erreur lors de l’enregistrement des paramètres inscription');
      }
    });
  }

  saveSecuritySettings(): void {
    if (
      !this.securite.nouveauMotDePasse ||
      this.securite.nouveauMotDePasse !== this.securite.confirmerMotDePasse
    ) {
      this.showError('Le nouveau mot de passe et la confirmation ne correspondent pas.');
      return;
    }

    const sessionPayload: Settings = {
      academyName: this.academy.nom,
      academyAddress: this.academy.adresse,
      academyEmail: this.academy.email,
      academyPhone: this.academy.telephone,
      academyLogo: this.academy.logo,
      inscriptionActive: this.inscription.inscriptionActive,
      autoApproveCoach: this.inscription.validationCoachAutomatique,
      sessionDuration: this.securite.dureeSession
    };

    this.settingsService.updateSession(sessionPayload).subscribe({
      next: () => {
        const passwordPayload: ChangePasswordRequest = {
          email: this.securite.emailAdmin,
          oldPassword: this.securite.ancienMotDePasse,
          newPassword: this.securite.nouveauMotDePasse
        };

        this.settingsService.changePassword(passwordPayload).subscribe({
          next: () => {
            this.showSuccess('Paramètres sécurité enregistrés avec succès');
            this.securite.ancienMotDePasse = '';
            this.securite.nouveauMotDePasse = '';
            this.securite.confirmerMotDePasse = '';
          },
          error: (err) => {
            console.error(err);
            this.showError('Erreur lors du changement du mot de passe');
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.showError('Erreur lors de l’enregistrement de la durée session');
      }
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.academy.logo = file.name;
    }
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }
}