// Actualizamos la URL base anticipando el cambio en el backend a /api/auth
// NOTA: Si aún no has tocado el back, mantén '/api/users' temporalmente, 
// pero te recomiendo cambiarlo ya a '/api/auth' y hacer el cambio en el back a continuación.
const API_BASE_URL = 'http://localhost:8989/api/auth'; 

function checkAuth() {
    const userJson = localStorage.getItem('user');
    
    if (!userJson) {
        // Rutas absolutas para la comprobación
        if (!window.location.pathname.includes('/login/login.html') && 
            !window.location.pathname.includes('/register/register.html') &&
            !window.location.pathname.includes('/index/index.html') &&
            window.location.pathname !== '/' // Para la raíz del servidor
           ) {
            window.location.href = '/login/login.html';
        }
        return null;
    }
    return JSON.parse(userJson);
}

function logout() {
    localStorage.removeItem('user');
    // Corrección crítica: ruta absoluta para volver al index
    window.location.href = '/index/index.html';
}