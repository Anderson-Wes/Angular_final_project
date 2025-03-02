import { Component, signal, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { IMovie } from '../../shared/interfaces/interfaces';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';

@Component({
  standalone: true,
  selector: 'app-category',
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);

  movies = signal<IMovie[]>([]);
  category = signal<string>('');
  currentPage = signal<number>(1);
  totalResults = signal<number>(0);

  constructor() {
    effect(() => {
      this.route.paramMap.subscribe((params) => {
        const type = params.get('type');
        const page = Number(params.get('page')) || 1;
        if (type) {
          this.category.set(type);
          this.currentPage.set(page);
          this.movieService
            .searchMoviesByCategory(type, page)
            .subscribe((data) => {
              this.movies.set(data.Search || []);
              this.totalResults.set(Number(data.totalResults) || 0);
            });
        }
      });
    });
  }

  changePage(offset: number) {
    const newPage = this.currentPage() + offset;
    if (newPage < 1 || newPage > Math.ceil(this.totalResults() / 10)) return;

    this.router.navigate(['/category', this.category(), { page: newPage }]);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalResults() / 10);
  }
}
