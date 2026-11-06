import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173?intro=false', { waitUntil: 'domcontentloaded' });
  await page.click('button:has-text("UPLOAD .XTF")');
  await page.waitForTimeout(1000);
  await page.setInputFiles('input[type="file"]', 'C:/Users/Asus/Downloads/transect_survey_alpha_455khz.xtf');
  await page.waitForTimeout(800);
  await page.click('button:has-text("START AI ANALYSIS")');
  await page.waitForTimeout(4500); // wait for processing stepper to complete
  await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/upload_xtf_results.png' });
  console.log('Upload XTF test complete!');
  await browser.close();
}

run().catch(console.error);
