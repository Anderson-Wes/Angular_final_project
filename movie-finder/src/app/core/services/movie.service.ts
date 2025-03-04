import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import {
  IMovie,
  IMovieDetails,
  IReview,
} from '../../shared/interfaces/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiKey = '260d0cc5';
  private readonly apiUrl = 'https://www.omdbapi.com/';

  private readonly baseJsonUrl = environment.apiBaseUrl;
  private readonly favoritesUrl = `${this.baseJsonUrl}/favorites`;
  private readonly reviewsUrl = `${this.baseJsonUrl}/reviews`;

  private readonly http = inject(HttpClient);

  public searchMovies(query: string): Observable<{ Search: IMovie[] }> {
    return this.http.get<{ Search: IMovie[] }>(
      `${this.apiUrl}?s=${query}&apikey=${this.apiKey}`
    );
  }

  public getMovieDetails(movieId: string): Observable<IMovieDetails> {
    return this.http.get<IMovieDetails>(
      `${this.apiUrl}?i=${movieId}&apikey=${this.apiKey}`
    );
  }

  public getFavorites(userId: number): Observable<IMovie[]> {
    return this.http.get<IMovie[]>(`${this.favoritesUrl}?userId=${userId}`);
  }

  public addToFavorites(
    userId: number,
    movie: IMovieDetails
  ): Observable<IMovieDetails> {
    return this.http.post<IMovieDetails>(this.favoritesUrl, {
      ...movie,
      userId,
    });
  }

  public removeFromFavorites(
    userId: number,
    movieId: string
  ): Observable<void> {
    return this.http
      .get<IMovie[]>(`${this.favoritesUrl}?userId=${userId}&imdbID=${movieId}`)
      .pipe(
        switchMap((favorites) => {
          if (favorites.length === 0) {
            return of(undefined);
          }
          const favoriteId = (favorites[0] as any).id;
          return this.http.delete<void>(`${this.favoritesUrl}/${favoriteId}`);
        })
      );
  }

  public getReviews(movieId: string): Observable<IReview[]> {
    return this.http.get<IReview[]>(`${this.reviewsUrl}?movieId=${movieId}`);
  }

  public addReview(
    userId: number,
    nickname: string,
    movieId: string,
    reviewText: string
  ): Observable<IReview> {
    return this.http.post<IReview>(this.reviewsUrl, {
      userId,
      nickname,
      movieId,
      reviewText,
    });
  }

  public deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.reviewsUrl}/${reviewId}`);
  }

  public searchMoviesByCategory(
    category: string,
    page = 1
  ): Observable<{ Search: IMovie[]; totalResults: string }> {
    return this.http.get<{ Search: IMovie[]; totalResults: string }>(
      `${this.apiUrl}?s=${category}&page=${page}&apikey=${this.apiKey}`
    );
  }
}
