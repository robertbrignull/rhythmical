import * as React from "react";
import { ChangeEvent } from "react";
import { PlaylistFilter } from "./PlaylistFilter";

export interface Playlist {
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

export function Filters(props: PlaylistsProps) {
  const { onFilterChanged } = props;

  const [currentPlaylist, setCurrentPlaylist] = React.useState(allPlaylists[0]);
  const [searchString, setSearchString] = React.useState("");

  React.useEffect(() => {
    onFilterChanged(makeFilter(currentPlaylist, searchString));
  }, [currentPlaylist, onFilterChanged, searchString]);

  const onPlaylistSelectedCallbacks: Array<() => void> = React.useMemo(() => {
    return allPlaylists.map(playlist => () => setCurrentPlaylist(playlist));
  }, [])

  const onSearchBoxChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
  }, []);

  return (
    <div className="filters">
      <div className={'search-wrapper'}>
        <input key={'search'}
          className={'search-input'}
          onChange={onSearchBoxChange}
          value={searchString} />
      </div>
      {...
        allPlaylists.map((playlist, index) => (
          <PlaylistFilter
            key={playlist.name}
            playlist={playlist}
            isSelected={playlist === currentPlaylist}
            onSelected={onPlaylistSelectedCallbacks[index]}
          ></PlaylistFilter>
        ))
      }
    </div>
  );
}
