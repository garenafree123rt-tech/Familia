# Familia: llamadas con la app cerrada (versión con avisos push)

Ahora, si llamas a alguien que tiene la app cerrada, a su teléfono le llega una **notificación**
("Papá te está llamando"). Al tocarla se abre la app, se conecta y tu llamada, que sigue
timbrando y reintentando hasta 60 segundos, entra sola.

## Qué cambia
- `public/` — la app (index.html, sw.js, manifest, iconos).
- `netlify/functions/push.mjs` — el pequeño servidor que envía los avisos. Crea sus propias claves
  la primera vez y guarda las suscripciones en Netlify Blobs. No tienes que configurar nada.
- `package.json` y `netlify.toml` — le dicen a Netlify cómo publicar todo.

## Publicarla (una sola vez)
Netlify Drop (arrastrar la carpeta) **no sirve** para esto, porque no instala ni publica funciones.
Usa GitHub + Netlify, todo desde el navegador y gratis:

1. Crea una cuenta en https://github.com y un repositorio nuevo (privado está bien).
2. Descomprime este zip y arrastra **el contenido** (carpetas `public` y `netlify`, y los archivos
   `package.json`, `netlify.toml`) a "Upload files" del repositorio. Confirma con "Commit changes".
3. En https://app.netlify.com: **Add new site → Import an existing project → GitHub**, elige el
   repositorio y toca **Deploy** (deja vacío el comando de build). Los nombres de las pantallas
   pueden cambiar.
4. Te dará un enlace nuevo https://algo.netlify.app.

## Pasar a la familia al sitio nuevo
El sitio nuevo tiene otra dirección, así que cada dispositivo debe entrar de nuevo. Puedes reusar tu
grupo: toma el enlace de invitación que ya tenías (lo que va después del `#`) y ponlo detrás de la
dirección nueva. Cada persona lo abre, elige quién es y listo.

## Activar los avisos (cada persona, una vez)
1. Instala la app (Android: botón **Instalar**; iPhone: Safari → Compartir → **Añadir a pantalla de inicio**
   y abrirla desde ese icono. En iPhone los avisos solo funcionan así, con iOS 16.4 o superior).
2. En la pantalla principal toca **Activar avisos de llamada** y acepta el permiso.
3. Prueba: cierra la app en un teléfono y llámalo desde otro.

## Lo que hay que saber
- No suena como una llamada de WhatsApp: llega una notificación que hay que tocar, y la llamada se
  conecta unos segundos después. Un timbre a pantalla completa solo es posible con una app nativa.
- Si la otra persona quitó los permisos de notificaciones, o el teléfono tiene ahorro de batería muy
  agresivo para el navegador, el aviso puede retrasarse. En Android conviene no "forzar detención" la app.
- Si llamas y la otra persona aún no activó los avisos, verás un mensaje que lo indica.
- Los mensajes de chat siguen guardándose solo en cada dispositivo. El servidor de avisos solo guarda
  la suscripción de cada teléfono, nunca llamadas ni mensajes.
- Cualquiera con el enlace del grupo puede entrar; compártelo solo con tu familia.
