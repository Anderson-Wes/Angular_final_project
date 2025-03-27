import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // Inject the form builder and auth service using Angular's modern inject() API
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  // Reactive form group with validation rules
  public form = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email], // Required + must be a valid email
    }),
    password: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(8)], // Required + at least 8 characters
    }),
  });

  // Signal to track if the form is valid
  public isValid = signal(false);

  // Signal to hold and display an error message from failed login
  public errorMessage = signal<string | null>(null);

  constructor() {
    // Listen for form validation status changes
    this.form.statusChanges.subscribe(() => {
      this.isValid.set(this.form.valid); // Update signal based on form state
    });
  }

  // Triggered when the user clicks the Login button
  public login(): void {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue(); // Get form values

      // Call AuthService.login and subscribe to the result
      this.authService.login(email, password).subscribe((response) => {
        if (response.error) {
          this.errorMessage.set(response.error); // Display error if login failed
        }
      });
    }
  }
}
