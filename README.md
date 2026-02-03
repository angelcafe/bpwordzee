# 🎮 BpWordzee - Buscador de Palabras para Wordzee!

[![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-5A0FC8)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

**Progressive Web App** que ayuda a los jugadores de **Wordzee!** a encontrar las palabras de mayor valor mediante búsqueda inteligente y cálculo automático de puntuaciones.

## 🎯 Características Principales

### 🔍 Motor de Búsqueda
- **Búsqueda de palabras válidas** con 7 letras disponibles
- **Cálculo automático de puntuaciones** basado en:
  - Valor base de cada letra
  - Multiplicadores de casilla (DL, TL, DP, TP)
  - Bonificaciones por longitud
  - Multiplicador de ronda (1-5)
- **Top 10 palabras** por longitud ordenadas por puntuación

### 📱 Progressive Web App
- **Instalable** en dispositivos móviles y escritorio
- **Service Worker** con caché de recursos estáticos
- **Web App Manifest** con iconos multi-resolución
- **Recursos cacheados** para carga rápida

### 🎨 Interfaz de Usuario
- **Diseño responsive** con Bootstrap 5
- **Interfaz intuitiva** optimizada para móviles

## 🛠️ Stack Tecnológico

- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados
- **Bootstrap 5** - Framework UI responsive
- **JavaScript ES6+** - Lógica de aplicación
- **Service Worker** - Caché de recursos estáticos
- **REST API** - Endpoint para búsqueda de palabras

## 🏗️ Arquitectura

### Estructura del Proyecto
```
bpwordzee/
├── index.html                # SPA principal
├── sw.js                     # Service Worker
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

## 🚀 Instalación y Uso

### Requisitos
- Navegador moderno con soporte para Service Workers
- Conexión a internet para búsqueda de palabras

### Uso de la Aplicación

1. **Ingresar letras disponibles** (7 letras)
2. **Configurar bonificadores** (DL, TL, DP, TP) según el tablero
3. **Seleccionar ronda** (1-5)
4. **Buscar palabras**
5. **Clic en palabra** para autocompletar

### Instalación como PWA

**Android/Desktop:**
- Usar el botón "Instalar" en la app o el menú del navegador

**iOS:**
- Safari → Compartir → "Añadir a pantalla de inicio"

## 📄 Licencia

**Licencia Propietaria** - Todos los derechos reservados © 2024-2025

No se permite el uso, reproducción, distribución o modificación sin autorización escrita del autor. Ver [LICENSE](LICENSE) para detalles completos.

## 👨‍💻 Autor

**Ángel Miguel Castro Fernández**
- 📧 Email: angelcafn@gmail.com
- 💼 LinkedIn: [Angel Castro](https://linkedin.com/in/angcas)
- 🌐 Portfolio: [angelcastro.es](https://angelcastro.es)

## 🌐 Comunidad BpWordzee!

Únete a la comunidad:
- 📘 **Facebook**: [Grupo Oficial BpWordzee!](https://www.facebook.com/groups/338600778038469)
- 💬 **Telegram**: [Canal BpWordzee!](https://t.me/wordzee)

---

<div align="center">

**¿Necesitas algo similar?** 📧 [Contáctame](mailto:angelcafn@gmail.com)

Desarrollado con ❤️ por [Ángel Castro](https://angelcastro.es)

</div>