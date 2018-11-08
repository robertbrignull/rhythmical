import * as React from "react";
import {RefObject} from "react";
import Api from "./api";

interface HeaderProps {
  currentSong?: Song;
  onPlay: () => void;
  onPause: () => void;
}

interface HeaderState {
  currentSongSrc?: string;
}

export class Header extends React.Component<HeaderProps, HeaderState> {

  private readonly audio: RefObject<HTMLAudioElement>;

  constructor(props: HeaderProps) {
    super(props);

    this.state = {
      currentSongSrc: undefined,
    };

    this.audio = React.createRef();
  }

  public componentDidUpdate(prevProps: HeaderProps) {
    if (this.audio.current) {
      if (!this.props.currentSong) {
        this.audio.current.pause();

      } else if (!prevProps.currentSong ||
        this.props.currentSong.id != prevProps.currentSong.id) {

        this.audio.current.pause();
        this.props.onPause();
        Api.songs.getSrc(this.props.currentSong).then(songSrc => {
          this.setState({
            currentSongSrc: songSrc,
          }, () => {
            if (this.audio.current) {
              this.audio.current.load();
              this.audio.current.play()
                .catch(error => console.error("Unable to play: ", error));
            }
          });
        }, error => {
          console.error("Unable to get song src: ", error)
        });
      }
    }
  }

  public restartSong() {
    if (this.audio.current) {
      this.audio.current.currentTime = 0;
    }
  }

  public pause() {
    if (this.audio.current) {
      this.audio.current.pause();
    }
  }

  public render() {
    return (
      <audio controls ref={this.audio}
             onPlay={this.props.onPlay}
             onPause={this.props.onPause}>
        { this.state.currentSongSrc
          ? <source src={this.state.currentSongSrc} />
          : null }
      </audio>
    );
  }
}
