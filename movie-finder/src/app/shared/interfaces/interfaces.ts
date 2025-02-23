export interface IMovie {
  Title: string;
  Year: string;
  Poster: string;
  imdbID: string;
  userId?: number;
}

export interface IRating {
  Source: string;
  Value: string;
}

export interface IMovieDetails extends IMovie {
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Ratings: IRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  BoxOffice: string;
  Production: string;
}

export interface IUser {
  id?: number;
  fullName: string;
  email: string;
  password: string;
}
