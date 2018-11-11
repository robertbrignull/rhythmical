import * as React from "react";

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
    name: "Unrated",
    predicate: (s: Song) => s.rating === 0
  }
];

export const defaultPlaylist = allPlaylists[0];

interface PlaylistsProps {
  currentPlaylist: string;
  onPlaylistSelected: (playlist: Playlist) => void;
}

export class Playlists extends React.Component<PlaylistsProps, {}> {
  public render() {
    return <div className="playlists">
      {...
        allPlaylists.map(p => {
          let className = "playlist" +
            ((p.name === this.props.currentPlaylist) ? " selected" : "");
          return (
            <div key={p.name}
                 className={className}
                 onDoubleClick={() => this.props.onPlaylistSelected(p)}>
              <i className="fas fa-search"/>
              <span className="playlist-name">{p.name}</span>
            </div>
          );
        })
      }
    </div>
  }
}
