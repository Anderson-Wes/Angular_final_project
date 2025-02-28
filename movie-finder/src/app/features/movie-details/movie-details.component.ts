import { Component, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { AuthService } from '../../core/services/auth.service';
import { IMovieDetails } from '../../shared/interfaces/interfaces';

@Component({
  standalone: true,
  selector: 'app-movie-details',
  imports: [CommonModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent {
  private route: ActivatedRoute;
  private movieService: MovieService;
  private authService: AuthService;

  movie = signal<IMovieDetails | null>(null);
  isLoading = signal<boolean>(true);
  isFavorite = signal<boolean>(false);

  constructor(
    route: ActivatedRoute,
    movieService: MovieService,
    authService: AuthService
  ) {
    this.route = route;
    this.movieService = movieService;
    this.authService = authService;

    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      const user = this.authService.getCurrentUser();
      if (id) {
        this.movieService.getMovieDetails(id).subscribe((data) => {
          this.movie.set(data);
          this.isLoading.set(false);

          if (user) {
            this.movieService.getFavorites(user.id!).subscribe((favorites) => {
              this.isFavorite.set(favorites.some((fav) => fav.imdbID === id));
            });
          }
        });
      }
    });
  }

  toggleFavorite() {
    const user = this.authService.getCurrentUser();
    if (!user || !this.movie()) return;

    if (this.isFavorite()) {
      this.movieService
        .removeFromFavorites(user.id!, this.movie()!.imdbID)
        .subscribe(() => {
          this.isFavorite.set(false);
        });
    } else {
      this.movieService
        .addToFavorites(user.id!, this.movie()!)
        .subscribe(() => {
          this.isFavorite.set(true);
        });
    }
  }
  openTrailer(title: string) {
    const query = `${title} trailer`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query
    )}`;
    window.open(youtubeUrl, '_blank');
  }
}
