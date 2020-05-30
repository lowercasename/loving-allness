import React from 'react';

export default class Tile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div
        key={this.props.tile.id}
        className='tile'
      >
        <div className="tile__image"
          style={{
            backgroundImage: 'url(' + this.props.tile.image + ')',
            transform: [{ rotate: this.props.tile.rotation }],
            boxShadow: '1px 1px 2px rgba(0,0,0,0.1)',
          }}
        ></div>
        <div className="tile__meaning" style={{ marginTop: '10px' }}>{this.props.tile.meaning}</div>
      </div>
    )
  }
}