import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';
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
    return this.http
      .get<any[]>(`${this.favoritesUrl}?userId=${userId}&imdbID=${movieId}`)
      .pipe(
        switchMap((favorites) => {
          if (favorites.length === 0) {
            return of();
          }
          const favoriteId = favorites[0].id;
          return this.http.delete<void>(`${this.favoritesUrl}/${favoriteId}`);
        })
      );
  }

  getReviews(movieId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `http://localhost:4000/reviews?movieId=${movieId}`
    );
  }

  addReview(
    userId: number,
    nickname: string,
    movieId: string,
    reviewText: string
  ): Observable<any> {
    return this.http.post<any>('http://localhost:4000/reviews', {
      userId,
      nickname,
      movieId,
      reviewText,
    });
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:4000/reviews/${reviewId}`);
  }
}
