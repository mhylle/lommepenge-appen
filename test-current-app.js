const { chromium } = require('playwright');

async function testCurrentApp() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('🚀 Testing current live application...\n');
  
  try {
    // Navigate to the live application
    console.log('📍 Navigating to http://localhost:4200/app2/...');
    await page.goto('http://localhost:4200/app2/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot of what's actually displayed
    await page.screenshot({ 
      path: 'screenshots/current-app-screen.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: current-app-screen.png');
    
    // Check what elements are visible
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);
    
    const bodyText = await page.textContent('body');
    console.log('📝 First 500 characters of page content:');
    console.log(bodyText.substring(0, 500));
    
    // Check if login modal is present
    const loginModal = await page.isVisible('.login-modal');
    console.log('🔐 Login modal visible:', loginModal);
    
    // Check if dashboard is visible
    const dashboard = await page.isVisible('.dashboard-container');
    console.log('📊 Dashboard visible:', dashboard);
    
    // Check if any authentication elements are present
    const authElements = await page.$$eval('[data-testid*="auth"], [class*="auth"], [id*="auth"]', 
      elements => elements.map(el => ({ tag: el.tagName, class: el.className, id: el.id })));
    console.log('🔓 Auth elements found:', authElements);
    
    // Take another screenshot after waiting
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/current-app-after-wait.png',
      fullPage: true 
    });
    console.log('✅ Second screenshot saved: current-app-after-wait.png');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testCurrentApp();