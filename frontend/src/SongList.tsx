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
        <table className="song-list">
          <thead>
            <tr>
              <th/>
              <th>Title</th>
              <th>Genre</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Duration</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {... this.state.songs.map(song =>
              <tr key={song.id}
                  onDoubleClick={() => this.props.onSongSelected(song)}>
                <td>
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
                </td>
                <td>{ song.title }</td>
                <td>{ song.genre }</td>
                <td>{ song.artist }</td>
                <td>{ song.album }</td>
                <td>{ song.duration }</td>
                <td>{ song.rating }</td>
              </tr>
            )}
          </tbody>
        </table>
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
