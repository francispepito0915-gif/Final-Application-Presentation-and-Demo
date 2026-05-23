const path = require('path');
const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const { promisify } = require('util');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'database.sqlite');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Unable to open database:', err);
        process.exit(1);
    }
});

const dbAll = promisify(db.all.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
    });
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function hashPassword(password) {
    return crypto.createHash('sha256').update(password, 'utf8').digest('hex');
}

function normalizeKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_-]/g, '')
        .replace(/_+/g, '_') || `key_${Date.now()}`;
}

const allowedStorageKeys = new Set([
    'products',
    'materials',
    'recipes',
    'suppliers',
    'storageLocations',
    'replenishments',
    'transactionHistory',
    'auditRecords'
]);

function ensureColumn(table, column, definition) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${table})`, (err, columns) => {
            if (err) return reject(err);
            const exists = columns.some((col) => col.name === column);
            if (exists) return resolve();
            db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
                if (alterErr) return reject(alterErr);
                resolve();
            });
        });
    });
}

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    passwordHash TEXT NOT NULL,
                    role TEXT NOT NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    key TEXT UNIQUE
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS beverages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE,
                    name TEXT NOT NULL,
                    category_id INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    image TEXT,
                    active INTEGER NOT NULL DEFAULT 1,
                    FOREIGN KEY(category_id) REFERENCES categories(id)
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS beverage_prices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    beverage_id INTEGER NOT NULL,
                    size TEXT,
                    price REAL NOT NULL,
                    FOREIGN KEY(beverage_id) REFERENCES beverages(id)
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS materials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE,
                    name TEXT NOT NULL,
                    unit TEXT NOT NULL,
                    quantity REAL NOT NULL DEFAULT 0,
                    low_stock_threshold REAL NOT NULL DEFAULT 0,
                    active INTEGER NOT NULL DEFAULT 1
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS recipe_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    beverage_id INTEGER NOT NULL,
                    size TEXT,
                    material_id INTEGER NOT NULL,
                    quantity REAL NOT NULL,
                    FOREIGN KEY(beverage_id) REFERENCES beverages(id),
                    FOREIGN KEY(material_id) REFERENCES materials(id)
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS suppliers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE,
                    name TEXT NOT NULL,
                    contact TEXT,
                    notes TEXT
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS storage_locations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE,
                    name TEXT NOT NULL,
                    notes TEXT
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    transaction_id TEXT UNIQUE NOT NULL,
                    date_time TEXT NOT NULL,
                    username TEXT,
                    role TEXT,
                    total_amount REAL NOT NULL,
                    cash_amount REAL NOT NULL,
                    change_amount REAL NOT NULL
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS transaction_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    transaction_id INTEGER NOT NULL,
                    beverage_id INTEGER,
                    size TEXT,
                    quantity INTEGER NOT NULL,
                    price REAL NOT NULL,
                    FOREIGN KEY(transaction_id) REFERENCES transactions(id),
                    FOREIGN KEY(beverage_id) REFERENCES beverages(id)
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS stock_updates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    material_id INTEGER NOT NULL,
                    quantity REAL NOT NULL,
                    supplier_id INTEGER,
                    storage_location_id INTEGER,
                    date_time TEXT NOT NULL,
                    notes TEXT,
                    FOREIGN KEY(material_id) REFERENCES materials(id),
                    FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
                    FOREIGN KEY(storage_location_id) REFERENCES storage_locations(id)
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date_time TEXT NOT NULL,
                    username TEXT,
                    role TEXT,
                    action_type TEXT NOT NULL,
                    description TEXT,
                    transaction_id TEXT,
                    product_name TEXT,
                    old_value TEXT,
                    new_value TEXT
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS app_data (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )`);

                await ensureColumn('categories', 'key', 'TEXT UNIQUE');
                await ensureColumn('beverages', 'key', 'TEXT UNIQUE');
                await ensureColumn('materials', 'key', 'TEXT UNIQUE');
                await ensureColumn('suppliers', 'key', 'TEXT UNIQUE');
                await ensureColumn('storage_locations', 'key', 'TEXT UNIQUE');

                await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_key ON categories(key)`);
                await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_beverages_key ON beverages(key)`);
                await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_materials_key ON materials(key)`);
                await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_key ON suppliers(key)`);
                await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_storage_locations_key ON storage_locations(key)`);

                await dbRun(`UPDATE categories SET key = lower(replace(name, ' ', '_')) WHERE key IS NULL OR key = ''`);
                await dbRun(`UPDATE beverages SET key = lower(replace(name, ' ', '_')) WHERE key IS NULL OR key = ''`);
                await dbRun(`UPDATE materials SET key = lower(replace(name, ' ', '_')) WHERE key IS NULL OR key = ''`);
                await dbRun(`UPDATE suppliers SET key = lower(replace(name, ' ', '_')) WHERE key IS NULL OR key = ''`);
                await dbRun(`UPDATE storage_locations SET key = lower(replace(name, ' ', '_')) WHERE key IS NULL OR key = ''`);

                const defaultAdminHash = hashPassword('admin123');
                db.run(`INSERT OR IGNORE INTO users (username, passwordHash, role) VALUES (?, ?, ?)`,
                    ['admin', defaultAdminHash, 'Admin']);

                const categories = ['Coffee', 'Juice', 'Milk Tea'];
                for (const category of categories) {
                    await dbRun(`INSERT OR IGNORE INTO categories (name, key) VALUES (?, ?)`, [category, normalizeKey(category)]);
                }

                const storageLocations = [
                    ['Shelf', 'Front counter supplies'],
                    ['Stock Room', 'Dry storage'],
                    ['Refrigerator', 'Cold ingredients']
                ];
                for (const [name, notes] of storageLocations) {
                    await dbRun(`INSERT OR IGNORE INTO storage_locations (name, key, notes) VALUES (?, ?, ?)`, [name, normalizeKey(name), notes]);
                }

                await dbRun(`INSERT OR IGNORE INTO suppliers (name, key, contact, notes) VALUES (?, ?, ?, ?)`,
                    ['Default Beverage Supplier', normalizeKey('Default Beverage Supplier'), '0912-000-0000', 'Reference supplier for demo replenishments.']);

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
}

async function getCategoryIdByName(name) {
    if (!name) return null;
    const categoryKey = normalizeKey(name);
    const row = await dbGet(`SELECT id FROM categories WHERE key = ?`, [categoryKey]);
    return row ? row.id : null;
}

async function findOrCreateCategory(name) {
    if (!name) return null;
    const categoryKey = normalizeKey(name);
    let row = await dbGet(`SELECT id FROM categories WHERE key = ?`, [categoryKey]);
    if (!row) {
        await dbRun(`INSERT INTO categories (name, key) VALUES (?, ?)`, [name, categoryKey]);
        row = await dbGet(`SELECT id FROM categories WHERE key = ?`, [categoryKey]);
    }
    return row ? row.id : null;
}

async function getEntityId(table, key, keyField = 'key') {
    if (!key) return null;
    const row = await dbGet(`SELECT id FROM ${table} WHERE ${keyField} = ?`, [key]);
    return row ? row.id : null;
}

async function upsertBeverage(product) {
    const categoryId = await findOrCreateCategory(product.category || 'Coffee');
    const beverageKey = String(product.id || product.name || '').trim();
    if (!beverageKey) return null;
    const active = product.active === false ? 0 : 1;
    const status = product.status || 'Active';
    const image = product.image || null;
    const name = product.name || beverageKey;
    let row = await dbGet(`SELECT id FROM beverages WHERE key = ?`, [beverageKey]);
    let beverageId;
    if (row) {
        await dbRun(`UPDATE beverages SET name = ?, category_id = ?, status = ?, image = ?, active = ? WHERE id = ?`,
            [name, categoryId, status, image, active, row.id]);
        beverageId = row.id;
    } else {
        const result = await dbRun(`INSERT INTO beverages (key, name, category_id, status, image, active) VALUES (?, ?, ?, ?, ?, ?)`,
            [beverageKey, name, categoryId, status, image, active]);
        beverageId = result.lastID;
    }
    await dbRun(`DELETE FROM beverage_prices WHERE beverage_id = ?`, [beverageId]);
    if (product.sizes && typeof product.sizes === 'object') {
        for (const [size, price] of Object.entries(product.sizes)) {
            const value = Number(price);
            if (!Number.isFinite(value)) continue;
            await dbRun(`INSERT INTO beverage_prices (beverage_id, size, price) VALUES (?, ?, ?)`, [beverageId, size, value]);
        }
    } else if (Number.isFinite(Number(product.price))) {
        await dbRun(`INSERT INTO beverage_prices (beverage_id, size, price) VALUES (?, ?, ?)`, [beverageId, null, Number(product.price)]);
    }
    return beverageId;
}

async function upsertMaterial(material) {
    const materialKey = String(material.id || material.name || '').trim();
    if (!materialKey) return null;
    const active = material.active === false ? 0 : 1;
    const name = material.name || materialKey;
    const unit = material.unit || 'pcs';
    const quantity = Number(material.quantity) || 0;
    const lowStockThreshold = Number(material.lowStockThreshold) || 0;
    let row = await dbGet(`SELECT id FROM materials WHERE key = ?`, [materialKey]);
    if (row) {
        await dbRun(`UPDATE materials SET name = ?, unit = ?, quantity = ?, low_stock_threshold = ?, active = ? WHERE id = ?`,
            [name, unit, quantity, lowStockThreshold, active, row.id]);
        return row.id;
    }
    const result = await dbRun(`INSERT INTO materials (key, name, unit, quantity, low_stock_threshold, active) VALUES (?, ?, ?, ?, ?, ?)`,
        [materialKey, name, unit, quantity, lowStockThreshold, active]);
    return result.lastID;
}

async function upsertSupplier(supplier) {
    const supplierKey = String(supplier.id || supplier.name || '').trim();
    if (!supplierKey) return null;
    const name = supplier.name || supplierKey;
    const contact = supplier.contact || null;
    const notes = supplier.notes || null;
    let row = await dbGet(`SELECT id FROM suppliers WHERE key = ?`, [supplierKey]);
    if (row) {
        await dbRun(`UPDATE suppliers SET name = ?, contact = ?, notes = ? WHERE id = ?`, [name, contact, notes, row.id]);
        return row.id;
    }
    const result = await dbRun(`INSERT INTO suppliers (key, name, contact, notes) VALUES (?, ?, ?, ?)`,
        [supplierKey, name, contact, notes]);
    return result.lastID;
}

async function upsertStorageLocation(location) {
    const locationKey = String(location.id || location.name || '').trim();
    if (!locationKey) return null;
    const name = location.name || locationKey;
    const notes = location.notes || null;
    let row = await dbGet(`SELECT id FROM storage_locations WHERE key = ?`, [locationKey]);
    if (row) {
        await dbRun(`UPDATE storage_locations SET name = ?, notes = ? WHERE id = ?`, [name, notes, row.id]);
        return row.id;
    }
    const result = await dbRun(`INSERT INTO storage_locations (key, name, notes) VALUES (?, ?, ?)`,
        [locationKey, name, notes]);
    return result.lastID;
}

async function saveProducts(products) {
    if (!Array.isArray(products)) return;
    for (const product of products) {
        await upsertBeverage(product);
    }
}

async function saveMaterials(materials) {
    if (!Array.isArray(materials)) return;
    for (const material of materials) {
        await upsertMaterial(material);
    }
}

async function saveSuppliers(suppliers) {
    if (!Array.isArray(suppliers)) return;
    for (const supplier of suppliers) {
        await upsertSupplier(supplier);
    }
}

async function saveStorageLocations(locations) {
    if (!Array.isArray(locations)) return;
    for (const location of locations) {
        await upsertStorageLocation(location);
    }
}

async function saveRecipes(recipes) {
    if (!recipes || typeof recipes !== 'object') return;
    await dbRun(`DELETE FROM recipe_items`);
    for (const [beverageKey, sizes] of Object.entries(recipes)) {
        const beverageId = await getEntityId('beverages', beverageKey);
        if (!beverageId || !sizes || typeof sizes !== 'object') continue;
        for (const [size, materials] of Object.entries(sizes)) {
            if (!materials || typeof materials !== 'object') continue;
            for (const [materialKey, quantity] of Object.entries(materials)) {
                const materialId = await getEntityId('materials', materialKey);
                const count = Number(quantity);
                if (!materialId || !Number.isFinite(count)) continue;
                await dbRun(`INSERT INTO recipe_items (beverage_id, size, material_id, quantity) VALUES (?, ?, ?, ?)`,
                    [beverageId, size, materialId, count]);
            }
        }
    }
}

async function saveReplenishments(replenishments) {
    if (!Array.isArray(replenishments)) return;
    await dbRun(`DELETE FROM stock_updates`);
    for (const replenishment of replenishments) {
        const materialId = await getEntityId('materials', replenishment.materialId);
        if (!materialId) continue;
        const supplierId = replenishment.supplierId ? await getEntityId('suppliers', replenishment.supplierId) : null;
        const locationId = replenishment.locationId ? await getEntityId('storage_locations', replenishment.locationId) : null;
        const quantity = Number(replenishment.quantity) || 0;
        await dbRun(`INSERT INTO stock_updates (material_id, quantity, supplier_id, storage_location_id, date_time, notes) VALUES (?, ?, ?, ?, ?, ?)`,
            [materialId, quantity, supplierId, locationId, replenishment.dateTime || new Date().toISOString(), replenishment.notes || null]);
    }
}

async function saveTransactionHistory(history) {
    if (!Array.isArray(history)) return;
    await dbRun(`DELETE FROM transaction_items`);
    await dbRun(`DELETE FROM transactions`);
    for (const transaction of history) {
        const dateTime = transaction.dateTime || new Date().toISOString();
        const username = transaction.username || null;
        const role = transaction.role || null;
        const totalAmount = Number(transaction.total) || 0;
        const cashAmount = Number(transaction.cashAmount) || 0;
        const changeAmount = Number(transaction.changeAmount) || 0;
        const result = await dbRun(`INSERT INTO transactions (transaction_id, date_time, username, role, total_amount, cash_amount, change_amount) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [transaction.id || `TXN-${Date.now()}`, dateTime, username, role, totalAmount, cashAmount, changeAmount]);
        const transactionRowId = result.lastID;
        if (Array.isArray(transaction.items)) {
            for (const item of transaction.items) {
                const beverageId = item.productId ? await getEntityId('beverages', item.productId) : null;
                const quantity = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                await dbRun(`INSERT INTO transaction_items (transaction_id, beverage_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)`,
                    [transactionRowId, beverageId, item.size || null, quantity, price]);
            }
        }
    }
}

