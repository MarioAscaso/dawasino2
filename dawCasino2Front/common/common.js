const API_BASE_URL = 'http://localhost:8989/api/users';

function checkAuth() {
    const userJson = localStorage.getItem('user');
    
    if (!userJson) {
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('register.html') &&
            !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
    return JSON.parse(userJson);
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}