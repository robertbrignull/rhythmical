import * as React from 'react';
import {SongList, sortSongs} from "./SongList";
import {Header} from "./Header";
import {RefObject} from "react";
import Api from "./api";

interface AppState {
  songs?: Song[];
  currentSong?: Song;
  playing: boolean;
}

class App extends React.Component<{}, AppState> {

  private readonly header: RefObject<Header>;

  constructor(props: {}) {
    super(props);

    this.onSongSelected = this.onSongSelected.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);

    this.header = React.createRef();

    this.state = {
      currentSong: undefined,
      playing: false,
    };
  }

  public componentDidMount() {
    Api.songs.getAll().then((songs: Song[]) => {
      sortSongs(songs, 'title', 'ascending');
      this.setState({ songs });
    });
  }

  private onSongSelected(song: Song) {
    if (!this.state.currentSong || song.id !== this.state.currentSong.id) {
      this.setState({currentSong: song});
    } else {
      if (this.header.current) {
        this.header.current.restartSong();
      }
    }
  }

  private onPlay() {
    if (this.state.currentSong !== undefined) {
      this.setState({
        playing: true,
      });
    }
  }

  private onPause() {
    if (this.header.current) {
      this.header.current.pause();
    }
    this.setState({
      playing: false,
    });
  }

  public render() {
    return this.state.songs !== undefined ? (
      <div className="app">
        <div className="header-container">
            <Header ref={this.header}
                    currentSong={this.state.currentSong}
                    onPlay={this.onPlay}
                    onPause={this.onPause}/>
        </div>
        <div className="song-list-container">
          <SongList songs={this.state.songs}
                    currentSong={this.state.currentSong}
                    playing={this.state.playing}
                    onSongSelected={this.onSongSelected}
                    onPause={this.onPause}/>
        </div>
      </div>
    ) : (
      <div className="loading-message">
        Loading...
      </div>
    );
  }
}

export default App;
