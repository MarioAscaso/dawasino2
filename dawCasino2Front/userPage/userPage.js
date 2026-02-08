document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user) return;

    const userNameElement = document.querySelector('.user-name');
    const balanceElement = document.querySelector('.balance-amount');

    if (userNameElement) userNameElement.textContent = user.username.toUpperCase();
    if (balanceElement) balanceElement.textContent = parseFloat(user.balance).toFixed(2) + ' €';

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout(); 
        });
    }

    await loadUserHistory(user.id);
});

let globalHistory = [];
let balanceChartInstance = null;
let winLossChartInstance = null;

async function loadUserHistory(userId) {
    try {
        const response = await fetch(`http://localhost:8989/api/blackjack/history/${userId}`);

        if (response.ok) {
            globalHistory = await response.json();
            
            updateDashboard('all', globalHistory);
            initSidebarFilters(globalHistory);
        } else {
            console.error("Error al cargar el historial del servidor.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

function initSidebarFilters(fullHistory) {
    const filters = document.querySelectorAll('.nav-filter');

    filters.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') !== '#') return;

            e.preventDefault();
            
            filters.forEach(f => f.classList.remove('active'));
            link.classList.add('active');

            const gameType = link.getAttribute('data-game');
            updateDashboard(gameType, fullHistory);
        });
    });
}

function updateDashboard(filter, history) {
    const pageTitle = document.querySelector('.page-title');

    let filteredData = [];
    if (filter === 'all') {
        filteredData = history;
        if (pageTitle) pageTitle.textContent = "RESUMEN GLOBAL";
    } else {
        filteredData = history.filter(item => item.gameType === filter.toUpperCase());
        if (pageTitle) pageTitle.textContent = `ESTADÍSTICAS: ${filter.toUpperCase()}`;
    }

    updateStatsCards(filteredData);
    updateCharts(filteredData);
    updateTable(filteredData);
}

function updateStatsCards(data) {
    if (!data || data.length === 0) {
        document.getElementById('totalGames').textContent = "0";
        document.getElementById('totalWins').textContent = "0";
        document.getElementById('totalLosses').textContent = "0";
        const profitEl = document.getElementById('netProfit');
        profitEl.textContent = "0 €";
        profitEl.style.color = "#fff";
        return;
    }
    
    const totalGames = data.length;
    const wins = data.filter(d => d.result === 'WIN').length;
    const losses = data.filter(d => d.result === 'LOSE').length;

    const netProfit = data.reduce((acc, curr) => acc + (curr.winAmount - curr.betAmount), 0);

    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalWins').textContent = wins;
    document.getElementById('totalLosses').textContent = losses;
    
    const profitEl = document.getElementById('netProfit');
    profitEl.textContent = netProfit.toFixed(2) + ' €';

    if (netProfit > 0) profitEl.style.color = '#2ecc71';
    else if (netProfit < 0) profitEl.style.color = '#ff4d4d';
    else profitEl.style.color = '#ffd700';
}

function updateCharts(data) {
    const containerBalance = document.getElementById('balanceChartContainer');
    const containerWinLoss = document.getElementById('winLossChartContainer');

    if (!data || data.length === 0) {
        renderNoDataMessage('balanceChartContainer');
        renderNoDataMessage('winLossChartContainer');
        return;
    }

    if (!containerBalance.querySelector('canvas')) {
        containerBalance.innerHTML = '<canvas id="balanceChart"></canvas>';
    }
    
    const chronologicalData = [...data].reverse();
    let accum = 0;
    const balanceTrend = chronologicalData.map(game => {
        accum += (game.winAmount - game.betAmount);
        return accum;
    });
    const labels = balanceTrend.map((_, i) => `Partida ${i + 1}`);

    const ctxBalance = document.getElementById('balanceChart');
    if (ctxBalance) {
        if (balanceChartInstance) balanceChartInstance.destroy();

        balanceChartInstance = new Chart(ctxBalance, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Beneficio Acumulado',
                    data: balanceTrend,
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#333' }, ticks: { color: '#aaa' } },
                    x: { display: false }
                }
            }
        });
    }
    
    if (!containerWinLoss.querySelector('canvas')) {
        containerWinLoss.innerHTML = '<canvas id="winLossChart"></canvas>';
    }

    const wins = data.filter(d => d.result === 'WIN').length;
    const losses = data.filter(d => d.result === 'LOSE').length;
    const draws = data.filter(d => d.result === 'DRAW').length;

    const ctxWinLoss = document.getElementById('winLossChart');
    if (ctxWinLoss) {
        if (winLossChartInstance) winLossChartInstance.destroy();

        winLossChartInstance = new Chart(ctxWinLoss, {
            type: 'doughnut',
            data: {
                labels: ['Victorias', 'Derrotas', 'Empates'],
                datasets: [{
                    data: [wins, losses, draws],
                    backgroundColor: ['#2ecc71', '#ff4d4d', '#ffd700'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { color: '#fff', padding: 20 } 
                    } 
                }
            }
        });
    }
}

function updateTable(data) {
    const tbody = document.getElementById('gamesTableBody');
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                    NO HAY DATOS PARA MOSTRAR
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = ''; 

    const latestGames = data.slice(0, 10);

    latestGames.forEach(game => {
        const row = document.createElement('tr');
        
        const profit = game.winAmount - game.betAmount;
        
        let profitClass = 'text-gold';
        let profitSign = '';
        if (profit > 0) {
            profitClass = 'text-win';
            profitSign = '+';
        } else if (profit < 0) {
            profitClass = 'text-lose';
        }

        const dateObj = new Date(game.playedAt);
        const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        row.innerHTML = `
            <td>${game.gameType}</td>
            <td class="${game.result === 'WIN' ? 'text-win' : (game.result === 'LOSE' ? 'text-lose' : 'text-gold')}">${game.result}</td>
            <td>${game.betAmount.toFixed(2)} €</td>
            <td class="${profitClass}">${profitSign}${profit.toFixed(2)} €</td>
            <td style="font-size: 0.8rem; color: #888;">${dateStr}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderNoDataMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666; font-size: 0.9rem; border: 1px dashed #444; border-radius: 4px;">
                <p>SIN ACTIVIDAD REGISTRADA</p>
            </div>
        `;
    }
}