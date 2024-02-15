import * as React from "react";
import { Library } from "../state/Library";

interface FooterProps {
  library: Library;
  songIds: string[];
}

export const Footer = (props: FooterProps) => {
  const { library, songIds } = props;

  const numSongs = songIds.length;

  const totalLengthSeconds = React.useMemo(() => {
    let total = 0;
    for (const songId of songIds) {
      const song = library.getSong(songId);
      if (song) {
        total += song.duration;
      }
    }
    return total;
  }, [library, songIds]);

  const totalDays = Math.floor(totalLengthSeconds / (24 * 60 * 60));
  const totalHours = Math.floor(totalLengthSeconds / (60 * 60)) % 24;
  const totalMinutes = Math.floor(totalLengthSeconds / 60) % 60;

  return (
    <div className="footer">
      {numSongs + " songs, "}
      {totalDays > 0 ? totalDays + " days, " : ""}
      {totalDays > 0 || totalHours > 0 ? totalHours + " hours and " : ""}
      {totalMinutes + " minutes"}
    </div>
  );
};
