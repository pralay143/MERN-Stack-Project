// Runs once after all test files (jest "globalTeardown"): removes the
// per-worker temporary upload folders created by tests/setup/env.js.
const fs = require('fs')
const os = require('os')
const path = require('path')

module.exports = async () => {
    for (const name of fs.readdirSync(os.tmpdir())) {
        if (name.startsWith('efurniture-test-uploads-')) {
            fs.rmSync(path.join(os.tmpdir(), name), { recursive: true, force: true })
        }
    }
}
