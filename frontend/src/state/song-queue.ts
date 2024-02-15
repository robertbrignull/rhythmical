const QUEUE_LENGTH = 50;

/**
 * Randomly selects n elements from the given array.
 */
function pickN<T>(xs: T[], n: number): T[] {
  const selected: T[] = [];
  const remaining = xs.slice();
  while (selected.length < n && remaining.length > 0) {
    const index = Math.floor(Math.random() * remaining.length);
    selected.push(remaining[index]);
    remaining.splice(index, 1);
  }
  return selected;
}

export class SongQueue {
  constructor(public readonly songIdQueue: string[] = []) {}

  public getNextSongId(availableSongIds: string[]): [string | undefined, SongQueue] {
    const newSongIdQueue = this.songIdQueue.filter((s) => availableSongIds.includes(s));

    if (newSongIdQueue.length <= QUEUE_LENGTH) {
      newSongIdQueue.push(
        ...pickN(
          availableSongIds.filter((x) => !newSongIdQueue.includes(x)),
          QUEUE_LENGTH + 1 - newSongIdQueue.length),
      );
    }

    const nextSong = newSongIdQueue.shift();
    return [nextSong, new SongQueue(newSongIdQueue)];
  }
}
