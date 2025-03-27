import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  public authService: AuthService;

  // Signal to manage the state of the dropdown (visible or hidden)
  isDropdownOpen = signal<boolean>(false);

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  // Toggles the dropdown menu (used on hover)
  toggleDropdown() {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  // Logout function calls the authService method
  logout() {
    this.authService.logout();
  }
}
