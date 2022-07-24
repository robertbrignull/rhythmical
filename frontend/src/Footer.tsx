import * as React from "react";
import { Library } from "./Library";

interface FooterProps {
  library: Library;
  songIds: string[];
}

export class Footer extends React.PureComponent<FooterProps, {}> {
  private calculateTotalLengthSeconds() {
    let total = 0;
    for (const songId of this.props.songIds) {
      const song = this.props.library.getSong(songId);
      if (song) {
        total += song.duration;
      }
    }
    return total;
  }

  public render() {
    let numSongs = this.props.songIds.length;

    let totalLengthSeconds = this.calculateTotalLengthSeconds();
    let totalDays = Math.floor(totalLengthSeconds / (24 * 60 * 60));
    let totalHours = Math.floor(totalLengthSeconds / (60 * 60)) % 24;
    let totalMinutes = Math.floor(totalLengthSeconds / 60) % 60;

    return <div className="footer">
      {numSongs + " songs, "}
      {totalDays > 0 ? totalDays + " days, " : ""}
      {totalDays > 0 || totalHours > 0 ? totalHours + " hours and " : ""}
      {totalMinutes + " minutes"}
    </div>
  }
}