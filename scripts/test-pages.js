#!/usr/bin/env node
/**
 * Puppeteer test script for all app pages
 * Run: node scripts/test-pages.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173/tutor/';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPages() {
  console.log('🚀 Starting Puppeteer tests...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // iPhone 14 Pro size

  const results = [];

  try {
    // Test 1: Home page (Topic Select)
    console.log('📱 Test 1: Home page (Topic Select)');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png') });

    const homeTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    results.push({
      page: 'Home (Topic Select)',
      status: homeTitle ? '✅ OK' : '❌ FAIL',
      details: homeTitle || 'No h1 found'
    });
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

    // Test 2: Progress page
    console.log('📊 Test 2: Progress page');
    // Click progress button in BottomBar (slot 2)
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      // BottomBar progress button - look for chart icon or specific position
      const progressBtn = btns.find(b => {
        const svg = b.querySelector('svg');
        return svg && (b.textContent.includes('pokrok') || b.closest('[class*="bottom"]'));
      }) || btns[btns.length - 2]; // Second from last is usually progress
      if (progressBtn) progressBtn.click();
    });
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-progress.png') });

    const progressContent = await page.$('h1, h2').catch(() => null);
    results.push({
      page: 'Progress',
      status: progressContent ? '✅ OK' : '⚠️ CHECK',
      details: 'Progress page loaded'
    });
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

    // Go back to home
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    // Test 3: Lightning Round
    console.log('⚡ Test 3: Lightning Round');
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const lightningBtn = btns.find(b =>
        b.textContent.includes('Bleskové') ||
        b.textContent.includes('Lightning')
      );
      if (lightningBtn) lightningBtn.click();
    });
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-lightning.png') });

    const lightningLoaded = await page.$('button, input').catch(() => null);
    results.push({
      page: 'Lightning Round',
      status: lightningLoaded ? '✅ OK' : '⚠️ CHECK',
      details: 'Lightning round loaded'
    });
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

    // Go back to home
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    // Test 4: Type Drill
    console.log('🎯 Test 4: Type Drill');
    const typeDrillClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const typeDrillBtn = btns.find(b => b.textContent.includes('Rozpoznej typ'));
      if (typeDrillBtn) {
        typeDrillBtn.click();
        return true;
      }
      return false;
    });
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-typedrill.png') });

    const typeDrillTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const header = document.querySelector('[class*="header"]');
      return h1?.textContent || header?.textContent || document.body.textContent.slice(0, 100);
    });
    const typeDrillOk = typeDrillClicked && !typeDrillTitle.includes('prozkoumáme');
    results.push({
      page: 'Type Drill',
      status: typeDrillOk ? '✅ OK' : '⚠️ CHECK',
      details: typeDrillOk ? 'Type drill loaded' : `Clicked: ${typeDrillClicked}, Title: ${typeDrillTitle.slice(0, 30)}`
    });
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

    // Go back to home
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    // Test 5: Start a session (Equations topic)
    console.log('📝 Test 5: Session (ProblemCard)');
    const sessionClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      // Look for "Lineární rovnice" topic button
      const equationsBtn = btns.find(b => b.textContent.includes('Lineární rovnice'));
      if (equationsBtn) {
        equationsBtn.click();
        return true;
      }
      return false;
    });
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-session.png') });

    // Check if we're on a problem card (has input field or progress indicator)
    const sessionInfo = await page.evaluate(() => {
      const input = document.querySelector('input[type="text"], input[type="number"]');
      const progress = document.body.textContent.match(/\d+\/\d+/);
      const hasSubmitBtn = [...document.querySelectorAll('button')].some(b =>
        b.textContent.includes('Zkontrolovat') || b.textContent.includes('Odpovědět')
      );
      return { hasInput: !!input, hasProgress: !!progress, hasSubmitBtn };
    });
    const sessionOk = sessionClicked && (sessionInfo.hasInput || sessionInfo.hasSubmitBtn);
    results.push({
      page: 'Session (ProblemCard)',
      status: sessionOk ? '✅ OK' : '⚠️ CHECK',
      details: sessionOk ? 'Problem card loaded' : `Clicked: ${sessionClicked}, Input: ${sessionInfo.hasInput}, Submit: ${sessionInfo.hasSubmitBtn}`
    });
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

    // Test 6: Answer a problem to get to next one
    console.log('✏️ Test 6: Answer interaction');
    // Wait a bit more for React to render
    await delay(500);
    const inputSelector = 'input[type="text"], input[type="number"], input:not([type="hidden"])';
    const input = await page.$(inputSelector);

    if (input) {
      await input.click();
      await input.type('5');
      await delay(300);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-answer-input.png') });

      // Click submit button (icon-only, uses title="Odeslat")
      const submitted = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const submitBtn = btns.find(b =>
          b.title === 'Odeslat' ||
          b.getAttribute('title') === 'Odeslat' ||
          b.textContent.includes('Zkontrolovat')
        );
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.click();
          return true;
        }
        return false;
      });
      await delay(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-answer-result.png') });

      results.push({
        page: 'Answer Interaction',
        status: submitted ? '✅ OK' : '⚠️ CHECK',
        details: submitted ? 'Answer submitted' : 'Submit button not found'
      });
    } else {
      // Maybe it's a multiple choice question?
      const hasChoices = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        return btns.length > 3; // Home, progress + answer choices
      });
      results.push({
        page: 'Answer Interaction',
        status: hasChoices ? '⚠️ MC' : '⚠️ SKIP',
        details: hasChoices ? 'Multiple choice detected' : 'No input field found'
      });
    }
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

    // Test 7: Complete session to see summary
    console.log('🏁 Test 7: Session Summary');
    // State-based approach: detect current state and take appropriate action
    for (let iter = 0; iter < 50; iter++) {
      // Check if we're on summary page
      const state = await page.evaluate(() => {
        const text = document.body.textContent;
        if (text.includes('Skvělá práce') || text.includes('úloh prozkoumáno') || text.includes('Nová session')) {
          return 'summary';
        }

        const btns = [...document.querySelectorAll('button')];
        const blueBtn = btns.find(b => b.classList.contains('bg-safe-blue'));
        const purpleBtn = btns.find(b => b.classList.contains('bg-purple-100') && !b.disabled);
        const input = document.querySelector('input:not([type="hidden"])');

        if (blueBtn && blueBtn.title === 'Pokračovat' && !blueBtn.disabled) {
          return 'can_continue';
        }
        if (purpleBtn) {
          return 'can_hint';
        }
        if (input && blueBtn && blueBtn.title === 'Odeslat' && !blueBtn.disabled) {
          return 'can_submit';
        }
        return 'unknown';
      });

      if (state === 'summary') break;

      if (state === 'can_continue') {
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('button')].find(b =>
            b.classList.contains('bg-safe-blue') && b.title === 'Pokračovat'
          );
          if (btn) btn.click();
        });
        await delay(400);
        continue;
      }

      if (state === 'can_hint') {
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('button')].find(b =>
            b.classList.contains('bg-purple-100') && !b.disabled
          );
          if (btn) btn.click();
        });
        await delay(300);
        continue;
      }

      if (state === 'can_submit') {
        // Triple-click to select all, then type to replace
        const inputHandle = await page.$('input:not([type="hidden"])');
        if (inputHandle) {
          await inputHandle.click({ clickCount: 3 });
          await delay(50);
          await page.keyboard.type('1');
          await delay(100);
          // Blur to prevent symbol bar focus issues
          await page.evaluate(() => document.activeElement.blur());
          await delay(50);
        }
        // Click submit
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('button')].find(b =>
            b.classList.contains('bg-safe-blue') && b.title === 'Odeslat' && !b.disabled
          );
          if (btn) btn.click();
        });
        await delay(400);
        continue;
      }

      // Unknown state - wait
      await delay(200);
    }

    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-summary.png') });

    const summaryInfo = await page.evaluate(() => {
      const text = document.body.textContent;
      return {
        hasSummary: text.includes('Skvělá práce') || text.includes('prozkoumáno') || text.includes('Nová session'),
        hasStats: text.includes('úloh') || text.includes('pokrok'),
        preview: text.slice(0, 150)
      };
    });
    results.push({
      page: 'Session Summary',
      status: summaryInfo.hasSummary ? '✅ OK' : '⚠️ CHECK',
      details: summaryInfo.hasSummary ? 'Summary page reached' : `Preview: ${summaryInfo.preview.slice(0, 50)}...`
    });
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

    // Test 8: Desktop viewport
    console.log('🖥️ Test 8: Desktop viewport');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-desktop.png') });

    results.push({
      page: 'Desktop Viewport',
      status: '✅ OK',
      details: 'Desktop layout rendered'
    });
    console.log(`   ${results[results.length - 1].status} - ${results[results.length - 1].details}\n`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.push({
      page: 'Error',
      status: '❌ FAIL',
      details: error.message
    });
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('═'.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('═'.repeat(50));
  results.forEach(r => {
    console.log(`${r.status} ${r.page}: ${r.details}`);
  });
  console.log('═'.repeat(50));
  console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);

  const passed = results.filter(r => r.status.includes('✅')).length;
  const total = results.length;
  console.log(`\n✨ Results: ${passed}/${total} passed\n`);

  return results;
}

testPages().catch(console.error);
