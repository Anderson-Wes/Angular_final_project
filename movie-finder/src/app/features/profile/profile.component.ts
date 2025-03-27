import {
  Component,
  signal,
  effect,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { IUser } from '../../shared/interfaces/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  // Signals for holding current user, editing state, and error message
  public user = signal<IUser | null>(null);
  public isEditing = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  // Form for updating fullName and email
  public profileForm = this.fb.group({
    fullName: this.fb.control('', {
      validators: [Validators.required, Validators.pattern('^[A-Za-z]+$')],
    }),
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  // Form for changing password
  public passwordForm = this.fb.group({
    currentPassword: this.fb.control(''), // filled manually
    newPassword: this.fb.control('', {
      validators: [
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'),
      ],
    }),
    confirmPassword: this.fb.control(''), // for match validation
  });

  constructor() {
    // On init, load current user and populate form
    effect(() => {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.user.set(currentUser);

        // Fill form fields with current user data
        this.profileForm.patchValue({
          fullName: currentUser.fullName,
          email: currentUser.email,
        });
      }
    });
  }

  // Toggle edit mode for profile info
  public toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
  }

  // Save updated name/email to the backend and local state
  public saveProfileChanges(): void {
    if (!this.user()) return;

    const updatedUser: IUser = {
      ...this.user()!,
      fullName: this.profileForm.value.fullName || '',
      email: this.profileForm.value.email || '',
    };

    // Check if new email is already in use (by another user)
    this.http
      .get<IUser[]>(
        `${environment.apiBaseUrl}/users?email=${updatedUser.email}`
      )
      .subscribe((users) => {
        if (users.length > 0 && users[0].id !== updatedUser.id) {
          this.errorMessage.set(
            'This email is already in use. Please use a different one.'
          );
          return;
        }

        // If email is valid, update user
        this.http
          .put<IUser>(
            `${environment.apiBaseUrl}/users/${updatedUser.id}`,
            updatedUser
          )
          .subscribe(() => {
            this.user.set(updatedUser);
            this.authService.updateUser(updatedUser);
            this.isEditing.set(false);
            this.errorMessage.set(null);
          });
      });
  }

  // Validate and save new password
  public changePassword(): void {
    if (!this.user()) return;

    const currentUser = this.user()!;
    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.getRawValue();

    // Check if current password matches
    if (currentUser.password !== currentPassword) {
      this.errorMessage.set('Current password is incorrect.');
      return;
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    // Ensure new password meets validation rules
    if (!this.passwordForm.controls.newPassword.valid) {
      this.errorMessage.set(
        'Password must be at least 8 characters long, include a digit and an uppercase letter.'
      );
      return;
    }

    // Update user with new password
    const updatedUser: IUser = {
      ...currentUser,
      password: newPassword,
    };

    this.http
      .put<IUser>(
        `${environment.apiBaseUrl}/users/${updatedUser.id}`,
        updatedUser
      )
      .subscribe(() => {
        this.user.set(updatedUser);
        this.authService.updateUser(updatedUser);
        this.errorMessage.set(null);
        this.passwordForm.reset(); // clear form fields
      });
  }
}
