document.addEventListener('DOMContentLoaded', () => {
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

    const fullHistory = [];
    updateDashboard('all', fullHistory);
    initSidebarFilters(fullHistory);
});

function initSidebarFilters(fullHistory) {
    const filters = document.querySelectorAll('.nav-filter');

    filters.forEach(link => {
        link.addEventListener('click', (e) => {
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
        filteredData = history.filter(item => item.game.toLowerCase() === filter);
        if (pageTitle) pageTitle.textContent = `ESTADÍSTICAS: ${filter.toUpperCase()}`;
    }

    updateStatsCards(filteredData);
    updateCharts(filteredData);
    updateTable(filteredData);
}

function updateStatsCards(data) {
    if (!data || data.length === 0) return;
    // Futura lógica de cálculo
}

function updateCharts(data) {
    if (!data || data.length === 0) {
        renderNoDataMessage('balanceChartContainer');
        renderNoDataMessage('winLossChartContainer');
        return;
    }
    // Futura lógica de gráficas
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
    // Futuro bucle de filas
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