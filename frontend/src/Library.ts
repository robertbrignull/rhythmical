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

    getSong(id: string  | undefined): Song | undefined {
        if (id) {
            return this.songs.get(id);
        } else {
            return undefined;
        }
    }

    applyFilter(filter: (song: Song) => boolean): string[] {
        const filteredSongIds: string[] = []
        this.songs.forEach((song: Song) => {
            if (filter(song)) {
                filteredSongIds.push(song.id);
            }
        })
        return filteredSongIds;
    }
}
