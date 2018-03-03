/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGLOverlay from './deckgl-overlay.js';

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 500,
      height: 500,
      timestamp: Date.now()
    };

    this._onResize = this._onResize.bind(this);
    this._onUpdate = this._onUpdate.bind(this);
    this._onLoad = this._onLoad.bind(this);
  }

  componentDidMount() {
    this._onResize();

    window.addEventListener('resize', this._onResize);
    this._timer = window.requestAnimationFrame(this._onUpdate);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    window.cancelAnimationFrame(this._timer);
  }

  _onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onUpdate() {
    this.setState({
      timestamp: Date.now()
    });

    this._timer = window.requestAnimationFrame(this._onUpdate);
  }

  _onLoad(video) {
    this._video = video;
    if (video) {
      this.setState({isPlaying: true});
    }
  }

  render() {
    const {width, height, timestamp, isPlaying} = this.state;

    return (
      <div>
        <video autoPlay
          style={{position: 'absolute', visibility: 'hidden'}}
          ref={this._onLoad} >
          <source src="./data/los_ageless.m4v" type="video/mp4" />
        </video>
        <DeckGLOverlay width={width} height={height} timestamp={timestamp} video={isPlaying && this._video} />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
