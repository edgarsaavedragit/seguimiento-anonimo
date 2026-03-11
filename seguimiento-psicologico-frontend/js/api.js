// Configuración de la API - BACKEND REAL
const API_BASE_URL = 'http://localhost:8080';

// Headers para peticiones
function getHeaders(requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        // Basic Auth para admin
        const auth = btoa('sofi:secure123');
        headers['Authorization'] = `Basic ${auth}`;
    }

    return headers;
}

// Función para manejar errores
async function handleApiResponse(response) {
    console.log('Respuesta recibida:', response.status, response.statusText);

    // Clonar la respuesta para poder leerla como texto primero
    const responseClone = response.clone();

    try {
        // Intentar parsear como JSON
        const data = await response.json();
        return data;

    } catch (jsonError) {
        console.log('No es JSON, intentando como texto...');

        // Si no es JSON, leer como texto (usando el clon)
        const text = await responseClone.text();
        console.log('Respuesta como texto:', text);

        if (!response.ok) {
            // Si es un error, ver si el texto parece JSON
            try {
                const errorData = JSON.parse(text);
                throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
            } catch {
                // Si no es JSON, usar el texto plano
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }
        }

        // Si es exitoso pero no es JSON, devolver objeto con mensaje
        return { message: text };
    }
}

