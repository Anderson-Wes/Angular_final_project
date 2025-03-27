**Angular Project "Movie Finder"**

---

## სწრაფი მიმოხილვა

- გამოიყენება Angular 19-ის ახალი შესაძლებლობები (Signals, Standalone)
- დაცული მარშრუტები (Guards)
- რეაქტიული ფორმები და ვალიდაცია
- SCSS სტრუქტურა, რესპონსივი
- მონაცემების მენეჯმენტი localStorage-ით
- რეალური API (OMDb) + Fake-ბაზა (json-server)

| კონცეფცია      | ფაილი                                                | რატომ გამოიყენება                                                         |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| **Bootstrap**  | [`main.ts`](./src/main.ts)                           | API-ის გაშვება `bootstrapApplication`–ით standalone არქიტექტურაში         |
| **Routing**    | [`app.routes.ts`](./src/app/app.routes.ts)           | Lazy loading + დაცული მარშრუტები `AuthGuard` / `AuthReverseGuard`.        |
| **App Layout** | [`app.component.html`](./src/app/app.component.html) | გლობალური კომპონენტები: `<app-navbar>`, `<app-sidebar>`, `router-outlet`. |

---

## აუტენტიფიკაცია

| დანიშნულება                                                          | ფაილი (s)                                                                                                                                                   | როგორ მუშაობს                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Get/set [`currentUser`](./src/app/core/services/auth.service.ts#L15) | [`auth.service.ts`](./src/app/core/services/auth.service.ts)                                                                                                | Signal-ი რომელიც ინახავს ავტორიზებულ მომხმარებელს, ასევე იყენებს `localStorage`-ს                                                                                                                                                                                              |
| Auth Guard                                                           | [`auth.guard.ts`](./src/app/core/guards/auth.guard.ts)                                                                                                      | არ აძლევს შესვლის / რეგისტრაციის წვდომას, თუ მომხმარებელი უკვე ავტორიზებულია [`currentUser`](./src/app/core/services/auth.service.ts#L15).                                                                                                                                     |
| Reverse Guard                                                        | [`auth-reverse.guard.ts`](./src/app/core/guards/auth-reverse.guard.ts)                                                                                      | არ აძლევს `/login` / `/register` / [`currentUser`](./src/app/core/services/auth.service.ts#L15) წვდომას, თუ მომხმარებელი უკვე ავტორიზებულია.                                                                                                                                   |
| Login/Register                                                       | [`login.component.ts`](./src/app/features/auth/login/login.component.ts), [`register.component.ts`](./src/app/features/auth/register/register.component.ts) | [`form`](./src/app/features/auth/login/login.component.ts#L17), [`isValid`](./src/app/features/auth/login/login.component.ts#L23), [`errorMessage`](./src/app/features/auth/login/login.component.ts#L24). Reactive Forms + ვალიდაცია, ელ.ფოსტის, პაროლის, checkbox-ის ჩათვლით |

---

- ყველა გვერდი იტვირთება lazy-loading-ით
- მხოლოდ სტუმრებისთვის: /login, /register

## Routing სისტემა

```ts
{ path: 'profile', loadComponent: () => import(...), canActivate: [AuthGuard] }
```

- **Lazy loading** ყველა როუტისთვის
- `/profile`, `/favorites` დაცულია
- `/login`, `/register` შეზღუდულია, თუ მომხმარებელი ავტორიზებულია

---

## ფილმები

| ფუნქცია         | ფაილი                                                                                       | აღწერა                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ძიება**       | [`search.component.ts`](./src/app/features/search/search.component.ts)                      | [`searchControl`](../src/app/features/search/search.component.ts#L10), [`movies`](./src/app/features/search/search.component.ts#L11), [`isSearching`](./src/app/features/search/search.component.ts#L12) — ავტომატური ძიება debounce-ით.                                         |
| **დეტალები**    | [`movie-details.component.ts`](./src/app/features/movie-details/movie-details.component.ts) | [`movie`](./src/app/features/movie-details/movie-details.component.ts#L17), [`isFavorite`](./src/app/features/movie-details/movie-details.component.ts#L20), [`submitReview()`](./src/app/features/movie-details/movie-details.component.ts#L89) — დეტალური გვერდი + მიმოხილვები |
| **რჩეულები**    | [`favorites.component.ts`](./src/app/features/favorites/favorites.component.ts)             | [`favorites`](./src/app/features/favorites/favorites.component.ts#L12), იღებს მონაცემებს userId–ის მიხედვით.                                                                                                                                                                     |
| **კომენტარები** | [`movie-details.component.ts`](./src/app/features/movie-details/movie-details.component.ts) | [`reviewForm`](./src/app/features/movie-details/movie-details.component.ts#L23), [`reviews`](./src/app/features/movie-details/movie-details.component.ts#L18) ამატებს და აჩვენებს კომენტარებს.                                                                                   |

---

## რეაქტიული ფორმები

| ფუნქცია          | ფაილი                                                                                                                                                       | შენიშვნა                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login / Register | [`login.component.ts`](./src/app/features/auth/login/login.component.ts), [`register.component.ts`](./src/app/features/auth/register/register.component.ts) | `Validators`: ელ.ფოსტა, პაროლი, checkbox.                                                                                                                                       |
| პროფილი          | [`profile.component.ts`](./src/app/features/profile/profile.component.ts)                                                                                   | [`profileForm`](./src/app/features/profile/profile.component.ts#L19)-ის განახლება.                                                                                              |
| პაროლის შეცვლა   | [`profile.component.ts`](./src/app/features/profile/profile.component.ts)                                                                                   | [`passwordForm`](./src/app/features/profile/profile.component.ts#L27), [`changePassword()`](./src/app/features/profile/profile.component.ts#L71). ადარებს და ამოწმებს პაროლებს. |

---

## საერთო კომპონენტები

| კომპონენტი           | ფაილი                                                                                       | დანიშნულება                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MovieCardComponent` | [`movie-card.component.ts`](./src/app/shared/components/movie-card/movie-card.component.ts) | აჩვენებს პოსტერს, სათაურს, წელს `movie/:id`.                                                                                                                                                                                                     |
| `NavbarComponent`    | [`navbar.component.ts`](./src/app/shared/components/navbar/navbar.component.ts)             | [`toggleDropdown()`](./src/app/shared/components/navbar/navbar.component.ts#L17), [`isDropdownOpen`](./src/app/shared/components/navbar/navbar.component.ts#L12). აჩვენებს „Favorites/Profile“ თუ ავტორიზებულია, ან „Login/Register“ თუ სტუმარია |
| `SidebarComponent`   | [`sidebar.component.ts`](./src/app/shared/components/sidebar/sidebar.component.ts)          | კატეგორიების ნავიგაცია (ფილმები, სერიალები და ა.შ.).                                                                                                                                                                                             |

---

## API და სერვისები

| სერვისი        | ფაილი                                                          | დანიშნულება                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MovieService` | [`movie.service.ts`](./src/app/core/services/movie.service.ts) | `searchMovies`, `getMovieDetails`, `getFavorites`, [`addReview()`](./src/app/core/services/movie.service.ts#L85).                                                                |
| `AuthService`  | [`auth.service.ts`](./src/app/core/services/auth.service.ts)   | [`login()`](./src/app/core/services/auth.service.ts#L36), [`register()`](./src/app/core/services/auth.service.ts#L21), [`logout()`](./src/app/core/services/auth.service.ts#L51) |

---

## კონფიგურაცია და გარემო

| ფაილი                                                 | დანიშნულება                        |
| ----------------------------------------------------- | ---------------------------------- |
| [`environment.ts`](./src/environments/environment.ts) | API URL-ები, OMDb API Key.         |
| [`angular.json`](./angular.json)                      | სტილები, SCSS                      |
| [`db.json`](./db.json)                                | Fake-მონაცემები json-server–ისთვის |

---

## პროექტის გაშვება

npm install
npx json-server --watch db.json --port 3000
ng serve
