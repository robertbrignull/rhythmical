import * as React from 'react';
import './App.css';
import Api from './api';
import {RefObject} from "react";

interface AppState {
  songs?: Song[];
  currentSong?: Song;
}

class App extends React.Component<{}, AppState> {

  private readonly audio: RefObject<HTMLAudioElement>;

  constructor(props: {}) {
    super(props);

    this.audio = React.createRef();

    this.state = {
      songs: undefined,
      currentSong: undefined,
    };
  }

  public componentDidMount() {
    Api.songs.getAll().then((songs: Song[]) => {
      this.setState({ songs });
    });
  }

  private playSong(song: Song) {
    this.setState(
      { currentSong: song },
      () => {
        if (this.audio.current) {
          this.audio.current.load();
          this.audio.current.play()
            .catch(error => console.error("Unable to play: ", error));
        }
      });
  }

  private static getSongSource(song: Song): string {
    return "/api/songs/" + song.id + "/contents";
  }

  public render() {
    if (this.state.songs) {
      return (
        <div>
          <audio controls ref={this.audio}>
            { this.state.currentSong
              ? <source src={App.getSongSource(this.state.currentSong)} />
              : null }
          </audio>
          {... this.state.songs.map(song =>
            <div key={song.id} className="song">
              <button onClick={() => this.playSong(song)}>
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

export default App;
