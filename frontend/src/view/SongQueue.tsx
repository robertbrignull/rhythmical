import * as React from "react";
import { Library } from "../state/Library";

interface SongQueueProps {
  library: Library;
  songIds: string[];
}

interface SongQueueState {
  songIdQueue: string[];
}

const INTERNAL_QUEUE_LENGTH = 50;
const VISIBLE_QUEUE_LENGTH = 5;

export class SongQueue extends React.PureComponent<
  SongQueueProps,
  SongQueueState
> {
  constructor(props: SongQueueProps) {
    super(props);

    this.state = {
      songIdQueue: SongQueue.populateQueue(props.songIds, []),
    };
  }

  private static populateQueue(
    songIds: string[],
    currentSongIdQueue: string[],
  ): string[] {
    if (currentSongIdQueue.length >= INTERNAL_QUEUE_LENGTH) {
      return currentSongIdQueue;
    }

    const availableSongIds = songIds
      .filter((x) => !currentSongIdQueue.includes(x))
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    return currentSongIdQueue.concat(
      availableSongIds.slice(
        0,
        INTERNAL_QUEUE_LENGTH - currentSongIdQueue.length,
      ),
    );
  }

  public getNextSongId(): string | undefined {
    let songIdQueue = this.state.songIdQueue.slice();
    if (songIdQueue.length === 0) {
      songIdQueue = SongQueue.populateQueue(this.props.songIds, songIdQueue);
    }
    const nextSong =
      songIdQueue.length === 0 ? undefined : songIdQueue.splice(0, 1)[0];
    this.setState({
      songIdQueue,
    });
    return nextSong;
  }

  public render() {
    return (
      <div className="song-queue">
        {this.state.songIdQueue.slice(0, VISIBLE_QUEUE_LENGTH).map((songId) => {
          const song = this.props.library.getSong(songId);
          if (song) {
            return (
              <div key={songId} className="song-queue-item">
                <div className="title">{song.title}</div>
                <div className="artist">by {song.artist}</div>
                <div className="album">from {song.album}</div>
              </div>
            );
          } else {
            return undefined;
          }
        })}
      </div>
    );
  }
}
