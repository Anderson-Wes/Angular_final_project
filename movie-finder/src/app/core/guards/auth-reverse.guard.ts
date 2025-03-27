import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Decorator that tells Angular to provide this service in the root injector
@Injectable({
  providedIn: 'root',
})
export class AuthReverseGuard implements CanActivate {
  // Injecting AuthService and Router using inject() function
  private authService = inject(AuthService);
  private router = inject(Router);

  // This method determines whether navigation to a route should be allowed
  canActivate(): boolean {
    const user = this.authService.getCurrentUser(); // Check if a user is logged in

    if (user) {
      // If the user is already authenticated, redirect to the homepage
      this.router.navigate(['/']);
    }
    return true;
  }
}
