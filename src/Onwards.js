import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Tile from './Tile'

export default class Onwards extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <DragDropContext onDragEnd={this.props.onDragEnd}>
        <main className="gameboard gameboard--onwards">
          <div className="droparea">
            <div className="droparea__title">
              <h2>Onwards</h2>
            </div>
            <Droppable droppableId={JSON.stringify({ location: 'onwardsWorldTiles', owner: 'world' })}>
              {(provided, snapshot) => (
                <div
                  className='world-card droparea__tilestack'
                  ref={provided.innerRef}
                  style={this.props.getListStyle(snapshot.isDraggingOver)}>
                  {this.props.onwardsWorldTiles.map((item, index) => (
                    <Tile
                      key={item.id}
                      tile={item}
                      index={index}
                      handleMeaningUpdate={this.props.handleMeaningUpdate}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          <div className="droparea">
            <div className="droparea__title">
              <h2>Pocket</h2>
            </div>
            <Droppable direction="horizontal" droppableId={JSON.stringify({ location: 'onwardsPocketTiles', owner: 'world' })}>
              {(provided, snapshot) => (
                <div
                  className='pocket droparea__tilestack'
                  ref={provided.innerRef}
                  style={this.props.getListStyle(snapshot.isDraggingOver)}>
                  {this.props.onwardsPocketTiles.map((item, index) => (
                    <Tile
                      key={item.id}
                      tile={item}
                      index={index}
                      handleMeaningUpdate={this.props.handleMeaningUpdate}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

        </main>
      </DragDropContext>
    )
  }
}