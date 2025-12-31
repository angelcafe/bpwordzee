# 🎮 BpWordzee - Buscador de Palabras para Wordzee!

[![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-5A0FC8)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Offline%20First-orange)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

**Progressive Web App** independiente que ayuda a los jugadores de **Wordzee!** a encontrar las palabras de mayor valor mediante búsqueda inteligente, cálculo automático de puntuaciones y funcionamiento offline mediante IndexedDB. Herramienta diseñada con arquitectura moderna y patrones de caché sofisticados.

## 🎯 Características Principales

### 🔍 Motor de Búsqueda Inteligente
- **Búsqueda de palabras válidas** con 7 letras disponibles
- **Algoritmo de validación** que verifica formación de palabras con letras disponibles
- **Cálculo automático de puntuaciones** basado en:
  - Valor base de cada letra (A=1, Z=10, etc.)
  - Multiplicadores de casilla (DL, TL, DP, TP)
  - Bonificaciones por longitud (×2 para 6 letras, ×3 para 7 letras)
  - Multiplicador de ronda (1-5)
- **Top 10 palabras** por longitud ordenadas por puntuación

### 💾 Sistema de Caché Offline-First
- **IndexedDB** como capa de persistencia local
- **Sincronización inteligente** mediante timestamp de modificación
- **Estrategia de caché híbrida**:
  - Prioridad: IndexedDB (instantáneo)
  - Fallback: API REST
  - Funcionamiento offline completo
- **Limpieza automática** cuando la base de datos remota se actualiza

### 📱 Progressive Web App
- **Instalable** en dispositivos móviles y escritorio
- **Service Worker** con estrategia de caché
- **Web App Manifest** con iconos multi-resolución
- **Soporte offline** completo
- **Detección de conectividad** en tiempo real

### 🎨 Interfaz de Usuario
- **Diseño responsive** con Bootstrap 5
- **Tema claro/oscuro** automático según preferencias del sistema
- **Interfaz intuitiva** optimizada para móviles
- **Feedback visual** de estado de caché y conectividad

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados
- **Bootstrap 5** - Framework UI responsive con soporte de tema dark/light
- **JavaScript ES6+** - Lógica de aplicación con clases y async/await

### Persistencia
- **IndexedDB API** - Base de datos NoSQL del navegador
- **Service Worker** - Cache API para assets estáticos
- **LocalStorage** - Configuración de preferencias

### APIs & Integración
- **Fetch API** - Comunicación con backend REST
- **REST API** - Endpoint `/api/bpwordzee` para búsqueda de palabras
- **Timestamp API** - Endpoint `/api/bpwordzee/modificacion` para sincronización

### PWA
- **Web App Manifest** - Configuración de instalación
- **beforeinstallprompt** - Control de instalación personalizado
- **matchMedia API** - Detección de preferencias de tema

## 🏗️ Arquitectura

### Estructura del Proyecto
```
bpwordzee/
├── index.html                # SPA principal
├── sw.js                     # Service Worker con estrategia de caché
├── bpwordzee.webmanifest     # Configuración PWA
├── LICENSE                   # Licencia propietaria
├── README.md                 # Documentación
└── front/
    ├── index.css             # Estilos personalizados
    ├── index.js              # Lógica de aplicación
    └── icons/                # Assets PWA multi-resolución
        ├── favicon.ico
        ├── wordzee-32_32.png
        ├── wordzee-64_64.jpg
        ├── wordzee-256_256.webp
        ├── wordzee-512_512.png
        ├── Facebook_f_logo_2019.svg
        └── telegram.png
```

### Clases Principales

#### `BpWordzeeDB`
Gestión completa de IndexedDB con dos stores:
- **`palabras`**: Caché de resultados por combinación de letras
- **`config`**: Almacenamiento de timestamp para sincronización

**Métodos clave:**
```javascript
static async obtenerTimestamp()      // Recupera timestamp de última sincronización
static async guardarTimestamp(ts)    // Actualiza timestamp
static async obtenerPalabras(letras) // Lee del caché
static async guardarPalabras(...)    // Escribe en caché
static async limpiarPalabras()       // Limpia cuando BD remota cambia
```

#### `BpWordzeeClient`
Motor de búsqueda y cálculo de puntuaciones con algoritmos optimizados.

