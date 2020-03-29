const server = require('./lib/server').server;
const port = process.env.PORT || 3000;
server.run(port);
