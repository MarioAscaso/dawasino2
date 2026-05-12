const API_BASE_URL = 'http://localhost:8989/api';

function checkAuth() {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        const path = window.location.pathname;
        if (!path.includes('login') && !path.includes('register') && !path.includes('index') && path !== '/') {
            window.location.href = '/login/login.html';
        }
        return null;
    }
    return JSON.parse(userJson);
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/index/index.html';
}

function updateLocalUser(newBalance) {
    const user = checkAuth();
    if(user) {
        user.balance = newBalance;
        localStorage.setItem('user', JSON.stringify(user));
    }
}

const api = {
    post: async (endpoint, data) => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (e) {
            console.error("API Error:", e);
            throw e;
        }
    },
    get: async (endpoint) => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!res.ok) throw new Error("Error fetching data");
            return await res.json();
        } catch (e) { return []; }
    }
};

function updateDOMBalance(amount) {
    const el = document.getElementById('currentBalance');
    if (el) el.textContent = parseFloat(amount).toFixed(2) + ' €';
}

function renderSharedHistory(games, listId = 'miniHistoryList') {
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = ''; 
    games.forEach(game => {
        const win = game.winAmount || 0;
        const bet = game.betAmount || 0;
        const profit = win - bet;
        
        let displayResult = 'L';
        if (game.winningNumber !== undefined) displayResult = game.winningNumber;
        else if (game.result) displayResult = game.result === 'WIN' ? 'W' : (game.result === 'LOSE' ? 'L' : 'D');

        let cssClass = 'res-lose';
        if (profit > 0) cssClass = 'res-win';
        else if (profit === 0 && win > 0) cssClass = 'res-draw';

        const li = document.createElement('li');
        li.className = `history-item ${cssClass}`;
        li.innerHTML = `<span>${displayResult}</span><span class="history-val">${profit > 0 ? '+' : ''}${parseFloat(profit).toFixed(0)}€</span>`;
        list.appendChild(li);
    });
}

/* NUEVO: Función global para Alertas con SweetAlert2 */
function showAlert(title, text, icon) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: title,
            text: text,
            icon: icon, // 'success', 'error', 'warning', 'info'
            background: '#252525',
            color: '#fff',
            confirmButtonColor: '#ffd700',
            confirmButtonText: '<span style="color:#000; font-weight:bold;">ACEPTAR</span>',
            customClass: { popup: 'swal-custom-popup' }
        });
    } else {
        alert(title + (text ? "\n" + text : ""));
    }
}

/* NUEVO: Renderizador de Avatares global para reusar en Lobby y Panel */
function renderUserAvatar(element, avatarData) {
    if (!element) return;
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    element.style.overflow = 'hidden';

    if (!avatarData || avatarData === 'default_avatar.png') {
        element.style.fontSize = '1.5rem';
        element.innerHTML = '👤';
        return;
    }

    if (avatarData.startsWith('http')) {
        element.innerHTML = `<img src="${avatarData}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
        element.style.fontSize = '1.5rem';
        element.innerHTML = avatarData;
    }
}