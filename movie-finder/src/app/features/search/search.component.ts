import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { IMovie } from '../../shared/interfaces/interfaces';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MovieCardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  private readonly movieService = inject(MovieService);

  searchControl = new FormControl(''); // Input field for search
  public movies = signal<IMovie[]>([]); // Stores search results
  public isSearching = signal<boolean>(false); // Indicates if a search is in progress
  public hasSearched = signal<boolean>(false); // Indicates if a search has been performed

  constructor() {
    // Listen for input changes and perform search automatically
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500), // Wait 500ms before sending request
        distinctUntilChanged(), // Ignore duplicate queries
        switchMap((query) => {
          if (!query?.trim()) {
            this.movies.set([]); // Clear results if input is empty
            this.hasSearched.set(false); // Reset search state
            return [];
          }
          this.isSearching.set(true);
          this.hasSearched.set(true); // Mark that a search has been performed
          return this.movieService.searchMovies(query);
        })
      )
      .subscribe((data) => {
        this.movies.set(data?.Search ?? []);
        this.isSearching.set(false);
      });
  }

  /**
   * Manually triggers search when "Search" button is clicked.
   */
  public performSearch(): void {
    const query = this.searchControl.value?.trim();
    if (!query) {
      this.movies.set([]);
      this.hasSearched.set(false); // Reset search state
      return;
    }

    this.isSearching.set(true);
    this.hasSearched.set(true); // Mark that a search has been performed
    this.movieService.searchMovies(query).subscribe((data) => {
      this.movies.set(data?.Search ?? []);
      this.isSearching.set(false);
    });
  }
}
