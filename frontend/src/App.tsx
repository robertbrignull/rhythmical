import * as React from "react";
import { SongList } from "./view/SongList";
import { Header } from "./view/Header";
import { RefObject } from "react";
import { Filters } from "./view/Filters";
import { Footer } from "./view/Footer";
import { Library } from "./state/Library";
import { UpcomingSongs } from "./view/UpcomingSongs";
import { SongQueue } from "./state/song-queue";

interface AppState {
  library?: Library;
  songQueue: SongQueue;
  filteredSongIds?: string[];
  currentSongId?: string;
  playing: boolean;
  currentFilter: SongFilter;
  pastSongIds: string[];
}

class App extends React.Component<Record<string, never>, AppState> {
  private readonly header: RefObject<Header>;

  constructor(props: Record<string, never>) {
    super(props);

    this.onSongSelected = this.onSongSelected.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onBackwards = this.onBackwards.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);

    const songQueue = new SongQueue();

    this.header = React.createRef();

    this.state = {
      library: undefined,
      songQueue,
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
    this.setState((state) => {
      if (
        state.currentSongId === undefined ||
        state.pastSongIds.length >= 100
      ) {
        return null;
      }
      const pastSongIds = state.pastSongIds.slice();
      pastSongIds.push(state.currentSongId);
      return {
        pastSongIds,
      };
    });

    const [nextSongId, newSongQueue] = this.state.songQueue.getNextSongId(this.state.filteredSongIds || []);
    this.setState({
      songQueue: newSongQueue,
    });

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
    if (
      this.state.library === undefined ||
      this.state.filteredSongIds === undefined
    ) {
      return <div className="loading-message">Loading...</div>;
    }

    return (
      <div className="app">
        <div className="header-container">
          <Header
            ref={this.header}
            library={this.state.library}
            currentSongId={this.state.currentSongId}
            onPlay={this.onPlay}
            onPause={this.onPause}
            onBackwards={this.onBackwards}
            onEnded={this.onEnded}
          />
        </div>
        <div className="playlists-container">
          <Filters onFilterChanged={this.onFilterChanged} />
        </div>
        <div className="song-queue-container">
          <UpcomingSongs
            library={this.state.library}
            songQueue={this.state.songQueue}
          />
        </div>
        <div className="song-list-container">
          <SongList
            library={this.state.library}
            songIds={this.state.filteredSongIds}
            currentSongId={this.state.currentSongId}
            playing={this.state.playing}
            onSongSelected={this.onSongSelected}
          />
        </div>
        <div className="footer-container">
          <Footer
            library={this.state.library}
            songIds={this.state.filteredSongIds}
          />
        </div>
      </div>
    );
  }
}

export default App;
