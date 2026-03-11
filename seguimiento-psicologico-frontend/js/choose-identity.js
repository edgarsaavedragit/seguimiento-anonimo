// Verificar si hay token en la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Función para verificar en backend si el token ya tiene seudónimo
async function verifyToken(tokenValue) {
    try {
        console.log('Verificando token:', tokenValue);

        // Llamar al backend para verificar si ya tiene seudónimo
        const response = await fetch(`${API_BASE_URL}/api/public/paciente/verificar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: tokenValue })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del backend:', data);

            if (data.tieneSeudonimo) {
                // Ya tiene seudónimo, redirigir directo a encuesta
                console.log('Paciente ya tiene seudónimo:', data.alias);

                // Guardar en localStorage
                localStorage.setItem('patientPseudonym', data.alias);
                localStorage.setItem('patientToken', tokenValue);
                localStorage.setItem('seudonimoId', data.idSeudonimo);

                // Redirigir inmediatamente
                window.location.href = 'survey.html';
                return { tieneSeudonimo: true };
            }
            return { tieneSeudonimo: false, token: tokenValue };
        }
    } catch (error) {
        console.error('Error verificando token:', error);

        // Para desarrollo, verificar en localStorage
        const savedToken = localStorage.getItem('patientToken');
        if (savedToken === tokenValue) {
            const pseudonym = localStorage.getItem('patientPseudonym');
            if (pseudonym) {
                window.location.href = 'survey.html';
                return { tieneSeudonimo: true };
            }
        }
    }

    return { tieneSeudonimo: false, token: tokenValue || 'dev-token-12345' };
}

// Función para limpiar localStorage específicamente para nuevo token
function clearPatientDataForNewToken(token) {
    const currentToken = localStorage.getItem('patientToken');

    // Si hay un token diferente al actual, limpiar todo
    if (currentToken && currentToken !== token) {
        console.log('Token diferente detectado, limpiando localStorage...');
        localStorage.removeItem('patientPseudonym');
        localStorage.removeItem('patientToken');
        localStorage.removeItem('seudonimoId');
        localStorage.removeItem('seudonimoElegido');
        localStorage.removeItem('lastSurveyDate');
    }

    // Guardar el nuevo token
    localStorage.setItem('patientToken', token);
}

function setupPage(currentToken) {
    // Mostrar token section
    document.getElementById('tokenSection').style.display = 'block';
    document.getElementById('invitationToken').value = currentToken;

    // Configurar botón de continuar
    document.getElementById('continueBtn').addEventListener('click', async function () {
        await handlePseudonymSelection(currentToken);
    });

    // Cargar seudónimos disponibles
    loadAvailablePseudonyms();
}

async function handlePseudonymSelection(currentToken) {
    const selectedCard = document.querySelector('.pseudonym-card.selected');
    if (!selectedCard) {
        showMessage('Por favor selecciona un seudónimo', 'warning');
        return;
    }

    const pseudonymId = selectedCard.dataset.id;
    const pseudonymName = selectedCard.querySelector('.pseudonym-name').textContent;

    try {
        // LLAMAR AL BACKEND REAL
        const result = await publicAPI.linkPseudonym(currentToken, pseudonymId);

        if (result && result.message) {
            showMessage(result.message, 'success');
        } else {
            showMessage(`¡Perfecto! Ahora eres "${pseudonymName}"`, 'success');
        }

        // Guardar en localStorage
        localStorage.setItem('patientPseudonym', pseudonymName);
        localStorage.setItem('patientToken', currentToken);
        localStorage.setItem('seudonimoId', pseudonymId);
        localStorage.setItem('seudonimoElegido', 'true'); // Marcar que ya eligió

        // Deshabilitar botón de retroceso
        disableBackNavigation();

        // Redirigir a la encuesta después de 2 segundos
        setTimeout(() => {
            window.location.href = 'survey.html';
        }, 2000);

    } catch (error) {
        console.error('Error al vincular:', error);
        showMessage('Error al vincular seudónimo: ' + error.message, 'error');
    }
}

// Función para prevenir navegación hacia atrás
function disableBackNavigation() {
    // Reemplazar estado actual
    window.history.replaceState(null, null, window.location.href);

    // Prevenir que el botón de retroceso funcione
    window.onpopstate = function (event) {
        window.history.pushState(null, null, window.location.href);
        showMessage('No puedes volver a la selección de seudónimo', 'warning');
    };

    // Añadir estado inicial
    window.history.pushState(null, null, window.location.href);
}

function copyToken() {
    const tokenInput = document.getElementById('devToken');
    tokenInput.select();
    document.execCommand('copy');
    showMessage('Token copiado al portapapeles', 'success');
}

// VERIFICACIÓN INMEDIATA AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        // Modo desarrollo sin token
        console.log('Modo desarrollo: Sin token en URL');
        return;
    }

    // ===== ¡IMPORTANTE! LIMPIAR localStorage para este paciente =====
    // Esto asegura que cada paciente comience fresco
    clearPatientDataForNewToken(token);

    // ===== VERIFICAR CON BACKEND =====
    try {
        const response = await fetch(`${API_BASE_URL}/api/public/paciente/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });

        if (response.ok) {
            const data = await response.json();

            if (data.tieneSeudonimo) {
                // ¡Ya tiene seudónimo en el backend! Redirigir a encuesta
                console.log('Backend dice: Ya tiene seudónimo:', data.alias);

                // Guardar en localStorage (solo para esta sesión)
                localStorage.setItem('patientPseudonym', data.alias);
                localStorage.setItem('patientToken', token);
                localStorage.setItem('seudonimoId', data.idSeudonimo);
                localStorage.setItem('seudonimoElegido', 'true');

                // Redirigir inmediatamente
                window.location.href = 'survey.html';
                return;
            } else {
                // No tiene seudónimo, mostrar cards para elegir
                console.log('Backend dice: NO tiene seudónimo, mostrar cards');
                // Configurar la página normalmente
                setupPage(token);
            }
        }
    } catch (error) {
        console.error('Error verificando con backend:', error);
        // Si falla el backend, mostrar cards de todos modos
        setupPage(token);
    }
});

