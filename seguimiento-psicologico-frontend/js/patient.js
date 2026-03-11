// Lógica para la sección de pacientes
document.addEventListener('DOMContentLoaded', function () {
    // Cargar seudónimos disponibles si estamos en la página de elección
    if (document.getElementById('pseudonymsGrid')) {
        loadAvailablePseudonyms();
        setupPseudonymSelection();
    }

    // Inicializar formulario de encuesta
    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
        setupSurveyForm();
    }

    // Manejar vinculación de seudónimo
    const linkForm = document.getElementById('linkPseudonymForm');
    if (linkForm) {
        linkForm.addEventListener('submit', handlePseudonymLink);
    }
});

// Cargar seudónimos disponibles
async function loadAvailablePseudonyms() {
    try {
        const grid = document.getElementById('pseudonymsGrid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading">Cargando seudónimos disponibles...</div>';

        const token = localStorage.getItem('patientToken') ||
            new URLSearchParams(window.location.search).get('token');

        // Obtener los seudónimos
        const pseudonyms = await publicAPI.getAvailablePseudonyms(token);

        // Verificar si recibimos datos
        if (!pseudonyms || pseudonyms.length === 0) {
            grid.innerHTML = '<p class="error">No hay seudónimos disponibles</p>';
            return;
        }

        // RENDERIZAR los seudónimos - ¡ESTO FALTA!
        renderPseudonyms(pseudonyms);

        // Configurar selección
        setupPseudonymSelection();

    } catch (error) {
        console.error('Error:', error);
        const grid = document.getElementById('pseudonymsGrid');
        if (grid) {
            grid.innerHTML = '<p class="error">Error cargando seudónimos</p>';
        }
    }
}

// Simular seudónimos disponibles (para desarrollo)
async function simulateAvailablePseudonyms() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, name: 'Río', icon: '🌊', description: 'Fluye y se adapta' },
                { id: 2, name: 'Montaña', icon: '⛰️', description: 'Firme y estable' },
                { id: 3, name: 'Sol', icon: '☀️', description: 'Brillante y cálido' },
                { id: 4, name: 'Luna', icon: '🌙', description: 'Tranquila y serena' },
                { id: 5, name: 'Bosque', icon: '🌳', description: 'Protector y vital' },
                { id: 6, name: 'Estrella', icon: '⭐', description: 'Guía e inspiración' },
                { id: 7, name: 'Viento', icon: '💨', description: 'Libre y cambiante' },
                { id: 8, name: 'Flor', icon: '🌸', description: 'Delicada y bella' }
            ]);
        }, 500);
    });
}

// Renderizar seudónimos disponibles
function renderPseudonyms(pseudonyms) {
    const grid = document.getElementById('pseudonymsGrid');
    if (!grid) return;

    grid.innerHTML = pseudonyms.map(pseudonym => `
    <div class="pseudonym-card" data-id="${pseudonym.id}">
        <div class="pseudonym-icon">${pseudonym.icon || '☁️'}</div>
        <div class="pseudonym-name">${pseudonym.alias || pseudonym.nombre}</div>
        <div class="pseudonym-description">${pseudonym.description || ''}</div>
        <button class="btn-select">Seleccionar</button>
    </div>
`).join('');
}

// Configurar selección de seudónimos
function setupPseudonymSelection() {
    const grid = document.getElementById('pseudonymsGrid');
    if (!grid) return;

    grid.addEventListener('click', function (e) {
        const card = e.target.closest('.pseudonym-card');
        const selectBtn = e.target.closest('.btn-select');

        if (card && selectBtn) {
            // Quitar selección anterior
            document.querySelectorAll('.pseudonym-card.selected').forEach(c => {
                c.classList.remove('selected');
            });

            // Seleccionar nueva card
            card.classList.add('selected');

            // Actualizar botón de continuar
            updateContinueButton(card.dataset.id, card.querySelector('.pseudonym-name').textContent);
        }
    });
}

// Actualizar botón de continuar
function updateContinueButton(pseudonymId, pseudonymName) {
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.textContent = `Continuar como "${pseudonymName}"`;
        continueBtn.dataset.pseudonymId = pseudonymId;
    }
}

