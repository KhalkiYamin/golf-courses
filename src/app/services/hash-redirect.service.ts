import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HashRedirectService {

  constructor(private router: Router) { }

  /**
   * Redirige les URLs sans hash vers les URLs avec hash
   * Cela permet aux liens d'email (sans hash) de fonctionner avec useHash: true
   */
  redirectToHashUrl(): void {
    // Récupère l'URL actuelle
    const location = window.location;
    const pathname = location.pathname;
    const search = location.search;
    const hash = location.hash;

    // Si l'URL ne commence pas par un hash ET qu'il y a un chemin ou des paramètres
    if (!hash && (pathname !== '/' || search)) {
      // Construit la nouvelle URL avec le hash
      const newPath = pathname.replace(/^\/(?:golf-courses0\/)?/, '');
      const newUrl = `${location.origin}${location.pathname}#${newPath}${search}`;
      window.location.href = newUrl;
    }
  }
}
