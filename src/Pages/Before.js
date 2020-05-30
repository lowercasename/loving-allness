import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Tile from '../Components/Tile'
import './before.css';

export default class Before extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <DragDropContext onDragEnd={this.props.onDragEnd}>
        <main className="gameboard gameboard--before">
          <div className="gameboard__playing-as">
            {this.props.prettyPlayerName &&
              <div class="bordered-box grid-box" style={{justifyContent: 'center', flexDirection: 'column'}}>
                <p>You are playing as:</p>
                <img class="avatar" src={"/avatars/" + this.props.prettyPlayerName + ".png"} alt={this.props.prettyPlayerName} />
              </div>
            }
          </div>
          <div className="gameboard__information">
            <div class="bordered-box grid-box">
              <p>
                This is the <strong>first stage</strong> of the game.
            </p>
              <p>
                There are three tiles in your <strong>Pocket</strong>.
            </p>
              <p>
                Arrange those tiles in any order on the card named <strong>Before</strong>.
            </p>
              <p>
                The arrangement of the tiles represents the world you are from. You are now seeking to leave this world behind. What do the tiles tell you about <strong>you</strong>? What might they say about the state of the world you have come from? Why do you want to depart from it? Take a few moments to construct your story.
            </p>
              <p>
                As you arrange the tiles, give each one a <strong>one-word name</strong>. What does this tile mean to you? What concept does it convey?
            </p>
              <p>
                When you are done, press 'To the Crossroads'.
            </p>
            </div>
          </div>
          <div className="gameboard__next-button">
            <button type="button" onClick={() => this.props.changeStage('crossroads')} className="pure-button grid-button" >To the Crossroads</button>
          </div>
          <div className="gameboard__pocket-title">
            <div class="bordered-box grid-box" style={{justifyContent: 'center'}}>
              <h2>Pocket</h2>
            </div>
          </div>
          <div className="gameboard__world-title">
            <div class="bordered-box grid-box" style={{justifyContent: 'center'}}>
              <h2>Before</h2>
            </div>
          </div>
          <div className="gameboard__pocket">
            <div className="droparea">
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
          </div>
          <div className="gameboard__world">
            <div className="counter-container">
              <div class="counter"></div>
            </div>
            <div className="droparea">
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
          </div>
        </main>
      </DragDropContext>
    )
  }
}