import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Tile from './Tile'

export default class Before extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <DragDropContext onDragEnd={this.props.onDragEnd}>
        <main className="gameboard gameboard--before">
          <div className="droparea">
            <div className="droparea__title">
              <h2>Pocket</h2>
            </div>
            <Droppable droppableId={JSON.stringify({ location: 'beforePocketTiles', owner: this.props.player })}>
              {(provided, snapshot) => (
                <div
                  className='pocket droparea__tilestack'
                  ref={provided.innerRef}
                  style={this.props.getListStyle(snapshot.isDraggingOver)}>
                  {this.props.beforePocketTiles.map((item, index) => (
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
              <h2>Before</h2>
            </div>
            <Droppable droppableId={JSON.stringify({ location: 'beforeWorldTiles', owner: this.props.player })}>
              {(provided, snapshot) => (
                <div
                  className='world-card droparea__tilestack'
                  ref={provided.innerRef}
                  style={this.props.getListStyle(snapshot.isDraggingOver)}>
                  {this.props.beforeWorldTiles.map((item, index) => (
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