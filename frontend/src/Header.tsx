import * as React from "react";
import {RefObject} from "react";

interface HeaderProps {
  currentSong?: Song;
}

export class Header extends React.Component<HeaderProps, {}> {

  private readonly audio: RefObject<HTMLAudioElement>;

  constructor(props: HeaderProps) {
    super(props);

    this.audio = React.createRef();
  }

  public componentDidUpdate(prevProps: HeaderProps) {
    if (this.audio.current) {
      if (!this.props.currentSong) {
        this.audio.current.pause();

      } else if (!prevProps.currentSong ||
        this.props.currentSong.id != prevProps.currentSong.id) {

        this.audio.current.load();
        this.audio.current.play()
          .catch(error => console.error("Unable to play: ", error));
      }
    }
  }

  private static getSongSource(song: Song): string {
    return "/api/songs/" + song.id + "/contents";
  }

  public render() {
    return (
      <audio controls ref={this.audio}>
        { this.props.currentSong
          ? <source src={Header.getSongSource(this.props.currentSong)} />
          : null }
      </audio>
    );
  }
}
