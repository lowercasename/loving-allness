import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

export default class Tile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Draggable
        key={this.props.tile.id}
        draggableId={this.props.tile.id}
        index={this.props.index}>
        {(provided, snapshot) => (
          <div
            className='tile'
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
          >
            <div className="tile__image"
              style={{
                backgroundImage: 'url(' + this.props.tile.image + ')',
                transform: [{ rotate: this.props.tile.rotation }],
                boxShadow: snapshot.isDragging ? '2px 2px 4px rgba(0,0,0,0.2)' : '1px 1px 2px rgba(0,0,0,0.1)',
              }}
            ></div>
            <input
              type="text"
              className="tile__meaning"
              placeholder="Name"
              value={this.props.tile.meaning || ''}
              onChange={(event) => this.props.handleMeaningUpdate(this.props.tile.id, event)}
            />
          </div>
        )}
      </Draggable>
    )
  }
}