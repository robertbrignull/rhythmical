import * as React from "react";
import { Library } from "./Library";

interface SongQueueProps {
  library: Library;
  songIds: string[];
}

interface SongQueueState {
  songIdQueue: string[];
}

export class SongQueue extends React.PureComponent<SongQueueProps, SongQueueState> {
  constructor(props: SongQueueProps) {
    super(props);

    this.state = {
      songIdQueue: [],
    };
  }
  
  public render() {
    return <div className="song-queue">
      <span>Song queue!</span>
    </div>;
  }
}