**Métodos principales:**
```javascript
static async buscarPalabras(letras, puntosExtra, ronda, apiUrl)
  └─ 1. Verifica conectividad (navigator.onLine)
  └─ 2. Sincroniza timestamp si online
  └─ 3. Busca en IndexedDB (caché)
  └─ 4. Si no existe, consulta API
  └─ 5. Guarda resultado en caché
  └─ 6. Procesa y ordena palabras

static calcularPuntos(palabra, longitud, puntosExtra, ronda)
  └─ Aplica multiplicadores de letra (DL, TL)
  └─ Aplica multiplicadores de palabra (DP, TP)
  └─ Aplica multiplicador de ronda
  └─ Aplica bonificación por longitud (×2 o ×3)
```

### Flujo de Datos

```
Usuario ingresa letras
         ↓
[BpWordzeeClient.buscarPalabras()]
         ↓
    ¿Online? ────→ Verificar timestamp
         │              ↓
         │         ¿Cambió BD? ──→ Limpiar IndexedDB
         ↓
 Buscar en IndexedDB
         │
    ¿Encontrado? ──No──→ Consultar API ──→ Guardar en IndexedDB
         │                                         │
         Sí                                        │
         └─────────────────────────────────────────┘
                        ↓
              Calcular puntuaciones
                        ↓
              Ordenar y filtrar Top 10
                        ↓
            Mostrar resultados al usuario
```

## 💻 Funcionalidades Técnicas Destacadas

### 1. Sistema de Sincronización
```javascript
// Consulta timestamp de modificación
GET /api/bpwordzee/modificacion
Response: { success: true, data: { timestamp: 1767088612 } }

// Compara con timestamp local
if (timestampRemoto !== timestampLocal) {
  await BpWordzeeDB.limpiarPalabras(); // Invalida caché
}
```

### 2. Estrategia de Caché Inteligente
- **Cache Hit**: Respuesta instantánea desde IndexedDB
- **Cache Miss + Online**: Consulta API → Guarda en caché
- **Offline + Cache Hit**: Funciona sin conexión
- **Offline + Cache Miss**: Error informativo

### 3. Cálculo de Puntuaciones
```javascript
// Ejemplo: "CASA" con DL en 'A', ronda 3
// C(3) + A(1×2×3) + S(1×3) + A(1×3) = 3 + 6 + 3 + 3 = 15 puntos
```

### 4. Validación de Palabras
```javascript
// Verifica que la palabra se pueda formar con letras disponibles
// Maneja correctamente letras repetidas
Letras: [A, B, C, A, D, E, F]
"ABACADA" → ❌ (3 'A' requeridas, solo 2 disponibles)
"ABACAD"  → ✅ (2 'A', correcto)
```

## 🚀 Instalación y Uso

### Requisitos
- Navegador moderno con soporte para:
  - IndexedDB
  - Service Workers
  - Fetch API
  - ES6+ JavaScript

### Despliegue
1. Clonar repositorio (requiere autorización)
2. Configurar endpoint de API en `formularioEnviar()`:
   ```javascript
   const url = 'https://tu-api.com/api/bpwordzee';
   ```
3. Servir desde servidor web con soporte HTTPS (requerido para PWA)

### Uso de la Aplicación

1. **Ingresar letras disponibles** (7 letras)
2. **Configurar bonificadores** (DL, TL, DP, TP) según el tablero
3. **Seleccionar ronda** (1-5)
4. **Buscar palabras** - La app mostrará:
   - Top 10 palabras por longitud (3-7 letras)
   - Puntuación calculada de cada palabra
   - Estado de caché (online/offline)
5. **Clic en palabra** para autocompletar letras en el formulario

### Instalación como PWA

**Android (Chrome/Edge):**
1. Menú → "Instalar aplicación" o "Añadir a pantalla de inicio"

**iOS (Safari):**
1. Compartir → "Añadir a pantalla de inicio"

**Desktop (Chrome/Edge):**
1. Barra de direcciones → Icono de instalación ⊕
2. O: Menú → "Instalar Busca Palabras para Wordzee!"

## 🔧 Configuración Técnica

