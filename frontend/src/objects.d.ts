interface Song {
  id: number,
  title: string
  genre: string,
  artist: string,
  album: string,
  duration: number,
  rating: number,
}

interface Playlist {
  name: string;
  predicate: (s: Song) => boolean;
}
