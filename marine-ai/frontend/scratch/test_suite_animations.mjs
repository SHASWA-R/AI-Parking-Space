import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173?intro=false', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // 1. Capture Hero Section with Typewriter in action
  await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/anim_hero_typewriter.png' });
  console.log('Captured Hero with Typewriter');

  // 2. Scroll to show Acoustic Transect Reel
  await page.evaluate(() => window.scrollBy({ top: 580, behavior: 'smooth' }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/anim_transect_reel.png' });
  console.log('Captured Acoustic Transect Reel');

  // 3. Click on a reel card to test interactive inspection modal
  const firstCard = page.locator('text=TGT-01').first();
  if (await firstCard.isVisible()) {
    console.log('Clicking TGT-01 on reel...');
    await firstCard.click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/anim_reel_inspect_modal.png' });
    console.log('Captured Reel Inspect Modal');

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 4. Scroll down to Beginner Education & Problem section to verify cards
  await page.evaluate(() => window.scrollBy({ top: 900, behavior: 'smooth' }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/anim_cards_section.png' });
  console.log('Captured Knowledge & Problem cards');

  await browser.close();
  console.log('Animation suite verification completed successfully');
}

run().catch(console.error);
