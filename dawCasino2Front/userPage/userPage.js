document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    const userNameElement = document.querySelector('.user-name');
    const balanceElement = document.querySelector('.balance-amount');
    const userImage = document.querySelector('.user-image');

    if (userNameElement) userNameElement.textContent = user.username.toUpperCase();
    if (balanceElement) balanceElement.textContent = parseFloat(user.balance).toFixed(2) + ' €';

    renderUserAvatar(userImage, user.avatar);

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    // Corrección del emoji descolocado (Sustituido el cohete por 😎)
    const avatarsList = ['👤', '👨', '👩', '😎', '🧛', '🧙', '🥷', '🕵️', '🤖', '👽', '🐶', '🦊', '🦁', '🐸', '🐼', '🤑', '🃏', '👑'];
    const flagsList = [
        { code: 'es', name: 'España' }, { code: 'ar', name: 'Argentina' },
        { code: 'mx', name: 'México' }, { code: 'co', name: 'Colombia' },
        { code: 'cl', name: 'Chile' }, { code: 'pe', name: 'Perú' },
        { code: 'ec', name: 'Ecuador' }, { code: 've', name: 'Venezuela' },
        { code: 'us', name: 'USA' }, { code: 'gb', name: 'Reino Unido' },
        { code: 'fr', name: 'Francia' }, { code: 'de', name: 'Alemania' },
        { code: 'it', name: 'Italia' }, { code: 'jp', name: 'Japón' },
        { code: 'br', name: 'Brasil' }, { code: 'pt', name: 'Portugal' }
    ];

    const settingsBtn = document.querySelector('.settings-btn');
    const modal = document.getElementById('settingsModal');
    const selector = document.getElementById('avatarCategorySelector');
    const grid = document.getElementById('avatarGrid');
    
    function renderAvatars(type) {
        if(!grid) return;
        grid.innerHTML = ''; 
        
        if (type === 'avatars') {
            avatarsList.forEach(emoji => {
                const div = document.createElement('div');
                div.className = 'avatar-option'; div.textContent = emoji;
                div.addEventListener('click', () => saveAvatar(emoji));
                grid.appendChild(div);
            });
        } else if (type === 'flags') {
            flagsList.forEach(flag => {
                const flagUrl = `https://flagcdn.com/w80/${flag.code}.png`;
                const div = document.createElement('div');
                div.className = 'avatar-option flag-option'; div.title = flag.name;
                div.innerHTML = `<img src="${flagUrl}" alt="${flag.name}">`;
                div.addEventListener('click', () => saveAvatar(flagUrl));
                grid.appendChild(div);
            });
        }
    }

    async function saveAvatar(avatarData) {
        try {
            const res = await fetch(`http://localhost:8989/api/users/${user.id}/avatar`, { 
                method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({avatar: avatarData})
            });
            
            if(res.ok) {
                user.avatar = avatarData;
                localStorage.setItem('user', JSON.stringify(user));
                renderUserAvatar(userImage, avatarData);
                modal.style.display = 'none';
                showAlert('¡Éxito!', 'Imagen de perfil actualizada correctamente.', 'success');
            }
        } catch(e) { showAlert('Error', 'No se pudo guardar el avatar', 'error'); }
    }

    if (settingsBtn && modal) {
        settingsBtn.addEventListener('click', () => { modal.style.display = 'flex'; if(selector) renderAvatars(selector.value); });
        document.getElementById('closeSettingsModal').addEventListener('click', () => modal.style.display = 'none');
        
        if(selector) selector.addEventListener('change', (e) => renderAvatars(e.target.value));

        const tabs = document.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active')); tab.classList.add('active');
                if(tab.textContent !== 'Mi Perfil') {
                    document.querySelector('.settings-panel').innerHTML = `<h3 style="color:#aaa; text-align:center; margin-top: 50px;">Esta opción estará disponible próximamente en su cuenta.</h3>`;
                } else {
                    document.querySelector('.settings-panel').innerHTML = `
                        <h3>CAMBIAR AVATAR O BANDERA</h3>
                        <div class="avatar-selection-area">
                            <select id="avatarCategorySelector" class="form-select"><option value="avatars">Avatares</option><option value="flags">Banderas</option></select>
                            <div id="avatarGrid" class="avatar-grid"></div>
                        </div>`;
                    const newSelector = document.getElementById('avatarCategorySelector');
                    const newGrid = document.getElementById('avatarGrid');
                    newSelector.addEventListener('change', (e) => {
                        newGrid.innerHTML = '';
                        if (e.target.value === 'avatars') {
                            avatarsList.forEach(em => { const d = document.createElement('div'); d.className = 'avatar-option'; d.textContent = em; d.addEventListener('click', () => saveAvatar(em)); newGrid.appendChild(d); });
                        } else {
                            flagsList.forEach(fl => { const url = `https://flagcdn.com/w80/${fl.code}.png`; const d = document.createElement('div'); d.className = 'avatar-option flag-option'; d.innerHTML = `<img src="${url}">`; d.addEventListener('click', () => saveAvatar(url)); newGrid.appendChild(d); });
                        }
                    });
                    newSelector.dispatchEvent(new Event('change'));
                }
            });
        });
    }
    await loadUserHistory(user.id);
});

let globalHistory = [];
let balanceChartInstance = null;
let winLossChartInstance = null;

