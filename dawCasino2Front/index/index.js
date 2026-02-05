document.addEventListener('DOMContentLoaded', () => {
    // Intentamos obtener el usuario del localStorage
    // No usamos checkAuth() aquí porque no queremos redirigir si no hay usuario,
    // solo queremos cambiar la interfaz.
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    const guestPanel = document.getElementById('guestPanel');
    const userPanel = document.getElementById('userPanel');
    const btnPlayBJ = document.getElementById('btnPlayBJ');
    const btnLogout = document.getElementById('btnLogoutLanding');

    if (user) {
        // --- MODO USUARIO LOGUEADO ---
        console.log("Usuario detectado:", user.username);
        
        // 1. Intercambiar paneles
        if(guestPanel) guestPanel.style.display = 'none';
        if(userPanel) userPanel.style.display = 'block';

        // 2. Rellenar datos
        const usernameDisplay = document.getElementById('landingUsername');
        const balanceDisplay = document.getElementById('landingBalance');

        if(usernameDisplay) usernameDisplay.textContent = user.username.toUpperCase();
        if(balanceDisplay) balanceDisplay.textContent = parseFloat(user.balance).toFixed(2);

        // 3. Activar enlace del juego
        if(btnPlayBJ) {
            btnPlayBJ.href = "/blackjack/blackjack.html";
            // Quitamos estilos de deshabilitado si los hubiera
            btnPlayBJ.style.opacity = "1"; 
            btnPlayBJ.style.cursor = "pointer";
        }

        // 4. Configurar botón de Logout
        if(btnLogout) {
            btnLogout.addEventListener('click', () => {
                logout(); // Función global definida en common.js
            });
        }

    } else {
        // --- MODO INVITADO ---
        console.log("Modo invitado");
        
        // 1. Intercambiar paneles
        if(guestPanel) guestPanel.style.display = 'block';
        if(userPanel) userPanel.style.display = 'none';

        // 2. Bloquear enlace del juego (redirigir a login al hacer click)
        if(btnPlayBJ) {
            btnPlayBJ.addEventListener('click', (e) => {
                e.preventDefault(); // Evita navegar
                alert("Debes iniciar sesión para jugar.");
                window.location.href = "/login/login.html";
            });
        }
    }
});