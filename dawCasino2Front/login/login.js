document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const credentials = {
                username: username,
                password: password
            };

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                if (response.ok) {
                    const user = await response.json();
                    
                    localStorage.setItem('user', JSON.stringify(user));

                    alert("¡Login correcto! Bienvenido " + user.username);
                    window.location.href = '/userPage/userPage.html'; 
                } else {
                    const errorText = await response.text();
                    alert("Error: " + errorText);
                }
            } catch (error) {
                console.error('Error:', error);
                alert("Error de conexión con el servidor");
            }
        });
    }
});