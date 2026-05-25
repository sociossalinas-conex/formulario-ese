const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('file:///C:/Users/anton/OneDrive/Documentos/Antigravity/Formulario%20Captura%20Final/web-app/index.html');
    
    // Wait a bit for scripts to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try clicking a button to see if it causes an error
    await page.click('#btn-to-capture').catch(e => console.log('Click error:', e.message));
    
    await browser.close();
  } catch (e) {
    console.error('PUPPETEER SCRIPT ERROR:', e);
  }
})();
