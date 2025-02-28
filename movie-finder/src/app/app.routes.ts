import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthReverseGuard } from './core/guards/auth-reverse.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/search/search.component').then(
        (m) => m.SearchComponent
      ),
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./features/movie-details/movie-details.component').then(
        (m) => m.MovieDetailsComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [AuthReverseGuard], // 🔒 Запрещаем вход для авторизованных пользователей
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [AuthReverseGuard], // 🔒 Запрещаем вход для авторизованных пользователей
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard], // 🔒 Доступ только для авторизованных пользователей
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (m) => m.FavoritesComponent
      ),
    canActivate: [AuthGuard], // 🔒 Доступ только для авторизованных пользователей
  },
  {
    path: '**',
    redirectTo: '',
  },
];
