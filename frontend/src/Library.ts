import Api from "./api";

// Represents an immutable list of songs.
export class Library {
    private songs : Readonly<Map<string, Song>>;

    private constructor(songs: Map<string, Song>) {
        this.songs = songs;
    }

    static async new(): Promise<Library> {
        const songs = await Api.songs.getAll();

        const songsMap = new Map();
        for (const song of songs) {
            songsMap.set(song.id, song);
        }

        return new Library(songsMap);
    }

    getSong(id: string): Song | undefined {
        return this.songs.get(id);
    }

    applyFilter(filter: (song: Song) => boolean): Song[] {
        const filteredSongs: Song[] = []
        this.songs.forEach((song: Song) => {
            if (filter(song)) {
                filteredSongs.push(song);
            }
        })
        return filteredSongs;
    }
}
