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

  public user = signal<IUser | null>(null);
  public isEditing = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  public profileForm = this.fb.group({
    fullName: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.pattern('^[A-Za-z]+$'),
      ],
    }),
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
  });


  public passwordForm = this.fb.group({
    currentPassword: this.fb.control(''),
    newPassword: this.fb.control('', {
      validators: [
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'),
      ],
    }),
    confirmPassword: this.fb.control(''),
  });

  constructor() {

    effect(() => {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.user.set(currentUser);

        this.profileForm.patchValue({
          fullName: currentUser.fullName,
          email: currentUser.email,
        });
      }
    });
  }


  public toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
  }


  public saveProfileChanges(): void {
    if (!this.user()) {
      return;
    }

    const updatedUser: IUser = {
      ...this.user()!,
      fullName: this.profileForm.value.fullName || '',
      email: this.profileForm.value.email || '',
    };


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


  public changePassword(): void {
    if (!this.user()) {
      return;
    }

    const currentUser = this.user()!;
    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.getRawValue();


    if (currentUser.password !== currentPassword) {
      this.errorMessage.set('Current password is incorrect.');
      return;
    }


    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

 
    if (!this.passwordForm.controls.newPassword.valid) {
      this.errorMessage.set(
        'Password must be at least 8 characters long, include a digit and an uppercase letter.'
      );
      return;
    }


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


        this.passwordForm.reset();
      });
  }
}
