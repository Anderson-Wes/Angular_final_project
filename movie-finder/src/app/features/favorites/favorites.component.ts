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

  public favorites = signal<IMovie[]>([]);

  constructor() {
    this.authService.getCurrentUser() &&
      this.authService.getCurrentUser()!.id &&
      this.movieService
        .getFavorites(this.authService.getCurrentUser()!.id!)
        .subscribe((movies) => this.favorites.set(movies));
  }

  public removeFromFavorites(movieId: string): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    this.movieService.removeFromFavorites(userId, movieId).subscribe(() => {
      this.favorites.set(this.favorites().filter((movie) => movie.imdbID !== movieId));
    });
  }
}
