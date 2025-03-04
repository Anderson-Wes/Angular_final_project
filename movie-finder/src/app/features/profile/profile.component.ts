import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IUser } from '../../shared/interfaces/interfaces';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private fb = new FormBuilder();
  private authService: AuthService;
  private http: HttpClient;

  user = signal<IUser | null>(null);
  isEditing = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    fullName: [
      '',
      [Validators.required, Validators.pattern('^[A-Za-zА-Яа-я ]+$')],
    ],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: [''],
    newPassword: [
      '',
      [Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$')],
    ],
    confirmPassword: [''],
  });

  constructor(authService: AuthService, http: HttpClient) {
    this.authService = authService;
    this.http = http;

    effect(() => {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.user.set(currentUser);
        this.form.patchValue({
          fullName: currentUser.fullName,
          email: currentUser.email,
        });
      }
    });
  }

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
  }

  saveChanges() {
    const updatedUser: IUser = {
      ...this.user()!,
      fullName: this.form.value.fullName as string,
      email: this.form.value.email as string,
    };

    this.http
      .get<IUser[]>(
        `${this.authService.getApiUrl()}?email=${updatedUser.email}`
      )
      .subscribe((users) => {
        if (users.length > 0 && users[0].id !== updatedUser.id) {
          this.errorMessage.set(
            'This email is already in use. Please use a different one.'
          );
          return;
        }

        this.http
          .put<IUser>(
            `http://localhost:3000/users/${updatedUser.id}`,
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

  changePassword() {
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    if (this.user()?.password !== this.form.value.currentPassword) {
      this.errorMessage.set('Current password is incorrect.');
      return;
    }

    if (!this.form.controls.newPassword.valid) {
      this.errorMessage.set(
        'Password must be at least 8 characters long, include a digit and an uppercase letter.'
      );
      return;
    }

    const updatedUser: IUser = {
      ...this.user()!,
      password: this.form.value.newPassword as string,
    };

    this.http
      .put<IUser>(`http://localhost:3000/users/${updatedUser.id}`, updatedUser)
      .subscribe(() => {
        this.user.set(updatedUser);
        this.errorMessage.set(null);
      });
  }
}
