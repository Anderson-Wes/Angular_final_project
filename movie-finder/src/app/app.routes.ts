import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthReverseGuard } from './core/guards/auth-reverse.guard';

export const routes: Routes = [
  {
    path: '', // Default route (home page)
    loadComponent: () =>
      import('./features/search/search.component').then(
        (m) => m.SearchComponent
      ), // Lazy-load the SearchComponent
  },
  {
    path: 'category/:type', // Dynamic category route (e.g. /category/Movies)
    loadComponent: () =>
      import('./features/category/category.component').then(
        (m) => m.CategoryComponent
      ),
  },
  {
    path: 'movie/:id', // Dynamic route for movie details
    loadComponent: () =>
      import('./features/movie-details/movie-details.component').then(
        (m) => m.MovieDetailsComponent
      ),
  },
  {
    path: 'login', // Login route
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [AuthReverseGuard], // Only accessible if NOT logged in
  },
  {
    path: 'register', // Registration route
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [AuthReverseGuard], // Only accessible if NOT logged in
  },
  {
    path: 'profile', // User profile page
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard], // Only accessible if logged in
  },
  {
    path: 'favorites', // User's favorite movies
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (m) => m.FavoritesComponent
      ),
    canActivate: [AuthGuard], // Only accessible if logged in
  },
  {
    path: '**', // Wildcard: catch-all route for unknown paths
    redirectTo: '', // Redirects to home/search page
  },
];
