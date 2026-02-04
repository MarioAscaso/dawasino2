document.addEventListener('DOMContentLoaded', () => {
    const userJson = localStorage.getItem('user');

    if (!userJson) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userJson);

    const userNameElement = document.querySelector('.user-name');
    const balanceElement = document.querySelector('.balance-amount');

    if (userNameElement) userNameElement.textContent = user.username.toUpperCase();
    if (balanceElement) balanceElement.textContent = parseFloat(user.balance).toFixed(2) + ' €';

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    const fullHistory = [];

    updateDashboard('all', fullHistory);

    initSidebarFilters(fullHistory);
});

function initSidebarFilters(fullHistory) {
    const filters = document.querySelectorAll('.nav-filter');

    filters.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            filters.forEach(f => f.parentElement.classList.remove('active'));

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
        filteredData = history.filter(item => item.game.toLowerCase() === filter);
        if (pageTitle) pageTitle.textContent = `ESTADÍSTICAS: ${filter.toUpperCase()}`;
    }

    updateStatsCards(filteredData);
    updateCharts(filteredData);
    updateTable(filteredData);
}

function updateStatsCards(data) {
    if (!data || data.length === 0) return;
}

function updateCharts(data) {
    if (!data || data.length === 0) {
        renderNoDataMessage('balanceChartContainer');
        renderNoDataMessage('winLossChartContainer');
        return;
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
}

function renderNoDataMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666; font-size: 0.9rem;">
                <p>SIN ACTIVIDAD REGISTRADA</p>
            </div>
        `;
    }
}