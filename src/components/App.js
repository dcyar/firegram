import React, { Component } from 'react';
import firebase from 'firebase';

import FileUpload from './fileUpload/FileUpload';
import './App.css';



class App extends Component {

  constructor() {
    super();
    this.state = {
      user: null,
      pictures: [],
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user });
    });

    firebase.database().ref('pictures').on('child_added', snapshot => {
      this.setState({
        pictures: this.state.pictures.concat(snapshot.val()),
      });
    });
  }

  handleAuth() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
      .then(result => console.log(`${result.user.email} ha iniciado sesión`))
      .catch(err => console.log(`Error: ${err.code} - ${err.message}`));
  }

  handleLogout() {
    firebase.auth().signOut()
      .then(result => console.log(`${result.user.email} ha salido`))
      .catch(err => console.log(`Error: ${err.code} - ${err.message}`));
  }

  handleUpload(event) {
    const file = event.target.files[0];
    const storageRef = firebase.storage().ref().child(`/photos/${file.name}`);
    const task = storageRef.put(file);

    task.on('state_changed', snapshot => {
      let percentage = (snapshot.bytesTranferred / snapshot.totalBytes) * 100;
      this.setState({
        uploadValue: percentage
      })
    }, err => {
      console.log(err.message)
    }, () => {
      const record = {
        photoURL: this.state.user.photoURL,
        displayName: this.state.user.displayName,
        image: task.snapshot.downloadURL
      };

      const dbRef = firebase.database().ref('pictures');
      const newPicture = dbRef.push();
      newPicture.set(record);
      
    });
  }

  renderLoginButton() {
    if (this.state.user) {
      return (
        <div>
          <img src={ this.state.user.photoURL } className="picture" alt={ this.state.user.displayName } />
          <p>Hola { this.state.user.displayName }!</p>
          <button onClick={ this.handleLogout }>Salir</button>
          <FileUpload onUpload={ this.handleUpload } />
          <div className="timeline">
            {
              this.state.pictures.map((picture, index) => (
                <div className="timeline__item" key={index}>
                  <img src={ picture.image } className="timeline__image" />
                  <br />
                  <img src={ picture.photoURL } className="timeline__user" alt={ picture.displayName } />
                  <br />
                  <span className="timeline__username">{ picture.displayName }</span>
                </div>
              )).reverse()
            }
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <button onClick={ this.handleAuth }>Login con Google</button>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Firegram</h1>
        </header>
        <div className="App-intro"> { this.renderLoginButton() } </div>
      </div>
    );
  }
}

export default App;