### Service Worker
```javascript
// sw.js - Estrategia de cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### Web App Manifest
```json
{
  "name": "Busca palabras para Wordzee!",
  "short_name": "BpWordzee",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0dcaf0",
  "icons": [...]
}
```

## 📊 Optimizaciones de Rendimiento

- ⚡ **Caché de IndexedDB**: Respuestas <50ms para búsquedas repetidas
- 🔄 **Lazy Loading**: Carga progresiva de resultados
- 📦 **Bundle mínimo**: Sin dependencias pesadas, vanilla JS
- 🎨 **CSS optimizado**: Bootstrap minimizado + custom CSS ligero
- 🗜️ **Compresión**: Assets optimizados (WebP para imágenes)

## 📈 Roadmap

- [ ] Web Workers para cálculos en background
- [ ] Modo análisis con estadísticas detalladas
- [ ] Histórico de búsquedas con gráficos
- [ ] Compartir resultados en redes sociales
- [ ] Soporte para otros idiomas (EN, FR, DE)
- [ ] Tema personalizable con más opciones de color

## 🤝 Contribución

Debido a la naturaleza propietaria de este proyecto, las contribuciones externas requieren autorización previa. Para propuestas de mejora o reportar bugs:

📧 **Contacto**: angelcafn@gmail.com

Para desarrolladores autorizados:
1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit con mensajes descriptivos
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request con descripción detallada

## 📄 Licencia

**Licencia Propietaria** - Todos los derechos reservados © 2024-2025

No se permite el uso, reproducción, distribución o modificación sin autorización escrita del autor. Ver [LICENSE](LICENSE) para detalles completos.

## 👨‍💻 Autor

**Ángel Miguel Castro Fernández**
- 📧 Email: angelcafn@gmail.com
- 💼 LinkedIn: [Angel Castro](https://linkedin.com/in/angcas)
- 🌐 Portfolio: [angelcastro.es](https://angelcastro.es)

## 🌐 Comunidad BpWordzee!

Únete a la comunidad para estar al día de las novedades:
- 📘 **Facebook**: [Grupo Oficial BpWordzee!](https://www.facebook.com/groups/338600778038469)
- 💬 **Telegram**: [Canal BpWordzee!](https://t.me/wordzee)

## 🏆 Tecnologías Demostradas

Este proyecto demuestra competencias en:

### Frontend Avanzado
- ✅ Progressive Web Apps (PWA)
- ✅ Service Workers & Caché Strategies
- ✅ IndexedDB para persistencia offline
- ✅ Responsive Design (Mobile-First)
- ✅ Vanilla JavaScript ES6+ (Clases, async/await, Promises)
- ✅ Bootstrap 5 con tema dark/light

### Arquitectura & Patrones
- ✅ Arquitectura basada en clases (OOP)
- ✅ Separación de responsabilidades (SoC)
- ✅ Patrón Repository (IndexedDB abstraction)
- ✅ Estrategia Cache-First/Network-First
- ✅ Error handling robusto
- ✅ Código modular y mantenible

### APIs Web Modernas
- ✅ Fetch API
- ✅ IndexedDB API
- ✅ Service Worker API
- ✅ Web App Manifest
- ✅ matchMedia (detección de preferencias)
- ✅ Navigator Online/Offline detection

### Performance & UX
- ✅ Optimización de caché multinivel
- ✅ Funcionalidad offline completa
- ✅ Sincronización inteligente de datos
- ✅ Respuestas instantáneas con caché
- ✅ Feedback visual de estados
- ✅ Instalación PWA nativa

## 📝 Notas de Versión

### v1.0.0 (Diciembre 2025)
- 🎉 **Release inicial**
- ✨ Implementación completa de PWA
- 💾 Sistema de caché con IndexedDB
- 🔄 Sincronización basada en timestamp
- 📱 Soporte offline total
- 🎨 Tema claro/oscuro automático
- 🔍 Motor de búsqueda optimizado
- 📊 Cálculo de puntuaciones avanzado
- 🏆 Top 10 palabras por longitud

## 🙏 Agradecimientos

- **Inspiración**: Juego móvil Wordzee!
- **Comunidad**: Jugadores y testers de Facebook/Telegram
- **Recursos**: MDN Web Docs, W3C Standards
- **Icons**: Diseño personalizado + assets de la comunidad

---

<div align="center">

**¿Te gustó el proyecto?** ⭐ Dale una estrella en GitHub

**¿Necesitas algo similar?** 📧 [Contáctame](mailto:angelcafn@gmail.com)

Desarrollado con ❤️ y ☕ por [Ángel Castro](https://angelcastro.es)

</div>