// Función para refrescar el semáforo
function refreshSemaphore() {
    loadSemaphoreData();
    showNotification('Semáforo actualizado', 'success');
}

// Funciones para el modal
function contactarPaciente(email, celular) {
    const modal = document.getElementById('contactModal');
    const contactInfo = document.getElementById('contactInfo');

    let html = '';
    if (email) {
        html += `<p><strong>📧 Email:</strong> ${email}</p>`;
    }
    if (celular) {
        html += `<p><strong>📱 Teléfono:</strong> ${celular}</p>`;
    }
    if (!email && !celular) {
        html = '<p>No hay información de contacto disponible.</p>';
    }

    contactInfo.innerHTML = html;
    modal.style.display = 'block';
}

function cerrarModal() {
    document.getElementById('contactModal').style.display = 'none';
}

function verHistorial(alias) {
    // Redirigir a la página de historial con el alias como parámetro
    window.location.href = `history.html?alias=${encodeURIComponent(alias)}`;
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        cerrarModal();
    }
}

// Función para confirmaciones personalizadas con estilo
function showCustomConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 9998;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            width: 90%;
            max-width: 450px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        modalContent.innerHTML = `
            <h3 style="color: #e63946; margin-bottom: 15px;">⚠️ ${title}</h3>
            <p style="margin-bottom: 20px; line-height: 1.5; color: #555;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="cancelBtn" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Cancelar</button>
                <button id="confirmBtn" style="
                    background: #e63946;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Cerrar Sesión</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modalContent.querySelector('#cancelBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });

        modalContent.querySelector('#confirmBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(true);
        });
    });
}

// Configurar logout con confirmación
document.getElementById('logoutBtn').addEventListener('click', async function (e) {
    e.preventDefault();

    const confirmed = await showCustomConfirm(
        "¿Estás segura de cerrar sesión?",
        "Serás redirigida a la página principal."
    );

    if (confirmed && typeof logout === 'function') {
        logout();
    }
});