interface Song {
  id: number,
  title: string
  genre: string,
  artist: string,
  album: string,
  duration: number,
  rating: number,
}

interface SongFilter {
  key: string;
  predicate: (s: Song) => boolean;
}
