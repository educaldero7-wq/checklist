# App de mantenimiento de escape rooms

Checklist PWA para revisar las salas Tao, Roomions y Velatoria desde un smartphone.

## Abrir la app

Con el servidor local iniciado, abre:

http://127.0.0.1:4174/index.html

Tambien puedes abrir `index.html` directamente en un navegador.

## PWA para iPhone

La app ya incluye:

- `manifest.json`
- `sw.js` con cache offline basico
- iconos PNG en `icons/`
- `apple-touch-icon` para iPhone
- configuracion para Vercel y Netlify

Para instalarla en iPhone:

1. Publica la app en Vercel o Netlify.
2. Abre el enlace publico desde Safari en el iPhone.
3. Pulsa el boton de compartir.
4. Elige `Añadir a pantalla de inicio`.
5. Confirma el nombre `Escape Rooms`.

Importante: en iPhone debe abrirse desde Safari y con un enlace HTTPS publico. Vercel y Netlify ya dan HTTPS automaticamente.

## Uso

- Selecciona la fecha y escribe el nombre del revisor.
- Selecciona el tipo de revision: diaria, semanal o averia detectada.
- Entra en cada sala y marca cada punto como verde, rojo o gris.
- Usa las notas y el campo de foto para incidencias o piezas pendientes.
- Pulsa `Guardar` para registrar la revision en el historial reciente.
- Pulsa `Exportar` para copiar o enviar el resumen al jefe.
- Pulsa el boton superior derecho para entrar en `Vista jefe`.

Clave inicial de jefe: `1234`

## Subir a Vercel

Opcion sencilla con GitHub:

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta al repositorio.
3. Entra en https://vercel.com/new.
4. Conecta tu cuenta de GitHub.
5. Selecciona el repositorio.
6. En `Framework Preset`, elige `Other`.
7. Deja `Build Command` vacio.
8. Deja `Output Directory` vacio o como `.`.
9. Pulsa `Deploy`.
10. Vercel te dara un enlace parecido a `https://tu-app.vercel.app`.

Con ese enlace ya puedes abrir Safari en el iPhone y usar `Añadir a pantalla de inicio`.

## Subir a Netlify

Opcion sencilla sin comandos:

1. Entra en https://app.netlify.com/drop.
2. Arrastra esta carpeta completa a la pantalla de Netlify.
3. Espera a que termine la subida.
4. Netlify te dara un enlace parecido a `https://nombre.netlify.app`.

Opcion con GitHub:

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta al repositorio.
3. Entra en https://app.netlify.com/start.
4. Conecta GitHub y selecciona el repositorio.
5. En `Build command`, deja vacio.
6. En `Publish directory`, escribe `.`.
7. Pulsa `Deploy site`.

Con ese enlace ya puedes abrir Safari en el iPhone y usar `Añadir a pantalla de inicio`.

## Archivos

- `index.html`: estructura de la app.
- `styles.css`: diseno visual responsive.
- `app.js`: logica del checklist, guardado local, exportacion y vista jefe.
- `manifest.json`: configuracion PWA instalable.
- `sw.js`: soporte offline basico.
- `icons/`: iconos de app para Android, iPhone y PWA.
- `vercel.json`: configuracion para Vercel.
- `netlify.toml` y `_headers`: configuracion para Netlify.
