import * as React from 'react';
import {SongList} from "./SongList";
import {Header} from "./Header";
import {RefObject} from "react";

interface AppState {
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
    return (
      <div className="app">
        <div className="header-container">
          <Header
            ref={this.header}
            currentSong={this.state.currentSong}
            onPlay={this.onPlay}
            onPause={this.onPause}/>
        </div>
        <div className="song-list-container">
          <SongList
            currentSong={this.state.currentSong}
            playing={this.state.playing}
            onSongSelected={this.onSongSelected}
            onPause={this.onPause}/>
        </div>
      </div>
    );
  }
}

export default App;
