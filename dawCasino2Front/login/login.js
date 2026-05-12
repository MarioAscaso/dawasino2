document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Lógica para ver/ocultar contraseña
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const user = await response.json();
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    if(typeof Swal !== 'undefined') {
                        Swal.fire({ title: '¡Login correcto!', text: 'Bienvenido ' + user.username, icon: 'success', background: '#252525', color: '#fff', showConfirmButton: false, timer: 1500 });
                        setTimeout(() => { window.location.href = '/userPage/userPage.html'; }, 1500);
                    } else {
                        window.location.href = '/userPage/userPage.html';
                    }
                } else {
                    const errorText = await response.text();
                    showAlert('Error al entrar', errorText, 'error');
                }
            } catch (error) {
                showAlert('Fallo de conexión', 'No se pudo conectar con el servidor', 'error');
            }
        });
    }
});