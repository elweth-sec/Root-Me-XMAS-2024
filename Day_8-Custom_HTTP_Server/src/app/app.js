const fs = require('fs').promises;
const path = require('path');
const { Router, createServer } = require('./lib/http');
const Sanitizer = require('./lib/sanitizer');
const Reporter = require('./lib/reporter');

const router = new Router();

router.get('/', async (req, res) => {
  try {
    const content = await fs.readFile(path.join(__dirname, 'templates', 'index.html'), 'utf8');
    res.html(content);
  } catch (err) {
    res.badRequest();
  }
});

router.get('/api/xml', (req, res) => {
  res.xml({
    response: {
      message: 'This is an XML response',
      timestamp: new Date().toISOString(),
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]
    }
  });
});

router.get('/api/json', (req, res) => {
  res.json({
    message: 'This is a JSON response',
    timestamp: new Date().toISOString()
  });
});

router.get('/api/xss', async (req, res) => {
  try {
      const { html } = req.query;
      const sanitized = Sanitizer.xss(html);
      res.html(sanitized);
  } catch (err) {
      res.badRequest();
  }
});

router.get('/api/sql', async (req, res) => {
  try {
      const { id } = req.query;
      const query = "SELECT * FROM users WHERE id=" + Sanitizer.sql(id, 'int') + "";
      // Do your SQL query ...
      res.print(query);
  } catch (err) {
      res.badRequest();
  }
});

router.get('/api/redirect', (req, res) => {
  const { url } = req.query;
  if (url) {
    res.redirect(url);
  } else {
    res.badRequest();
  }
});

router.get('/api/forbidden', async (req, res) => {
  try {
      res.forbidden();
  } catch (err) {
      res.badRequest();
  }
});

router.get('/api/badrequest', async (req, res) => {
  try {
      res.badRequest();
  } catch (err) {
      res.badRequest();
  }
});

router.get('/api/report', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.badRequest();
    }
    try {
      new URL(url);
    } catch (e) {
      return res.badRequest();
    }

    const report = await Reporter.generateReport(url);
    res.json(report);
  } catch (error) {
    res.json({
      error: true,
      message: error.message
    });
  }
});

const PORT = 3000;
createServer(router, PORT);