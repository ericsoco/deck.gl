/* global window,document */
import React, {Component} from 'react';
import {findDOMNode, render} from 'react-dom';
import DeckGLOverlay from './deckgl-overlay.js';

const SCALES = [0.125, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 500,
      height: 500,
      scaleIndex: 3,
      timestamp: Date.now(),
      videoSource: null
    };

    this._onResize = this._onResize.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onUpdate = this._onUpdate.bind(this);
    this._onLoad = this._onLoad.bind(this);
  }

  componentDidMount() {
    this._onResize();

    window.addEventListener('resize', this._onResize);
    document.addEventListener('keydown', this._onKeydown);
    this._timer = window.requestAnimationFrame(this._onUpdate);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._onKeydown);
    window.cancelAnimationFrame(this._timer);
  }

  _onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onKeydown(event) {
    if (event.keyCode === 38) {
      // up: increase font size
      this.setState({scaleIndex: Math.min(this.state.scaleIndex + 1, SCALES.length - 1)});
    } else if (event.keyCode === 40) {
      // down: reduce font size
      this.setState({scaleIndex: Math.max(0, this.state.scaleIndex - 1)});
    } else if (event.keyCode === 32) {
      // spacebar: toggle playback
      const {isPlaying} = this.state;
      this._video[isPlaying ? 'pause' : 'play']();
      this.setState({isPlaying: !isPlaying});
    } else if (event.keyCode === 39) {
      // right: use webcam
      this._initWebcam();
    } else if (event.keyCode === 37) {
      // left: use canned video
      this._stopWebcam();
    }
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
      this.setState({
        isPlaying: true,
        videoSource: video.srcObject
      });
    }
  }

  _initWebcam() {
    window.navigator.mediaDevices.getUserMedia({video: true})
      .then(stream => {
        if (this._video) {
          this._video.srcObject = stream;
          findDOMNode(this).querySelector('canvas').style.transform = 'rotateY(180deg)';
        }
      })
      .catch(error => console.error(error));
  }

  _stopWebcam() {
    if (this._video) {
      this._video.srcObject = this.state.videoSource;
      findDOMNode(this).querySelector('canvas').style.transform = null;
    }
  }

  render() {
    const {width, height, timestamp, scaleIndex} = this.state;

    return (
      <div>
        <video autoPlay
          style={{position: 'absolute', visibility: 'hidden'}}
          ref={this._onLoad} >
          <source src="./data/Addison Groove - Changa.mp4" type="video/mp4" />
        </video>
        <DeckGLOverlay
          width={width}
          height={height}
          timestamp={timestamp}
          sizeScale={SCALES[scaleIndex]}
          video={this._video}
        />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
