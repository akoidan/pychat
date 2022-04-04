const servor = require('servor');
const {promisify} = require('util');
const {readFile} = require('fs');

async function readFileAsync(name) {
    return promisify(readFile)(name);
}

async function main() {
    const instance = await servor({
        root: 'dist',
        fallback: 'index.html',
        credentials: {
            cert: await readFileAsync('./build/certs/server.crt.pem'),
            key: await readFileAsync('./build/certs/private.key.pem'),
        },
        port: 8080,
    });
}

main();
