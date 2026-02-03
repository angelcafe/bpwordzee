// const url = 'https://acf.alwaysdata.net/api/bpwordzee';
const url = 'http://127.0.0.1/api/bpwordzee';

// ============================================
// Clase principal BpWordzeeClient
// ============================================

/**
 * Cliente para buscar y puntuar palabras válidas en Wordzee
 */
class BpWordzeeClient {

    /**
     * Busca palabras válidas usando las letras disponibles y calcula sus puntuaciones
     * @param {string[]} letrasDisponibles - Array de 7 letras disponibles
     * @param {string[][]} puntosExtra - Array 2D con bonificadores para cada longitud (3-7 letras)
     * @param {number} ronda - Número de ronda (1-5)
     * @param {string} apiUrl - URL de la API a consultar
     * @returns {Promise<Object>} Objeto con palabras encontradas y estadísticas
     * @throws {Error} Si los parámetros son inválidos o la API falla
     */
    static async buscarPalabras(letrasDisponibles, puntosExtra, ronda, apiUrl = '/api/bpwordzee') {
        this.validarParametros(letrasDisponibles, puntosExtra, ronda);
        const letrasNormalizadas = letrasDisponibles.map(l => l.toUpperCase());
        
        const palabrasCoincidentes = await this.obtenerPalabrasAPI(letrasNormalizadas, puntosExtra, ronda, apiUrl);
        const resultado = this.procesarPalabras(palabrasCoincidentes);
        return resultado;
    }

    /**
     * Valida los parámetros de entrada
     * @param {string[]} letrasDisponibles - Array de letras (debe tener 7 elementos)
     * @param {string[][]} puntosExtra - Array 2D con bonificadores (5 filas para longitudes 3-7)
     * @param {number} ronda - Número de ronda (debe estar entre 1 y 5)
     * @throws {Error} Si algún parámetro no cumple los requisitos
     */
    static validarParametros(letrasDisponibles, puntosExtra, ronda) {
        if (!Array.isArray(letrasDisponibles) || letrasDisponibles.length !== 7) {
            throw new Error('El array de letras disponibles debe tener exactamente 7 letras');
        }
        if (!Array.isArray(puntosExtra) || puntosExtra.length !== 5) {
            throw new Error('El array de puntos extra debe tener 5 filas (para longitudes 3-7)');
        }
        for (let i = 0; i < puntosExtra.length; i++) {
            const longitud = i + 3;
            if (!Array.isArray(puntosExtra[i]) || puntosExtra[i].length !== longitud) {
                throw new Error(`La fila ${i} debe tener ${longitud} elementos`);
            }
        }
        if (typeof ronda !== 'number' || ronda < 1 || ronda > 5) {
            throw new Error('La ronda debe ser un número entre 1 y 5');
        }
    }