// Inicializar prevención de navegación hacia atrás
disableBackNavigation();

// Configurar el botón de continuar
document.getElementById('continueBtn').addEventListener('click', async function () {
    const selectedCard = document.querySelector('.pseudonym-card.selected');
    if (!selectedCard) {
        showMessage('Por favor selecciona un seudónimo', 'warning');
        return;
    }

    const pseudonymId = selectedCard.dataset.id;
    const pseudonymName = selectedCard.querySelector('.pseudonym-name').textContent;
    const currentToken = token || document.getElementById('devToken')?.value;

    if (!currentToken) {
        showMessage('No se encontró el token de invitación', 'error');
        return;
    }

    try {
        // LLAMAR AL BACKEND REAL
        const result = await publicAPI.linkPseudonym(currentToken, pseudonymId);

        if (result && result.message) {
            showMessage(result.message, 'success');
        } else {
            showMessage(`¡Perfecto! Ahora eres "${pseudonymName}"`, 'success');
        }

        // Guardar en localStorage
        localStorage.setItem('patientPseudonym', pseudonymName);
        localStorage.setItem('patientToken', currentToken);
        localStorage.setItem('seudonimoId', pseudonymId);

        // Redirigir a la encuesta después de 2 segundos
        setTimeout(() => {
            window.location.href = 'survey.html';
        }, 2000);

    } catch (error) {
        console.error('Error al vincular:', error);
        showMessage('Error al vincular seudónimo: ' + error.message, 'error');
    }
});

// Mostrar token section si hay token
if (token) {
    document.getElementById('tokenSection').style.display = 'block';
    document.getElementById('invitationToken').value = token;
} else {
    // Simular token para desarrollo
    document.getElementById('tokenSection').style.display = 'block';
}