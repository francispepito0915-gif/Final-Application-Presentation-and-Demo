const assert = require('node:assert/strict');
const test = require('node:test');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const port = 3155;
const baseUrl = `http://127.0.0.1:${port}`;

function requestJson(method, pathname, body) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const request = http.request(
            `${baseUrl}${pathname}`,
            {
                method,
                headers: payload
                    ? {
                          'Content-Type': 'application/json',
                          'Content-Length': Buffer.byteLength(payload)
                      }
                    : {}
            },
            (response) => {
                let data = '';
                response.setEncoding('utf8');
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    const contentType = response.headers['content-type'] || '';
                    let parsed = null;

                    if (data && contentType.includes('application/json')) {
                        parsed = JSON.parse(data);
                    }

                    resolve({
                        statusCode: response.statusCode,
                        body: data,
                        json: parsed
                    });
                });
            }
        );

        request.on('error', reject);

        if (payload) {
            request.write(payload);
        }

        request.end();
    });
}

async function waitForServer() {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
        try {
            const response = await requestJson('GET', '/api/storage/all');
            if (response.statusCode === 200) {
                return;
            }
        } catch (error) {
            // Ignore and retry until the server is ready.
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error('Server did not become ready in time');
}

async function startServer() {
    const child = spawn(process.execPath, ['server.js'], {
        cwd: projectRoot,
        env: {
            ...process.env,
            PORT: String(port)
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stderr.on('data', (chunk) => {
        process.stderr.write(chunk);
    });

    await waitForServer();
    return child;
}

async function stopServer(child) {
    if (!child) {
        return;
    }

    await new Promise((resolve) => {
        child.once('exit', resolve);
        child.kill('SIGTERM');
    });
}

let serverProcess;

test.before(async () => {
    serverProcess = await startServer();
});

test.after(async () => {
    await stopServer(serverProcess);
});

test('root page responds with 200', async () => {
    const response = await requestJson('GET', '/');
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /<html|<head|<body/i);
});

test('storage all endpoint returns expected keys', async () => {
    const response = await requestJson('GET', '/api/storage/all');
    assert.equal(response.statusCode, 200);
    assert.equal(typeof response.json, 'object');
    assert.deepEqual(
        Object.keys(response.json).sort(),
        ['auditRecords', 'materials', 'products', 'recipes', 'replenishments', 'storageLocations', 'suppliers', 'transactionHistory'].sort()
    );
});

test('signup and login succeed for a unique user', async () => {
    const uniqueSuffix = Date.now();
    const username = `regression_${uniqueSuffix}`;
    const password = 'RegPass123!';

    const signup = await requestJson('POST', '/api/signup', {
        username,
        password,
        role: 'Cashier'
    });

    assert.equal(signup.statusCode, 201);

    const login = await requestJson('POST', '/api/login', {
        username,
        password
    });

    assert.equal(login.statusCode, 200);
    assert.equal(login.json.username, username);
    assert.equal(login.json.role, 'Cashier');
});

/*test('writing products and materials persists and can be read back', async () => {
    const suffix = Date.now();
    const productId = `regression-product-${suffix}`;
    const materialId = `regression-material-${suffix}`;

    const productPayload = [{
        id: productId,
        name: 'Regression Product',
        category: 'Coffee',
        image: 'images/coffee/regression.png',
        active: true,
        price: 99
    }];

    const materialPayload = [{
        id: materialId,
        name: 'Regression Material',
        quantity: 25,
        unit: 'servings',
        lowStockThreshold: 5,
        active: true
    }]; */

    const saveProducts = await requestJson('POST', '/api/storage/products', { value: productPayload });
    const saveMaterials = await requestJson('POST', '/api/storage/materials', { value: materialPayload });

    assert.equal(saveProducts.statusCode, 200);
    assert.equal(saveMaterials.statusCode, 200);

    const productsResponse = await requestJson('GET', '/api/storage/products');
    const materialsResponse = await requestJson('GET', '/api/storage/materials');

    assert.equal(productsResponse.statusCode, 200);
    assert.equal(materialsResponse.statusCode, 200);
    assert.equal(productsResponse.json.value[0].id, productId);
    assert.equal(productsResponse.json.value[0].name, 'Regression Product');
    assert.equal(materialsResponse.json.value[0].id, materialId);
    assert.equal(materialsResponse.json.value[0].name, 'Regression Material');
});
