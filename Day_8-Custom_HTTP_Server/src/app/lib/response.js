const { HttpHeaders, HttpStatus, MimeTypes } = require('./constants');
const fs = require('fs').promises;
const path = require('path');

class HttpResponse {
  constructor(res) {
    this.res = res;
  }

  json(data) {
    const body = JSON.stringify(data);
    this.res.writeHead(HttpStatus.OK, {
      [HttpHeaders.CONTENT_TYPE]: MimeTypes.JSON,
      [HttpHeaders.CONTENT_LENGTH]: Buffer.byteLength(body)
    });
    this.res.end(body);
  }

  xml(data) {
    let body;
    if (typeof data === 'string') {
      body = data;
    } else {
      body = '<?xml version="1.0" encoding="UTF-8"?>\n';
      body += this.objectToXml(data);
    }
    
    this.res.writeHead(HttpStatus.OK, {
      [HttpHeaders.CONTENT_TYPE]: MimeTypes.XML,
      [HttpHeaders.CONTENT_LENGTH]: Buffer.byteLength(body)
    });
    this.res.end(body);
  }

  objectToXml(obj, rootName = 'root') {
    const convert = (data, name) => {
      if (data === null || data === undefined) {
        return `<${name}/>`; 
      }
      
      if (Array.isArray(data)) {
        return data.map(item => convert(item, name)).join('\n');
      }
      
      if (typeof data === 'object') {
        const children = Object.entries(data)
          .map(([key, value]) => convert(value, key))
          .join('\n');
        return `<${name}>\n${children}\n</${name}>`;
      }
      
      return `<${name}>${data}</${name}>`;
    };
    
    return convert(obj, rootName);
  }

  html(content) {
    this.res.writeHead(HttpStatus.OK, {
      [HttpHeaders.CONTENT_TYPE]: MimeTypes.HTML,
      [HttpHeaders.CONTENT_LENGTH]: Buffer.byteLength(content)
    });
    this.res.end(content);
  }

  print(content) {
    this.res.writeHead(HttpStatus.OK, {
      [HttpHeaders.CONTENT_TYPE]: MimeTypes.PLAIN,
      [HttpHeaders.CONTENT_LENGTH]: Buffer.byteLength(content)
    });
    this.res.end(content);
  }

  redirect(location, isPermanent = false) {
    const statusCode = isPermanent ? HttpStatus.MOVED_PERMANENTLY : HttpStatus.FOUND;
    const socket = this.res.socket;
    const head = `HTTP/1.1 ${statusCode} Found\r\nLocation: ${location}\r\nConnection: close\r\n\r\n`;
    socket.write(head);
    socket.end();
    this.res.finished = true;
  }

  async forbidden() {
    try {
      const content = await fs.readFile(path.join(__dirname, '..', 'templates', '403.html'), 'utf8');
      this.res.writeHead(HttpStatus.FORBIDDEN, {
        [HttpHeaders.CONTENT_TYPE]: MimeTypes.HTML,
        [HttpHeaders.CONTENT_LENGTH]: Buffer.byteLength(content)
      });
      this.res.end(content);
    } catch (err) {
      this.res.writeHead(HttpStatus.FORBIDDEN);
      this.res.end('You are not authorized.');
    }
  }

  async notFound() {
    try {
      const content = await fs.readFile(path.join(__dirname, '..', 'templates', '404.html'), 'utf8');
      this.res.writeHead(HttpStatus.NOT_FOUND, {
        [HttpHeaders.CONTENT_TYPE]: MimeTypes.HTML,
        [HttpHeaders.CONTENT_LENGTH]: Buffer.byteLength(content)
      });
      this.res.end(content);
    } catch (err) {
      this.res.writeHead(HttpStatus.NOT_FOUND);
      this.res.end('Not Found');
    }
  }

  async badRequest() {
    try {
      const content = await fs.readFile(path.join(__dirname, '..', 'templates', '400.html'), 'utf8');
      this.res.writeHead(HttpStatus.BAD_REQUEST, {
        [HttpHeaders.CONTENT_TYPE]: MimeTypes.HTML,
        [HttpHeaders.CONTENT_LENGTH]: Buffer.byteLength(content)
      });
      this.res.end(content);
    } catch (err) {
      this.res.writeHead(HttpStatus.NOT_FOUND);
      this.res.end('Not Found');
    }
  }
}

module.exports = HttpResponse;