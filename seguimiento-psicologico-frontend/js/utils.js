// utils.js - Utilidades generales para el frontend

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora en el formato
 * @returns {string} Fecha formateada
 */
function formatDate(date, includeTime = false) {
    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return d.toLocaleDateString('es-ES', options);
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida un número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si el teléfono es válido
 */
function isValidPhone(phone) {
    // Permite números internacionales con o sin +
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

/**
 * Genera un ID único
 * @returns {string} ID único
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Guarda datos en localStorage con expiración
 * @param {string} key - Clave para almacenar
 * @param {any} data - Datos a almacenar
 * @param {number} ttlMinutes - Tiempo de vida en minutos (opcional)
 */
function setLocalStorageWithExpiry(key, data, ttlMinutes = null) {
    const item = {
        data: data,
        timestamp: Date.now()
    };
    
    if (ttlMinutes) {
        item.expiry = ttlMinutes * 60 * 1000; // Convertir a milisegundos
    }
    
    localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Obtiene datos de localStorage con expiración
 * @param {string} key - Clave a obtener
 * @returns {any|null} Datos almacenados o null si expiraron
 */
function getLocalStorageWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
        return null;
    }
    
    const item = JSON.parse(itemStr);
    const now = Date.now();
    
    // Verificar si los datos expiraron
    if (item.expiry && now - item.timestamp > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    
    return item.data;
}

/**
 * Limpia datos expirados de localStorage
 */
function clearExpiredStorage() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('temp_') || key.endsWith('_cache')) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.expiry && Date.now() - item.timestamp > item.expiry) {
                    keysToRemove.push(key);
                }
            } catch (e) {
                // Si no es JSON, ignorar
            }
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Muestra un modal de confirmación
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje del modal
 * @param {string} confirmText - Texto del botón de confirmar
 * @param {string} cancelText - Texto del botón de cancelar
 * @returns {Promise<boolean>} True si se confirmó, False si se canceló
 */
function showConfirmationModal(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            background: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        // Contenido del modal
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: var(--primary-color);">${title}</h3>
            <p style="margin: 20px 0; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary" id="modalCancel">${cancelText}</button>
                <button class="btn btn-primary" id="modalConfirm">${confirmText}</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Manejar clics
        document.getElementById('modalConfirm').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        document.getElementById('modalCancel').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        });
    });
}

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si se copió exitosamente
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores antiguos
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err2) {
            console.error('Error al copiar al portapapeles:', err2);
            return false;
        }
    }
}

/**
 * Descarga datos como archivo JSON
 * @param {object} data - Datos a descargar
 * @param {string} filename - Nombre del archivo (sin extensión)
 */
function downloadAsJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

/**
 * Convierte un string a un slug URL-friendly
 * @param {string} str - String a convertir
 * @returns {string} Slug
 */
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

/**
 * Formatea un número como puntuación (ej: 8.5/10)
 * @param {number} score - Puntuación
 * @param {number} max - Puntuación máxima
 * @returns {string} Puntuación formateada
 */
function formatScore(score, max = 10) {
    return `${score.toFixed(1)}/${max}`;
}

/**
 * Obtiene el color correspondiente a una puntuación
 * @param {number} score - Puntuación (1-10)
 * @returns {string} Color CSS
 */
function getScoreColor(score) {
    if (score < 5) return 'var(--danger-color)';
    if (score < 7) return 'var(--warning-color)';
    return 'var(--success-color)';
}

/**
 * Genera un color aleatorio en formato HSL
 * @returns {string} Color HSL
 */
function generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Debounce function para limitar llamadas a funciones
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounceada
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para limitar frecuencia de llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} Función throttleada
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Parsea parámetros de URL
 * @returns {object} Objeto con parámetros de URL
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    
    return result;
}

/**
 * Establece parámetros en la URL sin recargar la página
 * @param {object} params - Parámetros a establecer
 */
function setUrlParams(params) {
    const url = new URL(window.location);
    
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    });
    
    window.history.pushState({}, '', url);
}

/**
 * Valida si un objeto está vacío
 * @param {object} obj - Objeto a validar
 * @returns {boolean} True si el objeto está vacío
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Combina múltiples clases CSS
 * @param {...string} classes - Clases a combinar
 * @returns {string} Clases combinadas
 */
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
function formatNumber(number) {
    return new Intl.NumberFormat('es-ES').format(number);
}

