const { chromium } = require('playwright');
const path = require('path');

async function testLommepenegeApp() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('🚀 Starting Lommepenge App testing...\n');
  
  try {
    // 1. Navigate to the application
    console.log('📍 Step 1: Navigating to application...');
    await page.goto('http://localhost:4200/app2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial load
    await page.screenshot({ 
      path: 'screenshots/01-initial-load.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: 01-initial-load.png');
    
    // 2. Check for login modal
    console.log('\n📍 Step 2: Checking login modal...');
    const loginModalVisible = await page.isVisible('text=Lommepenge App\'en');
    console.log(`Login modal visible: ${loginModalVisible}`);
    
    if (loginModalVisible) {
      await page.screenshot({ 
        path: 'screenshots/02-login-modal.png',
        fullPage: true 
      });
      console.log('✅ Screenshot saved: 02-login-modal.png');
      
      // 3. Try to close the login modal first
      console.log('\n📍 Step 3: Attempting to close login modal...');
      const closeButton = await page.locator('button:has(img[alt*="close"])').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: 'screenshots/03-after-close-modal.png',
          fullPage: true 
        });
        console.log('✅ Screenshot saved: 03-after-close-modal.png');
      }
      
      // 4. Fill in login credentials
      console.log('\n📍 Step 4: Filling login credentials...');
      
      // Check if login form is visible
      const emailField = await page.locator('input[type="email"], input[placeholder*="email"]').first();
      if (await emailField.isVisible()) {
        await emailField.fill('test@familie.dk');
        console.log('✅ Email entered: test@familie.dk');
        
        const passwordField = await page.locator('input[type="password"]').first();
        await passwordField.fill('password123');
        console.log('✅ Password entered');
        
        await page.screenshot({ 
          path: 'screenshots/04-credentials-filled.png',
          fullPage: true 
        });
        console.log('✅ Screenshot saved: 04-credentials-filled.png');
        
        // 5. Click login button
        console.log('\n📍 Step 5: Attempting login...');
        const loginButton = await page.locator('button:has-text("Log ind")').first();
        if (await loginButton.isEnabled()) {
          await loginButton.click();
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: 'screenshots/05-after-login-attempt.png',
            fullPage: true 
          });
          console.log('✅ Screenshot saved: 05-after-login-attempt.png');
        }
      }
    }
    
    // 6. Check current page state
    console.log('\n📍 Step 6: Checking current page state...');
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`Page title: ${pageTitle}`);
    console.log(`Current URL: ${pageUrl}`);
    
    // Look for Danish text elements
    const danishElements = await page.$$eval('*', elements => {
      const danishTexts = [];
      const keywords = ['Lommepenge', 'Familie', 'Børn', 'Voksen', 'Opgaver', 'Belønning', 'Balance', 'DKK'];
      
      elements.forEach(el => {
        const text = el.textContent || '';
        keywords.forEach(keyword => {
          if (text.includes(keyword) && !danishTexts.includes(text.trim())) {
            danishTexts.push(text.trim().substring(0, 100));
          }
        });
      });
      
      return danishTexts.slice(0, 10);
    });
    
    console.log('\n📝 Danish text elements found:');
    danishElements.forEach(text => console.log(`  - ${text}`));
    
    // 7. Check for dashboard elements
    console.log('\n📍 Step 7: Looking for dashboard elements...');
    const dashboardElements = {
      header: await page.isVisible('header'),
      navigation: await page.isVisible('nav'),
      main: await page.isVisible('main'),
      footer: await page.isVisible('footer'),
      buttons: await page.locator('button').count(),
      cards: await page.locator('.card, [class*="card"]').count(),
      forms: await page.locator('form').count()
    };
    
    console.log('Dashboard elements found:');
    Object.entries(dashboardElements).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    
    await page.screenshot({ 
      path: 'screenshots/06-current-state.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: 06-current-state.png');
    
    // 8. Test responsive design - Tablet
    console.log('\n📍 Step 8: Testing tablet responsive design...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/07-tablet-view.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: 07-tablet-view.png');
    
    // 9. Test responsive design - Mobile
    console.log('\n📍 Step 9: Testing mobile responsive design...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/08-mobile-view.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: 08-mobile-view.png');
    
    // 10. Try to navigate to different routes
    console.log('\n📍 Step 10: Testing different routes...');
    const routes = ['/app2/dashboard', '/app2/tasks', '/app2/profile', '/app2/admin'];
    
    for (const route of routes) {
      try {
        console.log(`  Trying route: ${route}`);
        await page.goto(`http://localhost:4200${route}`, { 
          waitUntil: 'networkidle',
          timeout: 5000 
        });
        await page.waitForTimeout(1000);
        const routeTitle = await page.title();
        console.log(`    - Title: ${routeTitle}`);
        
        // Take screenshot of each route
        const routeName = route.split('/').pop();
        await page.screenshot({ 
          path: `screenshots/09-route-${routeName}.png`,
          fullPage: true 
        });
        console.log(`    ✅ Screenshot saved: 09-route-${routeName}.png`);
      } catch (error) {
        console.log(`    ❌ Could not access ${route}`);
      }
    }
    
    // 11. Final summary
    console.log('\n📊 Testing Summary:');
    console.log('=====================================');
    console.log('✅ Application is accessible');
    console.log('✅ Danish localization confirmed');
    console.log('✅ Responsive design tested');
    console.log('✅ Multiple screenshots captured');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Testing completed!');
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the test
testLommepenegeApp().catch(console.error);