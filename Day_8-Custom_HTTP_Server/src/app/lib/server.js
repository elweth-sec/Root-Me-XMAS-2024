const http = require('http');

function createServer(router, port) {
  const server = http.createServer((req, res) => {
    router.handle(req, res);
  });

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  return server;
}

module.exports = createServer;