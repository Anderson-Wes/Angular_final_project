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
  // Base URL for the users endpoint
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;
  // Signal to hold the current authenticated user
  private readonly currentUser = signal<IUser | null>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser) as IUser);
    }
  }

  // Returns the currently authenticated user
  public getCurrentUser(): IUser | null {
    return this.currentUser();
  }
  // Registers a new user
  public register(user: IUser): Observable<{ error?: string }> {
    // First check if user with given email already exists
    return this.http.get<IUser[]>(`${this.apiUrl}?email=${user.email}`).pipe(
      switchMap((users: IUser[]) => {
        if (users.length > 0) {
          // Return error if email is already registered
          return of({ error: 'User with this email already exists.' });
        }
        // If email is unique, register the user via POST request
        return this.http.post<IUser>(this.apiUrl, user).pipe(
          tap((newUser: IUser) => {
            // Set current user after successful registration
            this.currentUser.set(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.router.navigate(['/']); // Redirect to home
          }),
          map(() => ({})) // Return empty success response
        );
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return of({ error: error.message }); // Return error if registration fails
      })
    );
  }

  // Logs in a user with email and password
  public login(
    email: string,
    password: string
  ): Observable<{ user?: IUser; error?: string }> {
    return this.http.get<IUser[]>(`${this.apiUrl}?email=${email}`).pipe(
      map((users: IUser[]) => {
        // If user not found or password mismatch
        if (users.length === 0 || users[0].password !== password) {
          return { error: 'Invalid email or password.' };
        }
        // Login successful, set user
        const user = users[0];
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/']);
        return { user };
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return of({ error: error.message }); // Return error object
      })
    );
  }

  // Logs the user out
  public logout(): void {
    this.currentUser.set(null); // Clear user signal
    localStorage.removeItem('currentUser'); // Remove from storage
    this.router.navigate(['/login']); // Redirect to login
  }

  // Updates user information in memory and localStorage
  public updateUser(updatedUser: IUser): void {
    this.currentUser.set(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }

  // Returns the base URL of the user API
  public getApiUrl(): string {
    return this.apiUrl;
  }
}
