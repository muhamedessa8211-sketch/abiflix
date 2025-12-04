
import { Movie, ApiResponse, User, ContentType, Country, Genre } from '../types';

// Mock Data Persistence Keys
const STORAGE_KEY_MOVIES = 'netflex_movies';
const STORAGE_KEY_USER = 'netflex_user';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Initial Data if empty
const initializeMockData = () => {
  const existing = localStorage.getItem(STORAGE_KEY_MOVIES);
  if (!existing) {
    const mocks: Movie[] = [
      {
        id: '1',
        title: 'Stranger Things',
        description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
        posterPath: 'https://picsum.photos/seed/stranger/300/450',
        videoPath: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        contentType: ContentType.Series,
        country: Country.America,
        genre: Genre.SciFi,
        year: 2016,
        isPopular: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Squid Game',
        description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes.',
        posterPath: 'https://picsum.photos/seed/squid/300/450',
        videoPath: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        contentType: ContentType.Series,
        country: Country.Korea,
        genre: Genre.Thriller,
        year: 2021,
        isPopular: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'RRR',
        description: 'A fearless warrior on a perilous mission comes face to face with a steely cop serving the British forces in this epic saga set in pre-independent India.',
        posterPath: 'https://picsum.photos/seed/rrr/300/450',
        videoPath: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        contentType: ContentType.Single,
        country: Country.India,
        genre: Genre.Action,
        year: 2022,
        isPopular: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Crouching Tiger',
        description: 'A young Chinese warrior steals a sword from a famed swordsman and then escapes into a world of romantic adventure with a mysterious man in the frontier of the nation.',
        posterPath: 'https://picsum.photos/seed/tiger/300/450',
        videoPath: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        contentType: ContentType.Single,
        country: Country.China,
        genre: Genre.Action,
        year: 2000,
        isPopular: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        title: 'The Office',
        description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
        posterPath: 'https://picsum.photos/seed/office/300/450',
        videoPath: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        contentType: ContentType.Series,
        country: Country.America,
        genre: Genre.Comedy,
        year: 2005,
        isPopular: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        title: 'The Protector',
        description: 'Discovering his ties to a secret ancient order, a young man living in modern Istanbul embarks on a quest to save the city from an immortal enemy.',
        posterPath: 'https://picsum.photos/seed/protector/300/450',
        videoPath: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        contentType: ContentType.Series,
        country: Country.Turkey,
        genre: Genre.Action,
        year: 2018,
        isPopular: true,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(mocks));
  }
};

initializeMockData();

// --- Auth Service ---

export const login = async (username: string, password: string): Promise<ApiResponse<User>> => {
  await delay(800); // Simulate network
  if (username === 'admin' && password === 'admin123') {
    const user: User = { username, token: 'mock-jwt-token-123' };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { success: true, data: user };
  }
  return { success: false, message: 'Invalid credentials' };
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY_USER);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  return stored ? JSON.parse(stored) : null;
};

// --- Movie Service ---

const getMoviesFromStorage = (): Movie[] => {
  const stored = localStorage.getItem(STORAGE_KEY_MOVIES);
  return stored ? JSON.parse(stored) : [];
};

const saveMoviesToStorage = (movies: Movie[]) => {
  localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(movies));
};

export const getMovies = async (): Promise<ApiResponse<Movie[]>> => {
  await delay(500);
  return { success: true, data: getMoviesFromStorage() };
};

export const getMovieById = async (id: string): Promise<ApiResponse<Movie>> => {
  await delay(300);
  const movies = getMoviesFromStorage();
  const movie = movies.find(m => m.id === id);
  return movie ? { success: true, data: movie } : { success: false, message: 'Movie not found' };
};

export const createMovie = async (movieData: Omit<Movie, 'id' | 'createdAt'>): Promise<ApiResponse<Movie>> => {
  await delay(800);
  const movies = getMoviesFromStorage();
  const newMovie: Movie = {
    ...movieData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  movies.unshift(newMovie); // Add to top
  saveMoviesToStorage(movies);
  return { success: true, data: newMovie };
};

export const updateMovie = async (id: string, updates: Partial<Movie>): Promise<ApiResponse<Movie>> => {
  await delay(800);
  const movies = getMoviesFromStorage();
  const index = movies.findIndex(m => m.id === id);
  if (index === -1) return { success: false, message: 'Movie not found' };
  
  const updatedMovie = { ...movies[index], ...updates };
  movies[index] = updatedMovie;
  saveMoviesToStorage(movies);
  return { success: true, data: updatedMovie };
};

export const deleteMovie = async (id: string): Promise<ApiResponse<void>> => {
  await delay(600);
  let movies = getMoviesFromStorage();
  movies = movies.filter(m => m.id !== id);
  saveMoviesToStorage(movies);
  return { success: true };
};

// Helper to convert File to Base64 (simulating upload return path)
export const mockFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
