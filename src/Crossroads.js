import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Tile from './Tile'

export default class Crossroads extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <DragDropContext onDragEnd={this.props.onDragEnd}>
        <main className="gameboard gameboard--crossroads">
          <div className="droparea">
            <div className="droparea__title">
              <h2>Pocket</h2>
            </div>
            <Droppable droppableId={JSON.stringify({ location: 'crossroadsPocketTiles', owner: this.props.player })}>
              {(provided, snapshot) => (
                <div
                  className='pocket droparea__tilestack'
                  ref={provided.innerRef}
                  style={this.props.getListStyle(snapshot.isDraggingOver)}>
                  {this.props.crossroadsPocketTiles.map((item, index) => (
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
          {Object.keys(this.props.takenPlayers).map(player => {
            if (this.props.crossroadsWorldTiles.find(tile => tile.owner === player)) {
              return (
                <div className="droparea" key={player}>
                  <div className="droparea__title">
                    <h2>{player}</h2>
                  </div>
                  <Droppable droppableId={JSON.stringify({ location: 'crossroadsWorldTiles', owner: player })}>
                    {(provided, snapshot) => (
                      <div
                        className='world-card droparea__tilestack'
                        ref={provided.innerRef}
                        style={this.props.getListStyle(snapshot.isDraggingOver)}>
                        {this.props.crossroadsWorldTiles.filter(tile => tile.owner === player).sort(this.props.idSort).map((tile, index) => (
                          <Tile
                            key={tile.id}
                            tile={tile}
                            index={index}
                            handleMeaningUpdate={this.props.handleMeaningUpdate}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            } else {
              return true;
            }
          })}

        </main>
      </DragDropContext>
    )
  }
}