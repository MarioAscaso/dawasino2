const API_BASE_URL = 'http://localhost:8989/api';

// --- AUTH ---
function checkAuth() {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        // Redirigir si no estamos ya en login/register/index
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

// --- API HELPER (Simplifica los fetch) ---
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

// --- UI HELPERS COMPARTIDOS ---
function updateDOMBalance(amount) {
    const el = document.getElementById('currentBalance');
    if (el) el.textContent = parseFloat(amount).toFixed(2) + ' €';
}

// Pinta el historial en la barra lateral (sirve para BJ y Ruleta)
function renderSharedHistory(games, listId = 'miniHistoryList') {
    const list = document.getElementById(listId);
    if (!list) return;
    
    list.innerHTML = ''; // Limpiar
    
    games.forEach(game => {
        // Unificar nombres de campos que a veces varían en el backend
        const win = game.winAmount || 0;
        const bet = game.betAmount || 0;
        const profit = win - bet;
        
        // Determinar qué mostrar como "Resultado" (Número en Ruleta, W/L en BJ)
        let displayResult = 'L';
        if (game.winningNumber !== undefined) displayResult = game.winningNumber; // Ruleta
        else if (game.result) displayResult = game.result === 'WIN' ? 'W' : (game.result === 'LOSE' ? 'L' : 'D');

        // Clase CSS
        let cssClass = 'res-lose';
        if (profit > 0) cssClass = 'res-win';
        else if (profit === 0 && win > 0) cssClass = 'res-draw';

        const li = document.createElement('li');
        li.className = `history-item ${cssClass}`;
        li.innerHTML = `
            <span>${displayResult}</span>
            <span class="history-val">${profit > 0 ? '+' : ''}${parseFloat(profit).toFixed(0)}€</span>
        `;
        list.appendChild(li);
    });
}