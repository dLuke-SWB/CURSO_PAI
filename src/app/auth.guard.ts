import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Agora o TypeScript vai reconhecer essa função!
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Se não estiver logado:
    console.warn('Acesso negado: Usuário não autenticado.');
    this.router.navigate(['/login']);
    return false;
  }
}