# Enosfera · landing nocturna

Variante visual de la landing de Enosfera con el lenguaje de la "Guía de estilos y animaciones — Landing Twin": bloques negros alternados con gris claro, títulos serif con degradé dorado, naranja solo como acento, botones pill y movimiento con GSAP y Lenis. El contenido es el de la landing [enosfera-ecosistema](https://github.com/lucasfloreslucero-agil/enosfera-ecosistema), sin cambios de texto.

- **Sitio publicado:** https://lucasfloreslucero-agil.github.io/enosfera-nocturna/
- **Publicación:** GitHub Pages desde la rama `main` (raíz). Cada push actualiza el sitio.
- **Estado:** en revisión, con `noindex`.

## Estructura

- `index.html` — la página completa (sitio estático, sin build).
- `assets/css/styles.css` — tokens de la guía (`:root`), componentes, secciones y responsive (991 / 767 / 479 px). El tamaño raíz es fluido: todo está en `rem`.
- `assets/js/motion.js` — Lenis + GSAP (ScrollTrigger y SplitText).
- `assets/js/landing.js` — modal y formulario por perfil (el mismo de enosfera-ecosistema).
- `assets/img/` — fotos de las carpetas de Drive del proyecto.
- `scripts/dev-server.js` — servidor local: `node scripts/dev-server.js` → http://localhost:4328

## Cómo se aplicó la guía

| Guía | En esta landing |
| --- | --- |
| Hero negro con título dorado y video | Título serif con degradé dorado que entra por líneas (SplitText con máscara). En lugar del video, una foto con glow naranja en la base. |
| "Dos lados de la misma moneda" (Lottie) | "Para quién es": caja central con el isotipo unida por líneas naranjas a tres tarjetas (hacen, comparten, disfrutan). Las líneas se dibujan con el scroll. |
| Lista sticky con imágenes en crossfade (`scrub: 0.8`) | "Cómo funciona": tres pasos con imagen que cambia en cada fase. Solo en pantallas de 992 px o más. |
| Story pineada, fondo claro a negro (`scrub: 2`) | "El propósito": cuatro frases que se suceden con blur mientras el fondo pasa de gris a negro. |
| Cards de blog | "Herramientas" y "Qué podés hacer". |
| Cards de prensa (fondo `#0B0B0B`) | "Compras anticipadas": pasos en cards con etiqueta naranja, ejemplo de preventa y comprobante. |
| FAQ en dos columnas | Igual, con flecha que rota. |
| CTA negro con imagen oscura | Cierre con título dorado sobre foto de viñedo muy oscurecida. |
| Reveal `top 90%` + `restart` | Todos los bloques con `data-reveal`. |
| Nav que se esconde al bajar | Igual. |

Diferencias con la guía: la tipografía LT Superior es paga, así que se usan las alternativas que propone la guía (Newsreader, Inter y Geist Mono); GSAP es la 3.13.0 en lugar de la 3.15.

## Accesibilidad y respaldo

- Con "reducir movimiento" activado, o si GSAP no carga, no hay smooth scroll ni pineados: todo el contenido se ve completo y estático.
- El modal frena el smooth scroll mientras está abierto.

## Formulario

Envía a la misma planilla que las otras landings, con `landing: "Enosfera · nocturna"` (el script actual todavía no guarda ese dato). Para probar sin enviar: `?demo=ok` o `?demo=error`.

## Pendientes antes de difundir

Los mismos que enosfera-ecosistema: validación legal de preventas, devoluciones y cargos; documentos legales reales; email y redes oficiales; confirmar el uso de las fotos; sacar `noindex`.
