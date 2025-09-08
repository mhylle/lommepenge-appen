const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages
  page.on('console', msg => console.log('🔍 CONSOLE:', msg.text()));
  
  // Listen to page errors
  page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));
  
  try {
    console.log('🚀 DETAILED TESTING: Lommepenge App\'en (Danish Pocket Money App)');
    console.log('Navigating to http://localhost:3002/');
    
    // Navigate to the app
    await page.goto('http://localhost:3002/');
    await page.waitForTimeout(3000); // Give Angular time to bootstrap
    
    // Check Angular routes
    console.log('\n📍 Testing Angular Routing:');
    
    // Get current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we get redirected (Angular routing)
    await page.waitForTimeout(2000);
    const finalUrl = page.url();
    console.log('Final URL after routing:', finalUrl);
    
    // Get the page content to see what's actually rendered
    const bodyText = await page.textContent('body');
    console.log('\n📄 Page content length:', bodyText?.length || 0);
    
    if (bodyText && bodyText.length > 50) {
      console.log('First 200 characters:', bodyText.substring(0, 200));
    }
    
    // Check if Angular is actually working
    const angularVersion = await page.evaluate(() => {
      // Check for Angular in window
      return window.ng ? 'Angular detected' : 'No Angular in window';
    });
    console.log('🅰️ Angular status:', angularVersion);
    
    // Look for specific Angular elements
    const appRoot = await page.$('app-root');
    if (appRoot) {
      const appContent = await appRoot.innerHTML();
      console.log('📱 App root content length:', appContent.length);
      
      if (appContent.length > 100) {
        console.log('App root preview:', appContent.substring(0, 300));
      }
    }
    
    // Check for router outlet
    const routerOutlet = await page.$('router-outlet');
    console.log('🛤️ Router outlet found:', routerOutlet ? 'Yes' : 'No');
    
    // Check for any error messages
    const errorElements = await page.$$('[class*="error"], .error, [class*="Error"]');
    if (errorElements.length > 0) {
      console.log('🚨 Error elements found:', errorElements.length);
      for (let element of errorElements) {
        const errorText = await element.textContent();
        console.log('   Error:', errorText);
      }
    }
    
    // Try to navigate to specific routes
    console.log('\n🧭 Testing specific routes:');
    
    // Try login route
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(1000);
    let loginContent = await page.textContent('body');
    console.log('Login page content length:', loginContent?.length || 0);
    
    // Try dashboard route  
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForTimeout(1000);
    let dashboardContent = await page.textContent('body');
    console.log('Dashboard page content length:', dashboardContent?.length || 0);
    
    // Check network requests
    console.log('\n🌐 Network Analysis:');
    
    page.on('response', response => {
      if (response.status() !== 200) {
        console.log(`⚠️ HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    // Reload and check network
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Final screenshot
    await page.screenshot({ path: 'detailed-test.png', fullPage: true });
    console.log('📸 Final screenshot saved: detailed-test.png');
    
  } catch (error) {
    console.error('❌ Error in detailed test:', error.message);
  }
  
  await browser.close();
})();