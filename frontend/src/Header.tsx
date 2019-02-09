import * as React from "react";
import {RefObject} from "react";
import Api from "./api";

interface HeaderProps {
  currentSong?: Song;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
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

    this.playPauseClicked = this.playPauseClicked.bind(this);
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
      this.play();
    }
  }

  public play() {
    if (this.audio.current) {
      this.audio.current.play();
    }
  }

  public pause() {
    if (this.audio.current) {
      this.audio.current.pause();
    }
  }

  private playPauseClicked() {
    if (this.props.playing) {
      this.pause();
      this.props.onPause();
    } else {
      this.play();
      this.props.onPlay();
    }
  }

  private renderButtonControls() {
    let playPauseIcon = this.props.playing ? (
      <i className="fas fa-pause fa-2x"/>
    ) : (
      <i className="fas fa-play fa-2x"/>
    );
    let playPauseButton = (
      <button onClick={this.playPauseClicked}>
        { playPauseIcon }
      </button>
    );
    return (
      <div className={"buttonControls"}>
        { playPauseButton }
      </div>
    );
  }

  private renderCurrentSongName() {
    let song = this.props.currentSong;
    if (song !== undefined) {
      return (
        <div>
          {song.title}
          <br/>
          by {song.artist} from {song.album}
        </div>
      );
    } else {
      return (
        <div>
          Not playing
        </div>
      );
    }
  }

  public render() {
    return (
      <div className="header">
        <div className="controls">
          { this.renderButtonControls() }
          { this.renderCurrentSongName() }
        </div>
        <audio controls ref={this.audio}
               className="audio-controls"
               onPlay={this.props.onPlay}
               onPause={this.props.onPause}
               onEnded={this.props.onEnded}>
          { this.state.currentSongSrc
            ? <source src={this.state.currentSongSrc} />
            : null }
        </audio>
      </div>
    );
  }
}
