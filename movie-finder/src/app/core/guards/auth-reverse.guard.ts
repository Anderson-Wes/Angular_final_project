import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthReverseGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.router.navigate(['/']); // Если уже авторизован → редирект на главную
      return false;
    }
    return true; // Если не авторизован → доступ разрешен
  }
}
