import { Component, OnInit } from '@angular/core';
import { Category } from '../../models/category';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  paginatedCategories: Category[] = [];

  categoryForm: Category = {
    title: '',
    description: ''
  };

  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedCategoryId: number | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Erreur chargement catégories', err);
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredCategories = this.categories.filter(category =>
      category.title.toLowerCase().includes(term) ||
      category.description.toLowerCase().includes(term)
    );

    this.totalPages = Math.ceil(this.filteredCategories.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePaginatedCategories();
  }

  updatePaginatedCategories(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCategories = this.filteredCategories.slice(startIndex, endIndex);
  }

  openAddModal(): void {
    this.showModal = true;
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryForm = {
      title: '',
      description: ''
    };
  }

  openEditModal(category: Category): void {
    this.showModal = true;
    this.isEditMode = true;
    this.selectedCategoryId = category.id || null;
    this.categoryForm = {
      title: category.title,
      description: category.description
    };
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryForm = {
      title: '',
      description: ''
    };
  }

  saveCategory(): void {
    if (!this.categoryForm.title.trim() || !this.categoryForm.description.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (this.isEditMode && this.selectedCategoryId !== null) {
      this.categoryService.updateCategory(this.selectedCategoryId, this.categoryForm).subscribe({
        next: () => {
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          console.error('Erreur modification catégorie', err);
        }
      });
    } else {
      this.categoryService.addCategory(this.categoryForm).subscribe({
        next: () => {
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          console.error('Erreur ajout catégorie', err);
        }
      });
    }
  }

  deleteCategory(id: number | undefined): void {
    if (!id) return;

    const confirmed = confirm('Voulez-vous vraiment supprimer cette catégorie ?');
    if (!confirmed) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        console.error('Erreur suppression catégorie', err);
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedCategories();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}