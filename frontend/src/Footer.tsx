import * as React from "react";

interface FooterProps {
  allSongs: Song[];
  currentPlaylist: Playlist;
}

export class Footer extends React.Component<FooterProps, {}> {
  public render() {
    let songs = this.props.allSongs.filter(this.props.currentPlaylist.predicate);
    let numSongs = songs.length;

    let totalLengthSeconds = songs.reduce((a, b) => a + b.duration, 0);
    let totalDays = Math.floor(totalLengthSeconds / (24 * 60 * 60));
    let totalHours = Math.floor(totalLengthSeconds / (60 * 60)) % 24;
    let totalMinutes = Math.floor(totalLengthSeconds / 60) % 60;

    return <div className="footer">
      { numSongs + " songs, " }
      { totalDays > 0 ? totalDays + " days, " : "" }
      { totalDays > 0 || totalHours > 0 ? totalHours + " hours and " : "" }
      { totalMinutes + " minutes" }
    </div>
  }
}