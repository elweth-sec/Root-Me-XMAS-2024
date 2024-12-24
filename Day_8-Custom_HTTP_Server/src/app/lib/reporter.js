const { firefox } = require('playwright');

class Reporter {
  static async generateReport(url) {
    let browser;
    try {
      browser = await firefox.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      const cookie = {
        name: 'FLAG',
        value: 'RM{REDACTED}',
        domain: '127.0.0.1',
        path: '/',
        httpOnly: false,
        secure: false,
      };

      await page.context().addCookies([cookie]);

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));

      return { success: true, message: "Thanks for your report, I'm checking!" };
    } catch (error) {
      console.error(`[Reporter] Error : ${error.message}`);
      return { error: true, message: "And error occured .." };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = Reporter;