import * as React from "react";
import { Library } from "../state/Library";
import { SongQueue } from "src/state/song-queue";

interface SongQueueProps {
  library: Library;
  songQueue: SongQueue;
}

const VISIBLE_QUEUE_LENGTH = 5;

export class UpcomingSongs extends React.PureComponent<
  SongQueueProps
> {
  public render() {
    return (
      <div className="song-queue">
        {this.props.songQueue.songIdQueue.slice(0, VISIBLE_QUEUE_LENGTH).map((songId) => {
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
