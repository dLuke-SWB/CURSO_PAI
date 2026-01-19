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
    const user = this.authService.getUser();

    if (user) {
      // Se tem usuário, libera a entrada
      return true;
    }

    // Se não tem usuário, bloqueia e manda pro login
    this.router.navigate(['/login']);
    return false;
  }
}