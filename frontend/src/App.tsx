import * as React from 'react';
import {SongList} from "./SongList";
import {Header} from "./Header";
import {RefObject} from "react";
import Api from "./api";
import {Footer} from "./Footer";
import {defaultPlaylist, Playlists} from "./Playlists";

interface AppState {
  allSongs?: Song[];
  filteredSongs?: Song[];
  currentSong?: Song;
  playing: boolean;
  currentPlaylist: Playlist;
}

class App extends React.Component<{}, AppState> {

  private readonly header: RefObject<Header>;

  constructor(props: {}) {
    super(props);

    this.onSongSelected = this.onSongSelected.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onPlaylistSelected = this.onPlaylistSelected.bind(this);

    this.header = React.createRef();

    this.state = {
      currentSong: undefined,
      playing: false,
      currentPlaylist: defaultPlaylist,
    };
  }

  public componentDidMount() {
    Api.songs.getAll().then((songs: Song[]) => {
      this.setState({
        allSongs: songs,
        filteredSongs: songs.slice().filter(this.state.currentPlaylist.predicate),
      });
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

  private onPlaylistSelected(playlist: Playlist) {
    this.setState((state) => {
      return {
        currentPlaylist: playlist,
        filteredSongs: state.allSongs !== undefined
          ? state.allSongs.slice().filter(playlist.predicate) : undefined
      };
    });
  }

  public render() {
    return this.state.filteredSongs !== undefined ? (
      <div className="app">
        <div className="header-container">
            <Header ref={this.header}
                    currentSong={this.state.currentSong}
                    onPlay={this.onPlay}
                    onPause={this.onPause}/>
        </div>
        <div className="playlists-container">
          <Playlists currentPlaylist={this.state.currentPlaylist.name}
                     onPlaylistSelected={this.onPlaylistSelected}/>
        </div>
        <div className="song-list-container">
          <SongList allSongs={this.state.filteredSongs}
                    currentSong={this.state.currentSong}
                    playing={this.state.playing}
                    onSongSelected={this.onSongSelected}
                    onPause={this.onPause}/>
        </div>
        <div className="footer-container">
          <Footer songs={this.state.filteredSongs}/>
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
