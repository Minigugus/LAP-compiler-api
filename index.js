const { parse } = require('url');
const { createServer } = require('http');
const nowConfig = require('./now.json');

const routes = nowConfig.routes
  .filter(route => route.dest !== '/src/notFound.js')
  .reduce((routes, route) => {
    routes[route.src] = require('.'+route.dest);
    return routes;
  }, {
    '*': require('./src/notFound')
  });

const PORT = process.env.PORT || 4000;

const server = createServer((req, res) => {
  console.info(`${req.socket.remoteAddress} -- ${req.method} ${req.url}`);
  const { pathname } = parse(req.url);
  let route = routes[pathname];
  if (!route)
    route = routes['*'];
  return route(req, res);
});

server.listen(PORT, () => console.info(`http://localhost:${PORT}/api`));
