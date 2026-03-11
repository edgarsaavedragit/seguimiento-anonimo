// Función para logout del paciente
function pacienteLogout() {
    if (confirm('¿Cerrar sesión? Podrás volver con el mismo enlace de invitación.')) {
        clearPatientData();
        window.location.href = '../../index.html';
    }
}

// Limpiar datos de sesión después de mostrar la página de éxito
setTimeout(() => {
    // localStorage.removeItem('patientPseudonym');
    // localStorage.removeItem('patientToken');
}, 3000);

// Cargar utils.js para tener acceso a las funciones
if (typeof clearPatientData === 'undefined') {
    // Si no está cargado, cargar utils.js
    const script = document.createElement('script');
    script.src = '../../js/utils.js';
    document.head.appendChild(script);
}