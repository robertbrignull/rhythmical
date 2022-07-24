import * as React from 'react';
import { SongList } from "./SongList";
import { Header } from "./Header";
import { RefObject } from "react";
import { Filters } from "./Filters";
import { Footer } from "./Footer";
import { Library } from "./Library";
import { SongQueue } from "./SongQueue";

interface AppState {
  library?: Library;
  filteredSongIds?: string[];
  currentSongId?: string;
  playing: boolean;
  currentFilter: SongFilter;
  pastSongIds: string[];
}

class App extends React.Component<{}, AppState> {

  private readonly header: RefObject<Header>;
  private readonly songQueue: RefObject<SongQueue>;

  constructor(props: {}) {
    super(props);

    this.onSongSelected = this.onSongSelected.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onBackwards = this.onBackwards.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);

    this.header = React.createRef();
    this.songQueue = React.createRef();

    this.state = {
      library: undefined,
      filteredSongIds: undefined,
      currentSongId: undefined,
      playing: false,
      currentFilter: { key: "", predicate: () => true },
      pastSongIds: [],
    };
  }

  public async componentDidMount() {
    const library = await Library.new();
    const filteredSongIds = library.applyFilter(() => true);
    this.setState({
      library,
      filteredSongIds,
    });
  }

  private onSongSelected(songId: string) {
    if (songId !== this.state.currentSongId) {
      this.setState({ currentSongId: songId });
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
      if (this.state.library?.getSong(prevSongId) !== undefined) {
        this.setState({
          pastSongIds: ids,
          currentSongId: prevSongId,
        });
      }
    }
  }

  private onEnded() {
    this.setState(state => {
      if (state.currentSongId === undefined || state.pastSongIds.length >= 100) {
        return null;
      }
      const pastSongIds = state.pastSongIds.slice();
      pastSongIds.push(state.currentSongId);
      return {
        pastSongIds,
      };
    });

    const nextSongId = this.songQueue.current?.getNextSongId();
    if (nextSongId) {
      this.onSongSelected(nextSongId);
    } else {
      this.setState({
        currentSongId: undefined,
      });
    }
  }

  private onFilterChanged(filter: SongFilter) {
    if (filter.key !== this.state.currentFilter.key) {
      this.setState((state) => {
        return {
          filteredSongIds: state.library?.applyFilter(filter.predicate),
          currentFilter: filter,
        };
      });
    }
  }

  public render() {
    if (this.state.library === undefined || this.state.filteredSongIds === undefined) {
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
            library={this.state.library}
            currentSongId={this.state.currentSongId}
            onPlay={this.onPlay}
            onPause={this.onPause}
            onBackwards={this.onBackwards}
            onEnded={this.onEnded} />
        </div>
        <div className="playlists-container">
          <Filters onFilterChanged={this.onFilterChanged} />
        </div>
        <div className="song-queue-container">
          <SongQueue
            ref={this.songQueue}
            library={this.state.library}
            songIds={this.state.filteredSongIds} />
        </div>
        <div className="song-list-container">
          <SongList
            library={this.state.library}
            songIds={this.state.filteredSongIds}
            currentSongId={this.state.currentSongId}
            playing={this.state.playing}
            onSongSelected={this.onSongSelected} />
        </div>
        <div className="footer-container">
          <Footer
            library={this.state.library}
            songIds={this.state.filteredSongIds} />
        </div>
      </div>
    );
  }
}

export default App;
