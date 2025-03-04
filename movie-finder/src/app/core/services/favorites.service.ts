import { Injectable, inject } from '@angular/core';
import { MovieService } from './movie.service';
import { AuthService } from './auth.service';
import { IMovieDetails } from '../../shared/interfaces/interfaces';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly movieService = inject(MovieService);
  private readonly authService = inject(AuthService);

  /**
   * Проверяем, есть ли у текущего пользователя фильм с данным imdbID в избранном
   */
  public isFavorite(movieId: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of(false);
    }
    return this.movieService
      .getFavorites(user.id!)
      .pipe(
        map((favorites) => favorites.some((fav) => fav.imdbID === movieId))
      );
  }

  /**
   * Добавляем фильм в избранное
   */
  public addToFavorites(movie: IMovieDetails): Observable<void> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of();
    }
    return this.movieService.addToFavorites(user.id!, movie);
  }

  /**
   * Удаляем фильм из избранного
   */
  public removeFromFavorites(movieId: string): Observable<void> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of();
    }
    return this.movieService.removeFromFavorites(user.id!, movieId);
  }
}