// Funciones de API para psicóloga
const adminAPI = {
    async loadPseudonyms(namesArray) {
        const response = await fetch(`${API_BASE_URL}/api/admin/seudonimos/carga`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(namesArray)
        });

        // Usar la función handleApiResponse mejorada
        return handleApiResponse(response);
    },

    async registerPatient(patientData) {
        const response = await fetch(`${API_BASE_URL}/api/admin/pacientes/nuevo`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(patientData)
        });

        const resultado = await handleApiResponse(response);

        // CORREGIR EL LINK DEL BACKEND
        if (resultado.linkInvitacion) {
            // Extraer el token del link
            const token = resultado.linkInvitacion.split('/').pop();

            // Crear link correcto para nuestro frontend
            resultado.linkInvitacion = `http://127.0.0.1:3000/pages/patient/choose-identity.html?token=${token}`;

            // También guardar el token puro por si acaso
            resultado.token = token;
        }

        return resultado;
    },

    async getSemaphore() {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/semaforo`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        return handleApiResponse(response);
    },

    // === NUEVAS FUNCIONES PARA DASHBOARD ===

    async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/estadisticas`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        return handleApiResponse(response);
    },

    async getRecentActivity() {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/actividad`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        return handleApiResponse(response);
    },

    async getHistory() {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/detalle`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        return handleApiResponse(response);
    },

    async getRecentPatients() {
        const response = await fetch(`${API_BASE_URL}/api/admin/pacientes/recientes`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        return handleApiResponse(response);
    },

    async deletePatient(patientId) {
        const response = await fetch(`${API_BASE_URL}/api/admin/pacientes/${patientId}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleApiResponse(response);
    },
};

// Funciones de API para pacientes
const publicAPI = {
    async getAvailablePseudonyms(token) {
        try {
            let url = `${API_BASE_URL}/api/public/seudonimos/disponibles`;

            // SOLUCIÓN: No enviar token como parámetro aún (el backend no lo necesita)
            // Si el backend requiere token, deberías pasarlo así:
            // if (token) {
            //     url += `?token=${encodeURIComponent(token)}`;
            // }

            console.log('URL para obtener seudónimos:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });

            console.log('Respuesta del backend:', response.status);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await handleApiResponse(response);
            console.log('Seudónimos recibidos:', data);

            const getIcon = (name) => {
                const icons = '☁️';
            };

            // Asegúrate de que la respuesta tiene el formato correcto
            return data.map(item => ({
                id: item.id,
                nombre: item.alias || item.nombre,
                estado: item.disponible ? "DISPONIBLE" : "OCUPADO",
                icon: getIcon(item.alias || item.nombre)
            }));

        } catch (error) {
            console.error('Error cargando seudónimos:', error);
            return [];
        }
    },

    async linkPseudonym(token, pseudonymId) {
        const response = await fetch(`${API_BASE_URL}/api/public/seudonimos/vincular`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                tokenInvitacion: token,
                idSeudonimo: pseudonymId
            })
        });
        return handleApiResponse(response);
    },

    async submitSurvey(surveyData) {
        const payload = {
            aliasPaciente: String(surveyData.aliasPaciente),
            ejeClinico: parseInt(surveyData.ejeClinico),
            ejeServicio: parseInt(surveyData.ejeServicio),
            ejeCualitativo: String(surveyData.ejeCualitativo),
            tokenPaciente: localStorage.getItem('patientToken')  // <-- AGREGAR ESTO
        };

        const response = await fetch(`${API_BASE_URL}/api/encuestas/guardar`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleApiResponse(response);
    },
};

// FUNCIONES NUEVAS PARA LOAD-NAMES.HTML
// Función para obtener TODOS los seudónimos (cargados por admin)
async function getAllPseudonyms() {
    try {
        console.log('Obteniendo todos los seudónimos del backend...');

        // Intenta varios endpoints posibles
        const endpoints = [
            '/api/admin/seudonimos/listar',
            '/api/seudonimos/todos',
            '/api/seudonimos',
            '/api/admin/seudonimos'
        ];

        let lastError = null;

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'GET',
                    headers: getHeaders(true)
                });

                console.log(`Intentando endpoint: ${endpoint}`, response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Datos recibidos:', data);

                    // Normalizar la respuesta según el formato esperado
                    if (Array.isArray(data)) {
                        return data.map(item => ({
                            id: item.id || 0,
                            alias: item.alias || item.nombre || item.pseudonym || item,
                            disponible: item.disponible !== false && item.estado !== "OCUPADO"
                        }));
                    }
                }
            } catch (error) {
                lastError = error;
                console.warn(`Endpoint ${endpoint} falló:`, error.message);
                // Continuar con el siguiente endpoint
            }
        }

        // Si todos los endpoints fallan, usar la función pública que ya existe
        console.log('Usando endpoint público como fallback...');
        const publicData = await publicAPI.getAvailablePseudonyms();
        return publicData.map(item => ({
            id: item.id,
            alias: item.nombre,
            disponible: item.estado === "DISPONIBLE"
        }));

    } catch (error) {
        console.error('Error en getAllPseudonyms:', error);
        return [];
    }
}

// Función para vaciar todos los seudónimos
async function clearAllPseudonyms() {
    try {
        if (!confirm('⚠️ ¿Estás segura de vaciar TODOS los seudónimos?\nEsta acción NO se puede deshacer.')) {
            return { cancelled: true };
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/seudonimos/limpiar`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo vaciar los seudónimos`);
        }

        return { success: true, message: 'Seudónimos vaciados correctamente' };

    } catch (error) {
        console.error('Error vaciando seudónimos:', error);

        // Intentar alternativa: desvincular primero
        try {
            // Primero desvincular todos los pacientes
            const unlinkResponse = await fetch(`${API_BASE_URL}/api/admin/seudonimos/desvincular-todos`, {
                method: 'PUT',
                headers: getHeaders(true)
            });

            if (unlinkResponse.ok) {
                // Luego eliminar seudónimos
                const deleteResponse = await fetch(`${API_BASE_URL}/api/admin/seudonimos/eliminar-todos`, {
                    method: 'DELETE',
                    headers: getHeaders(true)
                });

                if (deleteResponse.ok) {
                    return { success: true, message: 'Seudónimos vaciados correctamente' };
                }
            }
        } catch (altError) {
            console.error('Error en método alternativo:', altError);
        }

        throw error;
    }
}

// Función para obtener estadísticas de seudónimos
async function getPseudonymsStats() {
    const seudonimos = await getAllPseudonyms();
    const total = seudonimos.length;
    const disponibles = seudonimos.filter(s => s.disponible).length;
    const ocupados = seudonimos.filter(s => !s.disponible).length;

    return {
        total,
        disponibles,
        ocupados,
        porcentajeDisponibles: total > 0 ? Math.round((disponibles / total) * 100) : 0
    };
}

// Exportar para uso global
window.adminAPI = adminAPI;
window.publicAPI = publicAPI;
window.API_BASE_URL = API_BASE_URL;
window.getAllPseudonyms = getAllPseudonyms;
window.clearAllPseudonyms = clearAllPseudonyms;
window.getPseudonymsStats = getPseudonymsStats;