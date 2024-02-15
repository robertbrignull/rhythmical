import * as React from "react";

import "react-virtualized/styles.css";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import {
  Table,
  Column,
  TableCellProps,
  TableHeaderProps,
  SortIndicator,
  SortDirectionType,
  RowMouseEventHandlerParams,
} from "react-virtualized/dist/es/Table";
import { Index } from "react-virtualized";
import { Library } from "../state/Library";

type SortMode = "title" | "genre" | "artist" | "album" | "duration" | "rating";

function sortSongIds(
  library: Library,
  songIds: string[],
  sortMode: SortMode,
  sortDirection: SortDirectionType,
): string[] {
  let cmp: (a: Song, b: Song) => number;
  if (sortMode === "title") {
    cmp = (a, b) => a.title.localeCompare(b.title);
  } else if (sortMode === "genre") {
    cmp = (a, b) => a.genre.localeCompare(b.genre);
  } else if (sortMode === "artist") {
    cmp = (a, b) => a.artist.localeCompare(b.artist);
  } else if (sortMode === "album") {
    cmp = (a, b) => a.album.localeCompare(b.album);
  } else if (sortMode === "duration") {
    cmp = (a, b) => a.duration - b.duration;
  } else if (sortMode === "rating") {
    cmp = (a, b) => a.rating - b.rating;
  } else {
    cmp = () => 0;
  }

  const sortedSongsWithIds: Array<[string, Song]> = [];
  for (const songId of songIds) {
    const song = library.getSong(songId);
    if (song) {
      sortedSongsWithIds.push([songId, song]);
    }
  }

  const directedCmp =
    sortDirection === "ASC" ? cmp : (a: Song, b: Song) => cmp(b, a);
  sortedSongsWithIds.sort((a: [string, Song], b: [string, Song]) =>
    directedCmp(a[1], b[1]),
  );

  return sortedSongsWithIds.map((a: [string, Song]) => a[0]);
}

interface SongListProps {
  library: Library;
  songIds: string[];
  currentSongId?: string;
  onSongSelected: (songId: string) => void;
}

export function SongList(props: SongListProps) {
  const { library, songIds, currentSongId, onSongSelected } = props;

  const [sortMode, setSortMode] = React.useState<SortMode>("artist");
  const [sortDirection, setSortDirection] = React.useState<SortDirectionType>("ASC");

  const [scrollToIndex, setScrollToIndex] = React.useState<number | undefined>(undefined);

  const [sortedSongIds, setSortedSongIds] = React.useState<string[]>(sortSongIds(library, songIds, sortMode, sortDirection));

  React.useEffect(() => {
    if (currentSongId !== undefined) {
      setScrollToIndex(sortedSongIds.indexOf(currentSongId));
    }
  }, [currentSongId, sortedSongIds]);

  React.useEffect(() => {
    setSortedSongIds(sortSongIds(library, songIds, sortMode, sortDirection));
  }, [library, songIds, sortMode, sortDirection]);

  const headerRenderer = (
    label: string | undefined,
    disableSort?: boolean,
  ): (props: TableHeaderProps) => React.ReactNode => {
    // eslint-disable-next-line react/display-name
    return (props: TableHeaderProps) => {
      return (
        <div>
          {label}
          {!disableSort && props.sortBy === props.dataKey && (
            <SortIndicator sortDirection={props.sortDirection} />
          )}
        </div>
      );
    };
  }

  const sortList = React.useCallback((info: { sortBy: string; sortDirection: SortDirectionType }) => {
    setSortMode(info.sortBy as SortMode);
    setSortDirection(info.sortDirection);
  }, []);

  const onRowDoubleClick = React.useCallback((info: RowMouseEventHandlerParams) => {
    onSongSelected(sortedSongIds[info.index]);
  }, [onSongSelected, sortedSongIds]);

  const rowGetter = React.useCallback((index: Index): Song | undefined => {
    return library.getSong(sortedSongIds[index.index]);
  }, [library, sortedSongIds]);

  const durationCellRenderer = React.useCallback((props: TableCellProps): React.JSX.Element => {
    const song: Song = props.rowData;
    const minutes = Math.floor(song.duration / 60);
    const seconds = song.duration % 60;
    if (minutes < 1) {
      return <span>{seconds + "s"}</span>;
    } else {
      return <span>{minutes + "m " + seconds + "s"}</span>;
    }
  }, []);

  const ratingCellRenderer = React.useCallback((props: TableCellProps): React.JSX.Element => {
    const song: Song = props.rowData;
    const stars: React.JSX.Element[] = [];
    for (let i = 0; i < Math.min(song.rating, 5); i++) {
      stars.push(<i key={i} className="fas fa-star" />);
    }
    return <span className="stars">{...stars}</span>;
  }, []);

  const rowClassName = React.useCallback((info: Index) => {
    const songId = sortedSongIds[info.index];
    const song = library.getSong(songId);
    if (song && song.id === currentSongId) {
      return "song-row selected";
    } else {
      return "song-row";
    }
  }, [currentSongId, library, sortedSongIds]);

  return (
    <div className="song-list">
      <AutoSizer>
        {({ width, height }) => (
          <Table
            headerHeight={40}
            height={height}
            rowHeight={31}
            rowGetter={rowGetter}
            rowCount={sortedSongIds.length}
            sort={sortList}
            sortBy={sortMode}
            sortDirection={sortDirection}
            onRowDoubleClick={onRowDoubleClick}
            rowClassName={rowClassName}
            scrollToIndex={scrollToIndex}
            width={width}
          >
            <Column
              dataKey={"title"}
              headerRenderer={headerRenderer("Title")}
              width={200}
              flexGrow={1}
            />
            <Column
              dataKey={"genre"}
              headerRenderer={headerRenderer("Genre")}
              width={175}
            />
            <Column
              dataKey={"artist"}
              headerRenderer={headerRenderer("Artist")}
              width={200}
              flexGrow={1}
            />
            <Column
              dataKey={"album"}
              headerRenderer={headerRenderer("Album")}
              width={200}
              flexGrow={1}
            />
            <Column
              dataKey={"duration"}
              headerRenderer={headerRenderer("Duration")}
              cellRenderer={durationCellRenderer}
              width={100}
            />
            <Column
              dataKey={"rating"}
              className={"rating-col"}
              headerRenderer={headerRenderer("Rating")}
              cellRenderer={ratingCellRenderer}
              width={90}
            />
          </Table>
        )}
      </AutoSizer>
    </div>
  );
}