async function saveAuditRecords(records) {
    if (!Array.isArray(records)) return;
    await dbRun(`DELETE FROM audit_logs`);
    for (const record of records) {
        await dbRun(`INSERT INTO audit_logs (date_time, username, role, action_type, description, transaction_id, product_name, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [record.dateTime || new Date().toISOString(), record.username || null, record.role || null, record.actionType || null, record.description || null, record.transactionId || null, record.productName || null, record.oldValue || null, record.newValue || null]);
    }
}

async function readProducts() {
    const beverages = await dbAll(`SELECT b.id, b.key, b.name, b.status, b.image, b.active, c.name AS category FROM beverages b JOIN categories c ON b.category_id = c.id`);
    const prices = await dbAll(`SELECT beverage_id, size, price FROM beverage_prices`);
    const priceMap = prices.reduce((memo, row) => {
        memo[row.beverage_id] = memo[row.beverage_id] || [];
        memo[row.beverage_id].push(row);
        return memo;
    }, {});
    return beverages.map((row) => {
        const product = {
            id: row.key || `product-${row.id}`,
            name: row.name,
            category: row.category,
            image: row.image || '',
            active: row.active !== 0,
            status: row.status || 'Active'
        };
        const priceRows = priceMap[row.id] || [];
        if (priceRows.length === 1 && (priceRows[0].size === null || priceRows[0].size === undefined)) {
            product.price = priceRows[0].price;
        } else if (priceRows.length > 0) {
            product.sizes = {};
            priceRows.forEach((priceRow) => {
                product.sizes[priceRow.size || 'Regular'] = priceRow.price;
            });
        }
        return product;
    });
}

async function readMaterials() {
    const rows = await dbAll(`SELECT key, name, unit, quantity, low_stock_threshold AS lowStockThreshold, active FROM materials`);
    return rows.map((row) => ({
        id: row.key,
        name: row.name,
        unit: row.unit,
        quantity: row.quantity,
        lowStockThreshold: row.lowStockThreshold,
        active: row.active !== 0
    }));
}

async function readSuppliers() {
    const rows = await dbAll(`SELECT key, name, contact, notes FROM suppliers`);
    return rows.map((row) => ({ id: row.key, name: row.name, contact: row.contact, notes: row.notes }));
}

async function readStorageLocations() {
    const rows = await dbAll(`SELECT key, name, notes FROM storage_locations`);
    return rows.map((row) => ({ id: row.key, name: row.name, notes: row.notes }));
}

async function readRecipes() {
    const rows = await dbAll(`SELECT b.key AS beverageKey, ri.size AS size, m.key AS materialKey, ri.quantity AS quantity FROM recipe_items ri JOIN beverages b ON ri.beverage_id = b.id JOIN materials m ON ri.material_id = m.id`);
    const recipes = {};
    rows.forEach((row) => {
        if (!recipes[row.beverageKey]) recipes[row.beverageKey] = {};
        if (!recipes[row.beverageKey][row.size]) recipes[row.beverageKey][row.size] = {};
        recipes[row.beverageKey][row.size][row.materialKey] = row.quantity;
    });
    return recipes;
}

async function readReplenishments() {
    const rows = await dbAll(`
        SELECT su.id, su.date_time AS dateTime, m.key AS materialId, m.name AS materialName, m.unit AS unit,
               su.quantity AS quantity, sup.key AS supplierId, sup.name AS supplierName,
               loc.key AS locationId, loc.name AS locationName, su.notes, su.date_time AS dateTime
        FROM stock_updates su
        JOIN materials m ON su.material_id = m.id
        LEFT JOIN suppliers sup ON su.supplier_id = sup.id
        LEFT JOIN storage_locations loc ON su.storage_location_id = loc.id
        ORDER BY su.id DESC
    `);
    return rows.map((row) => ({
        id: `REP-${row.id}`,
        dateTime: row.dateTime,
        materialId: row.materialId,
        materialName: row.materialName,
        quantity: row.quantity,
        unit: row.unit,
        supplierId: row.supplierId || '',
        supplierName: row.supplierName || 'No supplier selected',
        locationId: row.locationId || '',
        locationName: row.locationName || 'No location selected',
        notes: row.notes || ''
    }));
}

async function readTransactionHistory() {
    const rows = await dbAll(`SELECT id, transaction_id AS transactionId, date_time AS dateTime, username, role, total_amount AS total, cash_amount AS cashAmount, change_amount AS changeAmount FROM transactions ORDER BY id DESC`);
    const itemRows = await dbAll(`SELECT ti.transaction_id AS txId, b.key AS productId, b.name AS productName, ti.size AS size, ti.quantity AS quantity, ti.price AS price FROM transaction_items ti LEFT JOIN beverages b ON ti.beverage_id = b.id`);
    const itemsByTransaction = itemRows.reduce((acc, item) => {
        acc[item.txId] = acc[item.txId] || [];
        acc[item.txId].push({ productId: item.productId || '', productName: item.productName || '', size: item.size, quantity: item.quantity, price: item.price });
        return acc;
    }, {});
    return rows.map((row) => ({
        id: row.transactionId,
        dateTime: row.dateTime,
        username: row.username,
        role: row.role,
        total: row.total,
        cashAmount: row.cashAmount,
        changeAmount: row.changeAmount,
        items: itemsByTransaction[row.transactionId] || []
    }));
}

async function readAuditRecords() {
    const rows = await dbAll(`SELECT date_time AS dateTime, username, role, action_type AS actionType, description, transaction_id AS transactionId, product_name AS productName, old_value AS oldValue, new_value AS newValue FROM audit_logs ORDER BY id DESC`);
    return rows.map((row) => ({
        dateTime: row.dateTime,
        username: row.username,
        role: row.role,
        actionType: row.actionType,
        description: row.description,
        transactionId: row.transactionId,
        productName: row.productName,
        oldValue: row.oldValue,
        newValue: row.newValue
    }));
}

async function readStorageValue(key) {
    if (!allowedStorageKeys.has(key)) {
        throw new Error('Invalid storage key');
    }
    switch (key) {
        case 'products':
            return await readProducts();
        case 'materials':
            return await readMaterials();
        case 'recipes':
            return await readRecipes();
        case 'suppliers':
            return await readSuppliers();
        case 'storageLocations':
            return await readStorageLocations();
        case 'replenishments':
            return await readReplenishments();
        case 'transactionHistory':
            return await readTransactionHistory();
        case 'auditRecords':
            return await readAuditRecords();
        default:
            return null;
    }
}

async function writeStorageValue(key, value) {
    if (!allowedStorageKeys.has(key)) {
        throw new Error('Invalid storage key');
    }
    switch (key) {
        case 'products':
            await saveProducts(value);
            return;
        case 'materials':
            await saveMaterials(value);
            return;
        case 'recipes':
            await saveRecipes(value);
            return;
        case 'suppliers':
            await saveSuppliers(value);
            return;
        case 'storageLocations':
            await saveStorageLocations(value);
            return;
        case 'replenishments':
            await saveReplenishments(value);
            return;
        case 'transactionHistory':
            await saveTransactionHistory(value);
            return;
        case 'auditRecords':
            await saveAuditRecords(value);
            return;
        default:
            return;
    }
}

app.post('/api/signup', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    const normalizedUsername = String(username).trim().toLowerCase();
    const normalizedRole = String(role || 'Cashier').trim();
    const allowedRoles = new Set(['Admin', 'Cashier']);
    const accountRole = allowedRoles.has(normalizedRole) ? normalizedRole : 'Cashier';
    const passwordHash = hashPassword(password);

    db.run(`INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)`,
        [normalizedUsername, passwordHash, accountRole], function (err) {
            if (err) {
                const isUniqueConstraint = (typeof err.code === 'string' && err.code.includes('SQLITE_CONSTRAINT'))
                    || (typeof err.message === 'string' && err.message.includes('UNIQUE constraint'));
                if (isUniqueConstraint) {
                    return res.status(409).json({ message: 'Username already exists.' });
                }
                console.error(err);
                return res.status(500).json({ message: 'Unable to create account.' });
            }
            return res.status(201).json({ message: 'Account created successfully.' });
        });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    const normalizedUsername = String(username).trim().toLowerCase();
    const passwordHash = hashPassword(password);

    db.get(`SELECT username, role FROM users WHERE username = ? AND passwordHash = ?`,
        [normalizedUsername, passwordHash], (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Login failed.' });
            }
            if (!row) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }
            res.json({ username: row.username, role: row.role });
        });
});

app.get('/api/storage/all', async (req, res) => {
    try {
        const result = {};
        for (const key of allowedStorageKeys) {
            result[key] = await readStorageValue(key);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to load storage.' });
    }
});

app.get('/api/storage/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const value = await readStorageValue(key);
        res.json({ value });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/storage/:key', async (req, res) => {
    try {
        const key = req.params.key;
        if (req.body == null || !Object.prototype.hasOwnProperty.call(req.body, 'value')) {
            return res.status(400).json({ message: 'Storage value is required.' });
        }
        await writeStorageValue(key, req.body.value);
        res.json({ message: 'Saved' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'marchendisepos.html'));
});

initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Local host running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
