import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService); // used to check if user is logged in
  private router = inject(Router); // used to programmatically navigate

  canActivate(): boolean {
    const user = this.authService.getCurrentUser(); // Get the current user

    // If no user is logged in, redirect to login page
    if (!user) {
      this.router.navigate(['/login']);
      return false; // Block access to the protected route
    }
    return true; // Allow access if user exists
  }
}
