// auth.js - SIMPLIFICADO
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const validUsername = 'sofi';
            const validPassword = 'secure123';

            if (username === validUsername && password === validPassword) {
                localStorage.setItem('psychologistLoggedIn', 'true');
                localStorage.setItem('psychologistName', 'admin');

                showMessage('Login exitoso! Redirigiendo...', 'success');

                setTimeout(() => {
                    window.location.href = '../admin/dashboard.html';
                }, 1000);
            } else {
                showMessage('Credenciales incorrectas, inténtalo nuevamente', 'error');
            }
        });
    }
});

// logout - simple
function logout() {
    localStorage.removeItem('psychologistLoggedIn');
    localStorage.removeItem('psychologistName');
    localStorage.removeItem('patientPseudonym');
    localStorage.removeItem('patientToken');
    localStorage.removeItem('seudonimoId');
    localStorage.removeItem('seudonimoElegido');
    window.location.href = '../../index.html';
}

window.logout = logout;

// Mostrar mensajes
function showMessage(message, type) {
    const messageDiv = document.getElementById('errorMessage') || createMessageElement();
    messageDiv.textContent = message;
    messageDiv.className = `${type}-message`;
    messageDiv.style.display = 'block';

    // AGREGAR ESTE ESTILO ESPECIAL PARA ÉXITO
    if (type === 'success') {
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2a9d8f;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
    }

    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 300);
        }, 1000); // Muestra por 1 segundo antes de redirigir
    }
}

function createMessageElement() {
    const div = document.createElement('div');
    div.id = 'errorMessage';
    document.querySelector('.auth-box').prepend(div);
    return div;
}

// Verificar autenticación al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}

// ========== NUEVO: Función auxiliar para limpiar datos de paciente ==========
// Esta función se puede llamar desde otros archivos
function clearPatientData() {
    try {
        // Verificar si utils.js ya está cargado
        if (typeof window.clearPatientData === 'function') {
            // Usar la función de utils.js si existe
            window.clearPatientData();
        } else {
            // Limpiar manualmente los datos específicos del paciente
            const keysToRemove = [
                'patientPseudonym',
                'patientToken',
                'seudonimoId',
                'seudonimoElegido',
                'lastSurveyDate'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log('Datos del paciente limpiados desde auth.js');
        }
    } catch (error) {
        console.error('Error al limpiar datos del paciente:', error);
        // Fallback: limpiar localStorage completamente
        localStorage.clear();
    }
}

// Hacer la función disponible globalmente
window.clearPatientData = clearPatientData;
window.logout = logout;