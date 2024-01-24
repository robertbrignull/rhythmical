import * as React from "react";
import { ChangeEvent } from "react";

interface Playlist {
  name: string;
  predicate: (s: Song) => boolean;
}

const allPlaylists: Playlist[] = [
  {
    name: "All",
    predicate: () => true
  },
  {
    name: "Best",
    predicate: (s: Song) => s.rating >= 5
  },
  {
    name: "Great",
    predicate: (s: Song) => s.rating >= 4
  },
  {
    name: "Good",
    predicate: (s: Song) => s.rating >= 3
  },
  {
    name: "Unrated",
    predicate: (s: Song) => s.rating === 0
  }
];

function matchesSearchString(s: Song, searchString: string): boolean {
  const regex = new RegExp('.*' + searchString + '.*', 'i');
  return regex.test(s.title) ||
    regex.test(s.artist) ||
    regex.test(s.album) ||
    regex.test(s.genre);
}

function makeFilter(playlist: Playlist, searchString: string): SongFilter {
  return {
    key: playlist.name + "_" + searchString,
    predicate: (s: Song) =>
      playlist.predicate(s) &&
      matchesSearchString(s, searchString)
  };
}

interface PlaylistsProps {
  onFilterChanged: (filter: SongFilter) => void;
}

interface PlaylistsState {
  currentPlaylist: Playlist;
  searchString: string;
}

export class Filters extends React.Component<PlaylistsProps, PlaylistsState> {
  constructor(props: PlaylistsProps) {
    super(props);

    this.state = {
      currentPlaylist: allPlaylists[0],
      searchString: ""
    };

    this.onPlaylistSelected = this.onPlaylistSelected.bind(this);
    this.onSearchBoxChange = this.onSearchBoxChange.bind(this);
  }

  public shouldComponentUpdate(nextProps: PlaylistsProps, nextState: PlaylistsState) {
    return nextState.currentPlaylist.name !== this.state.currentPlaylist.name ||
      nextState.searchString !== this.state.searchString;
  }

  public componentDidUpdate(prevProps: PlaylistsProps, prevState: PlaylistsState) {
    if (prevState.currentPlaylist.name !== this.state.currentPlaylist.name ||
      prevState.searchString !== this.state.searchString) {
      const filter = makeFilter(this.state.currentPlaylist, this.state.searchString);
      this.props.onFilterChanged(filter);
    }
  }

  private onPlaylistSelected(playlist: Playlist) {
    this.setState({
      currentPlaylist: playlist
    });
  }

  private onSearchBoxChange(e: ChangeEvent) {
    const searchString = (e.target as any).value;
    this.setState(state => {
      return searchString !== state.searchString ? { searchString } : null;
    });
  }

  private renderSearchBox() {
    return (
      <div className={'search-wrapper'}>
        <input key={'search'}
          className={'search-input'}
          onChange={this.onSearchBoxChange}
          value={this.state.searchString} />
      </div>
    );
  }

  public render() {
    return <div className="filters">
      {this.renderSearchBox()}
      {...
        allPlaylists.map(p => {
          let isSelected = p.name === this.state.currentPlaylist.name;
          let className = "playlist" + (isSelected ? " selected" : "");
          return (
            <div key={'playlist_' + p.name}
              className={className}
              onClick={() => this.onPlaylistSelected(p)}>
              <i className="fas fa-search" />
              {isSelected ? <i className="fas fa-caret-right" /> : null}
              <span className="playlist-name">{p.name}</span>
            </div>
          );
        })
      }
    </div>
  }
}
