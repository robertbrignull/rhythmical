import * as React from "react";
import { Playlist } from "./Filters";

interface Props {
  playlist: Playlist;
  isSelected: boolean;
  onSelected: () => void;
}

export function PlaylistFilter(props: Props) {
  const { playlist, isSelected, onSelected } = props;

  const className = "playlist" + (isSelected ? " selected" : "");
  return (
    <div
      key={"playlist_" + playlist.name}
      className={className}
      onClick={onSelected}
    >
      <i className="fas fa-search" />
      {isSelected ? <i className="fas fa-caret-right" /> : null}
      <span className="playlist-name">{playlist.name}</span>
    </div>
  );
}
