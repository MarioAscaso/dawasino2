document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación al cargar
    const user = checkAuth();
    if (!user) return; // Si no hay usuario, checkAuth redirige

    // Rellenar datos de cabecera
    const userNameElement = document.querySelector('.user-name');
    const balanceElement = document.querySelector('.balance-amount');

    if (userNameElement) userNameElement.textContent = user.username.toUpperCase();
    if (balanceElement) balanceElement.textContent = parseFloat(user.balance).toFixed(2) + ' €';

    // Configurar botón de logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout(); // Función de common.js
        });
    }

    // Inicializar datos simulados (o vacíos hasta que tengas el backend de estadísticas)
    const fullHistory = []; 
    updateDashboard('all', fullHistory);
    initSidebarFilters(fullHistory);
});

function initSidebarFilters(fullHistory) {
    const filters = document.querySelectorAll('.nav-filter');

    filters.forEach(link => {
        link.addEventListener('click', (e) => {
            // Si es un enlace normal (como "Volver al Lobby"), no hacemos preventDefault
            if (link.getAttribute('href') !== '#') return;

            e.preventDefault();
            
            // Gestión de clases activas
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
    if (!data || data.length === 0) {
        document.getElementById('totalGames').textContent = "0";
        document.getElementById('totalWins').textContent = "0";
        document.getElementById('totalLosses').textContent = "0";
        document.getElementById('netProfit').textContent = "0 €";
        return;
    }
    // Aquí iría la lógica de cálculo real cuando tengas datos
}

function updateCharts(data) {
    if (!data || data.length === 0) {
        renderNoDataMessage('balanceChartContainer');
        renderNoDataMessage('winLossChartContainer');
        return;
    }
    // Aquí iría la lógica de Chart.js
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
    // Aquí iría el bucle para crear filas <tr>
}

function renderNoDataMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        // Limpiamos canvas anteriores si existieran
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666; font-size: 0.9rem; border: 1px dashed #444; border-radius: 4px;">
                <p>SIN ACTIVIDAD REGISTRADA</p>
            </div>
        `;
    }
}