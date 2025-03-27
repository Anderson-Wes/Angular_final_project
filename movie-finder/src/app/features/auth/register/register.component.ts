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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  // Define the reactive registration form with validations
  public form = this.fb.group({
    // Full name: required, must contain only letters
    fullName: this.fb.control('', {
      validators: [Validators.required, Validators.pattern('^[A-Za-z]+$')],
    }),
    // Email: required, must be a valid email
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
    // Password: required, min 8 chars, must contain 1 uppercase letter and 1 digit
    password: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'),
      ],
    }),
    // Confirm password: required (logic to match is handled separately in the UI)
    confirmPassword: this.fb.control('', {
      validators: [Validators.required],
    }),
    // Checkbox: must be checked (requiredTrue)
    terms: this.fb.control(false, {
      validators: [Validators.requiredTrue],
    }),
  });

  // Track form validity using signals
  public isValid = signal(false);

  // Signal to hold registration error messages (e.g., duplicate email)
  public errorMessage = signal<string | null>(null);

  constructor() {
    // Listen for form status changes and update isValid accordingly
    this.form.statusChanges.subscribe(() => {
      this.isValid.set(this.form.valid);
    });
  }

  // Called when user submits the form
  public register(): void {
    if (this.form.valid) {
      // Destructure only the necessary fields
      const { fullName, email, password } = this.form.getRawValue();

      // Call AuthService to register the user
      this.authService
        .register({ fullName, email, password })
        .subscribe((response) => {
          // Show error message if backend responds with an error (e.g., email already exists)
          if (response.error) {
            this.errorMessage.set(response.error);
          }
        });
    }
  }
}
