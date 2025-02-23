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
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = new FormBuilder();
  private authService: AuthService;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern('^[A-Za-z]+$')]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'),
      ],
    ],
    confirmPassword: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
  });

  isValid = signal(false); //Used to control disabled on the "register" button.
  errorMessage = signal<string | null>(null); //if email is already registered

  constructor(authService: AuthService) {
    this.authService = authService;

    this.form.statusChanges.subscribe(() => {
      this.isValid.set(this.form.valid);
    });
  }

  register() {
    console.log('Register button clicked');

    if (this.form.valid) {
      console.log('Form is valid:', this.form.value);

      const fullName = this.form.value.fullName as string;
      const email = this.form.value.email as string;
      const password = this.form.value.password as string;

      this.authService
        .register({ fullName, email, password }) //Sending data to AuthService
        .subscribe((response) => {
          console.log('Server response:', response); //Logging the response from the server
          if (response.error) {
            this.errorMessage.set(response.error);
          }
        });
    } else {
      console.log('Form is not valid:', this.form.errors); //If the form is invalid, we log errors
    }
  }
}