/**
 * Calcula el porcentaje
 * @param {number} value - Valor actual
 * @param {number} total - Valor total
 * @returns {number} Porcentaje
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Función para esperar un tiempo
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promise que se resuelve después del tiempo especificado
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Maneja errores de forma consistente
 * @param {Error} error - Error a manejar
 * @param {string} context - Contexto donde ocurrió el error
 */
function handleError(error, context = '') {
    console.error(`Error en ${context}:`, error);
    
    // Mostrar notificación al usuario
    const message = error.message || 'Ocurrió un error inesperado';
    showNotification(`❌ ${context}: ${message}`, 'error');
}

// ================ NUEVAS FUNCIONES PARA PACIENTE ================

/**
 * Limpia datos del paciente de localStorage
 */
function clearPatientData() {
    localStorage.removeItem('patientPseudonym');
    localStorage.removeItem('patientToken');
    localStorage.removeItem('seudonimoId');
    localStorage.removeItem('seudonimoElegido');
    localStorage.removeItem('lastSurveyDate');
    console.log('Datos del paciente limpiados');
}

/**
 * Verifica si el paciente ya tiene seudónimo elegido
 * @returns {boolean} True si ya eligió seudónimo
 */
function hasPseudonymSelected() {
    return localStorage.getItem('seudonimoElegido') === 'true' && 
           localStorage.getItem('patientPseudonym') !== null;
}

/**
 * Cierra sesión del paciente
 */
function pacienteLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión? Podrás volver con tu mismo seudónimo usando el enlace de invitación.')) {
        clearPatientData();
        window.location.href = '../../index.html';
    }
}

/**
 * Verifica acceso a la encuesta (para survey.html)
 */
function verifySurveyAccess() {
    const pseudonym = localStorage.getItem('patientPseudonym');
    const token = localStorage.getItem('patientToken');
    
    if (!pseudonym || !token) {
        clearPatientData();
        window.location.href = 'choose-identity.html';
        return false;
    }
    
    return true;
}

// ================ FIN NUEVAS FUNCIONES ================

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.utils = {
        formatDate,
        capitalize,
        isValidEmail,
        isValidPhone,
        generateUniqueId,
        setLocalStorageWithExpiry,
        getLocalStorageWithExpiry,
        clearExpiredStorage,
        showConfirmationModal,
        copyToClipboard,
        downloadAsJSON,
        slugify,
        formatScore,
        getScoreColor,
        generateRandomColor,
        debounce,
        throttle,
        getUrlParams,
        setUrlParams,
        isEmpty,
        classNames,
        formatNumber,
        calculatePercentage,
        sleep,
        handleError,
        // NUEVAS FUNCIONES
        clearPatientData,
        hasPseudonymSelected,
        pacienteLogout,
        verifySurveyAccess
    };
}

// También exportar individualmente para compatibilidad
window.clearPatientData = clearPatientData;
window.pacienteLogout = pacienteLogout;
window.hasPseudonymSelected = hasPseudonymSelected;

// Inicializar limpieza automática de localStorage expirado
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Limpiar cada 5 minutos
        setInterval(clearExpiredStorage, 5 * 60 * 1000);
        // Limpiar al cargar la página
        clearExpiredStorage();
    });
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.utils = {
        formatDate,
        capitalize,
        isValidEmail,
        isValidPhone,
        generateUniqueId,
        setLocalStorageWithExpiry,
        getLocalStorageWithExpiry,
        clearExpiredStorage,
        showConfirmationModal,
        copyToClipboard,
        downloadAsJSON,
        slugify,
        formatScore,
        getScoreColor,
        generateRandomColor,
        debounce,
        throttle,
        getUrlParams,
        setUrlParams,
        isEmpty,
        classNames,
        formatNumber,
        calculatePercentage,
        sleep,
        handleError
    };
}

// Inicializar limpieza automática de localStorage expirado
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Limpiar cada 5 minutos
        setInterval(clearExpiredStorage, 5 * 60 * 1000);
        // Limpiar al cargar la página
        clearExpiredStorage();
    });
}

// Export para módulos (si se usa con bundlers)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        capitalize,
        isValidEmail,
        isValidPhone,
        generateUniqueId,
        setLocalStorageWithExpiry,
        getLocalStorageWithExpiry,
        clearExpiredStorage,
        showConfirmationModal,
        copyToClipboard,
        downloadAsJSON,
        slugify,
        formatScore,
        getScoreColor,
        generateRandomColor,
        debounce,
        throttle,
        getUrlParams,
        setUrlParams,
        isEmpty,
        classNames,
        formatNumber,
        calculatePercentage,
        sleep,
        handleError
    };
}

