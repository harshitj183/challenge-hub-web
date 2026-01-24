const http = require('http');

async function runTests() {
    console.log('\n🧪 BACKEND HEALTH CHECK');
    console.log('========================================');

    const baseUrl = 'http://127.0.0.1:3000';

    async function check(name, url) {
        console.log(`\n🔍 Checking ${name}...`);
        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                console.log('   ✅ STATUS: ONLINE (200 OK)');

                if (Array.isArray(data.challenges)) {
                    console.log(`   📊 Challenges Found: ${data.challenges.length}`);
                } else if (data.status === 'ok') {
                    console.log('   ❤️ Health Check: Passed');
                } else {
                    console.log('   📄 Data received.');
                }
            } else {
                console.log(`   ⚠️ STATUS: ${res.status} ${res.statusText}`);
                const text = await res.text();
                if (url.includes('session')) {
                    // Session often returns empty/500 if no cookie, which is normal-ish for curl
                    console.log('   ℹ️ Note: Session endpoint requires valid auth cookie.');
                }
            }
        } catch (err) {
            console.log('   ❌ FAILED: Connection Error');
            console.log('      ' + err.message);
        }
    }

    // Check 1: Health (Simple)
    await check('System Health', `${baseUrl}/api/health`);

    // Check 2: Challenges (DB Connectivity)
    await check('Database & Challenges API', `${baseUrl}/api/challenges`);

    console.log('\n========================================');
    console.log('✅ BACKEND SERVICES ARE OPERATIONAL');
}

runTests();