    /**
     * Consulta la API para obtener palabras válidas
     * @param {string[]} letras - Array de letras normalizadas
     * @param {string[][]} puntosExtra - Array con bonificadores
     * @param {number} ronda - Número de ronda
     * @param {string} apiUrl - URL base de la API
     * @returns {Promise<Object[]>} Array de palabras con sus puntuaciones
     * @throws {Error} Si la respuesta de la API no es exitosa
     */
    static async obtenerPalabrasAPI(letras, puntosExtra, ronda, apiUrl) {
        const letrasParam = letras.join(',');
        const puntosExtraParam = JSON.stringify(puntosExtra);
        const url = `${apiUrl}?letras=${letrasParam}&puntos_extra=${encodeURIComponent(puntosExtraParam)}&ronda=${ronda}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // Verificar el campo success en lugar del status code
            if (!data.success) {
                throw new Error(data.mensaje || 'No se pudo obtener las palabras del servidor');
            }
            
            return data.data.palabras;
        } catch (error) {
            // Si es error de JSON, mostrar mensaje genérico
            if (error instanceof SyntaxError) {
                throw new Error('El servidor no respondió correctamente. Inténtalo de nuevo.');
            }
            throw error;
        }
    }

    /**
     * Procesa y agrupa las palabras por longitud
     * @param {Object[]} palabras - Array de objetos con formato {"PALABRA": puntos}
     * @returns {Object} Resultado con palabras agrupadas por longitud
     */
    static procesarPalabras(palabras) {
        const palabrasPorLongitud = {3: [], 4: [], 5: [], 6: [], 7: []};

        for (const item of palabras) {
            // La API devuelve objetos como {"PALABRA": puntos}
            const palabra = Object.keys(item)[0];
            const puntosAPI = item[palabra];
            const longitud = palabra.length;
            
            palabrasPorLongitud[longitud].push({ palabra: palabra, puntos: puntosAPI });
        }

        return this.ordenarYLimitarResultados(palabrasPorLongitud);
    }

    /**
     * Ordena las palabras por puntuación y limita a las top 10 por longitud
     * @param {Object} palabrasPorLongitud - Objeto con palabras agrupadas por longitud
     * @returns {Object} Resultado estructurado con palabras ordenadas y estadísticas
     */
    static ordenarYLimitarResultados(palabrasPorLongitud) {
        const palabrasEncontradas = [];
        let totalPalabras = 0;
        const estadisticas = {};

        for (const [longitud, palabras] of Object.entries(palabrasPorLongitud)) {
            if (palabras.length === 0) continue;

            palabras.sort((a, b) => b.puntos - a.puntos);
            const top10 = palabras.slice(0, 10);
            palabrasEncontradas.push(...top10);
            
            totalPalabras += palabras.length;
            estadisticas[`longitud_${longitud}`] = {
                total: palabras.length,
                mejores: top10.length,
                puntos_max: palabras[0].puntos,
                puntos_min: palabras[palabras.length - 1].puntos
            };
        }

        palabrasEncontradas.sort((a, b) => b.puntos - a.puntos);

        return {
            success: true,
            data: {
                palabras: palabrasEncontradas,
                total: palabrasEncontradas.length,
                total_antes_filtro: totalPalabras,
                estadisticas: estadisticas
            }
        };
    }
}

// ============================================
// Funciones del formulario y eventos (separadas de la clase)
// ============================================

/**
 * Cambia el tema de la aplicación según las preferencias del sistema
 * @param {MediaQueryListEvent} event - Evento de cambio de preferencia de color
 */
function cambiarTema(event) {
    const newColorScheme = event.matches ? "dark" : "light";
    document.querySelector('html').setAttribute('data-bs-theme', newColorScheme);
}

/**
 * Muestra un mensaje de error en un modal de Bootstrap
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(titulo, mensaje) {
    // Crear el modal dinámicamente si no existe
    let modal = document.getElementById('modalError');
    if (!modal) {
        const modalHTML = `
            <div class="modal fade" id="modalError" tabindex="-1" aria-labelledby="modalErrorLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="modalErrorLabel"></h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body" id="modalErrorBody"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('modalError');
    }
    
