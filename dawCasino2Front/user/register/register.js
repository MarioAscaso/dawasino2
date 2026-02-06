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
                alert("Las contraseñas no coinciden");
                return;
            }

            if (password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres");
                return;
            }

            const userData = {
                username: username,
                email: email,
                password: password
            };

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    alert("¡Registro exitoso! Redirigiendo al login...");
                    window.location.href = 'login.html';
                } else {
                    const errorText = await response.text();
                    alert("Error en el registro: " + errorText);
                }
            } catch (error) {
                console.error('Error de red:', error);
                alert("No se pudo conectar con el servidor. Asegúrate de que el backend está encendido.");
            }
        });
    }
});