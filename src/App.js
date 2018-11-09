import React, { Component } from 'react';
import { DisplayTodos, CreateTodoBtn } from './Components';
import Contract from 'truffle-contract';
import ToDoListContract from '../build/contracts/TodoList.json';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      todoListInstance: {},
      todos: [],
    };
  }

  async componentDidMount() {
    await this.instantiateContract();
    await this.getTodos();
  }

  async instantiateContract() {
    // truffle contract (ORN like sequelize) takes the json blob and turns it into JS object
    // Contract knows where our unique contract lives (TodoList.json => networks => ... => address)
    const todoList = Contract(ToDoListContract);

    // relying on web3 obj to give us the current provider - where will this be on the blockchain?
    // metamask put web3 on our window and provides our currentProvider (where it is on the blockchain)
    todoList.setProvider(window.web3.currentProvider);

    // looks for the deployed version of the todolist contract at the address from Contract on the network currentProvider
    const todoListInstance = await todoList.deployed();

    console.log(todoListInstance);
    this.setState({ todoListInstance });
  }

  async getTodos() {
    // use .call() at the end because it is a get method and we need to invoke it this way
    const totalNumberOfTodos = await this.state.todoListInstance.getTotalNumTodos.call();

    const pendingTodosPromiseArray = [];
    for (let i = 0; i < totalNumberOfTodos; i++) {
      pendingTodosPromiseArray.push(
        this.state.todoListInstance.returnTodo.call(i)
      );
    }

    const todos = await Promise.all(pendingTodosPromiseArray);
    this.setState({ todos });
  }

  render() {
    const {
      todos,
      todoListInstance: { createTodo },
    } = this.state;
    console.log(todos);
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            My Todo List!
          </a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>My todos!</h1>
              <p>Coming directly from my smart contract</p>
              <DisplayTodos
                completeTodo={
                  null /* completeTodoSmartContractFunc goes here */
                }
                todos={todos}
              />
              <CreateTodoBtn createTodo={createTodo} />
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
