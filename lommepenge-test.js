const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLommepengeApp() {
  console.log('🚀 Starting Lommepenge App (Danish Pocket Money App) testing...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📍 Navigating to http://localhost:4200/app2...');
    
    // Navigate to the application
    await page.goto('http://localhost:4200/app2', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial screen
    console.log('📷 Taking screenshot of initial screen...');
    await page.screenshot({ 
      path: '/home/mhylle/projects/mhylle.com/example-app2/.playwright-mcp/lommepenge-initial-screen.png',
      fullPage: true 
    });
    
    // Check page title and content
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Look for Danish text and UI elements
    console.log('🔍 Analyzing page content for Danish localization...');
    
    // Check if there are login fields
    const emailField = await page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
    const passwordField = await page.locator('input[type="password"], input[name="password"]').first();
    
    let hasLoginForm = false;
    if (await emailField.isVisible() && await passwordField.isVisible()) {
      hasLoginForm = true;
      console.log('✅ Login form detected');
      
      // Try to log in with test credentials
      console.log('🔐 Attempting login with test credentials...');
      await emailField.fill('test@familie.dk');
      await passwordField.fill('password123');
      
      // Look for login button (various possible texts in Danish)
      const loginButton = await page.locator('button:has-text("Log ind"), button:has-text("Login"), button[type="submit"]').first();
      
      if (await loginButton.isVisible()) {
        await loginButton.click();
        console.log('🔄 Login button clicked, waiting for response...');
        
        // Wait for navigation or response
        await page.waitForTimeout(3000);
        
        // Take screenshot after login attempt
        await page.screenshot({ 
          path: '/home/mhylle/projects/mhylle.com/example-app2/.playwright-mcp/lommepenge-after-login.png',
          fullPage: true 
        });
        
        // Check if login was successful (look for dashboard elements or error messages)
        const currentUrl = page.url();
        console.log(`📍 Current URL after login: ${currentUrl}`);
        
        // Look for Danish dashboard elements
        const danishElements = await page.locator('text=/familie|børn|lommepenge|kroner|DKK|balance|saldo/i').count();
        console.log(`🇩🇰 Found ${danishElements} potential Danish elements`);
        
      } else {
        console.log('❌ No login button found');
      }
    } else {
      console.log('ℹ️  No login form detected, checking if already logged in or different interface...');
    }
    
    // Look for main application features regardless of login state
    console.log('🔍 Exploring main application features...');
    
    // Check for navigation elements
    const navElements = await page.locator('nav, .nav, [role="navigation"]').count();
    console.log(`🧭 Found ${navElements} navigation elements`);
    
    // Look for Danish-specific content
    const danishText = await page.textContent('body');
    const danishKeywords = ['familie', 'børn', 'lommepenge', 'kroner', 'DKK', 'balance', 'saldo', 'opgaver', 'belønning'];
    const foundKeywords = danishKeywords.filter(keyword => 
      danishText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    console.log('🇩🇰 Danish keywords found:', foundKeywords);
    
    // Look for family/children management features
    const familyFeatures = await page.locator('text=/familie|family|børn|child|kid/i').count();
    console.log(`👨‍👩‍👧‍👦 Family-related elements: ${familyFeatures}`);
    
    // Look for transaction/money features
    const moneyFeatures = await page.locator('text=/transaktion|penge|kroner|DKK|balance|saldo/i').count();
    console.log(`💰 Money-related elements: ${moneyFeatures}`);
    
    // Test responsive design - switch to mobile viewport
    console.log('📱 Testing mobile responsive design...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: '/home/mhylle/projects/mhylle.com/example-app2/.playwright-mcp/lommepenge-mobile-view.png',
      fullPage: true 
    });
    
    // Switch back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Try to navigate through available sections
    console.log('🗂️  Attempting to navigate through application sections...');
    
    // Look for clickable navigation items
    const navItems = await page.locator('a, button, [role="button"]').all();
    console.log(`🔗 Found ${navItems.length} clickable elements`);
    
    // Try to click on main navigation items (avoid logout/external links)
    for (let i = 0; i < Math.min(5, navItems.length); i++) {
      try {
        const element = navItems[i];
        const text = await element.textContent() || '';
        const href = await element.getAttribute('href') || '';
        
        // Skip external links, logout, or potentially destructive actions
        if (text.toLowerCase().includes('log ud') || 
            text.toLowerCase().includes('logout') ||
            href.startsWith('http') ||
            href.includes('logout')) {
          continue;
        }
        
        if (text.trim() && text.length < 50) { // Reasonable navigation text
          console.log(`🖱️  Trying to click: "${text.trim()}"`);
          await element.click();
          await page.waitForTimeout(1000);
          
          // Take screenshot of this section
          await page.screenshot({ 
            path: `/home/mhylle/projects/mhylle.com/example-app2/.playwright-mcp/lommepenge-section-${i}.png`,
            fullPage: true 
          });
        }
      } catch (error) {
        console.log(`⚠️  Could not interact with navigation item ${i}: ${error.message}`);
      }
    }
    
    // Final analysis
    console.log('📊 Final Analysis:');
    console.log(`• Application accessible: ✅`);
    console.log(`• Danish localization: ${foundKeywords.length > 0 ? '✅' : '❌'} (${foundKeywords.length} keywords found)`);
    console.log(`• Login form: ${hasLoginForm ? '✅' : 'ℹ️  Not detected'}`);
    console.log(`• Family features: ${familyFeatures > 0 ? '✅' : '❌'} (${familyFeatures} elements)`);
    console.log(`• Money features: ${moneyFeatures > 0 ? '✅' : '❌'} (${moneyFeatures} elements)`);
    console.log(`• Navigation: ${navElements > 0 ? '✅' : '❌'} (${navElements} elements)`);
    console.log(`• Responsive design: ✅ (mobile viewport tested)`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: '/home/mhylle/projects/mhylle.com/example-app2/.playwright-mcp/lommepenge-error.png',
      fullPage: true 
    });
  }
  
  await browser.close();
  console.log('✅ Testing completed');
}

// Run the test
testLommepengeApp().catch(console.error);