import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Tile from '../Components/Tile'
import './onwards.css';

export default class Onwards extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <DragDropContext onDragEnd={this.props.onDragEnd}>
        <main className="gameboard gameboard--onwards">
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
                This is the <strong>third and final stage</strong> of the game.
              </p>
              <p>
                In your <strong>Pocket</strong> are all the tiles you have played - the collective language with which you have told the stories of your worlds.
              </p>
              <p>
                Working together, choose three tiles and arrange them in any order on the card named <strong>Onwards</strong>.
              </p>
              <p>
                The arrangement of the tiles represents the world to which you are travelling together. What do they tell you about <strong>all of you?</strong> Take a few moments to talk about this world. How will you get there? What will you bring with you? What will you leave behind?
              </p>
              <p>
                When you are all done, press 'Finish'.
              </p>
            </div>
          </div>
          <div className="gameboard__finish-button">
            <button type="button" onClick={() => this.props.changeStage('after')} className="pure-button grid-button" >Finish</button>
          </div>
          <div className="gameboard__pocket-title">
            <div class="bordered-box grid-box" style={{ justifyContent: 'center' }}>
              <h2>Pocket</h2>
            </div>
          </div>
          <div className="gameboard__world-title">
            <div class="bordered-box grid-box" style={{ justifyContent: 'center' }}>
              <h2>Onwards</h2>
            </div>
          </div>
          <div className="gameboard__world">
            <div className="counter-container">
              <div class="counter"></div>
              <div class="counter"></div>
              <div class="counter"></div>
            </div>
            <div className="droparea">
              <Droppable direction="horizontal" droppableId={JSON.stringify({ location: 'onwardsWorldTiles', owner: 'world' })}>
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
          </div>
          <div className="gameboard__pocket">
            <div className="droparea">
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
          </div>
        </main>
      </DragDropContext>
    )
  }
}