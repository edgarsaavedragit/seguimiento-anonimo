document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('recoveryForm');
    const messageDiv = document.getElementById('recoveryMessage');
    
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('recoveryEmail').value.trim();
            
            if (!email || !email.includes('@')) {
                showMessage('Ingresa un email válido', 'error');
                return;
            }
            
            // Mostrar loading
            const submitBtn = recoveryForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            try {
                // LLAMADA REAL AL BACKEND
                const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage(
                        '✅ Se ha enviado un enlace de recuperación a tu email. ' +
                        'Revisa tu bandeja de entrada y carpeta de spam.',
                        'success'
                    );
                    recoveryForm.reset();
                } else {
                    showMessage(
                        data.message || 'Error al procesar la solicitud',
                        'error'
                    );
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage(
                    '❌ No se pudo conectar con el servidor. Verifica tu conexión.',
                    'error'
                );
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
});