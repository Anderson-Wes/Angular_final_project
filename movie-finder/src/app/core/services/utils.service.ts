import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  /**
   * Округляет число вверх (Math.ceil)
   */
  ceil(value: number): number {
    return Math.ceil(value);
  }

  /**
   * Открывает YouTube с трейлером фильма
   */
  openTrailer(title: string) {
    const query = `${title} trailer`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query
    )}`;
    window.open(youtubeUrl, '_blank');
  }
}
