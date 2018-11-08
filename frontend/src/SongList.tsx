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
        <ul>
          {... this.state.songs.map(song =>
            <li>
              <button onClick={() => this.props.onSongSelected(song)}>
                <i className="fa fa-play"/>
              </button>
              <span key={song.id}
                   className="song"
                   onDoubleClick={() => this.props.onSongSelected(song)}>
                { song.name }
              </span>
            </li>
          )}
        </ul>
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
