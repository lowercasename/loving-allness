import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Tile from '../Components/Tile'
import './crossroads.css';

export default class Crossroads extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <DragDropContext onDragEnd={this.props.onDragEnd}>
        <div className="scroll-message">
          Scroll to see more worlds.
        </div>
        <main className="gameboard gameboard--crossroads">
          <div className="gameboard__playing-as">
            {this.props.prettyPlayerName &&
              <div class="bordered-box grid-box" style={{ justifyContent: 'center', flexDirection: 'column', flexWrap: 'nowrap' }}>
                <p>You are playing as:</p>
                <img class="avatar" src={"/avatars/" + this.props.prettyPlayerName + ".png"} alt={this.props.prettyPlayerName} />
              </div>
            }
          </div>
          <div className="gameboard__information">
            <div class="bordered-box grid-box">
              <p>
                This is the <strong>second stage</strong> of the game.
              </p>
              <p>
                You meet your fellow travellers at the <strong>Crossorads</strong>. Taking turns, tell the others the story of the world you created in the first stage.
              </p>
              <p>
                There are three new tiles in your <strong>Pocket</strong>. Taking turns, take one tile from your Pocket, give it a name, and place it anywhere on the card of the player to your <strong>left</strong>.
              </p>
              <p>
                Explain how the tile you placed relates to the story told by this fellow traveller. Is it an object they need? An expression of emotion? An offer of help? After the last player has taken their turn, take a moment as a group to contemplate how your stories are moving, and the shape they are taking as they are loosened from their origins.
              </p>
              <p>
                Then, press 'Onwards'.
              </p>
            </div>
          </div>
          <div className="gameboard__next-button">
            <button type="button" onClick={() => this.props.changeStage('onwards')} className="pure-button grid-button">Onwards</button>
          </div>
          <div className="gameboard__worlds-container">
            <div className="crossroads-world-grid-container">
              <div className="gameboard__pocket-title">
                <div class="bordered-box grid-box" style={{ justifyContent: 'center' }}>
                  <h2>Pocket</h2>
                </div>
              </div>
              <div className="gameboard__pocket">
                <div className="droparea">
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
              </div>
            </div>
            {Object.keys(this.props.takenPlayers).map(player => {
              if (this.props.crossroadsWorldTiles.find(tile => tile.owner === player)) {
                return (
                  <div className="crossroads-world-grid-container" key={player}>
                    <div className="gameboard__world-title">
                      <div class="bordered-box grid-box" style={{ justifyContent: 'center' }}>
                        <h2>{player}</h2>
                      </div>
                    </div>
                    <div className="gameboard__world" >
                      <div className="counter-container">
                        <div class="counter"></div>
                        <div class="counter"></div>
                      </div>
                      <div className="droparea">
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
                    </div>
                  </div>
                )
              } else {
                return true;
              }
            })}
          </div>
        </main>
      </DragDropContext>
    )
  }
}