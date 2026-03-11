// Prevenir que el paciente regrese a choose-identity.html
document.addEventListener('DOMContentLoaded', function () {
    // Verificar si ya eligió seudónimo
    const pseudonym = localStorage.getItem('patientPseudonym');
    const token = localStorage.getItem('patientToken');

    // Obtener token de la URL (si hay)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    // Si hay token en URL pero no coincide con localStorage, limpiar
    if (urlToken && urlToken !== token) {
        console.log('Token de URL no coincide con localStorage, limpiando...');
        clearPatientData();
        localStorage.setItem('patientToken', urlToken);
        window.location.href = 'choose-identity.html?token=' + urlToken;
        return;
    }

    if (!pseudonym || !token) {
        // Si no tiene seudónimo, redirigir al inicio
        window.location.href = 'choose-identity.html' + (urlToken ? '?token=' + urlToken : '');
        return;
    }

    // Verificar en backend si realmente tiene seudónimo
    verifySurveyAccess(token, pseudonym);

    // Bloquear navegación hacia atrás
    disableBackNavigation();
});

async function verifySurveyAccess(token, pseudonym) {
    try {
        // Verificar con backend
        const response = await fetch(`${API_BASE_URL}/api/public/paciente/verificar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        });

        if (response.ok) {
            const data = await response.json();

            if (!data.tieneSeudonimo) {
                // Backend dice que no tiene seudónimo, limpiar y redirigir
                clearPatientData();
                window.location.href = 'choose-identity.html';
            }

            // Actualizar alias en pantalla si es diferente
            if (data.alias && data.alias !== pseudonym) {
                localStorage.setItem('patientPseudonym', data.alias);
                document.getElementById('aliasDisplay').textContent = data.alias;
            }
        }
    } catch (error) {
        console.error('Error verificando acceso:', error);
        // Continuar con datos de localStorage como fallback
    }
}

// Función para prevenir navegación hacia atrás
function disableBackNavigation() {
    // CONTADOR para apilar alertas
    let alertStack = 0;

    // FUNCIÓN QUE SIEMPRE MUESTRA ALERTA
    function showBackAlert() {
        alertStack++;

        // Crear alerta
        const alertDiv = document.createElement('div');
        alertDiv.id = `back-alert-${Date.now()}`;
        alertDiv.textContent = '⚠️ No puedes volver a la selección de seudónimo';
        alertDiv.style.cssText = `
            position: fixed;
            top: ${20 + ((alertStack - 1) * 70)}px;
            right: 20px;
            background: linear-gradient(135deg, #ff9f1c, #ff7b00);
            color: white;
            padding: 18px 24px;
            border-radius: 12px;
            z-index: 99999;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 6px 20px rgba(255, 159, 28, 0.4);
            border: 2px solid #ffd166;
            animation: slideInAlert 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            min-width: 300px;
            text-align: center;
        `;

        document.body.appendChild(alertDiv);

        // Quitar después de 7 segundos
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                alertDiv.style.animation = 'slideOutAlert 0.5s ease';
                setTimeout(() => {
                    if (document.body.contains(alertDiv)) {
                        document.body.removeChild(alertDiv);
                        alertStack--;
                    }
                }, 500);
            }
        }, 7000);
    }

    // 1. BLOQUEAR POPSTATE - ESTO ES CLAVE
    window.onpopstate = function (event) {
        showBackAlert();
        // Forzar a mantenerse en la página
        setTimeout(() => {
            history.pushState(null, null, location.href);
            history.pushState(null, null, location.href);
            history.pushState(null, null, location.href);
        }, 10);
        return false;
    };

    // 2. BLOQUEAR TECLA BACKSPACE
    document.onkeydown = function (e) {
        if (e.key === 'Backspace' || e.keyCode === 8) {
            if (!e.target.matches('input, textarea, [contenteditable="true"]')) {
                e.preventDefault();
                e.stopPropagation();
                showBackAlert();
                return false;
            }
        }
    };

    // 3. VERIFICACIÓN CONSTANTE CADA 50ms
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            showBackAlert();
            lastUrl = location.href;
            // Si intentaron cambiar a choose-identity, forzar vuelta
            if (location.href.includes('choose-identity.html')) {
                setTimeout(() => {
                    location.replace('survey.html');
                }, 100);
            }
        }
    }, 50);

    // 4. BLOQUEO DE HISTORIAL AGGRESIVO
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (state, title, url) {
        if (url && url.toString().includes('choose-identity.html')) {
            showBackAlert();
            url = 'survey.html';
        }
        return originalPushState.call(this, state, title, url);
    };

    history.replaceState = function (state, title, url) {
        if (url && url.toString().includes('choose-identity.html')) {
            showBackAlert();
            url = 'survey.html';
        }
        return originalReplaceState.call(this, state, title, url);
    };

    // 5. AGREGAR MÚLTIPLES ESTADOS AL HISTORIAL
    for (let i = 0; i < 15; i++) {
        history.pushState({ blocked: true, index: i }, '', location.href);
    }

    // 6. BLOQUEAR CLIC DERECHO EN BOTÓN ATRÁS (si existe)
    document.addEventListener('mouseup', function (e) {
        // Detectar clic en área donde podría estar botón de retroceso
        if (e.clientX < 50 && e.clientY < 50) {
            showBackAlert();
        }
    });

    // 8. INICIALIZAR CON ALERTA DE BIENVENIDA
    setTimeout(() => {
        const welcomeAlert = document.createElement('div');
        welcomeAlert.textContent = '🔒 Navegación hacia atrás bloqueada';
        welcomeAlert.style.cssText = `
            position: fixed;
            top: 20px;           
            right: 20px;        
            transform: none;
            background: #2a9d8f;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 99998;
            font-weight: bold;
            animation: fadeInOut 4s ease;
        `;

        document.body.appendChild(welcomeAlert);

        setTimeout(() => {
            if (document.body.contains(welcomeAlert)) {
                document.body.removeChild(welcomeAlert);
            }
        }, 3000);
    }, 1000);

    console.log('✅ Navegación hacia atrás BLOQUEADA al 100%');
}

// EJECUTAR INMEDIATAMENTE
disableBackNavigation();

// Y también cuando se cargue la página
document.addEventListener('DOMContentLoaded', disableBackNavigation);

// Y también en cada evento de carga
window.addEventListener('load', disableBackNavigation);