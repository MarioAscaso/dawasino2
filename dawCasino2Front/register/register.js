// Función global para alternar la vista de los campos de contraseña múltiples
function toggleView(inputId, btn) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    btn.textContent = type === 'password' ? '👁️' : '🔒';
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 

            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                return showAlert('Error', 'Las contraseñas no coinciden', 'error');
            }

            if (password.length < 6) {
                return showAlert('Error', 'La contraseña debe tener al menos 6 caracteres', 'warning');
            }

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                if (response.ok) {
                    if(typeof Swal !== 'undefined') {
                        Swal.fire({ title: '¡Registro exitoso!', text: 'Redirigiendo al login...', icon: 'success', background: '#252525', color: '#fff', showConfirmButton: false, timer: 1500 });
                        setTimeout(() => { window.location.href = '/login/login.html'; }, 1500);
                    } else {
                        window.location.href = '/login/login.html';
                    }
                } else {
                    const errorText = await response.text();
                    showAlert('Error en el registro', errorText, 'error');
                }
            } catch (error) {
                showAlert('Fallo de conexión', 'No se pudo conectar con el servidor', 'error');
            }
        });
    }
});