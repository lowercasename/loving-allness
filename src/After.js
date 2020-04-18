import React from 'react';
import NonDraggableTile from './NonDraggableTile'

export default class After extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <main className="gameboard gameboard--after">
        <div className="droparea">
          <div className="droparea__title">
            <h2>Onwards</h2>
          </div>
          <div
            className='world-card droparea__tilestack'
          >
            {this.props.onwardsWorldTiles.map((item, index) => (
              <NonDraggableTile
                key={item.id}
                tile={item}
                index={index}
              />
            ))}
          </div>
        </div>
        <div className="droparea archival-notes">
          <div className="droparea__title">
            <h2>Archival Notes</h2>
          </div>
          <div
            className='world-card droparea__tilestack'
          >
            <textarea value={this.props.archivalNotes} onChange={this.props.handleArchivalNotesChange} placeholder="You may write your archival notes here." />
          </div>

        </div>
      </main>
    )
  }
}