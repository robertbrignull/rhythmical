import * as React from "react";
import Api from "./api";

type SortMode = 'id';

interface SongListProps {
  currentSong?: Song;
  playing: boolean;
  onSongSelected: (song: Song) => void;
  onPause: () => void;
}

interface SongListState {
  songs?: Song[];
  sortMode: SortMode;
}

export class SongList extends React.Component<SongListProps, SongListState> {
  constructor(props: SongListProps) {
    super(props);

    this.state = {
      songs: undefined,
      sortMode: 'id'
    };
  }

  public componentDidMount() {
    Api.songs.getAll().then((songs: Song[]) => {
      this.sortSongs(songs);
      this.setState({ songs });
    });
  }

  private sortSongs(songs: Song[]) {
    if (this.state.sortMode === 'id') {
      songs.sort((a, b) => a.id - b.id);
    }
  }

  private isPlaying(song: Song): boolean {
    return this.props.playing &&
      this.props.currentSong !== undefined &&
      this.props.currentSong.id === song.id;
  }

  private renderDuration(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes < 1) {
      return seconds + "s";
    } else {
      return minutes + "m " + seconds + "s";
    }
  }

  private renderRating(rating: number) {
    let stars = [];
    for (let i = 0; i < Math.min(rating, 5); i++) {
      stars.push(<i key={i} className="fas fa-star"/>);
    }
    return <span className="stars">{... stars}</span>;
  }

  public render() {
    if (this.state.songs) {
      return (
        <div className="song-list">
          <table className="table">
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
          </table>
          <div>
            <table className="table">
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
                    <td>{ this.renderDuration(song.duration) }</td>
                    <td>{ this.renderRating(song.rating) }</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
