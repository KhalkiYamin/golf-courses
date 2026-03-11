import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';

  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      this.message = 'Lien invalide (token manquant).';
      return;
    }

    this.http.get(`${this.apiUrl}/verify-email`, { params: { token }, responseType: 'text' }).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Votre compte a été vérifié avec succès !';
      },
      error: (err) => {
        this.status = 'error';
        this.message = err?.error?.message || err?.error || 'Lien invalide, expiré ou déjà utilisé.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/pages/login']);
  }
}
