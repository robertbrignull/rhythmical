import * as React from "react";

import 'react-virtualized/styles.css';
import {AutoSizer} from 'react-virtualized/dist/es/AutoSizer';
import {WindowScroller} from 'react-virtualized/dist/es/WindowScroller';
import {Table, Column, TableCellProps, TableHeaderProps, SortIndicator, SortDirectionType} from 'react-virtualized/dist/es/Table';
import {Index} from "react-virtualized";

type SortMode = 'title' | 'genre' | 'artist' | 'album' | 'duration' | 'rating';

function filterAndSortSongs(allSongs: Song[],
                            playlist: Playlist,
                            sortMode: SortMode,
                            sortDirection: SortDirectionType): Song[] {
  const songs = allSongs.slice().filter(playlist.predicate);

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

  songs.sort(sortDirection === 'ASC'
    ? cmp : (a: Song, b: Song) => cmp(b, a));

  return songs;
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
  sortDirection: SortDirectionType;
}

export class SongList extends React.Component<SongListProps, SongListState> {
  constructor(props: SongListProps) {
    super(props);

    let sortMode: SortMode = 'artist';
    let sortDirection: SortDirectionType = 'ASC';
    this.state = {
      filteredSongs: filterAndSortSongs(
        props.allSongs,
        props.currentPlaylist,
        sortMode,
        sortDirection),
      sortMode,
      sortDirection };

    this.sortList = this.sortList.bind(this);
    this.rowGetter = this.rowGetter.bind(this);
    this.playCellRenderer = this.playCellRenderer.bind(this);
    this.durationCellRenderer = this.durationCellRenderer.bind(this);
    this.ratingCellRenderer = this.ratingCellRenderer.bind(this);
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

  private headerRenderer(label: string, disableSort?: boolean) {
      return (props: TableHeaderProps) => {
        return (
          <div>
            { label }
            { !disableSort && props.sortBy === props.dataKey &&
              <SortIndicator sortDirection={props.sortDirection } /> }
          </div>
        );
      };
  }

  private sortList(info: { sortBy: string; sortDirection: SortDirectionType }) {
    this.setState((state, props) => {
      const sortMode = info.sortBy as SortMode;
      return {
        filteredSongs: filterAndSortSongs(
          props.allSongs,
          props.currentPlaylist,
          sortMode,
          info.sortDirection),
        sortMode,
        sortDirection: info.sortDirection
      };
    })
  }

  private rowGetter(index: Index) {
    return this.state.filteredSongs[index.index];
  }

  private playCellRenderer(props: TableCellProps) {
    const song: Song = props.rowData;
    return this.isPlaying(song) ? (
      <button className="pause-button"
              onClick={() => this.props.onPause()}>
        <i className="fa fa-pause"/>
      </button>
    ) : (
      <button className="play-button"
              onClick={() => this.props.onSongSelected(song)}>
        <i className="fa fa-play"/>
      </button>
    );
  }

  private durationCellRenderer(props: TableCellProps) {
    const song: Song = props.rowData;
    const minutes = Math.floor(song.duration / 60);
    const seconds = song.duration % 60;
    if (minutes < 1) {
      return seconds + "s";
    } else {
      return minutes + "m " + seconds + "s";
    }
  }

  private ratingCellRenderer(props: TableCellProps) {
    const song: Song = props.rowData;
    let stars = [];
    for (let i = 0; i < Math.min(song.rating, 5); i++) {
      stars.push(<i key={i} className="fas fa-star"/>);
    }
    return <span className="stars">{... stars}</span>;
  }

  public render() {
    return (
      <div className="song-list">
        <WindowScroller>
          {({height, isScrolling, onChildScroll, scrollTop}) => (
            <AutoSizer disableHeight>
              {({width}) => (
                <Table
                  autoHeight
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  scrollTop={scrollTop}
                  headerHeight={40}
                  height={height}
                  rowHeight={30}
                  rowGetter={this.rowGetter}
                  rowCount={this.state.filteredSongs.length}
                  sort={this.sortList}
                  sortBy={this.state.sortMode}
                  sortDirection={this.state.sortDirection}
                  width={width}>
                  <Column dataKey={'play'}
                          className={'play-col'}
                          headerRenderer={this.headerRenderer('Play', true)}
                          cellRenderer={this.playCellRenderer}
                          disableSort={true}
                          width={45}/>
                  <Column dataKey={'title'}
                          headerRenderer={this.headerRenderer('Title')}
                          width={200}
                          flexGrow={1}/>
                  <Column dataKey={'genre'}
                          headerRenderer={this.headerRenderer('Genre')}
                          width={175}/>
                  <Column dataKey={'artist'}
                          headerRenderer={this.headerRenderer('Artist')}
                          width={200}
                          flexGrow={1}/>
                  <Column dataKey={'album'}
                          headerRenderer={this.headerRenderer('Album')}
                          width={200}
                          flexGrow={1}/>
                  <Column dataKey={'duration'}
                          headerRenderer={this.headerRenderer('Duration')}
                          cellRenderer={this.durationCellRenderer}
                          width={100}/>
                  <Column dataKey={'rating'}
                          className={'rating-col'}
                          headerRenderer={this.headerRenderer('Rating')}
                          cellRenderer={this.ratingCellRenderer}
                          width={90}/>
                </Table>
              )}
            </AutoSizer>
          )}
        </WindowScroller>
      </div>
    );
  }
}
