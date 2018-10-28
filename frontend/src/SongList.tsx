import * as React from "react";
import Api from "./api";

interface SongListProps {
  onSongSelected: (song: Song) => void;
}

interface SongListState {
  songs?: Song[];
}

export class SongList extends React.Component<SongListProps, SongListState> {
  constructor(props: SongListProps) {
    super(props);

    this.state = {
      songs: undefined,
    };
  }

  public componentDidMount() {
    Api.songs.getAll().then((songs: Song[]) => {
      this.setState({ songs });
    });
  }

  public render() {
    if (this.state.songs) {
      return (
        <div>
          {... this.state.songs.map(song =>
            <div key={song.id} className="song">
              <button onClick={() => this.props.onSongSelected(song)}>
                Play
              </button>
              { song.name }
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="loading-message">
          Loading...
        </div>
      );
    }
  }
}
