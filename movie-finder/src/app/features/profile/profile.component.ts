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

  // Сигналы
  public user = signal<IUser | null>(null);
  public isEditing = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  // Форма для обновления имени и email (без this в типе)
  public profileForm = this.fb.group({
    fullName: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.pattern('^[A-Za-zА-Яа-я ]+$'),
      ],
    }),
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  // Форма для смены пароля (без this в типе)
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
    // Отслеживаем изменения текущего пользователя
    effect(() => {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.user.set(currentUser);
        // Заполняем форму профиля
        this.profileForm.patchValue({
          fullName: currentUser.fullName,
          email: currentUser.email,
        });
      }
    });
  }

  // Переключение режима редактирования профиля
  public toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
  }

  // Сохраняем изменения профиля (имя и email)
  public saveProfileChanges(): void {
    if (!this.user()) {
      return;
    }

    const updatedUser: IUser = {
      ...this.user()!,
      fullName: this.profileForm.value.fullName || '',
      email: this.profileForm.value.email || '',
    };

    // Проверяем, не занята ли почта другим пользователем
    this.http
      .get<IUser[]>(
        `${environment.apiBaseUrl}/users?email=${updatedUser.email}`
      )
      .subscribe((users) => {
        // Если есть другой пользователь с таким email
        if (users.length > 0 && users[0].id !== updatedUser.id) {
          this.errorMessage.set(
            'This email is already in use. Please use a different one.'
          );
          return;
        }

        // Обновляем пользователя на сервере
        this.http
          .put<IUser>(
            `${environment.apiBaseUrl}/users/${updatedUser.id}`,
            updatedUser
          )
          .subscribe(() => {
            // Обновляем локальное состояние
            this.user.set(updatedUser);
            this.authService.updateUser(updatedUser);
            this.isEditing.set(false);
            this.errorMessage.set(null);
          });
      });
  }

  // Смена пароля
  public changePassword(): void {
    if (!this.user()) {
      return;
    }

    const currentUser = this.user()!;
    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.getRawValue();

    // Проверяем, что введён корректный текущий пароль
    if (currentUser.password !== currentPassword) {
      this.errorMessage.set('Current password is incorrect.');
      return;
    }

    // Проверяем совпадение новых паролей
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    // Проверяем валидаторы (мин. длина, большая буква и цифра)
    if (!this.passwordForm.controls.newPassword.valid) {
      this.errorMessage.set(
        'Password must be at least 8 characters long, include a digit and an uppercase letter.'
      );
      return;
    }

    // Формируем обновлённый объект пользователя
    const updatedUser: IUser = {
      ...currentUser,
      password: newPassword,
    };

    // Запрос на обновление пользователя
    this.http
      .put<IUser>(
        `${environment.apiBaseUrl}/users/${updatedUser.id}`,
        updatedUser
      )
      .subscribe(() => {
        // Обновляем состояние
        this.user.set(updatedUser);
        this.authService.updateUser(updatedUser);
        this.errorMessage.set(null);

        // Сбрасываем поля паролей
        this.passwordForm.reset();
      });
  }
}
