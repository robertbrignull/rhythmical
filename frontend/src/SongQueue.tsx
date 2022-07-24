import * as React from "react";
import { Library } from "./Library";

interface SongQueueProps {
  library: Library;
  songIds: string[];
}

interface SongQueueState {
  songIdQueue: string[];
}

const INTERNAL_QUEUE_LENGTH = 50;
const VISIBLE_QUEUE_LENGTH = 5;

export class SongQueue extends React.PureComponent<SongQueueProps, SongQueueState> {
  constructor(props: SongQueueProps) {
    super(props);

    const songIdQueue: string[] = [];
    for (let i = 0; i < INTERNAL_QUEUE_LENGTH; i++) {
      songIdQueue.push(props.songIds[Math.floor(Math.random() * props.songIds.length)]);
    }

    this.state = {
      songIdQueue: songIdQueue,
    };
  }
  
  public render() {
    return <div className="song-queue">
      {
        this.state.songIdQueue.slice(0, VISIBLE_QUEUE_LENGTH).map(songId => {
          const song = this.props.library.getSong(songId);
          if (song) {
            return <div className="song-queue-item">
              <div className="title">{ song.title }</div>
              <div className="artist">by { song.artist }</div>
              <div className="album">from { song.album }</div>
            </div>
          } else {
            return undefined;
          }
        })
      }
    </div>;
  }
}