    // Actualizar contenido y mostrar
    document.getElementById('modalErrorLabel').textContent = titulo;
    document.getElementById('modalErrorBody').innerHTML = mensaje;
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Cambia el valor de los botones de puntos extra al hacer clic
 * Cicla entre valores vacío -> DL -> TL -> vacío
 * @param {Event} e - Evento de clic del botón
 */
function cambiarValorBotones(e) {
    const clases = { I: 'rosa', DL: 'bg-success', TL: 'info' };
    const valores = { I: 'DL', DL: 'TL', TL: '' };
    const target = e.currentTarget;
    const currentValue = target.value || 'I';
    if (currentValue === 'DP' || currentValue === 'TP') {
        return;
    }
    target.parentElement.querySelectorAll("input").forEach(input => {
        if (input.value === "DL" || input.value === "TL") {
            input.value = '';
            input.classList.remove('rosa', 'bg-success', 'info');
            input.classList.add('info');
        }
    });
    target.classList.remove('rosa', 'bg-success', 'info');
    target.value = valores[currentValue];
    if (clases[currentValue]) {
        target.classList.add(clases[currentValue]);
    }
}

/**
 * Extrae los datos del formulario y los estructura para BpWordzeeClient
 * @returns {Object} Objeto con propiedades: letras (array), puntosExtra (array 2D), ronda (number)
 */
function obtenerDatosFormulario() {
    const formulario = document.getElementById('principal');
    const formData = new FormData(formulario);
    
    // Obtener las 7 letras (name="letrasDisponibles[]")
    const letras = formData.getAll('letrasDisponibles[]').map(l => l.toUpperCase());
    
    // Obtener la ronda
    const ronda = parseInt(formData.get('ronda')) || 1;
    
    // Obtener los bonificadores para cada longitud (3-7 letras)
    const puntosExtra = [];
    for (let longitud = 3; longitud <= 7; longitud++) {
        const bonificadores = formData.getAll(`puntosextra[${longitud}][]`);
        puntosExtra.push(bonificadores);
    }
    
    return { letras, puntosExtra, ronda };
}

/**
 * Procesa el envío del formulario y muestra los resultados
 * @async
 * @returns {Promise<void>}
 */
async function formularioEnviar() {
    const cargando = document.getElementById('cargando');
    cargando.classList.remove('d-none');

    try {
        // Obtener datos del formulario
        const { letras, puntosExtra, ronda } = obtenerDatosFormulario();
        
        // Validar que haya 7 letras
        if (letras.length !== 7) {
            throw new Error('Debes ingresar exactamente 7 letras');
        }
        
        // Usar BpWordzeeClient para buscar palabras y calcular puntuaciones
        const resultado = await BpWordzeeClient.buscarPalabras(letras, puntosExtra, ronda, url);
        
        if (resultado && resultado.success && resultado.data && resultado.data.palabras) {
            mostrarPalabrasEncontradas('idPalabrasEncontradas', 'palenc noselect', resultado.data.palabras);
        }

        document.querySelectorAll('td.palenc').forEach(td => {
            td.addEventListener('click', function () {
                let palabra = this.textContent.split(' ')[0];
                if (palabra.length > 0) {
                    const inputs = document.querySelectorAll('#letras>input');
                    inputs.forEach((input, index) => {
                        input.value = palabra[index] || '';
                    });
                    const emptyInput = Array.from(inputs).find(input => !input.value.trim());
                    if (emptyInput) {
                        emptyInput.focus();
                    }
                    document.getElementById('letras').scrollIntoView();
                }
            });
        });
    } catch (error) {
        // Mostrar error al usuario sin contaminar la consola
        mostrarError(
            'Error al buscar palabras',
            `<p class="mb-0">${error.message}</p>
             <p class="mb-0 mt-2 text-muted small">Si el problema persiste, contacta con el administrador.</p>`
        );
    } finally {
        cargando.classList.add('d-none');
    }
}

/**
 * Inicializa todos los event listeners de la aplicación
 * Incluye manejo de formulario, botones, tema y PWA
 */
function inicializarEventos() {
    document.querySelectorAll('input.btn-secondary').forEach(function (element) {
        element.addEventListener('click', cambiarValorBotones);
    });

    document.querySelectorAll('#letras>input').forEach(function (input) {
        input.addEventListener('keyup', validarTexto);
        input.addEventListener('click', function () {
            this.select();
        });
    });

    document.getElementById('principal').addEventListener('submit', function (e) {
        e.preventDefault();
        formularioEnviar();
    });

    document.querySelector('#principal button[type="button"].btn-danger').addEventListener('click', restablecer);

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.querySelector('html').setAttribute('data-bs-theme', 'dark');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cambiarTema);

    // Manejo del botón de instalación PWA
    let deferredPrompt;
    const btnInstalar = document.getElementById('btnInstalarHeader');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (btnInstalar) {
            btnInstalar.classList.remove('d-none');
        }
    });

    if (btnInstalar) {
        btnInstalar.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            btnInstalar.classList.add('d-none');
        });
    }

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        if (btnInstalar) {
            btnInstalar.classList.add('d-none');
        }
    });
}

/**
 * Muestra las palabras encontradas en una tabla HTML
 * @param {string} id - ID del elemento tbody donde mostrar los resultados
 * @param {string} clase - Clases CSS a aplicar a las celdas
 * @param {Object[]} datos - Array de objetos con propiedades palabra y puntos
 */
function mostrarPalabrasEncontradas(id, clase, datos) {
    if (!datos) return;

    const tabla = [[], [], [], [], []];
    for (const { palabra, puntos } of datos) {
        const index = palabra.length - 3;
        tabla[index].push(`<td class="${clase}">${palabra} - ${puntos}</td>`);
    }
    const maximo = Math.max(...tabla.map(arr => arr.length));
    const filas = Array.from({ length: maximo }, (_, x) => {
        return '<tr>' + tabla.map(arr => arr[x] || '<td></td>').join('') + '</tr>';
    });
    const elemento = document.getElementById(id);
    elemento.innerHTML = '';
    elemento.insertAdjacentHTML('beforeend', filas.join(''));
}

/**
 * Restablece la página recargándola completamente
 */
function restablecer() {
    window.location.href = window.location.href;
}

/**
 * Valida el texto ingresado en los inputs de letras
 * Solo permite letras válidas (a-z excluyendo k, w) y avanza al siguiente input
 * @param {Event} e - Evento keyup del input
 */
function validarTexto(e) {
    const texto = /^[a-jl-vx-zA-JL-VX-ZñÑ]$/;
    const input = e.target;
    if (texto.test(input.value)) {
        const siguiente = input.nextElementSibling;
        if (siguiente) {
            siguiente.focus();
            siguiente.select();
        }
    } else {
        input.value = '';
    }
}

// ============================================
// Inicialización al cargar el documento
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    inicializarEventos();
});
