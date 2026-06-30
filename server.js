const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.txt');

let orders = [];

function loadOrders() {
    try {
        if (fs.existsSync(ORDERS_FILE)) {
            const data = fs.readFileSync(ORDERS_FILE, 'utf8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                orders = parsed;
                return true;
            }
        }
    } catch (e) {
        console.error('Error loading orders:', e);
    }
    return false;
}

function saveOrders() {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return true;
    } catch (e) {
        console.error('Error saving orders:', e);
        return false;
    }
}

if (!loadOrders()) {
    orders = [
        { id: 1, client: 'Иванов И.И.', product: 'Ноутбук ASUS', amount: 45000, status: 'Новый' },
        { id: 2, client: 'Петрова А.С.', product: 'Смартфон Xiaomi', amount: 32000, status: 'В обработке' },
        { id: 3, client: 'Сидоров В.П.', product: 'Наушники Sony', amount: 8500, status: 'Доставлен' },
        { id: 4, client: 'Козлова М.Д.', product: 'Планшет iPad', amount: 28000, status: 'Отправлен' },
        { id: 5, client: 'Новиков А.А.', product: 'Клавиатура Logitech', amount: 4200, status: 'Новый' },
        { id: 6, client: 'Морозова Е.В.', product: 'Монитор Dell', amount: 18000, status: 'Отменен' }
    ];
    saveOrders();
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    if (pathname === '/' || pathname === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    if (pathname === '/style.css') {
        fs.readFile(path.join(__dirname, 'style.css'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
        return;
    }

    if (pathname === '/script.js') {
        fs.readFile(path.join(__dirname, 'script.js'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
        return;
    }

    if (pathname === '/api/orders') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(orders));
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data.orders) {
                        orders = data.orders;
                        saveOrders();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid data' }));
                    }
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Orders file: ${ORDERS_FILE}`);
});