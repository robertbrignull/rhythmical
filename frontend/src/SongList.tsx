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

interface SongListProps {
  allSongs: Song[];
  currentSong?: Song;
  playing: boolean;
  onSongSelected: (song: Song) => void;
  onPause: () => void;
}

interface SongListState {
  sortedSongs: Song[];
  sortMode: SortMode;
  sortDirection: SortDirection;
}

export class SongList extends React.Component<SongListProps, SongListState> {
  constructor(props: SongListProps) {
    super(props);

    let sortMode: SortMode = 'artist';
    let sortDirection: SortDirection = 'ascending';
    let sortedSongs = props.allSongs;
    sortSongs(sortedSongs, sortMode, sortDirection);
    this.state = { sortedSongs, sortMode, sortDirection };
  }

  public componentWillReceiveProps(nextProps: Readonly<SongListProps>) {
    this.setState((state, props) => {
      let sortedSongs = props.allSongs.slice();
      sortSongs(sortedSongs, this.state.sortMode, this.state.sortDirection);
      return { sortedSongs };
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
        let sortedSongs = props.allSongs.slice();
        let sortMode = key;
        let sortDirection: SortDirection =
          state.sortMode === key && state.sortDirection === 'ascending'
            ? 'descending' : 'ascending';
        sortSongs(sortedSongs, sortMode, sortDirection);
        return { sortedSongs, sortMode, sortDirection };
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
        <table className="table">
          <thead>
            <tr>
              <th/>
              <th>
                Title
                { this.renderSortIcon('title') }
              </th>
              <th>
                Genre
                { this.renderSortIcon('genre') }
              </th>
              <th>
                Artist
                { this.renderSortIcon('artist') }
              </th>
              <th>
                Album
                { this.renderSortIcon('album') }
              </th>
              <th>
                Duration
                { this.renderSortIcon('duration') }
              </th>
              <th>
                Rating
                { this.renderSortIcon('rating') }
              </th>
            </tr>
          </thead>
        </table>
        <div>
          <table className="table">
            <tbody>
              {... this.state.sortedSongs.map(song =>
                <tr key={song.id}
                    onDoubleClick={() => this.props.onSongSelected(song)}>
                  <td>
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
                  </td>
                  <td>{ song.title }</td>
                  <td>{ song.genre }</td>
                  <td>{ song.artist }</td>
                  <td>{ song.album }</td>
                  <td>{ this.renderDuration(song.duration) }</td>
                  <td>{ this.renderRating(song.rating) }</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
