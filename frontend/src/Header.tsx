import * as React from "react";
import {ChangeEvent, RefObject} from "react";
import Api from "./api";

function formatDuration(duration: number) {
  let mins = "" + Math.floor(duration / 60);
  let secs = "" + Math.floor(duration % 60);
  if (secs.length === 1) {
    secs = "0" + secs;
  }
  return mins + ":" + secs;
}

interface HeaderProps {
  currentSong?: Song;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onBackwards: () => void;
  onEnded: () => void;
}

interface HeaderState {
  currentSongSrc?: string;
  currentSongPosition?: number;
  muted: boolean;
}

export class Header extends React.Component<HeaderProps, HeaderState> {

  private readonly audio: RefObject<HTMLAudioElement>;

  constructor(props: HeaderProps) {
    super(props);

    this.state = {
      currentSongSrc: undefined,
      currentSongPosition: undefined,
      muted: false,
    };

    this.audio = React.createRef();

    this.onTimeUpdate = this.onTimeUpdate.bind(this);
    this.positionSliderChanged = this.positionSliderChanged.bind(this);
    this.backwardClicked = this.backwardClicked.bind(this);
    this.playPauseClicked = this.playPauseClicked.bind(this);
    this.forwardClicked = this.forwardClicked.bind(this);
    this.volumeClicked = this.volumeClicked.bind(this);
  }

  public componentDidUpdate(prevProps: HeaderProps) {
    const oldSong = prevProps.currentSong;
    const nextSong = this.props.currentSong;
    if (!nextSong && oldSong) {
      this.setState({
        currentSongSrc: undefined,
        currentSongPosition: undefined,
      }, () => {
        if (this.audio.current && this.audio.current) {
          this.audio.current.pause();
        }
      });

    } else if (nextSong && (!oldSong || nextSong.id != oldSong.id)) {
      this.setState({
        currentSongPosition: 0,
      }, () => {
        if (this.audio.current) {
          this.audio.current.pause();
        }

        Api.songs.getSrc(nextSong).then(songSrc => {
          this.setState({
            currentSongSrc: songSrc,
          }, () => {
            if (this.audio.current) {
              this.audio.current.load();
              this.audio.current.play()
                .catch(error => console.error("Unable to play: ", error));
              this.props.onPlay();
            }
          });
        }, error => {
          console.error("Unable to get song src: ", error)
        });
      });
    }
  }

  public restartSong() {
    if (this.audio.current && this.state.currentSongSrc !== undefined) {
      this.audio.current.currentTime = 0;
      this.setState({
        currentSongPosition: 0
      });
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

  private onTimeUpdate() {
    if (this.audio.current) {
      this.setState({
        currentSongPosition: this.audio.current.currentTime
      });
    }
  }

  private positionSliderChanged(event: ChangeEvent) {
    if (this.audio.current) {
      this.audio.current.currentTime = (event.target as any).value;
    }
  }

  private backwardClicked() {
    const pos = this.state.currentSongPosition;
    if (pos !== undefined && pos < 3) {
      this.pause();
      this.props.onBackwards();
    } else {
      this.restartSong();
      this.props.onPlay();
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

  private forwardClicked() {
    this.props.onEnded();
  }

  private volumeClicked() {
    this.setState(state => {
      if (this.audio.current) {
        if (state.muted) {
          this.audio.current.volume = 1;
        } else {
          this.audio.current.volume = 0;
        }
      }
      return {
        muted: !state.muted
      };
    });
  }

  private renderButtonControls() {
    let backwardButton = (
      <button onClick={this.backwardClicked}>
        <i className="fas fa-backward fa-2x"/>
      </button>
    );

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

    let forwardButton = (
      <button onClick={this.forwardClicked}>
        <i className="fas fa-forward fa-2x"/>
      </button>
    );

    return (
      <div className={"buttonControls"}>
        { backwardButton }
        { playPauseButton }
        { forwardButton }
      </div>
    );
  }

  private renderCurrentSongName() {
    let song = this.props.currentSong;
    if (song !== undefined) {
      return (
        <div className="songTitle">
          {song.title}
          <br/>
          by {song.artist} from {song.album}
        </div>
      );
    } else {
      return (
        <div className="songTitle">
          Not playing
        </div>
      );
    }
  }

  private renderPositionText() {
    if (this.props.currentSong === undefined ||
      this.state.currentSongPosition === undefined) {
      return null;
    }

    const position = this.state.currentSongPosition;
    const maxPosition = this.props.currentSong.duration;
    return (
      <div className="position-text">
        { formatDuration(position) + " / " + formatDuration(maxPosition) }
      </div>
    );
  }

  private renderPositionSlider() {
    if (this.props.currentSong === undefined ||
      this.state.currentSongPosition === undefined) {
      return null;
    }

    const position = this.state.currentSongPosition;
    const maxPosition = this.props.currentSong.duration;
    return (
      <div className="position-slider">
        <input type="range"
               min={0}
               max={Math.floor(maxPosition)}
               value={Math.floor(position)}
               step={1}
               onChange={this.positionSliderChanged}/>
      </div>
    );
  }

  private renderVolumeControls() {
    let volumeIcon = this.state.muted ? (
      <i className="fas fa-volume-mute fa-lg"/>
    ) : (
      <i className="fas fa-volume-up fa-lg"/>
    );
    return (
      <div className="volume-controls">
        <button onClick={this.volumeClicked}>
          { volumeIcon }
        </button>
      </div>
    );
  }

  public render() {
    return (
      <div className="header">
        <div className="controls">
          { this.renderButtonControls() }
          { this.renderCurrentSongName() }
          { this.renderPositionText() }
          { this.renderPositionSlider() }
          { this.renderVolumeControls() }
        </div>
        <audio ref={this.audio}
               className="audio-controls"
               onPlay={this.props.onPlay}
               onPause={this.props.onPause}
               onEnded={this.props.onEnded}
               onTimeUpdate={this.onTimeUpdate}>
          { this.state.currentSongSrc
            ? <source src={this.state.currentSongSrc} />
            : null }
        </audio>
      </div>
    );
  }
}
