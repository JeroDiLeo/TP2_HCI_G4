# TRABAJO PRÁCTICO SEGUNDA ENTREGA - Interacción Hombre-Computadora (HCI)

## Gestión de Casas Inteligentes - SmartHome

---

## Integrantes:

- Juan Francisco Palermo
  - mail: juanpalermo@itba.edu.ar
  - Git id: juan43963
  - Legajo: 63014

- Jeronimo Di Leo Muntaner
  - Mail: jdileomuntaner@itba.edu.ar
  - Git id: JeroDiLeo
  - Legajo: 63051

- Mateo Pirola Paulovich
  - Mail: mpirolapaulovich@itba.edu.ar
  - Git id: matepirola
  - Legajo: 62810

- Lucas Rodriguez Nahuel
  - Mail: lrodrigueznahuel@itba.edu.ar
  - Git id: 1ucasrn
  - Legajo: 63335

---

## Requisitos previos

Tener instalado:

- Node.js 24 o superior
- npm 10 o superior
- Git
- Navegador web moderno

Se recomienda usar `nvm` para asegurar la versión correcta de Node:

```bash
nvm install 24
nvm use 24
```

Para verificar las versiones instaladas:

```bash
node -v
npm -v
```

---

## Instalación y configuración del sitio web

### Paso 1 - Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd TP2_HCI_G4
```

### Paso 2 - Instalar dependencias

Desde el directorio raíz del repositorio, ingresar a la carpeta de la aplicación web:

```bash
cd smarthome-hci
npm install
```

### Paso 3 - Configurar variables de entorno

Crear un archivo `.env` dentro de la carpeta `smarthome-hci` con las siguientes variables:

```env
VITE_API_BASE_URL=<URL_BASE_DE_LA_API>
VITE_API_KEY=<API_KEY>
```

Estas variables son necesarias para que el frontend pueda comunicarse con la API.

### Paso 4 - Ejecutar en modo desarrollo

```bash
npm run dev
```

Por defecto, la aplicación queda disponible en:

```text
http://localhost:3000
```

### Paso 5 - Validar el proyecto

Antes de generar la versión final, se recomienda ejecutar:

```bash
npm run type-check
npm run lint
npm run build
```

Estos comandos validan tipos de TypeScript, reglas de linting y generación correcta del build productivo.

### Paso 6 - Generar la versión para producción

```bash
npm run build
```

El resultado se genera en la carpeta:

```text
smarthome-hci/dist/
```

Esa carpeta contiene los archivos estáticos finales que deben subirse al servidor web.

Para verificar localmente el build antes de publicarlo:

```bash
npm run preview
```

Luego abrir en el navegador la URL indicada por la terminal.

### Paso 7 - Configurar en un servidor web

La aplicación es una SPA (Single Page Application), por lo que el servidor debe devolver `index.html` cuando se accede directamente a rutas internas como `/login`, `/homes`, `/rooms` o `/routines`.

Ejemplo de configuración con Nginx:

```nginx
server {
    listen 80;
    server_name ejemplo.com;

    root /var/www/smarthome-hci/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Luego se debe copiar el contenido de `smarthome-hci/dist/` al directorio configurado en el servidor:

```bash
sudo mkdir -p /var/www/smarthome-hci/dist
sudo cp -r smarthome-hci/dist/* /var/www/smarthome-hci/dist/
```

## Navegadores compatibles

Para esta entrega, el sitio web fue desarrollado y validado para navegadores modernos en versiones 140 o superiores:

- Google Chrome 140 o superior
- Microsoft Edge 140 o superior
- Mozilla Firefox 140 o superior

No se garantiza compatibilidad con Internet Explorer, Safari ni con navegadores antiguos que no soporten módulos ES modernos, `import.meta` o funcionalidades actuales de JavaScript y CSS.

---

## Ejecución y funcionalidades

### Registro y correos

Para verificar correctamente el envío y la recepción de los correos correspondientes a las funcionalidades RF1 a RF6 vinculadas a la gestión de usuarios, se deja disponible una cuenta de prueba de Ethereal. Esta cuenta permite consultar los correos generados por el sistema durante la corrección:

- Email: sam28@ethereal.email
- Contraseña: 6TrvQfSbRQmdsCHSTJ


