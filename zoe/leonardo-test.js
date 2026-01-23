// Leonardo Test Suite - Tests complets pour Zoe
const puppeteer = require('puppeteer');

const conversations = [
    { name: 'Jean', messages: ["salut zoe", "qui es-tu?", "merci"] },
    { name: 'Maria', messages: ["bonjour", "je suis un peu triste", "qu'est-ce que tu penses de la vie?"] },
    { name: 'Leo', messages: ["hey", "c'est quoi ce jeu?", "montre-moi"] },
    { name: 'Sara', messages: ["coucou", "tu aimes la musique?", "je t'aime bien"] },
];

async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function testConversation(browser, { name, messages }, pageUrl) {
    const page = await browser.newPage();
    let errors = [];

    try {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`TEST: ${name}`);
        console.log('='.repeat(50));

        await page.goto(pageUrl);
        await page.waitForSelector('#input', { timeout: 5000 });

        // Attend les messages initiaux de Zoe
        await wait(2000);

        let msgCount = await page.evaluate(() =>
            document.querySelectorAll('.msg.zoe').length
        );
        console.log(`[init] ${msgCount} messages de zoe`);

        if (msgCount < 2) {
            errors.push('Pas assez de messages initiaux');
        }

        // Envoie le nom
        await page.type('#input', name);
        await page.keyboard.press('Enter');
        console.log(`[user] ${name}`);

        await wait(3000);

        // Verification de la reponse au nom
        const nameResponse = await page.evaluate(() => {
            const msgs = document.querySelectorAll('.msg.zoe');
            return Array.from(msgs).map(m => m.textContent);
        });

        const hasGreeting = nameResponse.some(m =>
            m.toLowerCase().includes('enchantee') || m.toLowerCase().includes(name.toLowerCase())
        );

        if (hasGreeting) {
            console.log(`[zoe] Salutation personnalisee detectee`);
        } else {
            errors.push('Pas de salutation personnalisee');
        }

        // Envoie les messages de test
        for (const msg of messages) {
            await wait(500);

            // Attend que l'input soit actif
            const isEnabled = await page.evaluate(() =>
                !document.getElementById('input').disabled
            );

            if (!isEnabled) {
                await wait(2000);
            }

            const beforeCount = await page.evaluate(() =>
                document.querySelectorAll('.msg').length
            );

            await page.type('#input', msg);
            await page.keyboard.press('Enter');
            console.log(`[user] ${msg}`);

            // Attend la reponse
            await wait(3000);

            const afterCount = await page.evaluate(() =>
                document.querySelectorAll('.msg').length
            );

            if (afterCount > beforeCount) {
                const lastMsg = await page.evaluate(() => {
                    const msgs = document.querySelectorAll('.msg.zoe');
                    return msgs[msgs.length - 1]?.textContent || '';
                });
                console.log(`[zoe] ${lastMsg}`);
            } else {
                errors.push(`Pas de reponse a: "${msg}"`);
            }
        }

        // Rapport de la conversation
        const allMessages = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.msg')).map(m => ({
                type: m.classList.contains('user') ? 'user' :
                      m.classList.contains('fragment') ? 'fragment' :
                      m.classList.contains('discovery') ? 'discovery' : 'zoe',
                text: m.textContent.trim()
            }));
        });

        console.log(`\n--- Conversation complete (${allMessages.length} messages) ---`);

        // Etat du jeu
        const gameState = await page.evaluate(() => {
            if (typeof game !== 'undefined') {
                return {
                    phase: game.phase,
                    level: game.level,
                    fragments: game.fragments,
                    turns: game.turns
                };
            }
            return null;
        });

        if (gameState) {
            console.log(`[state] phase=${gameState.phase} level=${gameState.level} turns=${gameState.turns}`);
        }

        if (errors.length === 0) {
            console.log(`\n[OK] Test ${name} reussi`);
            return { success: true, messages: allMessages, errors: [] };
        } else {
            console.log(`\n[WARN] Test ${name} termine avec ${errors.length} probleme(s)`);
            return { success: true, messages: allMessages, errors };
        }

    } catch (e) {
        console.error(`[ERREUR] Test ${name}: ${e.message}`);
        return { success: false, error: e.message, errors };
    } finally {
        await page.close();
    }
}

async function testResponsiveness(browser, pageUrl) {
    console.log(`\n${'='.repeat(50)}`);
    console.log('TEST: Reactivite');
    console.log('='.repeat(50));

    const page = await browser.newPage();

    try {
        const start = Date.now();
        await page.goto(pageUrl);
        await page.waitForSelector('#input');
        const loadTime = Date.now() - start;
        console.log(`[perf] Temps de chargement: ${loadTime}ms`);

        await wait(2000);

        // Test de reponse rapide
        const inputStart = Date.now();
        await page.type('#input', 'Test');
        await page.keyboard.press('Enter');

        await page.waitForFunction(
            () => document.querySelectorAll('.msg').length > 3,
            { timeout: 10000 }
        );
        const responseTime = Date.now() - inputStart;
        console.log(`[perf] Temps de reponse: ${responseTime}ms`);

        return {
            success: true,
            loadTime,
            responseTime,
            verdict: loadTime < 3000 && responseTime < 5000 ? 'RAPIDE' : 'ACCEPTABLE'
        };

    } catch (e) {
        console.error(`[ERREUR] Test reactivite: ${e.message}`);
        return { success: false, error: e.message };
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('        LEONARDO TEST SUITE - ZOE CHAT');
    console.log('='.repeat(60));
    console.log('Test du site Zoe avec simulation utilisateur');
    console.log(`Date: ${new Date().toLocaleString('fr-FR')}\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const pageUrl = 'http://127.0.0.1:8899/new.html';

    const results = [];

    // Test de reactivite
    const perfResult = await testResponsiveness(browser, pageUrl);
    results.push({ name: 'Reactivite', ...perfResult });

    // Tests de conversation
    for (const conv of conversations) {
        const result = await testConversation(browser, conv, pageUrl);
        results.push({ name: conv.name, ...result });
        await wait(500);
    }

    await browser.close();

    // Rapport final
    console.log('\n' + '='.repeat(60));
    console.log('              RAPPORT FINAL');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const allWarnings = results.flatMap(r => r.errors || []);

    console.log(`\nTests: ${passed}/${total} reussis`);

    if (perfResult.success) {
        console.log(`Performance: ${perfResult.verdict}`);
        console.log(`  - Chargement: ${perfResult.loadTime}ms`);
        console.log(`  - Reponse: ${perfResult.responseTime}ms`);
    }

    if (allWarnings.length > 0) {
        console.log(`\nAvertissements (${allWarnings.length}):`);
        allWarnings.forEach(w => console.log(`  - ${w}`));
    }

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        console.log('\nEchecs:');
        failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log(passed === total ? '        TOUS LES TESTS SONT PASSES' : '        CERTAINS TESTS ONT ECHOUE');
    console.log('='.repeat(60) + '\n');

    process.exit(passed === total ? 0 : 1);
}

main().catch(e => {
    console.error('Erreur fatale:', e);
    process.exit(1);
});
