import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMovie, IMovieDetails } from '../../shared/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiKey = '260d0cc5';
  private readonly apiUrl = 'https://www.omdbapi.com/';
  private readonly favoritesUrl = 'http://localhost:4000/favorites';

  private http = inject(HttpClient);

  searchMovies(query: string): Observable<{ Search: IMovie[] }> {
    return this.http.get<{ Search: IMovie[] }>(
      `${this.apiUrl}?s=${query}&apikey=${this.apiKey}`
    );
  }

  getMovieDetails(movieId: string): Observable<IMovieDetails> {
    return this.http.get<IMovieDetails>(
      `${this.apiUrl}?i=${movieId}&apikey=${this.apiKey}`
    );
  }

  getFavorites(userId: number): Observable<IMovie[]> {
    return this.http.get<IMovie[]>(`${this.favoritesUrl}?userId=${userId}`);
  }

  addToFavorites(
    userId: number,
    movie: IMovieDetails
  ): Observable<IMovieDetails> {
    console.log(`Adding movie to favorites:`, movie);

    return this.http.post<IMovieDetails>('http://localhost:4000/favorites', {
      ...movie,
      userId,
    });
  }

  removeFromFavorites(userId: number, movieId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.favoritesUrl}?userId=${userId}&imdbID=${movieId}`
    );
  }
}
