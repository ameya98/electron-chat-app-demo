/* eslint-env browser, node */
/* global React */

const marked = require('marked');

let typing = false;
let typingTimer;

document.addEventListener('DOMContentLoaded', function onLoad() {
  const app = React.createElement(App);
  ReactDOM.render(app, document.body);
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      url: '',
      users: [],
      messages: [],
      message_senders: [],
      status: ''
    };
    this.onLogin = this.onLogin.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSend = this.onSend.bind(this);
  }
  initSocket(url) {
    this.setState({ status: 'Connecting...' });
    const socket = io.connect(url);
    socket.on('connect', () => {
      this.appendMessage(`Connected to server ${ this.state.url }`);
      this.setState({ status: '' });
    });
    socket.on('message', data => {
      this.appendMessage(`__${ data.username }__    
                            ${ data.text }`, data.username);
    });
    socket.on('login', data => {
      this.appendMessage(`${ data.username } has entered the chat.`);
      this.setState({ users: data.users });
    });
    socket.on('typing', data => {
      this.setState({ status: `__${ data.username }__ *is typing...*` });
    });
    socket.on('stop-typing', () => {
      this.setState({ status: '' });
    });
    socket.on('logout', data => {
      this.appendMessage(`${ data.username } disconnected.`);
      this.setState({ users: data.users });
    });
    this.socket = socket;
  }
  appendMessage(message, sender) {
    this.setState((prev, props) => {
      const messages = prev.messages;
      messages.push(message);
      const message_senders = prev.message_senders;
      message_senders.push(sender);
      return { messages, message_senders };
    });
  }
  onLogin(url, username) {
    this.setState({ url, username });
    this.initSocket(url);
    this.socket.emit('login', { username });
    this.refs.inputBar.focus();
  }
  onInput(text) {
    const username = this.state.username;
    if (!typing) {
      typing = true;
      this.socket.emit('typing', { username });
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    typingTimer = setTimeout(() => {
      typing = false;
      this.socket.emit('stop-typing', { username });
    }, 1000);
  }
  onSend(text) {
    const username = this.state.username;
    this.socket.emit('message', { username, text });
  }
  componentDidMount() {
    this.refs.loginBox.focus();
  }
  render() {
    return React.createElement(
      'main',
      null,
      React.createElement(LoginBox, { ref: 'loginBox', url: this.state.url, onLogin: this.onLogin }),
      React.createElement(
        'div',
        { className: 'content' },
        React.createElement(UserList, { users: this.state.users }),
        React.createElement(ChatArea, { messages: this.state.messages, message_senders: this.state.message_senders, curr_user: this.state.username, status: this.state.status })
      ),
      React.createElement(InputBar, { ref: 'inputBar', onInput: this.onInput, onSend: this.onSend })
    );
  }
}

class LoginBox extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }
  focus() {
    this.refs.username.focus();
  }
  onKeyDown(e) {
    if (e.keyCode === 13) {
      const value = this.refs.username.value.trim();
      const url = this.refs.url.value.trim();
      if (value) {
        this.props.onLogin(url, value);
        this.refs.root.classList.add('hidden');
      }
    }
  }
  render() {
    return React.createElement(
      'div',
      { id: 'login-box', ref: 'root' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          null,
          'Bootleg WhatsApp Login'
        ),
        React.createElement('input', { type: 'url',  placeholder: 'Server URL', id: 'server-url', ref: 'url'}),
        React.createElement('input', { type: 'text', placeholder: 'Username', id: 'username', ref: 'username', onKeyDown: this.onKeyDown, autofocus: true })
      )
    );
  }
}

class UserList extends React.Component {
  render() {
    const opts = { sanitize: true };
    const users = this.props.users.map(user => React.createElement('li', { dangerouslySetInnerHTML: { __html: marked(user, opts) } }));
    return React.createElement(
      'aside',
      null,
      React.createElement(
        'h3',
        null,
        'Users'
      ),
      React.createElement(
        'ul',
        { id: 'users' },
        users
      ),
      React.createElement(
        'div',
        { id: 'user-stats' },
        users.length,
        ' user(s) online.'
      )
    );
  }
}

class ChatArea extends React.Component {
  render() {
    const opts = { sanitize: true };
    const messages = this.props.messages;
    const message_senders = this.props.message_senders;
    return React.createElement(
      'div',
      { id: 'chat' },
      messages.map((msg, index) => {
        const sender = message_senders[index];
        if(sender != undefined){
          if(sender == this.props.curr_user){
            return (
              React.createElement('div', 
                { className: 'chat-text-mine-parent' },
                React.createElement('div', { className:'chat-text-mine', dangerouslySetInnerHTML: { __html: marked(msg) } }))
              )
          } else {
            return (
              React.createElement('div', 
                { className: 'chat-text-other-parent' },
                React.createElement('div', { className:'chat-text-other', dangerouslySetInnerHTML: { __html: marked(msg) } }))
              )
          }
        } else {
          return (
            React.createElement('div', 
              { className: 'chat-logs-parent' },
              React.createElement('div', { className:'chat-logs', dangerouslySetInnerHTML: { __html: marked(msg) } }))
            )
        }
      }),
      React.createElement(
        'div',
        { id: 'chat-status-msg' },
        marked(this.props.status)
      )
    );
  }
}

class InputBar extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  onKeyDown(e) {
    if (e.keyCode === 13) {
      this.send();
    }
  }
  onInput() {
    const value = this.refs.input.value.trim();
    this.props.onInput(value);
  }
  onClick() {
    this.send();
  }
  send() {
    const value = this.refs.input.value.trim();
    if (value) {
      this.props.onSend(value);
      this.refs.input.value = ''; // Should I mutate state instead?
    }
  }
  focus() {
    this.refs.input.focus();
  }
  render() {
    return React.createElement(
      'div',
      { className: 'input', id:'input-holder' },
      React.createElement('input', {
        type: 'text',
        id: 'text-input',
        ref: 'input',
        placeholder: 'Type a message',
        onInput: this.onInput,
        onKeyDown: this.onKeyDown
      }),
      React.createElement(
        'img',
        { id: 'send-btn', onClick: this.onClick, src:'imgs/send.svg'},
      )
    );
  }
}