async function loadUserHistory(userId) {
    try {
        const [resBJ, resRoulette, resSlots] = await Promise.all([
            fetch(`http://localhost:8989/api/blackjack/history/${userId}`),
            fetch(`http://localhost:8989/api/roulette/history/${userId}`),
            fetch(`http://localhost:8989/api/slots/history/${userId}`)
        ]);

        let historyBJ = []; let historyRoulette = []; let historySlots = [];
        if (resBJ.ok) historyBJ = await resBJ.json();
        if (resRoulette.ok) historyRoulette = await resRoulette.json();
        if (resSlots.ok) historySlots = await resSlots.json();

        globalHistory = [...historyBJ, ...historyRoulette, ...historySlots].sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
            
        updateDashboard('all', globalHistory);
        initSidebarFilters(globalHistory);
    } catch (error) { console.error("Error cargando historiales:", error); }
}

function initSidebarFilters(fullHistory) {
    const filters = document.querySelectorAll('.nav-filter');
    filters.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') !== '#') return;
            e.preventDefault();
            filters.forEach(f => f.classList.remove('active')); link.classList.add('active');
            updateDashboard(link.getAttribute('data-game'), fullHistory);
        });
    });
}

function updateDashboard(filter, history) {
    const pageTitle = document.querySelector('.page-title');
    let filteredData = filter === 'all' ? history : history.filter(item => item.gameType === filter.toUpperCase());
    if (pageTitle) pageTitle.textContent = filter === 'all' ? "RESUMEN GLOBAL" : `ESTADÍSTICAS: ${filter.toUpperCase()}`;
    updateStatsCards(filteredData); updateCharts(filteredData); updateTable(filteredData);
}

function updateStatsCards(data) {
    if (!data || data.length === 0) {
        document.getElementById('totalGames').textContent = "0"; document.getElementById('totalWins').textContent = "0"; document.getElementById('totalLosses').textContent = "0";
        const p = document.getElementById('netProfit'); p.textContent = "0.00 €"; p.style.color = "#fff"; return;
    }
    const totalGames = data.length;
    const wins = data.filter(d => d.result === 'WIN').length;
    const losses = data.filter(d => d.result === 'LOSE').length;
    const netProfit = data.reduce((acc, curr) => acc + (curr.winAmount - curr.betAmount), 0);

    document.getElementById('totalGames').textContent = totalGames; document.getElementById('totalWins').textContent = wins; document.getElementById('totalLosses').textContent = losses;
    const p = document.getElementById('netProfit'); p.textContent = netProfit.toFixed(2) + ' €';
    p.style.color = netProfit > 0 ? '#2ecc71' : (netProfit < 0 ? '#ff4d4d' : '#ffd700');
}

function updateCharts(data) {
    const cb = document.getElementById('balanceChartContainer'); const cwl = document.getElementById('winLossChartContainer');
    if (!data || data.length === 0) { cb.innerHTML = `<p style="color:#666; text-align:center; padding-top:80px;">SIN DATOS</p>`; cwl.innerHTML = `<p style="color:#666; text-align:center; padding-top:80px;">SIN DATOS</p>`; return; }
    cb.innerHTML = '<canvas id="balanceChart"></canvas>'; cwl.innerHTML = '<canvas id="winLossChart"></canvas>';
    
    const chronologicalData = [...data].reverse();
    let accum = 0; const balanceTrend = chronologicalData.map(g => { accum += (g.winAmount - g.betAmount); return accum; });
    const labels = balanceTrend.map((_, i) => `Partida ${i + 1}`);

    if (document.getElementById('balanceChart')) {
        if (balanceChartInstance) balanceChartInstance.destroy();
        balanceChartInstance = new Chart(document.getElementById('balanceChart'), { type: 'line', data: { labels: labels, datasets: [{ label: 'Beneficio', data: balanceTrend, borderColor: '#ffd700', backgroundColor: 'rgba(255, 215, 0, 0.1)', borderWidth: 2, tension: 0.3, fill: true, pointRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#333' } }, x: { display: false } } }});
    }
    
    const wins = data.filter(d => d.result === 'WIN').length, losses = data.filter(d => d.result === 'LOSE').length, draws = data.filter(d => d.result === 'DRAW').length;
    if (document.getElementById('winLossChart')) {
        if (winLossChartInstance) winLossChartInstance.destroy();
        winLossChartInstance = new Chart(document.getElementById('winLossChart'), { type: 'doughnut', data: { labels: ['Victorias', 'Derrotas', 'Empates'], datasets: [{ data: [wins, losses, draws], backgroundColor: ['#2ecc71', '#ff4d4d', '#ffd700'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }});
    }
}

function updateTable(data) {
    const tbody = document.getElementById('gamesTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666;">NO HAY DATOS</td></tr>`; return; }
    tbody.innerHTML = ''; 
    data.slice(0, 10).forEach(g => {
        const tr = document.createElement('tr');
        const profit = g.winAmount - g.betAmount;
        let pClass = profit > 0 ? 'text-win' : (profit < 0 ? 'text-lose' : 'text-gold');
        const dateStr = new Date(g.playedAt).toLocaleDateString() + ' ' + new Date(g.playedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        tr.innerHTML = `<td>${g.gameType}</td><td class="${g.result === 'WIN' ? 'text-win' : (g.result === 'LOSE' ? 'text-lose' : 'text-gold')}">${g.result}</td><td>${g.betAmount.toFixed(2)} €</td><td class="${pClass}">${profit > 0 ? '+' : ''}${profit.toFixed(2)} €</td><td style="font-size: 0.8rem; color: #888;">${dateStr}</td>`;
        tbody.appendChild(tr);
    });
}