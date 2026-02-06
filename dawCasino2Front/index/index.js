document.addEventListener('DOMContentLoaded', () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    const guestPanel = document.getElementById('guestPanel');
    const userPanel = document.getElementById('userPanel');
    const btnPlayBJ = document.getElementById('btnPlayBJ');
    const btnLogout = document.getElementById('btnLogoutLanding');

    if (user) {
        console.log("Usuario detectado:", user.username);
        
        if(guestPanel) guestPanel.style.display = 'none';
        if(userPanel) userPanel.style.display = 'block';

        const usernameDisplay = document.getElementById('landingUsername');
        const balanceDisplay = document.getElementById('landingBalance');

        if(usernameDisplay) usernameDisplay.textContent = user.username.toUpperCase();
        if(balanceDisplay) balanceDisplay.textContent = parseFloat(user.balance).toFixed(2);

        if(btnPlayBJ) {
            btnPlayBJ.href = "/blackjack/blackjack.html";
            btnPlayBJ.style.opacity = "1"; 
            btnPlayBJ.style.cursor = "pointer";
        }

        if(btnLogout) {
            btnLogout.addEventListener('click', () => {
                logout();
            });
        }

    } else {
        console.log("Modo invitado");
        
        if(guestPanel) guestPanel.style.display = 'block';
        if(userPanel) userPanel.style.display = 'none';

        if(btnPlayBJ) {
            btnPlayBJ.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Debes iniciar sesión para jugar.");
                window.location.href = "/login/login.html";
            });
        }
    }
});