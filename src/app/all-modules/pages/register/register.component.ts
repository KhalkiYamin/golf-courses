import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/all-modules/models/category';

type Role = 'COACH' | 'ATHLETE' | '';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  categories: Category[] = [];

  nom: string = '';
  prenom: string = '';
  telephone: string = '';
  email: string = '';
  password: string = '';
  role: Role = '';

  specialiteId: number | null = null;
  experience: number | null = null;

  sportId: number | null = null;
  niveau: string = '';

  loading: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (err: any) => {
        console.error('Erreur chargement catégories', err);
      }
    });
  }

  onRoleChange(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.role === 'COACH') {
      this.sportId = null;
      this.niveau = '';
    } else if (this.role === 'ATHLETE') {
      this.specialiteId = null;
      this.experience = null;
    }
  }

  submit(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.nom || !this.prenom || !this.email || !this.password || !this.role) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMsg = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.role === 'COACH' && !this.specialiteId) {
      this.errorMsg = 'Veuillez choisir votre spécialité.';
      return;
    }

    if (this.role === 'ATHLETE' && (!this.sportId || !this.niveau)) {
      this.errorMsg = 'Veuillez compléter les informations du profil athlète.';
      return;
    }

    const payload: any = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      telephone: this.telephone,
      role: this.role
    };

    if (this.role === 'COACH') {
      payload.specialiteId = this.specialiteId;
      payload.experience = this.experience ?? 0;
    }

    if (this.role === 'ATHLETE') {
      payload.sportId = this.sportId;
      payload.niveau = this.niveau;
    }

    this.loading = true;

    this.auth.register(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMsg = res?.message || "Inscription réussie ✅";

        setTimeout(() => {
          this.router.navigate(['/pages/login']);
        }, 1500);
      },
      error: (err: any) => {
        this.loading = false;
        console.error(err);
        this.errorMsg = err?.error?.message || "Erreur lors de l'inscription.";
      }
    });
  }
}