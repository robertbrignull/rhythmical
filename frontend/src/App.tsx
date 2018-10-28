import * as React from 'react';
import './App.css';
import Api from './api';

interface AppState {
  songs?: Song[]
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      songs: undefined
    };
  }

  public componentDidMount() {
    Api.songs.getAll().then((songs: Song[]) => {
      this.setState({ songs });
    });
  }

  public render() {
    if (this.state.songs) {
      return (
        <div>
          {... this.state.songs.map(song =>
            <div key={song.id} className="song">
              { song.name }
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="loading-message">
          Loading...
        </div>
      );
    }
  }
}

export default App;
