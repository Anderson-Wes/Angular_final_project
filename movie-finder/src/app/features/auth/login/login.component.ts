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
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  public form = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  public isValid = signal(false);
  public errorMessage = signal<string | null>(null);

  constructor() {
    this.form.statusChanges.subscribe(() => {
      this.isValid.set(this.form.valid);
    });
  }

  public login(): void {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      this.authService.login(email, password).subscribe((response) => {
        if (response.error) {
          this.errorMessage.set(response.error);
        }
      });
    }
  }
}
