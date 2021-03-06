import React from 'react';
import Firebase from 'firebase';
import NonDraggableTile from '../Components/NonDraggableTile'

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
          <main className="archive" style={{ marginTop: '20px' }}>
            <Link to="/" className="pure-button square-button" style={{ margin: '0 auto' }}>Return</Link>
            <h1>Archive</h1>
            {Object.keys(this.state.archives).map((key, index) => (
              <div key={index} className="archive__row">
                <div className="bordered-box grid-box" style={{ flexDirection: 'column', flexWrap: 'nowrap' }}>
                  {this.state.archives[key].world.map((item, index) => (
                    <NonDraggableTile
                      key={item.id}
                      tile={item}
                      index={index}
                    />
                  ))}
                </div>
                <div className="bordered-box grid-box archive__notes" style={{alignItems: 'flex-start'}}>
                  <div>
                    <p style={{ color: '#fcf8ea' }}>Notes from World of {this.convertToDate(this.state.archives[key].date)}</p>
                    <p>{this.state.archives[key].notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    )
  }
}
