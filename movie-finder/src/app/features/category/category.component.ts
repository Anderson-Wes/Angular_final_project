import { Component, computed, effect, inject, signal } from '@angular/core';
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieService = inject(MovieService);

  // Сигналы
  public category = signal<string>('');
  public currentPage = signal<number>(1);
  public totalResults = signal<number>(0);
  public movies = signal<IMovie[]>([]);

  constructor() {
    // Следим за изменением параметров (type, page) и запрашиваем данные
    effect(() => {
      this.route.paramMap.subscribe((params) => {
        const type = params.get('type') ?? '';
        const page = +(params.get('page') ?? 1);

        this.category.set(type);
        this.currentPage.set(page);

        // Запрашиваем фильмы
        this.movieService
          .searchMoviesByCategory(type, page)
          .subscribe((data) => {
            this.movies.set(data.Search ?? []);
            this.totalResults.set(+data.totalResults || 0);
          });
      });
    });
  }

  /**
   * Общее кол-во страниц (1 страница = 10 фильмов)
   */
  public totalPages = computed(() => {
    return Math.ceil(this.totalResults() / 10);
  });

  /**
   * Массив страниц (с многоточиями), ±4 страницы от текущей
   */
  public pages = computed<Array<number | string>>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const range = 4;

    // Если всего страниц <= 9, выводим все
    if (total <= range * 2 + 1) {
      const all: number[] = [];
      for (let i = 1; i <= total; i++) all.push(i);
      return all;
    }

    // Окно вокруг текущей страницы
    let startPage = current - range;
    let endPage = current + range;

    if (startPage < 1) startPage = 1;
    if (endPage > total) endPage = total;

    const result: Array<number | string> = [];

    // Если начало > 1, добавляем 1 и '...'
    if (startPage > 1) {
      result.push(1);
      if (startPage > 2) {
        result.push('...');
      }
    }

    // Добавляем диапазон [startPage..endPage]
    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }

    // Если конец < total, добавляем '...' и total
    if (endPage < total) {
      if (endPage < total - 1) {
        result.push('...');
      }
      result.push(total);
    }

    return result;
  });

  /**
   * Смена страницы
   * @param pageOrAction 'prev' | 'next' | конкретный номер
   */
  public changePage(pageOrAction: 'prev' | 'next' | number): void {
    let newPage = this.currentPage();

    if (pageOrAction === 'prev') {
      newPage--;
    } else if (pageOrAction === 'next') {
      newPage++;
    } else {
      // Если пришло число, переходим на него
      newPage = pageOrAction;
    }

    if (newPage < 1) newPage = 1;
    if (newPage > this.totalPages()) newPage = this.totalPages();

    this.router.navigate(['/category', this.category(), { page: newPage }]);
  }
}
