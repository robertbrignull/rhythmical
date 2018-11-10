import * as React from "react";
import Api from "./api";

interface SongListProps {
  currentSong?: Song;
  playing: boolean;
  onSongSelected: (song: Song) => void;
  onPause: () => void;
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

  private isPlaying(song: Song): boolean {
    return this.props.playing &&
      this.props.currentSong !== undefined &&
      this.props.currentSong.id === song.id;
  }

  public render() {
    if (this.state.songs) {
      return (
        <ul className="song-list">
          {... this.state.songs.map(song =>
            <li>
              {
                this.isPlaying(song) ? (
                  <button onClick={() => this.props.onPause()}>
                    <i className="fa fa-pause"/>
                  </button>
                ) : (
                  <button onClick={() => this.props.onSongSelected(song)}>
                    <i className="fa fa-play"/>
                  </button>
                )
              }
              <span key={song.id}
                   className="song"
                   onDoubleClick={() => this.props.onSongSelected(song)}>
                { song.title }
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
