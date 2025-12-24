class BpWordzeeClient {

    // Puntuaciones base por letra
    static PUNTOS_LETRAS = {
        'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1,
        'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
        'L': 1, 'M': 3, 'N': 1, 'Ñ': 8, 'O': 1,
        'P': 3, 'Q': 5, 'R': 1, 'S': 1, 'T': 1,
        'U': 1, 'V': 4, 'X': 8, 'Y': 4, 'Z': 10
    };
    
    static MULTIPLICADORES = {
        'DL': 2,   // Doble Letra
        'TL': 3,   // Triple Letra
        'DP': 2,   // Doble Palabra (aplicado al final)
        'TP': 3,   // Triple Palabra (aplicado al final)
        '': 1      // Sin bonificación
    };

    // ============================================
    // Métodos de búsqueda y cálculo de palabras
    // ============================================

    static async buscarPalabras(letrasDisponibles, puntosExtra, ronda, apiUrl = '/api/bpwordzee') {
        this.validarParametros(letrasDisponibles, puntosExtra, ronda);
        const letrasNormalizadas = letrasDisponibles.map(l => l.toUpperCase());
        
        try {
            const palabrasCoincidentes = await this.obtenerPalabrasAPI(letrasNormalizadas, apiUrl);
            const resultado = this.procesarPalabras(palabrasCoincidentes, letrasNormalizadas, puntosExtra, ronda);
            return resultado;
        } catch (error) {
            console.error('Error al buscar palabras:', error);
            throw error;
        }
    }

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

    static async obtenerPalabrasAPI(letras, apiUrl) {
        const letrasParam = letras.join(',');
        const url = `${apiUrl}?letras=${letrasParam}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error de API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.mensaje || 'Error desconocido de la API');
        }
        return data.data.palabras;
    }

    static procesarPalabras(palabras, letrasDisponibles, puntosExtra, ronda) {
        const palabrasPorLongitud = {3: [], 4: [], 5: [], 6: [], 7: []};
        const letrasContador = this.contarLetras(letrasDisponibles);

        for (const palabra of palabras) {
            const longitud = palabra.length;
            if (!this.puedeFormarsePalabra(palabra, letrasContador)) continue;
            const puntos = this.calcularPuntos(palabra, longitud, puntosExtra, ronda);
            palabrasPorLongitud[longitud].push({ palabra: palabra, puntos: puntos });
        }

        return this.ordenarYLimitarResultados(palabrasPorLongitud);
    }

    static contarLetras(letras) {
        const contador = {};
        for (const letra of letras) {
            const letraMayus = letra.toUpperCase();
            contador[letraMayus] = (contador[letraMayus] || 0) + 1;
        }
        return contador;
    }

    static puedeFormarsePalabra(palabra, letrasContador) {
        const letrasDisponibles = {...letrasContador};
        for (const letra of palabra) {
            if (letrasDisponibles[letra] && letrasDisponibles[letra] > 0) {
                letrasDisponibles[letra]--;
            } else {
                return false;
            }
        }
        return true;
    }

    static calcularPuntos(palabra, longitud, puntosExtra, ronda) {
        let puntos = 0;
        let multiplicadorPalabra = 1;
        const indiceBonus = longitud - 3;
        
        for (let i = 0; i < longitud; i++) {
            const letra = palabra[i];
            const valorLetra = this.PUNTOS_LETRAS[letra] || 0;
            const bonus = puntosExtra[indiceBonus][i] || '';
            const multiplicadorLetra = this.MULTIPLICADORES[bonus] || 1;
            
            if (bonus === 'DP' || bonus === 'TP') {
                multiplicadorPalabra *= multiplicadorLetra;
                puntos += valorLetra * ronda;
            } else {
                puntos += valorLetra * ronda * multiplicadorLetra;
            }
        }
        
        puntos *= multiplicadorPalabra;
        
        if (longitud === 6) {
            puntos *= 2;
        } else if (longitud === 7) {
            puntos *= 3;
        }
        
        return Math.floor(puntos);
    }

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

function cambiarTema(event) {
    const newColorScheme = event.matches ? "dark" : "light";
    document.querySelector('html').setAttribute('data-bs-theme', newColorScheme);
}

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

async function formularioEnviar() {
    const url = 'https://acf.alwaysdata.net/api/bpwordzee';
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
        console.error('Error en la petición:', error);
        alert('Error: ' + error.message);
    } finally {
        cargando.classList.add('d-none');
    }
}

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

function restablecer() {
    window.location.href = window.location.href;
}

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
