const url = require('url');
const HttpResponse = require('./response');

class Router {
  constructor() {
    this.routes = new Map();
  }

  get(path, handler) {
    this.routes.set(`GET:${path}`, handler);
  }

  post(path, handler) {
    this.routes.set(`POST:${path}`, handler);
  }

  handle(req, res) {
    const parsedUrl = url.parse(req.url, true);
    req.query = parsedUrl.query;
    
    const handler = this.routes.get(`${req.method}:${parsedUrl.pathname}`);
    
    if (handler) {
      handler(req, new HttpResponse(res));
    } else {
      new HttpResponse(res).notFound();
    }
  }
}

module.exports = Router;