const STATUSES = ['Новый', 'В обработке', 'Отправлен', 'Доставлен', 'Отменен'];

let orders = [];
let nextId = 1;

function renderBoard() {
    STATUSES.forEach(status => {
        const container = document.getElementById('col-' + getStatusId(status));
        if (container) container.innerHTML = '';
    });

    orders.forEach(order => {
        const container = document.getElementById('col-' + getStatusId(order.status));
        if (container) {
            container.appendChild(createCard(order));
        }
    });

    STATUSES.forEach(status => {
        const count = orders.filter(o => o.status === status).length;
        const el = document.getElementById('count-' + getStatusId(status));
        if (el) el.textContent = count;
    });
}

function getStatusId(status) {
    const map = {
        'Новый': 'new',
        'В обработке': 'processing',
        'Отправлен': 'shipped',
        'Доставлен': 'delivered',
        'Отменен': 'cancelled'
    };
    return map[status] || status;
}

function createCard(order) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = order.id;

    const statusIndex = STATUSES.indexOf(order.status);

    card.innerHTML = `
        <div class="id">#${order.id}</div>
        <div class="client">${order.client}</div>
        <div class="product">${order.product}</div>
        <div class="amount">${order.amount.toLocaleString()} ₽</div>
        <div class="card-actions">
            ${statusIndex > 0 ? `<button class="btn-left" onclick="moveOrder(${order.id}, 'left')">◀</button>` : ''}
            ${statusIndex < STATUSES.length - 1 ? `<button class="btn-right" onclick="moveOrder(${order.id}, 'right')">▶</button>` : ''}
            <button class="btn-delete" onclick="deleteOrder(${order.id})">🗑</button>
        </div>
    `;

    return card;
}

function moveOrder(id, direction) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const currentIndex = STATUSES.indexOf(order.status);
    let newIndex;

    if (direction === 'left') {
        newIndex = Math.max(0, currentIndex - 1);
    } else {
        newIndex = Math.min(STATUSES.length - 1, currentIndex + 1);
    }

    if (newIndex !== currentIndex) {
        order.status = STATUSES[newIndex];
        renderBoard();
        saveToServer();
    }
}

function addOrder() {
    const client = document.getElementById('client').value.trim();
    const product = document.getElementById('product').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    if (!client || !product || !amount) {
        alert('Заполните все поля!');
        return;
    }

    orders.push({
        id: nextId++,
        client: client,
        product: product,
        amount: amount,
        status: 'Новый'
    });

    document.getElementById('client').value = '';
    document.getElementById('product').value = '';
    document.getElementById('amount').value = '';

    renderBoard();
    saveToServer();
}

function deleteOrder(id) {
    if (confirm('Удалить заказ #' + id + '?')) {
        orders = orders.filter(o => o.id !== id);
        renderBoard();
        saveToServer();
    }
}

async function saveToServer() {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders: orders })
        });
        if (!response.ok) {
            console.error('Failed to save to server');
        }
    } catch (err) {
        console.error('Save error:', err);
    }
}

async function loadFromServer() {
    try {
        const response = await fetch('/api/orders');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                orders = data;
                const maxId = orders.reduce((max, o) => Math.max(max, o.id || 0), 0);
                nextId = maxId + 1;
                renderBoard();
                return true;
            }
        }
    } catch (err) {
        console.error('Load error:', err);
    }
    return false;
}

async function init() {
    const loaded = await loadFromServer();
    if (!loaded) {
        orders = [
            { id: 1, client: 'Иванов И.И.', product: 'Ноутбук ASUS', amount: 45000, status: 'Новый' },
            { id: 2, client: 'Петрова А.С.', product: 'Смартфон Xiaomi', amount: 32000, status: 'В обработке' },
            { id: 3, client: 'Сидоров В.П.', product: 'Наушники Sony', amount: 8500, status: 'Доставлен' },
            { id: 4, client: 'Козлова М.Д.', product: 'Планшет iPad', amount: 28000, status: 'Отправлен' },
            { id: 5, client: 'Новиков А.А.', product: 'Клавиатура Logitech', amount: 4200, status: 'Новый' },
            { id: 6, client: 'Морозова Е.В.', product: 'Монитор Dell', amount: 18000, status: 'Отменен' }
        ];
        nextId = 7;
        renderBoard();
        await saveToServer();
    }
}

init();