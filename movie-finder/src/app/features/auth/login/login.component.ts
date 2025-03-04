// import { Component, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormsModule,
//   ReactiveFormsModule,
//   FormBuilder,
//   Validators,
// } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//   standalone: true,
//   selector: 'app-login',
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss'],
// })
// export class LoginComponent {
//   private fb = new FormBuilder();
//   private authService: AuthService;

//   form = this.fb.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(8)]],
//   });

//   isValid = signal(false); //stores the validity state of forms
//   errorMessage = signal<string | null>(null);

//   constructor(authService: AuthService) {
//     this.authService = authService;

//     this.form.statusChanges.subscribe(() => {
//       this.isValid.set(this.form.valid); //when the form becomes valid, we update it
//     });
//   } //to control disabled on the "Login" button.

//   login() {
//     if (this.form.valid) {
//       const email = this.form.value.email as string;
//       const password = this.form.value.password as string;

//       this.authService.login(email, password).subscribe((response) => {
//         if (response.error) {
//           this.errorMessage.set(response.error);
//         }
//       });
//     }
//   }
// }

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
    // Следим за изменениями статуса формы и сигнализируем о валидности
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
