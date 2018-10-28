import * as React from 'react';
import './App.css';
import {SongList} from "./SongList";
import {Header} from "./Header";

interface AppState {
  currentSong?: Song;
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);

    this.onSongSelected = this.onSongSelected.bind(this);

    this.state = {
      currentSong: undefined,
    };
  }

  private onSongSelected(song: Song) {
    this.setState({ currentSong: song });
  }

  public render() {
    return (
      <div>
        <Header currentSong={this.state.currentSong}/>
        <SongList onSongSelected={this.onSongSelected}/>
      </div>
    );
  }
}

export default App;
