// Función para generar enlace de invitación (placeholder)
function generateInvitationLink() {
    alert('Función: Generar enlace único para paciente\n\nEsta función se implementará en la integración con el backend');
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

// Verificación de autenticación
if (localStorage.getItem('psychologistLoggedIn') !== 'true') {
    window.location.href = '../auth/login.html';
}

// Inicializar dashboard después de verificar autenticación
if (typeof initializeDashboard === 'function') {
    initializeDashboard();
}