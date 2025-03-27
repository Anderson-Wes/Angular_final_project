**Movie Finder**

---

## Main Concepts (Quick Overview)

| Concept        | File(s)                                              | Why It’s Used                                                                |
| -------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Bootstrap**  | [`main.ts`](./src/main.ts)                           | Starts app using `bootstrapApplication` with standalone architecture.        |
| **Routing**    | [`app.routes.ts`](./src/app/app.routes.ts)           | Lazy loads components, protects routes via `AuthGuard` / `AuthReverseGuard`. |
| **App Layout** | [`app.component.html`](./src/app/app.component.html) | Renders `<app-navbar>`, `<app-sidebar>`, and `router-outlet`.                |

---

## Authentication

| Purpose                                                              | File(s)                                                                                                                                                     | How                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Get/set [`currentUser`](./src/app/core/services/auth.service.ts#L15) | [`auth.service.ts`](./src/app/core/services/auth.service.ts)                                                                                                | Signal to store logged-in user across app. Uses `localStorage` for persistence.                                                                                                                                                                 |
| Auth Guard                                                           | [`auth.guard.ts`](./src/app/core/guards/auth.guard.ts)                                                                                                      | Checks if [`currentUser`](./src/app/core/services/auth.service.ts#L15) exists before route access.                                                                                                                                              |
| Reverse Guard                                                        | [`auth-reverse.guard.ts`](./src/app/core/guards/auth-reverse.guard.ts)                                                                                      | Prevents navigation to `/login` or `/register` if [`currentUser`](./src/app/core/services/auth.service.ts#L15) is set.                                                                                                                          |
| Login/Register                                                       | [`login.component.ts`](./src/app/features/auth/login/login.component.ts), [`register.component.ts`](./src/app/features/auth/register/register.component.ts) | Use [`form`](./src/app/features/auth/login/login.component.ts#L17), [`isValid`](./src/app/features/auth/login/login.component.ts#L23), [`errorMessage`](./src/app/features/auth/login/login.component.ts#L24). Reactive forms with validations. |

---

## Routing System

```ts
{ path: 'profile', loadComponent: () => import(...), canActivate: [AuthGuard] }
```

- **Lazy loading** used for all routes
- `/profile`, `/favorites` protected
- `/login`, `/register` restricted if user is logged in

---

## Movie Flow

| Feature           | File(s)                                                                                     | Explanation                                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search**        | [`search.component.ts`](./src/app/features/search/search.component.ts)                      | Uses [`searchControl`](../src/app/features/search/search.component.ts#L10), [`movies`](./src/app/features/search/search.component.ts#L11), [`isSearching`](./src/app/features/search/search.component.ts#L12). Debounced search via OMDb API.                                                         |
| **Movie Details** | [`movie-details.component.ts`](./src/app/features/movie-details/movie-details.component.ts) | Uses [`movie`](./src/app/features/movie-details/movie-details.component.ts#L17), [`isFavorite`](./src/app/features/movie-details/movie-details.component.ts#L20), [`submitReview()`](./src/app/features/movie-details/movie-details.component.ts#L89). Shows full data, allows favorites and reviews. |
| **Favorites**     | [`favorites.component.ts`](./src/app/features/favorites/favorites.component.ts)             | Uses [`favorites`](./src/app/features/favorites/favorites.component.ts#L12), loaded by userId, allows removal.                                                                                                                                                                                        |
| **Add Review**    | [`movie-details.component.ts`](./src/app/features/movie-details/movie-details.component.ts) | Uses [`reviewForm`](./src/app/features/movie-details/movie-details.component.ts#L23), signal [`reviews`](./src/app/features/movie-details/movie-details.component.ts#L18).                                                                                                                            |

---

## Reactive Forms

| Feature          | Files                                                                                                                                                       | Notes                                                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login / Register | [`login.component.ts`](./src/app/features/auth/login/login.component.ts), [`register.component.ts`](./src/app/features/auth/register/register.component.ts) | Uses [`form`](./src/app/features/auth/login/login.component.ts#L17), `Validators`, pattern rules.                                                                                        |
| Profile Update   | [`profile.component.ts`](./src/app/features/profile/profile.component.ts)                                                                                   | Uses [`profileForm`](./src/app/features/profile/profile.component.ts#L19), updates user with PUT request.                                                                                |
| Change Password  | [`profile.component.ts`](./src/app/features/profile/profile.component.ts)                                                                                   | Uses [`passwordForm`](./src/app/features/profile/profile.component.ts#L27), [`changePassword()`](./src/app/features/profile/profile.component.ts#L71). Compares and validates passwords. |

---

## Shared Components

| Component            | File                                                                                        | Purpose                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MovieCardComponent` | [`movie-card.component.ts`](./src/app/shared/components/movie-card/movie-card.component.ts) | Displays poster, title, year. Wraps link to `movie/:id`.                                                                                                                                                   |
| `NavbarComponent`    | [`navbar.component.ts`](./src/app/shared/components/navbar/navbar.component.ts)             | Uses [`toggleDropdown()`](./src/app/shared/components/navbar/navbar.component.ts#L17), [`isDropdownOpen`](./src/app/shared/components/navbar/navbar.component.ts#L12). Shows different UI for auth states. |
| `SidebarComponent`   | [`sidebar.component.ts`](./src/app/shared/components/sidebar/sidebar.component.ts)          | Static category navigation (Movies, Series, etc).                                                                                                                                                          |

---

## API & Services

| Service        | File                                                           | Responsibility                                                                                                                                                                                         |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MovieService` | [`movie.service.ts`](./src/app/core/services/movie.service.ts) | `searchMovies`, `getMovieDetails`, `getFavorites`, [`addReview()`](./src/app/core/services/movie.service.ts#L85).                                                                                      |
| `AuthService`  | [`auth.service.ts`](./src/app/core/services/auth.service.ts)   | [`login()`](./src/app/core/services/auth.service.ts#L36), [`register()`](./src/app/core/services/auth.service.ts#L21), [`logout()`](./src/app/core/services/auth.service.ts#L51), manages user signal. |

---

## Config & Environment

| File                                                  | Purpose                                           |
| ----------------------------------------------------- | ------------------------------------------------- |
| [`environment.ts`](./src/environments/environment.ts) | Stores API keys and base URLs.                    |
| [`angular.json`](./angular.json)                      | Project config: SCSS, styles, test/build targets. |
| [`db.json`](./db.json)                                | Fake database: users, favorites, reviews.         |

---

## Tips for Defense

- Use [`signal()`](https://angular.io/guide/signals) instead of `BehaviorSubject` — more concise, native to Angular.
- Standalone components eliminate need for `NgModule`, improve modularity.
- Lazy loading + guards = better UX and secure access control.
- Reviews and favorites are filtered by `userId` from [`currentUser`](./src/app/core/services/auth.service.ts#L15).
- Project is **fully typed** — no `any`, all models defined in [`interfaces.ts`](./src/app/shared/interfaces/interfaces.ts).
