document.addEventListener('DOMContentLoaded', () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    const guestButtons = document.getElementById('guestButtons');
    const loggedInControls = document.getElementById('loggedInControls');
    const headerBalance = document.getElementById('headerBalance');
    const headerUsername = document.getElementById('headerUsername');
    const btnLogoutHeader = document.getElementById('btnLogoutHeader');

    const guestPanel = document.getElementById('guestPanel');
    const userPanel = document.getElementById('userPanel');
    const btnPlayBJ = document.getElementById('btnPlayBJ');
    const btnPlayRoulette = document.getElementById('btnPlayRoulette');
    const btnPlaySlots = document.getElementById('btnPlaySlots');
    const btnLogoutLanding = document.getElementById('btnLogoutLanding');

    if (user) {
        if(guestButtons) guestButtons.style.display = 'none';
        if(loggedInControls) loggedInControls.style.display = 'flex';
        
        if(headerBalance) headerBalance.textContent = parseFloat(user.balance).toFixed(2) + ' €';
        if(headerUsername) headerUsername.textContent = user.username.toUpperCase();

        // Renderizar el Avatar en el Header
        const userImageEl = document.querySelector('#loggedInControls .user-image');
        if(userImageEl) renderUserAvatar(userImageEl, user.avatar);

        const performLogout = () => { if(typeof logout === 'function') logout(); else { localStorage.removeItem('user'); window.location.href = '/index/index.html'; } };

        btnLogoutHeader?.addEventListener('click', performLogout);
        btnLogoutLanding?.addEventListener('click', performLogout);

        if(guestPanel) guestPanel.style.display = 'none';
        if(userPanel) userPanel.style.display = 'block';

        const landingUsername = document.getElementById('landingUsername');
        const landingBalance = document.getElementById('landingBalance');
        if(landingUsername) landingUsername.textContent = user.username.toUpperCase();
        if(landingBalance) landingBalance.textContent = parseFloat(user.balance).toFixed(2) + ' €';

        if(btnPlayBJ) btnPlayBJ.href = "/blackjack/blackjack.html";
        if(btnPlayRoulette) btnPlayRoulette.href = "/roulette/roulette.html";
        if(btnPlaySlots) btnPlaySlots.href = "/slots/slots.html";

    } else {
        if(guestButtons) guestButtons.style.display = 'flex';
        if(loggedInControls) loggedInControls.style.display = 'none';
        
        if(guestPanel) guestPanel.style.display = 'block';
        if(userPanel) userPanel.style.display = 'none';

        const guestClickAction = (e) => {
            e.preventDefault();
            showAlert('Acceso Denegado', 'Debes iniciar sesión para jugar.', 'warning');
        };
        btnPlayBJ?.addEventListener('click', guestClickAction);
        btnPlayRoulette?.addEventListener('click', guestClickAction);
        btnPlaySlots?.addEventListener('click', guestClickAction);
    }
});