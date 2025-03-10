// import { Injectable, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, catchError, map, of, tap } from 'rxjs';
// import { Router } from '@angular/router';
// import { switchMap } from 'rxjs/operators';
// import { IUser } from '../../shared/interfaces/interfaces';

// @Injectable({
//   providedIn: 'root',
// }) //makes the service globaly available
// export class AuthService {
//   private apiUrl = 'http://localhost:3000/users';
//   private currentUser = signal<IUser | null>(null); //to store the current user

//   constructor(private http: HttpClient, private router: Router) {
//     const storedUser = localStorage.getItem('currentUser');
//     if (storedUser) {
//       this.currentUser.set(JSON.parse(storedUser)); //user's state is preserved after a page reload.
//     }
//   }

//   getCurrentUser(): IUser | null {
//     return this.currentUser();
//   } //Returns the currently logged in user (Used in components to check if the user is logged in)

//   register(user: IUser): Observable<{ error?: string }> {
//     return this.http.get<IUser[]>(`${this.apiUrl}?email=${user.email}`).pipe(
//       //Request a list of users with the same email
//       switchMap((users: IUser[]) => {
//         if (users.length > 0) {
//           return of({ error: 'User with this email already exists.' });
//         }
//         return this.http.post<IUser>(this.apiUrl, user).pipe(
//           //If the email is free - Register the user
//           tap((newUser) => {
//             this.currentUser.set(newUser);
//             localStorage.setItem('currentUser', JSON.stringify(newUser)); //Save the user
//             this.router.navigate(['/']);
//           }),
//           map(() => ({}))
//         );
//       }),
//       catchError((error) => {
//         console.error('Registration error:', error);
//         return of({ error: error.message });
//       })
//     );
//   }

//   login(
//     email: string,
//     password: string
//   ): Observable<{ user?: IUser; error?: string }> {
//     return this.http.get<IUser[]>(`${this.apiUrl}?email=${email}`).pipe(
//       //Requesting the user by email
//       map((users) => {
//         if (users.length === 0 || users[0].password !== password) {
//           return { error: 'Invalid email or password.' };
//         }
//         this.currentUser.set(users[0]);
//         localStorage.setItem('currentUser', JSON.stringify(users[0]));
//         this.router.navigate(['/']);
//         return { user: users[0] };
//       }),
//       catchError((error) => {
//         console.error('Login error:', error);
//         return of({ error: error.message });
//       })
//     );
//   }

//   logout(): void {
//     this.currentUser.set(null);
//     localStorage.removeItem('currentUser');
//     this.router.navigate(['/login']);
//   }

//   updateUser(updatedUser: IUser): void {
//     this.currentUser.set(updatedUser);
//     localStorage.setItem('currentUser', JSON.stringify(updatedUser));
//   }
//   getApiUrl(): string {
//     return this.apiUrl;
//   }
// }
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { IUser } from '../../shared/interfaces/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;
  private readonly currentUser = signal<IUser | null>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser) as IUser);
    }
  }

  public getCurrentUser(): IUser | null {
    return this.currentUser();
  }

  public register(user: IUser): Observable<{ error?: string }> {
    return this.http.get<IUser[]>(`${this.apiUrl}?email=${user.email}`).pipe(
      switchMap((users: IUser[]) => {
        if (users.length > 0) {
          return of({ error: 'User with this email already exists.' });
        }
        return this.http.post<IUser>(this.apiUrl, user).pipe(
          tap((newUser: IUser) => {
            this.currentUser.set(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.router.navigate(['/']);
          }),
          map(() => ({}))
        );
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return of({ error: error.message });
      })
    );
  }

  public login(
    email: string,
    password: string
  ): Observable<{ user?: IUser; error?: string }> {
    return this.http.get<IUser[]>(`${this.apiUrl}?email=${email}`).pipe(
      map((users: IUser[]) => {
        if (users.length === 0 || users[0].password !== password) {
          return { error: 'Invalid email or password.' };
        }
        const user = users[0];
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/']);
        return { user };
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return of({ error: error.message });
      })
    );
  }

  public logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  public updateUser(updatedUser: IUser): void {
    this.currentUser.set(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }

  public getApiUrl(): string {
    // Метод, если нужно вызывать где-то ещё
    return this.apiUrl;
  }
}
