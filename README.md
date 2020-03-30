# Bootleg WhatsApp Chat

This is just a demo of a chat app mimicking WhatsApp, built with Electron and React.
The server is included and must be run using node.js.

## Tiny features

* You provide a username to enter a chat room. Server endpoint is configurable.
* Supports Markdown.
* List of connected users.
* Informs connection and disconnection events.
* Informs when someone is typing.
* Supports multiple instances

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/ameya98/electron-chat-app-demo.git
# Go into the repository
cd electron-chat-app-demo
# Install dependencies
npm install
```

Then, to start the client:
```bash
# Run the app
npm start
```

If you want to start your own local server:
```bash
# Run local server
npm run server
```
If you want to test the app using multiple instances, remember you should only have one instance of the chat server running!

## Create distributable package
```
npm install -g electron-packager
cd electron-chat-app-demo
electron-packager . --asar
```
You will now have a folder for your platform and you can run the app by executing `electron-chat-app-demo`

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).
