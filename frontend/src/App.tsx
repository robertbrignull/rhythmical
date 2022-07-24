import * as React from 'react';
import { SongList } from "./SongList";
import { Header } from "./Header";
import { RefObject } from "react";
import { Filters } from "./Filters";
import { Footer } from "./Footer";
import { Library } from "./Library";

interface AppState {
  library?: Library;
  filteredSongs?: Song[];
  currentSong?: Song;
  playing: boolean;
  currentFilter: SongFilter;
  pastSongIds: string[];
}

class App extends React.Component<{}, AppState> {

  private readonly header: RefObject<Header>;

  constructor(props: {}) {
    super(props);

    this.onSongSelected = this.onSongSelected.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onBackwards = this.onBackwards.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);

    this.header = React.createRef();

    this.state = {
      library: undefined,
      filteredSongs: undefined,
      currentSong: undefined,
      playing: false,
      currentFilter: { key: "", predicate: () => true },
      pastSongIds: [],
    };
  }

  public async componentDidMount() {
    const library = await Library.new();
    const filteredSongs = library.applyFilter(() => true);
    this.setState({
      library,
      filteredSongs,
    });
  }

  private onSongSelected(song: Song) {
    if (!this.state.currentSong || song.id !== this.state.currentSong.id) {
      this.setState({ currentSong: song });
    } else {
      if (this.header.current) {
        this.header.current.restartSong();
      }
    }
  }

  private onPlay() {
    this.setState({
      playing: true,
    });
  }

  private onPause() {
    this.setState({
      playing: false,
    });
  }

  private onBackwards() {
    let prevSongId: string | undefined = undefined;
    const ids = this.state.pastSongIds;
    while ((prevSongId = ids.pop()) !== undefined) {
      const prevSong = this.state.library?.getSong(prevSongId);
      if (prevSong !== undefined) {
        this.setState({
          pastSongIds: ids,
          currentSong: prevSong,
        });
      }
    }
  }

  private onEnded() {
    this.setState(state => {
      if (state.currentSong === undefined || state.pastSongIds.length >= 100) {
        return null;
      }
      const pastSongIds = state.pastSongIds.slice();
      pastSongIds.push(state.currentSong.id);
      return {
        pastSongIds,
      };
    });

    if (this.state.filteredSongs != undefined) {
      const index = Math.floor(Math.random() * this.state.filteredSongs.length);
      this.onSongSelected(this.state.filteredSongs[index]);
    } else {
      this.setState({
        currentSong: undefined,
      });
    }
  }

  private onFilterChanged(filter: SongFilter) {
    if (filter.key !== this.state.currentFilter.key) {
      this.setState((state) => {
        return {
          filteredSongs: state.library?.applyFilter(filter.predicate),
          currentFilter: filter,
        };
      });
    }
  }

  public render() {
    if (this.state.filteredSongs === undefined) {
      return (
        <div className="loading-message">
          Loading...
        </div>
      );
    }

    return (
      <div className="app">
        <div className="header-container">
          <Header ref={this.header}
            currentSong={this.state.currentSong}
            onPlay={this.onPlay}
            onPause={this.onPause}
            onBackwards={this.onBackwards}
            onEnded={this.onEnded} />
        </div>
        <div className="playlists-container">
          <Filters onFilterChanged={this.onFilterChanged} />
        </div>
        <div className="song-list-container">
          <SongList songs={this.state.filteredSongs}
            currentSong={this.state.currentSong}
            playing={this.state.playing}
            onSongSelected={this.onSongSelected} />
        </div>
        <div className="footer-container">
          <Footer songs={this.state.filteredSongs} />
        </div>
      </div>
    );
  }
}

export default App;
