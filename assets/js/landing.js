/* Landing de Enosfera: modal de postulación, formulario por perfil y gráfico de comunidades. */
(function () {
  'use strict';

  // Dirección a la que se envían las postulaciones: la URL /exec del script de
  // Google Sheets (ver scripts/google-sheets/Code.gs). Es la misma planilla que la
  // landing anterior; la columna "Landing" distingue el origen si el script la tiene.
  // Para revisar los estados sin enviar nada: agregar ?demo=ok o ?demo=error a la URL.
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwHTuY755yx46cH7XBBysmRcGmWrUHfk3t2IgH54J34weBxGDYqIkGmimZyFfd_MGW8rg/exec';
  var DEMO = new URLSearchParams(location.search).get('demo');

  var MIEMBRO = 'Miembro';
  var PREVENTA = 'Lanzamientos en preventa';
  var PERFILES = [
    ['Anfitrión/a', 'Productores, fincas y proyectos que reciben visitas o presentan productos.'],
    ['Bodega', 'Bodegas que quieren presentar sus vinos y lanzamientos.'],
    ['Profesional del vino', 'Sommeliers, enólogos, docentes y otros profesionales del sector.'],
    ['Comunicador/a', 'Periodistas, divulgadores y creadores de contenido sobre vino.'],
    ['Comercio', 'Vinotecas, restaurantes y otros comercios vinculados al vino.'],
    [MIEMBRO, 'Personas que disfrutan el vino y quieren descubrirlo, aprender y participar.']
  ];
  var OPCIONES = {
    comunidad: ['Estoy empezando', 'Menos de 1.000 personas', '1.000 a 5.000', '5.000 a 20.000', 'Más de 20.000'],
    interesesProyecto: ['Catas presenciales', 'Catas virtuales', 'Visitas', 'Cursos y contenidos', PREVENTA, 'Comunidad'],
    interesesMiembro: ['Catas y degustaciones', 'Visitas a bodegas', 'Cursos y contenidos', PREVENTA, 'Conocer productores y creadores']
  };
  var PROVINCIAS = ['Buenos Aires', 'Ciudad de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'];
  var TEXTOS = {
    proyecto: {
      titulo: 'Presentá tu proyecto y formá parte de Enosfera.',
      intro: 'Queremos conocer quién sos, qué relación tenés con el mundo del vino y qué propuestas te gustaría desarrollar dentro de la comunidad.',
      intereses: '¿Qué propuestas te gustaría desarrollar?',
      boton: 'Enviar postulación',
      nota: 'Postularte es gratuito y no implica ningún compromiso.',
      ok: '¡Recibimos tu postulación!',
      okTexto: 'Vamos a leerla con atención y te responderemos por email o por WhatsApp.'
    },
    miembro: {
      titulo: 'Sumate a la comunidad de Enosfera.',
      intro: 'Contanos qué te interesa del mundo del vino. Te vamos a avisar cuando abramos el ingreso de nuevos miembros.',
      intereses: '¿Qué te interesa del mundo del vino?',
      boton: 'Quiero sumarme',
      nota: 'Sumarte es gratuito y no implica ningún compromiso.',
      ok: '¡Gracias por sumarte!',
      okTexto: 'Te vamos a escribir por email cuando Enosfera abra el ingreso de nuevos miembros.'
    }
  };

  var HINT = '¿Hacés, compartís o disfrutás el vino? Elegí la opción que mejor te describe.';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Gráfico de comunidades ---------- */
  var rings = $('#rings');
  if (rings) {
    var ring = function (cx, cy, r, n, off) {
      for (var i = 0; i < n; i++) {
        var a = off + i * 2 * Math.PI / n;
        var pt = document.createElement('span');
        pt.className = 'pt';
        pt.style.left = Math.round(cx + r * Math.cos(a) - 7) + 'px';
        pt.style.top = Math.round(cy + r * Math.sin(a) - 7) + 'px';
        rings.insertBefore(pt, rings.querySelector('.eno-avatar'));
      }
    };
    ring(240, 215, 112, 11, 0.5);
    ring(86, 84, 64, 6, 0.2);
    ring(400, 92, 64, 6, 1.2);
  }

  /* ---------- Formulario ---------- */
  var modal = $('#modal'), form = $('#form'), success = $('#success');
  var nServer = $('#n-server'), nFields = $('#n-fields'), submitBtn = $('#submit');
  var status = 'idle';
  var modo = 'proyecto';
  var errors = {};
  var opener = null;

  var select = $('#f-prov');
  PROVINCIAS.forEach(function (p) {
    var o = document.createElement('option');
    o.value = p; o.textContent = p;
    select.appendChild(o);
  });

  function crearChips(box, labels, multi, onPick) {
    box.innerHTML = '';
    labels.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip focusable' + (multi ? ' chip--ico' : '');
      b.setAttribute('aria-pressed', 'false');
      b.dataset.value = label;
      if (multi) {
        var i = document.createElement('i');
        i.className = 'eno-icon icon-plus';
        i.setAttribute('aria-hidden', 'true');
        b.appendChild(i);
      }
      b.appendChild(document.createTextNode(label));
      b.addEventListener('click', function () {
        if (multi) setChip(b, b.getAttribute('aria-pressed') !== 'true');
        else $$('.chip', box).forEach(function (c) { setChip(c, c === b); });
        if (onPick) onPick(label);
      });
      box.appendChild(b);
    });
  }

  function setChip(b, on) {
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    var i = b.querySelector('i');
    if (i) i.className = 'eno-icon icon-' + (on ? 'check' : 'plus');
  }
  function picked(key) {
    return $$('[data-chips="' + key + '"] .chip[aria-pressed="true"]').map(function (c) { return c.dataset.value; });
  }
  function pick(key, value, on) {
    var c = $('[data-chips="' + key + '"] .chip[data-value="' + value + '"]');
    if (c) setChip(c, on !== false);
  }

  crearChips($('[data-chips="perfil"]'), PERFILES.map(function (p) { return p[0]; }), false, function (label) {
    clearError('perfil');
    $('#perfil-hint').textContent = PERFILES.filter(function (p) { return p[0] === label; })[0][1];
    setModo(label === MIEMBRO ? 'miembro' : 'proyecto');
  });
  crearChips($('[data-chips="comunidad"]'), OPCIONES.comunidad, false);

  function setModo(m) {
    var cambio = m !== modo;
    modo = m;
    var t = TEXTOS[m];
    $('#m-t').textContent = t.titulo;
    $('#m-intro').textContent = t.intro;
    $('#l-intereses').textContent = t.intereses;
    $('#submit-note').textContent = t.nota;
    $('#l-whatsapp').textContent = m === 'miembro' ? 'WhatsApp (opcional)' : 'WhatsApp';
    $$('[data-only="proyecto"]', form).forEach(function (el) { el.hidden = m === 'miembro'; });
    if (m === 'miembro') { clearError('red'); clearError('whatsapp'); }
    if (cambio || !$('[data-chips="intereses"] .chip')) {
      crearChips($('[data-chips="intereses"]'), m === 'miembro' ? OPCIONES.interesesMiembro : OPCIONES.interesesProyecto, true);
    }
    render();
  }

  function values() {
    var esMiembro = modo === 'miembro';
    return {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      provincia: form.provincia.value,
      tipo: picked('perfil')[0] || '',
      red: esMiembro ? '' : form.red.value.trim(),
      seguidores: esMiembro ? '' : (picked('comunidad')[0] || ''),
      intereses: picked('intereses'),
      preventa: esMiembro ? '' : form.proyecto.value.trim(),
      hoy: esMiembro ? '' : form.hoy.value.trim(),
      acepta: form.acepta.checked,
      landing: 'Enosfera · nocturna',
      sitio: form.sitio.value
    };
  }

  function showError(key, msg) {
    var w = $('[data-field="' + key + '"]', form);
    if (!w) return;
    var out = $('.eno-field__hint, .err', w);
    w.classList.toggle('is-error', !!msg);
    var ctl = $('.ctl', w); if (ctl) ctl.classList.toggle('is-error', !!msg);
    var input = $('input, select', w); if (input && key !== 'perfil') input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    out.textContent = msg || '';
    out.hidden = !msg;
  }
  function clearError(key) {
    if (!errors[key]) return;
    delete errors[key];
    showError(key, '');
    render();
  }

  function render() {
    var ok = status === 'ok';
    var t = TEXTOS[modo];
    form.hidden = ok;
    success.hidden = !ok;
    $('#s-title').textContent = t.ok;
    $('#s-text').textContent = t.okTexto;
    nServer.hidden = status !== 'error';
    nFields.hidden = status === 'error' || Object.keys(errors).length === 0;
    submitBtn.disabled = status === 'sending';
    submitBtn.textContent = status === 'sending' ? 'Enviando…' : status === 'error' ? 'Probá de nuevo' : t.boton;
  }

  ['nombre', 'email', 'whatsapp', 'red'].forEach(function (k) {
    form[k].addEventListener('input', function () { clearError(k); });
  });
  select.addEventListener('change', function () { clearError('provincia'); });
  form.acepta.addEventListener('change', function () { clearError('acepta'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (status === 'sending') return;
    var v = values(), err = {}, esMiembro = modo === 'miembro';
    if (!v.tipo) err.perfil = 'Elegí el perfil que mejor te describe.';
    if (!v.nombre) err.nombre = 'Ingresá tu nombre y apellido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) err.email = 'Revisá el email: parece incompleto.';
    var digitos = v.whatsapp.replace(/\D/g, '').length;
    if ((!esMiembro || digitos > 0) && digitos < 8) err.whatsapp = 'Revisá el número: parece incompleto.';
    if (!v.provincia) err.provincia = 'Elegí tu provincia.';
    if (!esMiembro && !v.red) err.red = 'Ingresá un sitio web o una red social.';
    if (!v.acepta) err.acepta = 'Para continuar, tenés que ser mayor de 18 años y aceptar la política de privacidad.';
    ['perfil', 'nombre', 'email', 'whatsapp', 'provincia', 'red', 'acepta'].forEach(function (k) { showError(k, err[k]); });
    errors = err;
    status = 'idle';
    render();
    if (Object.keys(err).length) { modal.scrollTop = 0; return; }

    status = 'sending';
    render();
    send(v).then(function () { status = 'ok'; }, function () { status = 'error'; }).then(function () {
      render();
      modal.scrollTop = 0;
    });
  });

  function send(v) {
    if (DEMO) {
      return new Promise(function (res, rej) { setTimeout(DEMO === 'error' ? rej : res, 900); });
    }
    if (!ENDPOINT) {
      return new Promise(function (_, rej) { setTimeout(rej, 600); });
    }
    // Apps Script no acepta el preflight de CORS: el JSON viaja como text/plain.
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(v)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (res) { if (!res || res.ok !== true) throw new Error('rechazado'); });
  }

  /* ---------- Modal ---------- */
  function resetForm() {
    form.reset();
    $$('.chip', form).forEach(function (c) { setChip(c, false); });
    Object.keys(errors).forEach(function (k) { showError(k, ''); });
    errors = {};
    status = 'idle';
    $('#perfil-hint').textContent = HINT;
  }

  // origen: 'miembro', 'preventa', 'proyecto' o vacío (botón general del encabezado).
  function open(origen) {
    if (status === 'ok') resetForm();
    if (origen === 'miembro') {
      pick('perfil', MIEMBRO);
      $$('[data-chips="perfil"] .chip').forEach(function (c) { setChip(c, c.dataset.value === MIEMBRO); });
      $('#perfil-hint').textContent = PERFILES[PERFILES.length - 1][1];
      setModo('miembro');
    } else if (origen === 'proyecto' || origen === 'preventa') {
      if (picked('perfil')[0] === MIEMBRO) {
        pick('perfil', MIEMBRO, false);
        $('#perfil-hint').textContent = HINT;
      }
      setModo('proyecto');
      if (origen === 'preventa') pick('intereses', PREVENTA);
    } else {
      setModo(modo);
    }
    render();
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
  }

  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { opener = b; open(b.dataset.open); });
  });
  $$('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { modal.close(); });
  });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', function () { if (opener) opener.focus(); });

  setModo('proyecto');
})();
