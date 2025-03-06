import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { IMovie } from '../../shared/interfaces/interfaces';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';
import { switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-category',
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieService = inject(MovieService);

  public category = signal<string>(''); // Stores the selected movie category
  public currentPage = signal<number>(1); // Stores the current page number
  public totalResults = signal<number>(0); // Total number of movies found
  public movies = signal<IMovie[]>([]); // Holds the list of movies
  public totalPages = signal<number>(1); // Total number of pages
  public pages = signal<Array<number | string>>([]); // Pagination structure with numbers and '...'

  constructor() {
    // Listen for route parameter changes and fetch movies accordingly
    this.route.params
      .pipe(
        switchMap((params) => {
          // Extract 'type' and 'page' from the url parameters
          const type = params['type'] ?? '';
          const page = +(params['page'] ?? 1); // Convert page to a number

          // Update category and current page state
          this.category.set(type);
          this.currentPage.set(page);

          // Fetch movies based on category and page
          return this.movieService.searchMoviesByCategory(type, page);
        })
      )
      .subscribe((data) => {
        // Update movie list and total results
        this.movies.set(data.Search ?? []);
        this.totalResults.set(+data.totalResults || 0);

        // Update pagination logic
        this.updatePagination();
      });
  }

  private updatePagination(): void {
    const total = Math.ceil(this.totalResults() / 10); // Calculate total pages (10 movies per page)
    this.totalPages.set(total);

    const current = this.currentPage();
    const range = 4; // Number of pages to show before/after current page

    // If total pages are small, show all pages
    if (total <= range * 2 + 1) {
      this.pages.set(Array.from({ length: total }, (_, i) => i + 1));
      return;
    }

    // Determine start and end page numbers
    let startPage = Math.max(current - range, 1);
    let endPage = Math.min(current + range, total);

    const result: Array<number | string> = [];

    // Include the first page and '...' if needed
    if (startPage > 1) {
      result.push(1);
      if (startPage > 2) result.push('...');
    }

    // Add pages within the range
    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }

    // Include the last page and '...' if needed
    if (endPage < total) {
      if (endPage < total - 1) result.push('...');
      result.push(total);
    }

    // Update pagination state
    this.pages.set(result);
  }

  public changePage(pageOrAction: 'prev' | 'next' | number): void {
    let newPage = this.currentPage();

    if (pageOrAction === 'prev') {
      newPage = Math.max(newPage - 1, 1); // Ensure page does not go below 1
    } else if (pageOrAction === 'next') {
      newPage = Math.min(newPage + 1, this.totalPages()); // Ensure page does not exceed total pages
    } else {
      newPage = pageOrAction; // Set to the selected page
    }

    // Navigate to the new page
    this.router.navigate(['/category', this.category(), { page: newPage }]);
  }
}
