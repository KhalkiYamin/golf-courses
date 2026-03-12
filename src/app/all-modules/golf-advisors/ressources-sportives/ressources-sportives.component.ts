import { Component, OnInit } from '@angular/core';
import { RessourceSportif } from '../../models/ressource-sportif.model';
import { RessourceSportifService } from 'src/app/services/ressource-sportif.service';

@Component({
  selector: 'app-ressources-sportives',
  templateUrl: './ressources-sportives.component.html',
  styleUrls: ['./ressources-sportives.component.css']
})
export class RessourcesSportivesComponent implements OnInit {

  equipements: RessourceSportif[] = [];
  filteredEquipements: RessourceSportif[] = [];

  searchTerm = '';
  selectedFilter: 'TOUS' | 'DISPONIBLE' | 'INDISPONIBLE' = 'TOUS';

  showModal = false;
  isEditMode = false;
  successMessage = '';

  equipementForm: RessourceSportif = this.getEmptyEquipement();

  constructor(private ressourceSportifService: RessourceSportifService) { }

  ngOnInit(): void {
    this.loadEquipements();
  }

  getEmptyEquipement(): RessourceSportif {
    return {
      nom: '',
      description: '',
      disponibilite: true,
      image: ''
    };
  }

  loadEquipements(): void {
    let disponibilite: boolean | undefined = undefined;

    if (this.selectedFilter === 'DISPONIBLE') {
      disponibilite = true;
    } else if (this.selectedFilter === 'INDISPONIBLE') {
      disponibilite = false;
    }

    this.ressourceSportifService.getAll(this.searchTerm, disponibilite).subscribe({
      next: (data) => {
        this.equipements = data;
        this.filteredEquipements = data;
      },
      error: (err) => {
        console.error('Erreur chargement ressources', err);
      }
    });
  }

  applyFilters(): void {
    this.loadEquipements();
  }

  setFilter(filter: 'TOUS' | 'DISPONIBLE' | 'INDISPONIBLE'): void {
    this.selectedFilter = filter;
    this.loadEquipements();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.equipementForm = this.getEmptyEquipement();
    this.showModal = true;
  }

  openEditModal(item: RessourceSportif): void {
    this.isEditMode = true;
    this.equipementForm = { ...item };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.equipementForm = this.getEmptyEquipement();
  }

  saveEquipement(): void {
    if (!this.equipementForm.nom.trim() || !this.equipementForm.description.trim()) {
      return;
    }

    if (this.isEditMode && this.equipementForm.id) {
      this.ressourceSportifService.update(this.equipementForm.id, this.equipementForm).subscribe({
        next: () => {
          this.showSuccess('Équipement modifié avec succès');
          this.loadEquipements();
          this.closeModal();
        },
        error: (err) => {
          console.error('Erreur modification équipement', err);
        }
      });
    } else {
      this.ressourceSportifService.create(this.equipementForm).subscribe({
        next: () => {
          this.showSuccess('Équipement ajouté avec succès');
          this.loadEquipements();
          this.closeModal();
        },
        error: (err) => {
          console.error('Erreur ajout équipement', err);
        }
      });
    }
  }

  deleteEquipement(item: RessourceSportif): void {
    if (!item.id) return;

    const confirmation = confirm(`Supprimer l'équipement "${item.nom}" ?`);
    if (!confirmation) return;

    this.ressourceSportifService.delete(item.id).subscribe({
      next: () => {
        this.showSuccess('Équipement supprimé avec succès');
        this.loadEquipements();
      },
      error: (err) => {
        console.error('Erreur suppression équipement', err);
      }
    });
  }

  getDisponibiliteLabel(value: boolean): string {
    return value ? 'Disponible' : 'Indisponible';
  }

  get totalEquipements(): number {
    return this.equipements.length;
  }

  get totalDisponibles(): number {
    return this.equipements.filter(e => e.disponibilite).length;
  }

  get totalIndisponibles(): number {
    return this.equipements.filter(e => !e.disponibilite).length;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}