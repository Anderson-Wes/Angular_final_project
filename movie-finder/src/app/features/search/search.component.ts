import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { IMovie } from '../../shared/interfaces/interfaces';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { query } from '@angular/animations';

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MovieCardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  private movieService = new MovieService(); //create an instance of `MovieService`

  searchControl = new FormControl('');
  movies = signal<{ Search: IMovie[] } | null>(null); //stores a list of found movies
  movies$ = this.searchControl.valueChanges.pipe(
    distinctUntilChanged(), //the request is sent only if the text has changed
    debounceTime(500),
    switchMap((query) => this.movieService.searchMovies(query ?? '')) //Cancels the previous request if the user continues typing
  );

  constructor() {
    effect(() => {
      this.searchControl.valueChanges.pipe().subscribe((query) => {
        //tracks changes in the input field
        if (query) {
          this.movieService
            .searchMovies(query)
            .subscribe((data) => this.movies.set(data)); //updating the list of found films
        }
      });
    });
  }
}
