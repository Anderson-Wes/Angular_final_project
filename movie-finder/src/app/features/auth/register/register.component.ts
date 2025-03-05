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

  public form = this.fb.group({
    fullName: this.fb.control('', {
      validators: [Validators.required, Validators.pattern('^[A-Za-z]+$')],
    }),
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'),
      ],
    }),
    confirmPassword: this.fb.control('', {
      validators: [Validators.required],
    }),
    terms: this.fb.control(false, {
      validators: [Validators.requiredTrue],
    }),
  });

  public isValid = signal(false);
  public errorMessage = signal<string | null>(null);

  constructor() {
    this.form.statusChanges.subscribe(() => {
      this.isValid.set(this.form.valid);
    });
  }

  public register(): void {
    if (this.form.valid) {
      const { fullName, email, password } = this.form.getRawValue();
      this.authService
        .register({ fullName, email, password })
        .subscribe((response) => {
          if (response.error) {
            this.errorMessage.set(response.error);
          }
        });
    }
  }
}
