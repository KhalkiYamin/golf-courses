import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Vérifiez que ce chemin est bon

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      console.log('AuthGuard: Utilisateur non connecté -> Redirection login');
      this.router.navigate(['/login']);
      return false;
    }
    const requiredRole = route.data['role']; 
    const userRole = this.authService.getRole();
    console.log('AuthGuard Check:', { requis: requiredRole, actuel: userRole });

    if (requiredRole && requiredRole !== userRole) {
      console.log('AuthGuard: Rôle insuffisant -> Accès refusé');
      alert("Accès refusé : Droits d'administration requis.");
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}