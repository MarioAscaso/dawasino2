document.addEventListener('DOMContentLoaded', () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    // Elementos del Header
    const guestButtons = document.getElementById('guestButtons');
    const loggedInControls = document.getElementById('loggedInControls');
    const headerBalance = document.getElementById('headerBalance');
    const headerUsername = document.getElementById('headerUsername');
    const btnLogoutHeader = document.getElementById('btnLogoutHeader');

    // Paneles del cuerpo
    const guestPanel = document.getElementById('guestPanel');
    const userPanel = document.getElementById('userPanel');
    const btnPlayBJ = document.getElementById('btnPlayBJ');
    const btnPlayRoulette = document.getElementById('btnPlayRoulette');
    const btnLogoutLanding = document.getElementById('btnLogoutLanding');

    if (user) {
        // 1. Mostrar controles de usuario en el Header y ocultar Login/Register
        if(guestButtons) guestButtons.style.display = 'none';
        if(loggedInControls) loggedInControls.style.display = 'flex';
        
        // 2. Actualizar datos en el Header
        if(headerBalance) headerBalance.textContent = parseFloat(user.balance).toFixed(2) + ' €';
        if(headerUsername) headerUsername.textContent = user.username.toUpperCase();

        // 3. Manejar los botones de salir (Header y Landing)
        const performLogout = () => {
            if(typeof logout === 'function') {
                logout(); // Función definida en common.js
            } else {
                localStorage.removeItem('user');
                window.location.href = '/index/index.html';
            }
        };

        btnLogoutHeader?.addEventListener('click', performLogout);
        btnLogoutLanding?.addEventListener('click', performLogout);

        // 4. Actualizar paneles centrales
        if(guestPanel) guestPanel.style.display = 'none';
        if(userPanel) userPanel.style.display = 'block';

        const landingUsername = document.getElementById('landingUsername');
        const landingBalance = document.getElementById('landingBalance');
        if(landingUsername) landingUsername.textContent = user.username.toUpperCase();
        if(landingBalance) landingBalance.textContent = parseFloat(user.balance).toFixed(2) + ' €';

        // Habilitar enlaces de juego
        if(btnPlayBJ) btnPlayBJ.href = "/blackjack/blackjack.html";
        if(btnPlayRoulette) btnPlayRoulette.href = "/roulette/roulette.html";

    } else {
        // Modo invitado: Mostrar Login/Register y ocultar controles de usuario
        if(guestButtons) guestButtons.style.display = 'flex';
        if(loggedInControls) loggedInControls.style.display = 'none';
        
        if(guestPanel) guestPanel.style.display = 'block';
        if(userPanel) userPanel.style.display = 'none';

        // Bloquear juegos con alerta si no está logueado
        const guestClickAction = (e) => {
            e.preventDefault();
            alert("Debes iniciar sesión para jugar.");
            window.location.href = "/login/login.html";
        };
        btnPlayBJ?.addEventListener('click', guestClickAction);
        btnPlayRoulette?.addEventListener('click', guestClickAction);
    }
});