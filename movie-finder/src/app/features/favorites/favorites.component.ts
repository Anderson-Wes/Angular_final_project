import { Component, signal, inject } from '@angular/core';
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
  private readonly movieService = inject(MovieService);
  private readonly authService = inject(AuthService);

  // Signal to hold the list of favorite movies for the current user
  public favorites = signal<IMovie[]>([]);

  constructor() {
    // Get current user and fetch their favorites if authenticated
    this.authService.getCurrentUser() &&
      this.authService.getCurrentUser()!.id &&
      this.movieService
        .getFavorites(this.authService.getCurrentUser()!.id!)
        .subscribe((movies) => this.favorites.set(movies));
  }

  // Removes a movie from the user's favorites
  public removeFromFavorites(movieId: string): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return; // Do nothing if not authenticated

    // Call MovieService to delete the favorite movie
    this.movieService.removeFromFavorites(userId, movieId).subscribe(() => {
      // Update the signal by filtering out the removed movie
      this.favorites.set(
        this.favorites().filter((movie) => movie.imdbID !== movieId)
      );
    });
  }
}
