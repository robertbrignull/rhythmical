import * as React from "react";

import 'react-virtualized/styles.css';
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';
import { Table, Column, TableCellProps, TableHeaderProps, SortIndicator, SortDirectionType, RowMouseEventHandlerParams } from 'react-virtualized/dist/es/Table';
import { Index } from "react-virtualized";
import { Library } from "../state/Library";

type SortMode = 'title' | 'genre' | 'artist' | 'album' | 'duration' | 'rating';

function sortSongIds(
  library: Library,
  songIds: string[],
  sortMode: SortMode,
  sortDirection: SortDirectionType): string[] {

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

  let sortedSongsWithIds = [];
  for (const songId of songIds) {
    const song = library.getSong(songId);
    if (song) {
      sortedSongsWithIds.push([songId, song]);
    }
  }

  const directedCmp = (sortDirection === 'ASC') ? cmp : (a: Song, b: Song) => cmp(b, a);
  sortedSongsWithIds.sort((a: [string, Song], b: [string, Song]) => directedCmp(a[1], b[1]));

  return sortedSongsWithIds.map((a: [string, Song]) => a[0]);
}

interface SongListProps {
  library: Library;
  songIds: string[];
  currentSongId?: string;
  playing: boolean;
  onSongSelected: (songId: string) => void;
}

interface SongListState {
  sortedSongIds: string[];
  sortMode: SortMode;
  sortDirection: SortDirectionType;
  scrollToIndex: number | undefined;
}

export class SongList extends React.PureComponent<SongListProps, SongListState> {
  constructor(props: SongListProps) {
    super(props);

    let sortMode: SortMode = 'artist';
    let sortDirection: SortDirectionType = 'ASC';
    this.state = {
      sortedSongIds: sortSongIds(props.library, props.songIds, sortMode, sortDirection),
      sortMode,
      sortDirection,
      scrollToIndex: undefined
    };

    this.sortList = this.sortList.bind(this);
    this.rowGetter = this.rowGetter.bind(this);
    this.onRowDoubleClick = this.onRowDoubleClick.bind(this);
    this.durationCellRenderer = this.durationCellRenderer.bind(this);
    this.ratingCellRenderer = this.ratingCellRenderer.bind(this);
    this.rowClassName = this.rowClassName.bind(this);
  }

  public componentDidUpdate(prevProps: Readonly<SongListProps>) {
    const songsChanged = prevProps.songIds !== this.props.songIds;
    const currentSongChanged = this.props.currentSongId !== undefined &&
      prevProps.currentSongId !== this.props.currentSongId;

    if (!songsChanged && !currentSongChanged) {
      return;
    }

    this.setState(state => {
      const sortedSongIds = songsChanged
        ? sortSongIds(this.props.library, this.props.songIds, state.sortMode, state.sortDirection)
        : state.sortedSongIds;

      let scrollToIndex = undefined;
      if (currentSongChanged) {
        scrollToIndex = sortedSongIds.findIndex(songId =>
          this.props.currentSongId !== undefined &&
          this.props.currentSongId === songId);
      }

      return {
        sortedSongIds,
        scrollToIndex
      };
    });
  }

  private headerRenderer(label: string | undefined, disableSort?: boolean) {
    return (props: TableHeaderProps) => {
      return (
        <div>
          {label}
          {!disableSort && props.sortBy === props.dataKey &&
            <SortIndicator sortDirection={props.sortDirection} />}
        </div>
      );
    };
  }

  private sortList(info: { sortBy: string; sortDirection: SortDirectionType }) {
    this.setState((state, props) => {
      const sortMode = info.sortBy as SortMode;
      return {
        sortedSongIds: sortSongIds(props.library, props.songIds, sortMode, info.sortDirection),
        sortMode,
        sortDirection: info.sortDirection
      };
    })
  }

  private onRowDoubleClick(info: RowMouseEventHandlerParams) {
    const songId = this.state.sortedSongIds[info.index];
    this.props.onSongSelected(songId);
  }

  private rowGetter(index: Index): Song  | undefined {
    return this.props.library.getSong(this.state.sortedSongIds[index.index]);
  }

  private durationCellRenderer(props: TableCellProps): React.ReactFragment {
    const song: Song = props.rowData;
    const minutes = Math.floor(song.duration / 60);
    const seconds = song.duration % 60;
    if (minutes < 1) {
      return seconds + "s";
    } else {
      return minutes + "m " + seconds + "s";
    }
  }

  private ratingCellRenderer(props: TableCellProps): React.ReactFragment {
    const song: Song = props.rowData;
    let stars = [];
    for (let i = 0; i < Math.min(song.rating, 5); i++) {
      stars.push(<i key={i} className="fas fa-star" />);
    }
    return <span className="stars">{...stars}</span>;
  }

  private rowClassName(info: Index) {
    const songId = this.state.sortedSongIds[info.index];
    const song = this.props.library.getSong(songId);
    if (song && song.id === this.props.currentSongId) {
      return "song-row selected";
    } else {
      return "song-row";
    }
  }

  public render() {
    return (
      <div className="song-list">
        <AutoSizer>
          {({ width, height }) => (
            <Table
              headerHeight={40}
              height={height}
              rowHeight={31}
              rowGetter={this.rowGetter}
              rowCount={this.state.sortedSongIds.length}
              sort={this.sortList}
              sortBy={this.state.sortMode}
              sortDirection={this.state.sortDirection}
              onRowDoubleClick={this.onRowDoubleClick}
              rowClassName={this.rowClassName}
              scrollToIndex={this.state.scrollToIndex}
              width={width}>
              <Column dataKey={'title'}
                headerRenderer={this.headerRenderer('Title')}
                width={200}
                flexGrow={1} />
              <Column dataKey={'genre'}
                headerRenderer={this.headerRenderer('Genre')}
                width={175} />
              <Column dataKey={'artist'}
                headerRenderer={this.headerRenderer('Artist')}
                width={200}
                flexGrow={1} />
              <Column dataKey={'album'}
                headerRenderer={this.headerRenderer('Album')}
                width={200}
                flexGrow={1} />
              <Column dataKey={'duration'}
                headerRenderer={this.headerRenderer('Duration')}
                cellRenderer={this.durationCellRenderer}
                width={100} />
              <Column dataKey={'rating'}
                className={'rating-col'}
                headerRenderer={this.headerRenderer('Rating')}
                cellRenderer={this.ratingCellRenderer}
                width={90} />
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }
}
