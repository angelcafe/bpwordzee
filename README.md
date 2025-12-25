# Busca Palabras para Wordzee!

[![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-blue)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

Una aplicación web progresiva (PWA) diseñada para ayudar a los jugadores de **Wordzee!** a encontrar palabras válidas basadas en letras disponibles y restricciones. Ideal para maximizar puntos en el juego.

## 🚀 Características

- **Búsqueda inteligente de palabras**: Encuentra palabras válidas usando letras disponibles, con soporte para letras obligatorias y posiciones específicas.
- **Puntos extra**: Calcula automáticamente los puntos extra por longitud de palabra (3, 4, 5 letras).
- **Interfaz intuitiva**: Diseño responsive y fácil de usar, optimizado para móviles y escritorio.
- **Instalable como app**: Compatible con PWA, se puede instalar en dispositivos móviles y navegadores compatibles.

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación.
- **CSS3** (Bootstrap): Estilos y diseño responsive.
- **JavaScript** (Vanilla): Lógica de búsqueda de palabras y funcionalidad.
- **Web App Manifest**: Configuración PWA.
- **Apache/.htaccess**: Configuración del servidor para SPA.

## 📋 Requisitos

- Navegador moderno con soporte para PWA (Chrome, Firefox, Safari, Edge).

## 🚀 Instalación y Uso

### Opción 1: Usar Online
1. Visita la URL del proyecto desplegado (ej: `https://angelcastro.es/bpwordzee/`).
2. La app se cargará automáticamente.
3. Para instalar como PWA: En el navegador, haz clic en "Instalar" o "Añadir a pantalla de inicio" (disponible en móviles).

### Opción 2: Ejecutar Localmente
1. Clona el repositorio:
   ```bash
   git clone https://github.com/angelcafe/bpwordzee.git
   cd bpwordzee
   ```

2. Abre `index.html` en un navegador web local (o usa un servidor local como Live Server en VS Code).

3. Para simular un servidor Apache (opcional, para probar .htaccess):
   - Instala XAMPP o similar.
   - Coloca la carpeta en `htdocs` y accede vía `localhost/bpwordzee`.

### Uso de la App
1. **Ingresa letras disponibles**: Escribe las letras que tienes en el campo correspondiente.
2. **Letra obligatoria**: Especifica si hay una letra que debe estar en la palabra.
3. **Posición específica**: Indica posiciones fijas si es necesario.
4. **Busca**: Haz clic en "Buscar" para obtener una lista de palabras válidas.
5. **Puntos extra**: La app calcula automáticamente los puntos por palabras de 3, 4 o 5 letras.
6. **Comparte**: Usa los enlaces a Facebook y Telegram para unirte a la comunidad.

## 📱 Instalación como PWA

La app es una PWA, por lo que puedes instalarla en tu dispositivo:
- **En móvil**: Abre en Chrome/Safari y selecciona "Añadir a pantalla de inicio".
- **En escritorio**: En Chrome, haz clic en el icono de instalación en la barra de direcciones.

Una vez instalada, funciona como una app nativa con icono en el escritorio/inicio.

## 🏗️ Estructura del Proyecto

```
bpwordzee/
├── index.html              # Página principal
├── sw.js                   # Service Worker para cache y offline
├── bpwordzee.webmanifest   # Manifiesto PWA
├── .htaccess               # Configuración Apache para SPA
└── front/
    ├── index.css           # Estilos CSS
    ├── index.js            # Lógica JavaScript
    ├── cargando.gif        # Imagen de carga
    └── icons/              # Iconos PWA
        ├── favicon.ico
        ├── wordzee-32_32.png
        ├── wordzee-64_64.jpg
        ├── wordzee-256_256.webp
        ├── wordzee-512_512.png
        ├── Facebook_f_logo_2019.svg
        └── telegram.png
```

## 🤝 Contribución

Debido a la naturaleza propietaria de este proyecto, las contribuciones externas no se aceptan sin el consentimiento expreso del autor. Si tienes sugerencias o mejoras, contacta directamente al autor en angelcafn@gmail.com.

Para desarrolladores autorizados:
1. Realiza tus cambios en una rama separada.
2. Solicita revisión antes de mergear.

## 📄 Licencia

Este proyecto es **propietario**. Todos los derechos reservados. No se permite el uso, reproducción, distribución, modificación o cualquier otro tipo de explotación de este software sin el consentimiento expreso y por escrito del autor. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto y Comunidad

- **Facebook**: [Grupo de Wordzee!](https://www.facebook.com/groups/338600778038469)
- **Telegram**: [Canal de Wordzee!](https://t.me/wordzee)
- **Autor**: Ángel Miguel Castro Fernández (angelcafn@gmail.com)

## 🔄 Versiones

- **v1.0**: Versión inicial con búsqueda básica y PWA.

## 🙏 Agradecimientos

- Inspirado en el juego Wordzee!.
- Iconos y assets proporcionados por la comunidad.
- Gracias a la comunidad de desarrolladores PWA por las mejores prácticas.

---

¡Disfruta maximizando tus puntos en Wordzee! 🎉