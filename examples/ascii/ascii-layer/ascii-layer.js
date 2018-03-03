/* global document */
import {CompositeLayer, IconLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {Texture2D, Model, GL} from 'luma.gl';
import {makeFontAtlas} from 'deck.gl-layers/dist/text-layer/font-atlas';
import CHARS from './chars';

const FONT_FAMILY = '"Lucida Console", Monaco, monospace';
const LETTER_WIDTH = 18;
const LETTER_HEIGHT = 32;

function bitColor(x) {
  return ((x + 32) >> 6) << 6;
}

export default class AsciiLayer extends CompositeLayer {

  initializeState() {
    // WebGL1
    // gl.getExtension('OES_texture_float');

    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');

    const {gl} = this.context;
    const {mapping, texture} = makeFontAtlas(gl, FONT_FAMILY);

    const iconFrameData = new Float32Array(256 * 4);
    let i = 0;
    CHARS.forEach(char => {
      const def = mapping[char];
      iconFrameData[i++] = def.x;
      iconFrameData[i++] = def.y;
      iconFrameData[i++] = def.width;
      iconFrameData[i++] = def.height;
    });

    this.setState({
      canvas,
      canvasContext,
      iconAtlas: texture,
      iconMapping: mapping
    });
  }

  updateState({props, oldProps}) {
    const {canvas, canvasContext} = this.state;

    if (props.width !== oldProps.width ||
      props.height !== oldProps.height ||
      props.sizeScale !== oldProps.sizeScale) {
      const {grid, texture, dimension} = this._updateDimension(props)
      this.setState({grid, texture, dimension});

      canvas.width = dimension[0];
      canvas.height = dimension[1];
    }
    // Update texture
    // this.state.texture.setImageData({data: props.video});

    canvasContext.drawImage(props.video, 0, 0, canvas.width, canvas.height);
    const frame = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const data = this.state.grid;

    for (let i = 0; i < data.length; i++) {
      const r = frame.data[i * 4];
      const g = frame.data[i * 4 + 1];
      const b = frame.data[i * 4 + 2];
      const l = ((r + g + b) / 3) | 0;
      data[i].char = CHARS[l];
      data[i].color = [
        bitColor(r),
        bitColor(g),
        bitColor(b)
      ];
    }
  }

  _updateDimension({width, height, sizeScale}) {
    const letterWidth = sizeScale * LETTER_WIDTH;
    const letterHeight = sizeScale * LETTER_HEIGHT;

    const xCount = Math.ceil(width / letterWidth);
    const yCount = Math.ceil(height / letterHeight);
    const grid = [];
    let index = 0;

    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        grid.push({
          x: (x + 0.5) * letterWidth,
          y: (y + 0.5) * letterHeight,
          u: x / xCount,
          v: y / yCount
        });
      }
    }
    return {
      grid,
      texture: new Texture2D(this.context.gl, {width: xCount, height: yCount}),
      dimension: [xCount, yCount]
    };
  }

  renderLayers() {
    const {grid, iconAtlas, iconMapping} = this.state;
    const {sizeScale, timestamp} = this.props;

    return new IconLayer({
      id: 'text',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: grid,
      opacity: 1,
      iconAtlas,
      iconMapping,
      sizeScale: LETTER_HEIGHT * 2 * sizeScale,

      getIcon: d => d.char,
      getColor: d => d.color,
      getPosition: d => [d.x, d.y],

      updateTriggers: {
        getIcon: timestamp,
        getColor: timestamp
      }
    });

  }
}

AsciiLayer.layerName = 'AsciiLayer';
