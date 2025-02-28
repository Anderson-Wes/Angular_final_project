import { Component, signal, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { AuthService } from '../../core/services/auth.service';
import { IMovieDetails } from '../../shared/interfaces/interfaces';

@Component({
  standalone: true,
  selector: 'app-movie-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent {
  private route = inject(ActivatedRoute);
  public movieService = inject(MovieService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);

  movie = signal<IMovieDetails | null>(null);
  reviews = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  isFavorite = signal<boolean>(false);

  reviewForm = this.fb.group({
    reviewText: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      const user = this.authService.getCurrentUser();
      if (id) {
        this.movieService.getMovieDetails(id).subscribe((data) => {
          this.movie.set(data);
          this.isLoading.set(false);

          this.movieService.getReviews(id).subscribe((reviews) => {
            this.reviews.set(reviews);
          });

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

  submitReview() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const newReview = {
      userId: user.id!,
      nickname: user.fullName,
      movieId: this.movie()?.imdbID!,
      reviewText: this.reviewForm.value.reviewText as string,
    };

    this.movieService
      .addReview(
        user.id!,
        user.fullName,
        this.movie()?.imdbID!,
        newReview.reviewText
      )
      .subscribe((review) => {
        this.reviews.set([...this.reviews(), review]);
        this.reviewForm.reset();
      });
  }

  deleteReview(reviewId: number, userId: number) {
    const user = this.authService.getCurrentUser();
    if (user && user.id === userId) {
      this.movieService.deleteReview(reviewId).subscribe(() => {
        this.reviews.set(this.reviews().filter((r) => r.id !== reviewId));
      });
    }
  }
}
