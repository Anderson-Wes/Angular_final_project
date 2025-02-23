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

  constructor(
    route: ActivatedRoute,
    movieService: MovieService,
    authService: AuthService
  ) {
    this.route = route;
    this.movieService = movieService;
    this.authService = authService;

    effect(() => {
      const id = this.route.snapshot.paramMap.get('id'); //Get movie id from URL
      if (id) {
        this.movieService.getMovieDetails(id).subscribe((data) => {
          //send a request
          console.log('Movie data loaded:', data);
          this.movie.set(data);
          this.isLoading.set(false);
        });
      }
    });
  }

  addToFavorites() {
    const user = this.authService.getCurrentUser();
    const movie = this.movie();

    console.log('User:', user); // Checking if there is a user
    console.log('Movie:', movie); // Checking if there is any data about the film

    if (user && movie) {
      this.movieService.addToFavorites(user.id!, movie).subscribe(
        () => {
          console.log('Movie added to favorites');
        },
        (error) => {
          console.error('Error adding movie to favorites:', error);
        }
      );
    } else {
      console.warn('User is not logged in or movie is null');
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
