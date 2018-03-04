import React, {Component} from 'react';
import DeckGL, {OrthographicViewport} from 'deck.gl';
import AsciiLayer from './ascii-layer/ascii-layer';

export default class DeckGLOverlay extends Component {

  render() {
    const {width, height, video, timestamp, sizeScale} = this.props;

    if (!video) {
      return null;
    }

    const layer = new AsciiLayer({
      id: 'video',
      width,
      height,
      video,
      timestamp,
      sizeScale
    });

    const viewport = new OrthographicViewport({
      width,
      height,
      left: 0,
      top: 0
    });

    return <DeckGL width={width} height={height} viewport={viewport} layers={[layer]} />;
  }
}
