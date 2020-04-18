import React from 'react';
import Firebase from 'firebase';
import NonDraggableTile from './NonDraggableTile'

import {
  BrowserRouter as Router,
  Link
} from "react-router-dom";

export default class Archive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      archives: []
    }
  }

  componentDidMount() {
    let ref = Firebase.database().ref('archives');
    ref.on('value', snapshot => {
      console.log(snapshot.val())
      this.setState({
        archives: snapshot.val()
      })
    })
  }

  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-1">
          <main className="archive">
            <Link to="/" className="pure-button" style={{ marginTop: '20px' }}>To the beginning</Link>
            <h1>Archive</h1>
            {Object.keys(this.state.archives).map((key, index) => (
              <div className="pure-g archive__row">
                <div className="pure-u-1-4">
                  <div className="droparea">
                    <div className='world-card droparea__tilestack'>
                      {this.state.archives[key].world.map((item, index) => (
                        <NonDraggableTile
                          key={item.id}
                          tile={item}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pure-u-3-4 archive__notes">
                  <p>{this.state.archives[key].notes}</p>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    )
  }
}
