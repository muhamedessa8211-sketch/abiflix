
export enum ContentType {
  Single = 'Single',
  Series = 'Series'
}

export enum Country {
  India = 'India',
  Korea = 'Korea',
  America = 'America',
  China = 'China',
  Turkey = 'Turkey'
}

export enum Genre {
  Action = 'Action',
  Comedy = 'Comedy',
  Drama = 'Drama',
  SciFi = 'Sci-Fi',
  Horror = 'Horror',
  Romance = 'Romance',
  Documentary = 'Documentary',
  Thriller = 'Thriller'
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterPath: string; // Base64 or URL
  videoPath: string;  // Base64 or URL
  contentType: ContentType;
  country: Country;
  genre: Genre;
  year: number;
  isPopular: boolean;
  createdAt: string;
}

export interface User {
  username: string;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}