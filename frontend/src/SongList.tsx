import * as React from "react";

type SortMode = 'title' | 'genre' | 'artist' | 'album' | 'duration' | 'rating';
type SortDirection = 'ascending' | 'descending';

function sortSongs(songs: Song[], sortMode: SortMode, sortDirection: SortDirection) {
  let cmp: (a: Song, b: Song) => number;
  if (sortMode === 'title') {
    cmp = (a, b) => a.title.localeCompare(b.title);
  } else if (sortMode === 'genre') {
    cmp = (a, b) => a.genre.localeCompare(b.genre);
  } else if (sortMode === 'artist') {
    cmp = (a, b) => a.artist.localeCompare(b.artist);
  } else if (sortMode === 'album') {
    cmp = (a, b) => a.album.localeCompare(b.album);
  } else if (sortMode === 'duration') {
    cmp = (a, b) => a.duration - b.duration;
  } else if (sortMode === 'rating') {
    cmp = (a, b) => a.rating - b.rating;
  } else {
    cmp = () => 0;
  }

  songs.sort(sortDirection === 'ascending'
    ? cmp : (a: Song, b: Song) => cmp(b, a));
}

function filterAndSortSongs(allSongs: Song[],
                            playlist: Playlist,
                            sortMode: SortMode,
                            sortDirection: SortDirection): Song[] {
  const filteredSongs = allSongs.slice().filter(playlist.predicate);
  sortSongs(filteredSongs, sortMode, sortDirection);
  return filteredSongs;
}

interface SongListProps {
  allSongs: Song[];
  currentPlaylist: Playlist;
  currentSong?: Song;
  playing: boolean;
  onSongSelected: (song: Song) => void;
  onPause: () => void;
}

interface SongListState {
  filteredSongs: Song[];
  sortMode: SortMode;
  sortDirection: SortDirection;
}

export class SongList extends React.Component<SongListProps, SongListState> {
  constructor(props: SongListProps) {
    super(props);

    let sortMode: SortMode = 'artist';
    let sortDirection: SortDirection = 'ascending';
    this.state = {
      filteredSongs: filterAndSortSongs(
        props.allSongs,
        props.currentPlaylist,
        sortMode,
        sortDirection),
      sortMode,
      sortDirection };
  }

  public componentWillReceiveProps(nextProps: Readonly<SongListProps>) {
    if (nextProps.currentPlaylist.name === this.props.currentPlaylist.name) {
      return;
    }

    this.setState((state, props) => {
      return {
        filteredSongs: filterAndSortSongs(
          props.allSongs,
          props.currentPlaylist,
          state.sortMode,
          state.sortDirection)
      };
    });
  }

  private isPlaying(song: Song): boolean {
    return this.props.playing &&
      this.props.currentSong !== undefined &&
      this.props.currentSong.id === song.id;
  }

  private renderSortIcon(key: SortMode) {
    let onClick = () => {
      this.setState((state, props) => {
        return {
          filteredSongs: filterAndSortSongs(
            props.allSongs,
            props.currentPlaylist,
            state.sortMode,
            state.sortDirection),
          sortMode: key,
          sortDirection:
            state.sortMode === key && state.sortDirection === 'ascending'
              ? 'descending' : 'ascending'
        };
      });
    };

    if (this.state.sortMode === key) {
      if (this.state.sortDirection === 'ascending') {
        return <i className="fa fa-fw fa-sort-up selected-sort"
                  onClick={onClick}/>;
      } else {
        return <i className="fa fa-fw fa-sort-down selected-sort"
                  onClick={onClick}/>;
      }
    }
    return <i className="fa fa-fw fa-sort"
              onClick={onClick}/>;
  }

  private renderDuration(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes < 1) {
      return seconds + "s";
    } else {
      return minutes + "m " + seconds + "s";
    }
  }

  private renderRating(rating: number) {
    let stars = [];
    for (let i = 0; i < Math.min(rating, 5); i++) {
      stars.push(<i key={i} className="fas fa-star"/>);
    }
    return <span className="stars">{... stars}</span>;
  }

  public render() {
    return (
      <div className="song-list">
        <div className="songs-table-header">
          <div className="play-col"/>
          <div className="title-col">
            Title
            { this.renderSortIcon('title') }
          </div>
          <div className="genre-col">
            Genre
            { this.renderSortIcon('genre') }
          </div>
          <div className="artist-col">
            Artist
            { this.renderSortIcon('artist') }
          </div>
          <div className="album-col">
            Album
            { this.renderSortIcon('album') }
          </div>
          <div className="duration-col">
            Duration
            { this.renderSortIcon('duration') }
          </div>
          <div className="rating-col">
            Rating
            { this.renderSortIcon('rating') }
          </div>
        </div>
        <div className="songs-table-body">
          {... this.state.filteredSongs.map(song =>
            <div key={song.id} className="song-row">
              <div className="play-col">
                {
                  this.isPlaying(song) ? (
                    <button className="pause-button"
                            onClick={() => this.props.onPause()}>
                      <i className="fa fa-pause"/>
                    </button>
                  ) : (
                    <button className="play-button"
                            onClick={() => this.props.onSongSelected(song)}>
                      <i className="fa fa-play"/>
                    </button>
                  )
                }
              </div>
              <div className="title-col">
                { song.title }
              </div>
              <div className="genre-col">
                { song.genre }
              </div>
              <div className="artist-col">
                { song.artist }
              </div>
              <div className="album-col">
                { song.album }
              </div>
              <div className="duration-col">
                { this.renderDuration(song.duration) }
              </div>
              <div className="rating-col">
                { this.renderRating(song.rating) }
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
