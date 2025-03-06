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

  public category = signal<string>('');
  public currentPage = signal<number>(1);
  public totalResults = signal<number>(0);
  public movies = signal<IMovie[]>([]);
  public totalPages = signal<number>(1);
  public pages = signal<Array<number | string>>([]);

  constructor() {
    this.route.params.pipe(
      switchMap((params) => {
        const type = params['type'] ?? '';
        const page = +(params['page'] ?? 1);

        this.category.set(type);
        this.currentPage.set(page);

        return this.movieService.searchMoviesByCategory(type, page);
      })
    ).subscribe((data) => {
      this.movies.set(data.Search ?? []);
      this.totalResults.set(+data.totalResults || 0);
      this.updatePagination();
    });
  }

  private updatePagination(): void {
    const total = Math.ceil(this.totalResults() / 10);
    this.totalPages.set(total);

    const current = this.currentPage();
    const range = 4;

    if (total <= range * 2 + 1) {
      this.pages.set(Array.from({ length: total }, (_, i) => i + 1));
      return;
    }

    let startPage = Math.max(current - range, 1);
    let endPage = Math.min(current + range, total);

    const result: Array<number | string> = [];

    if (startPage > 1) {
      result.push(1);
      if (startPage > 2) result.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }

    if (endPage < total) {
      if (endPage < total - 1) result.push('...');
      result.push(total);
    }

    this.pages.set(result);
  }

  public changePage(pageOrAction: 'prev' | 'next' | number): void {
    let newPage = this.currentPage();

    if (pageOrAction === 'prev') {
      newPage = Math.max(newPage - 1, 1);
    } else if (pageOrAction === 'next') {
      newPage = Math.min(newPage + 1, this.totalPages());
    } else {
      newPage = pageOrAction;
    }

    this.router.navigate(['/category', this.category(), { page: newPage }]);
  }
}