// Manejar vinculación de seudónimo
async function handlePseudonymLink(e) {
    e.preventDefault();

    const token = getUrlParameter('token');
    if (!token) {
        showMessage('Enlace de invitación inválido', 'error');
        return;
    }

    const selectedCard = document.querySelector('.pseudonym-card.selected');
    if (!selectedCard) {
        showMessage('Por favor selecciona un seudónimo', 'warning');
        return;
    }

    const pseudonymId = selectedCard.dataset.id;
    const pseudonymName = selectedCard.querySelector('.pseudonym-name').textContent;

    try {
        const result = await publicAPI.linkPseudonym(token, pseudonymId);

        if (result && result.message) {
            showMessage(result.message, 'success');
        } else {
            showMessage(`¡Perfecto! Ahora eres "${pseudonymName}"`, 'success');
        }

        // Guardar en localStorage
        localStorage.setItem('patientPseudonym', pseudonymName);
        localStorage.setItem('patientToken', token);
        localStorage.setItem('seudonimoId', pseudonymId);

        // Redirigir a la encuesta después de 2 segundos
        setTimeout(() => {
            window.location.href = 'survey.html';
        }, 2000);

    } catch (error) {
        console.error('Error al vincular seudónimo:', error);
        showMessage('Error al vincular seudónimo. Intenta nuevamente.', 'error');
    }
}

// Configurar formulario de encuesta
function setupSurveyForm() {
    // Cargar seudónimo del paciente
    const pseudonym = localStorage.getItem('patientPseudonym');
    if (pseudonym) {
        const aliasElement = document.getElementById('aliasDisplay');
        if (aliasElement) {
            aliasElement.textContent = pseudonym;
        }
    }

    // Configurar sliders
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}Value`);
        if (valueDisplay) {
            // Mostrar valor inicial
            valueDisplay.textContent = slider.value;

            // Actualizar al mover slider
            slider.addEventListener('input', function () {
                valueDisplay.textContent = this.value;
                updateEmoji(this.id, this.value);
            });
        }
    });

    // Manejar envío de encuesta
    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
        surveyForm.addEventListener('submit', handleSurveySubmit);
    }
}

// Actualizar emoji según valor del slider
function updateEmoji(sliderId, value) {
    const emojiElement = document.getElementById(`${sliderId}Emoji`);
    if (!emojiElement) return;

    const numericValue = parseInt(value);
    let emoji = '😐';

    if (sliderId === 'ejeClinico') {
        if (numericValue <= 3) emoji = '😢';
        else if (numericValue <= 6) emoji = '😐';
        else if (numericValue <= 8) emoji = '🙂';
        else emoji = '😊';
    } else if (sliderId === 'ejeServicio') {
        if (numericValue <= 3) emoji = '👎';
        else if (numericValue <= 6) emoji = '🤔';
        else if (numericValue <= 8) emoji = '👍';
        else emoji = '👏';
    }

    emojiElement.textContent = emoji;
}

// Manejar envío de encuesta
async function handleSurveySubmit(e) {
    e.preventDefault();

    const surveyData = {
        aliasPaciente: localStorage.getItem('patientPseudonym') || 'Anónimo',
        ejeClinico: parseInt(document.getElementById('ejeClinico').value),    // <-- parseInt
        ejeServicio: parseInt(document.getElementById('ejeServicio').value),  // <-- parseInt
        ejeCualitativo: document.getElementById('ejeCualitativo').value
    };

    // Validación
    if (!surveyData.ejeCualitativo.trim()) {
        showMessage('Por favor comparte tu experiencia en el diario personal', 'warning');
        return;
    }

    try {
        // Mostrar loading
        const submitBtn = document.querySelector('#surveyForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // En un sistema real, usaríamos: await publicAPI.submitSurvey(surveyData);

        // Simular envío exitoso
        await publicAPI.submitSurvey(surveyData);

        showMessage('¡Encuesta enviada exitosamente! Gracias por tu honestidad.', 'success');

        // Limpiar formulario
        e.target.reset();

        // Actualizar valores de sliders
        document.querySelectorAll('.slider-value').forEach(el => {
            el.textContent = '5';
        });
        document.querySelectorAll('.slider-emoji').forEach(el => {
            el.textContent = '😐';
        });

        // Redirigir a página de éxito después de 2 segundos
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 2000);

    } catch (error) {
        console.error('Error al enviar encuesta:', error);
        showMessage('Error al enviar la encuesta. Intenta nuevamente.', 'error');
    } finally {
        // Restaurar botón
        const submitBtn = document.querySelector('#surveyForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// Obtener parámetro de URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Mostrar mensajes
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        // Crear elemento si no existe
        const div = document.createElement('div');
        div.id = 'message';
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(div);
    }

    const element = document.getElementById('message');
    element.textContent = message;
    element.className = `${type}-message`;
    element.style.display = 'block';

    // Colores según tipo
    const bgColors = {
        success: '#2a9d8f',
        error: '#e63946',
        warning: '#ff9f1c'
    };

    element.style.backgroundColor = bgColors[type] || '#4a6fa5';

    // Ocultar después de 5 segundos
    if (type !== 'error') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}