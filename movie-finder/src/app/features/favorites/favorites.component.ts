import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { AuthService } from '../../core/services/auth.service';
import { IMovie } from '../../shared/interfaces/interfaces';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';

@Component({
  standalone: true,
  selector: 'app-favorites',
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent {
  private movieService: MovieService; //connecting `MovieService` to work with selected movies
  private authService: AuthService; //connect `AuthService` to get the current user

  favorites = signal<IMovie[]>([]); //stores a list of the current user's favorite movies

  constructor(movieService: MovieService, authService: AuthService) {
    this.movieService = movieService;
    this.authService = authService;

    //effect() to update the list when the user changes.
    effect(() => {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.movieService.getFavorites(user.id!).subscribe((movies) => {
          this.favorites.set(
            //When the data changes, updates the interface.
            movies.filter((movie) => movie.userId === user.id)
          );
        });
      }
    });
  }
  removeFromFavorites(movieId: string) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.movieService.removeFromFavorites(user.id!, movieId).subscribe(() => {
        this.favorites.set(
          this.favorites().filter((movie) => movie.imdbID !== movieId)
        );
      });
    }
  }
}
