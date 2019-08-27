import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateMatrix, updateGameStatus } from './actions/gameActions';

// Components
import Form from './components/Form'
import GameOverlay from './components/GameOverlay'
import Table from './components/Table'

class App extends Component {
  constructor(props) {
    super(props);
    // Default state
    this.state = {
      nbRows: 10,
      nbColumns: 7,
      nbBombs: 10
    };
    // Bind this to all functions that use the state
    this.handleChange = this.handleChange.bind(this);
    this.resetBombs = this.resetBombs.bind(this);
    this.nbLeftTiles = this.nbLeftTiles.bind(this);
  }
  handleChange(event) {
    // If something is changed in one of the input in form, update the value in the state and reset the board
    this.setState({ [event.target.name]: parseInt(event.target.value) > 0 ? parseInt(event.target.value) : 1 }, this.resetBombs);
  }
  nbLeftTiles() {
    let counter = 0;
    this.props.matrix.map((r) => {
      r.map((c) => {
        if (!c.showed && !c.bomb) {
          counter++
        }
        return c;
      })
      return r;
    });
    return counter;
  }
  resetBombs() {
    let bombsCoords = [];
    let nbBombs = this.state.nbBombs;
    const maxAuthorizedBombs = Math.round((this.state.nbRows * this.state.nbColumns) - ((this.state.nbRows * this.state.nbColumns) / 100 * 50));
    if (this.state.nbBombs > maxAuthorizedBombs) {
      this.setState({
        nbBombs: maxAuthorizedBombs
      });
      nbBombs = maxAuthorizedBombs;
    }
    for (let i = 0; i < nbBombs; i++) {
      let found = true;
      var coords = [Math.floor(Math.random() * Math.floor(this.state.nbRows)), Math.floor(Math.random() * Math.floor(this.state.nbColumns))];
      while (found) {
        // eslint-disable-next-line
        found = bombsCoords.filter((bc) => { return bc[0] === coords[0] && bc[1] === coords[1] }).length > 0
        if (!found) {
          bombsCoords.push([coords[0], coords[1]]);
        } else {
          coords = [Math.floor(Math.random() * Math.floor(this.state.nbRows)), Math.floor(Math.random() * Math.floor(this.state.nbColumns))];
        }
      }
    }
    let matrix = [];
    for (let i = 0; i < this.state.nbRows; i++) {
      let row = [];
      for (let j = 0; j < this.state.nbColumns; j++) {
        row.push({
          showed: false,
          bomb: false,
          counter: 0,
          marked: false
        });
      }
      matrix.push(row);
    }
    bombsCoords.map((bc) => {
      matrix[bc[0]][bc[1]].bomb = true;
      return bc;
    });
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        let counter = 0;
        bombsCoords.map((bc) => {
          if (bc[0] === i - 1 && bc[1] === j - 1) { counter++ }
          if (bc[0] === i - 1 && bc[1] === j) { counter++ }
          if (bc[0] === i - 1 && bc[1] === j + 1) { counter++ }
          if (bc[0] === i && bc[1] === j - 1) { counter++ }
          if (bc[0] === i && bc[1] === j + 1) { counter++ }
          if (bc[0] === i + 1 && bc[1] === j - 1) { counter++ }
          if (bc[0] === i + 1 && bc[1] === j) { counter++ }
          if (bc[0] === i + 1 && bc[1] === j + 1) { counter++ }
          return bc;
        });
        matrix[i][j].counter = counter;
      }
    }
    this.props.updateGameStatus(false);
    // Update the matrix in store
    this.props.updateMatrix(matrix);
  }
  componentDidMount() {
    // Reset the matrix at the beginning
    this.resetBombs();
  }
  render() {
    let gameOverlay = null;
    // If game status is game over, display the game over overlay
    // Or if game status is not game over and no more tile to discover, display the win overlay
    if (this.props.gameOver || (this.nbLeftTiles() <= 0 && !this.props.gameOver)) {
      gameOverlay = (<GameOverlay gameOver={this.props.gameOver} resetGame={this.resetBombs} />)
    }
    return (
      <div className="App" style={appStyle}>
        <Form handleChange={this.handleChange} nbRows={this.state.nbRows} nbColumns={this.state.nbColumns} nbBombs={this.state.nbBombs} />
        {gameOverlay}
        <Table table={this.props.matrix} nbLeftTiles={this.nbLeftTiles()} />
      </div>
    );
  }
}

// Map store state and actions to current component
const mapStateToProps = (state) => ({
  matrix: state.game.matrix,
  gameOver: state.game.gameOver
});

const mapDispatchToProps = {
  updateMatrix,
  updateGameStatus
};

// Inline styling
const appStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
