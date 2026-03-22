import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Vérifiez que ce chemin est bon

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  private redirectByRole(userRole: string | null): void {
    if (userRole === 'ADMIN') {
      this.router.navigate(['/golf-advisors/advisors-dashboard']);
      return;
    }

    if (userRole === 'COACH') {
      this.router.navigate(['/dashboard/coach/dashboard']);
      return;
    }

    if (userRole === 'ATHLETE') {
      this.router.navigate(['/dashboard/athlete/dashboard']);
      return;
    }

    this.router.navigate(['/']);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      console.log('AuthGuard: Utilisateur non connecté -> Redirection login');
      this.router.navigate(['/pages/login']);
      return false;
    }
    const requiredRole = route.data['role'];
    const userRole = this.authService.getRole();
    console.log('AuthGuard Check:', { requis: requiredRole, actuel: userRole });

    if (requiredRole && requiredRole !== userRole) {
      console.log('AuthGuard: Rôle insuffisant -> Accès refusé');
      this.redirectByRole(userRole);
      return false;
    }
    return true;
  }
}