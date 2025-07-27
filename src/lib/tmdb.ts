// TMDB API 키 설정
export const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

// TMDB API 기본 설정
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDB API 이미지 크기 설정
export const TMDB_IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original'
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original'
  }
};

// TMDB API 언어 설정
export const TMDB_LANGUAGE = 'ko-KR';

// TMDB API 지역 설정
export const TMDB_REGION = 'KR'; 