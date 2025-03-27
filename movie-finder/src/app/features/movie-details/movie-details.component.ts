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

  // Signals
  movie = signal<IMovieDetails | null>(null);
  reviews = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  isFavorite = signal<boolean>(false); // Whether movie is in user's favorites

  // Reactive form for submitting reviews
  reviewForm = this.fb.group({
    reviewText: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor() {
    // Run this effect once component is created
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id'); // Get movie ID from URL
      const user = this.authService.getCurrentUser(); // Get current user

      if (id) {
        // Fetch movie details
        this.movieService.getMovieDetails(id).subscribe((data) => {
          this.movie.set(data); // Save movie data
          this.isLoading.set(false); // Turn off loading indicator

          // Fetch reviews for this movie
          this.movieService.getReviews(id).subscribe((reviews) => {
            this.reviews.set(reviews);
          });

          // If user is logged in, check if this movie is already in favorites
          if (user) {
            this.movieService.getFavorites(user.id!).subscribe((favorites) => {
              this.isFavorite.set(favorites.some((fav) => fav.imdbID === id));
            });
          }
        });
      }
    });
  }

  // Toggle movie as favorite / unfavorite
  toggleFavorite() {
    const user = this.authService.getCurrentUser();
    if (!user || !this.movie()) return;

    if (this.isFavorite()) {
      // Remove from favorites
      this.movieService
        .removeFromFavorites(user.id!, this.movie()!.imdbID)
        .subscribe(() => {
          this.isFavorite.set(false);
        });
    } else {
      // Add to favorites
      this.movieService
        .addToFavorites(user.id!, this.movie()!)
        .subscribe(() => {
          this.isFavorite.set(true);
        });
    }
  }

  // Open YouTube trailer search for this movie
  openTrailer(title: string) {
    const query = `${title} trailer`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query
    )}`;
    window.open(youtubeUrl, '_blank');
  }

  // Submit a new review
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
        this.reviews.set([...this.reviews(), review]); // Add new review to list
        this.reviewForm.reset(); // Clear form
      });
  }

  // Allow a user to delete only their own review
  deleteReview(reviewId: number, userId: number) {
    const user = this.authService.getCurrentUser();
    if (user && user.id === userId) {
      this.movieService.deleteReview(reviewId).subscribe(() => {
        // Remove review from local signal
        this.reviews.set(this.reviews().filter((r) => r.id !== reviewId));
      });
    }
  }
}
