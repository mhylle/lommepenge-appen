const { chromium } = require('playwright');

async function testLoginFlow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('🚀 Testing login flow with live application...\n');
  
  try {
    // 1. Navigate to the application
    console.log('📍 Step 1: Navigating to application...');
    await page.goto('http://localhost:4200/app2/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Screenshot initial state
    await page.screenshot({ 
      path: 'screenshots/live-01-initial.png',
      fullPage: true 
    });
    console.log('✅ Screenshot: live-01-initial.png');
    
    // 2. Fill in the login form
    console.log('\n📍 Step 2: Filling login credentials...');
    
    // Fill email
    const emailField = await page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]');
    await emailField.fill('test@familie.dk');
    console.log('✅ Email entered: test@familie.dk');
    
    // Fill password  
    const passwordField = await page.locator('input[type="password"]');
    await passwordField.fill('password123');
    console.log('✅ Password entered');
    
    // Screenshot with credentials filled
    await page.screenshot({ 
      path: 'screenshots/live-02-credentials-filled.png',
      fullPage: true 
    });
    console.log('✅ Screenshot: live-02-credentials-filled.png');
    
    // 3. Click login button
    console.log('\n📍 Step 3: Clicking login button...');
    const loginButton = await page.locator('button:has-text("Log ind")');
    await loginButton.click();
    console.log('✅ Login button clicked');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Screenshot after login attempt
    await page.screenshot({ 
      path: 'screenshots/live-03-after-login.png',
      fullPage: true 
    });
    console.log('✅ Screenshot: live-03-after-login.png');
    
    // 4. Check current state
    console.log('\n📍 Step 4: Analyzing result...');
    
    // Check if still on login modal
    const loginModalStillVisible = await page.isVisible('.login-modal');
    console.log('🔐 Login modal still visible:', loginModalStillVisible);
    
    // Check if dashboard appeared
    const dashboardVisible = await page.isVisible('.dashboard-container');
    console.log('📊 Dashboard visible:', dashboardVisible);
    
    // Check for error messages
    const errorMessages = await page.$$eval('[class*="error"], [class*="alert"]', 
      elements => elements.map(el => el.textContent));
    console.log('❌ Error messages:', errorMessages);
    
    // Check page URL
    const currentUrl = page.url();
    console.log('🌐 Current URL:', currentUrl);
    
    // Final wait and screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/live-04-final-state.png',
      fullPage: true 
    });
    console.log('✅ Screenshot: live-04-final-state.png');
    
  } catch (error) {
    console.error('❌ Error during login flow:', error);
  } finally {
    await browser.close();
  }
}

testLoginFlow();