// Test simple Zoe - debug
const puppeteer = require('puppeteer');

async function test() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture console logs
    page.on('console', msg => console.log('[PAGE]', msg.text()));
    page.on('pageerror', err => console.log('[ERROR]', err.message));

    await page.goto('http://127.0.0.1:8899/new.html');

    // Wait for page to fully load
    await new Promise(r => setTimeout(r, 3000));

    // Check initial state
    let msgs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.msg')).map(m => m.textContent)
    );
    console.log('Initial messages:', msgs);

    // Check if input exists
    const hasInput = await page.evaluate(() => !!document.getElementById('input'));
    console.log('Input exists:', hasInput);

    // Get game state
    const state = await page.evaluate(() => {
        if (typeof game !== 'undefined') return game;
        return null;
    });
    console.log('Game state:', state);

    // Type name
    await page.type('#input', 'Test');
    await page.keyboard.press('Enter');
    console.log('Sent: Test');

    // Wait for response
    await new Promise(r => setTimeout(r, 5000));

    msgs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.msg')).map(m => ({
            class: m.className,
            text: m.textContent.trim()
        }))
    );
    console.log('Messages after name:', msgs);

    // Check input state
    const inputDisabled = await page.evaluate(() =>
        document.getElementById('input').disabled
    );
    console.log('Input disabled:', inputDisabled);

    // Try another message
    if (!inputDisabled) {
        await page.type('#input', 'salut');
        await page.keyboard.press('Enter');
        console.log('Sent: salut');

        await new Promise(r => setTimeout(r, 4000));

        msgs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.msg')).map(m => ({
                class: m.className,
                text: m.textContent.trim()
            }))
        );
        console.log('Final messages:', msgs);
    }

    await browser.close();
    console.log('\nTest complete!');
}

test().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
