import React from 'react';
import Firebase from 'firebase';
import NonDraggableTile from './NonDraggableTile'

import {
  Link
} from "react-router-dom";

export default class Archive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      archives: []
    }

    this.convertToDate = this.convertToDate.bind(this);
  }

  componentDidMount() {
    let ref = Firebase.database().ref('archives');
    ref.on('value', snapshot => {
      this.setState({
        archives: snapshot.val() || []
      })
    })
  }

  convertToDate(timestamp) {
    var a = new Date(timestamp);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    // var hour = a.getHours();
    // var min = a.getMinutes();
    // var sec = a.getSeconds();
    var string = date + ' ' + month + ' ' + year;
    return string;
  }

  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-1">
          <main className="archive">
            <Link to="/" className="pure-button" style={{ marginTop: '20px' }}>Return to the Introduction</Link>
            <h1>Archive</h1>
            {Object.keys(this.state.archives).map((key, index) => (
              <div key={index} className="pure-g archive__row">
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
                  <p><strong>Notes from World of {this.convertToDate(this.state.archives[key].date)}</strong></p>
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
