import * as React from "react";
import { Library } from "../state/Library";
import { SongQueue } from "src/state/song-queue";

interface SongQueueProps {
  library: Library;
  songQueue: SongQueue;
}

const VISIBLE_QUEUE_LENGTH = 5;

export function UpcomingSongs(props: SongQueueProps) {
  const { library, songQueue } = props;
  return (
    <div className="song-queue">
      {songQueue.songIdQueue.slice(0, VISIBLE_QUEUE_LENGTH).map((songId) => {
        const song = library.getSong(songId);
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
