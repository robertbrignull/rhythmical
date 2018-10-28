import * as React from 'react';
import './App.css';
import {SongList} from "./SongList";
import {Header} from "./Header";
import {RefObject} from "react";

interface AppState {
  currentSong?: Song;
}

class App extends React.Component<{}, AppState> {

  private readonly header: RefObject<Header>;

  constructor(props: {}) {
    super(props);

    this.onSongSelected = this.onSongSelected.bind(this);

    this.header = React.createRef();

    this.state = {
      currentSong: undefined,
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

  public render() {
    return (
      <div>
        <Header ref={this.header} currentSong={this.state.currentSong}/>
        <SongList onSongSelected={this.onSongSelected}/>
      </div>
    );
  }
}

export default App;
