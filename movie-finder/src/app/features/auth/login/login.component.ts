import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = new FormBuilder();
  private authService: AuthService;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isValid = signal(false); //stores the validity state of forms
  errorMessage = signal<string | null>(null);

  constructor(authService: AuthService) {
    this.authService = authService;

    this.form.statusChanges.subscribe(() => {
      this.isValid.set(this.form.valid); //when the form becomes valid, we update it
    });
  } //to control disabled on the "Login" button.

  login() {
    if (this.form.valid) {
      const email = this.form.value.email as string;
      const password = this.form.value.password as string;

      this.authService.login(email, password).subscribe((response) => {
        if (response.error) {
          this.errorMessage.set(response.error);
        }
      });
    }
  }
}
