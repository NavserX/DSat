// ==========================================================================
// 🚀 PANEL DE GESTIÓN - LÓGICA FRONTEND (JavaScript)
// ==========================================================================
// Este archivo es el "cerebro" de la página. Se encarga de hablar con Laravel (nuestro servidor),
// pedirle datos, y pintar la pantalla en consecuencia sin tener que recargar la web.

// --- 1. EL PORTERO DE LA DISCOTECA (Autenticación) ---
// Cuando haces login, Laravel te da una pulsera VIP (el Token).
// Lo primero que hago al cargar la página es mirar si tienes esa pulsera guardada en el navegador.
const token = localStorage.getItem('token');

// Si no tienes pulsera (o te la has quitado), te echo a la pantalla de login directamente.
if (!token) window.location.href = '/';

// --- 2. LOS BOLSILLOS DEL PANTALÓN (Variables Globales) ---
// Guardo aquí los datos que voy a usar todo el rato para no tener que pedírselos a Laravel
// 50 veces por minuto. Es mucho más rápido leer de la memoria del navegador.
let listaClientes = [];         // Para el buscador rápido
let todasLasReparaciones = [];  // Para cargar las tablas y los historiales
let usuarioActual = null;       // Para saber si soy Sergio (Admin) o un Técnico
let piezasTemporales = [];      // Mi "carrito de la compra" virtual antes de cerrar un aviso

// ==========================================================================
// 👤 PERFIL Y ADAPTACIÓN DE INTERFAZ (El Modo Enfoque)
// ==========================================================================

async function cargarPerfilUsuario() {
    try {
        // Le pregunto a Laravel: "¿Quién soy?". Y le enseño mi Token en la cabecera.
        const res = await fetch('/api/me', {
            headers: {
                'Accept': 'application/json', // Escudo anti-errores web
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            usuarioActual = await res.json();
            adaptarInterfazAlRol(); // Como ya sé quién soy, adapto lo que veo en pantalla.
        }
    } catch (error) { console.error("Error cargando perfil", error); }
}

function adaptarInterfazAlRol() {
    // Si la persona que ha entrado tiene el rol de 'tecnico', le aplico el "tijeretazo".
    // Le escondo todo lo que sea de administración para que no rompa nada y se centre en trabajar.
    if (usuarioActual && usuarioActual.rol === 'tecnico') {

        // 1. Le escondo los menús laterales de historial general
        const btnClientes = document.getElementById('btn-menu-clientes');
        const btnTecnicos = document.getElementById('btn-menu-tecnicos');
        if (btnClientes) btnClientes.classList.add('hidden');
        if (btnTecnicos) btnTecnicos.classList.add('hidden');

        // 2. Le escondo el formulario para crear avisos nuevos (eso lo hace el admin)
        const cajaFormulario = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');

        if (cajaFormulario && cajaTabla) {
            cajaFormulario.classList.add('hidden');
            // Como le he quitado el formulario de la izquierda, hago que su tabla ocupe toda la pantalla
            cajaTabla.classList.remove('lg:col-span-2');
            cajaTabla.classList.add('col-span-1', 'lg:col-span-3');
        }

        // 3. Bloqueo los selectores de búsqueda para que no husmee en clientes que no le tocan
        document.getElementById('cliente_search').disabled = true;
        document.getElementById('tecnico_id').disabled = true;

        // 4. Oculto botones de "Crear Cliente" y "Limpiar"
        const btnNuevoCliente = document.querySelector('button[onclick="abrirModalCliente()"]');
        if (btnNuevoCliente) btnNuevoCliente.classList.add('hidden');

        const btnLimpiar = document.querySelector('button[onclick="limpiarFormulario()"]');
        if (btnLimpiar) btnLimpiar.classList.add('hidden');
    }
}

// ==========================================================================
// 🗺️ NAVEGACIÓN SPA (Single Page Application)
// ==========================================================================
// Como esto es una web moderna, NO recargamos la página al cambiar de menú.
// Simplemente escondemos unos bloques <div> y mostramos otros.

function mostrarPantalla(idPantalla, botonClicado) {
    // 1. Busco todas las pantallas y les pongo la clase 'hidden' (esconder)
    document.querySelectorAll('.pantalla-seccion').forEach(div => div.classList.add('hidden'));

    // 2. Busco la pantalla que el usuario quiere ver y le quito el 'hidden'
    document.getElementById(idPantalla).classList.remove('hidden');

    // 3. Pinto de azul el botón del menú que he clicado para saber visualmente dónde estoy
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'border-l-4'); // Le quito el azul a todos
        btn.classList.add('hover:bg-slate-800');           // Les devuelvo su color gris
    });
    botonClicado.classList.remove('hover:bg-slate-800');
    botonClicado.classList.add('bg-blue-600');             // Pinto de azul el actual
}

// Truquito rápido para sacar la fecha de hoy en formato YYYY-MM-DD y ponerla por defecto en los inputs
function setFechaHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_entrada').value = hoy;
}
setFechaHoy();

// ==========================================================================
// 📦 CARGA DE DATOS MAESTROS (Rellenar desplegables al inicio)
// ==========================================================================

async function cargarClientes() {
    try {
        const res = await fetch('/api/clientes', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) listaClientes = await res.json(); // Guardo la lista en el "bolsillo"
    } catch (error) { console.error(error); }
}

async function cargarTecnicos() {
    try {
        const res = await fetch('/api/tecnicos', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const tecnicos = await res.json();
            // Relleno el desplegable del formulario y el del buscador de historial
            const selectForm = document.getElementById('tecnico_id');
            const selectFiltro = document.getElementById('filtro_tecnico_id');
            tecnicos.forEach(t => {
                selectForm.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                selectFiltro.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
            });
        }
    } catch (error) { console.error(error); }
}

async function cargarMarcas() {
    try {
        const res = await fetch('/api/marcas', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const marcas = await res.json();
            const select = document.getElementById('marca_id');
            marcas.forEach(m => select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`);
        }
    } catch (error) { console.error(error); }
}

// ==========================================================================
// 🔍 BUSCADOR DE CLIENTES MÁGICO (Autocompletado)
// ==========================================================================

function filtrarClientes(inputId, dropdownId, callbackSeleccion) {
    // 1. Leo lo que el admin está escribiendo. Lo paso a minúsculas para que no importe cómo lo escriba.
    const query = document.getElementById(inputId).value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ''; // Limpio la lista de sugerencias anterior

    if (query.length < 1) { dropdown.classList.add('hidden'); return; }

    // 2. Filtro mi "bolsillo" buscando coincidencias en el nombre O en el teléfono
    const filtrados = listaClientes.filter(c => c.nombre.toLowerCase().includes(query) || (c.telefono && c.telefono.includes(query)));

    if (filtrados.length === 0) {
        dropdown.innerHTML = '<li class="p-3 text-gray-500 text-sm italic">No se encontraron coincidencias...</li>';
    } else {
        // 3. Dibujo las tarjetitas sugeridas una por una
        filtrados.forEach(c => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-blue-50 cursor-pointer border-b text-gray-800 flex justify-between items-center';
            li.innerHTML = `<div><div class="font-semibold">${c.nombre}</div><div class="text-xs text-gray-500">${c.telefono || 'Sin teléfono'}</div></div>`;

            // 4. Si el admin hace clic en una sugerencia...
            li.onclick = () => {
                document.getElementById(inputId).value = c.nombre; // Pongo el nombre en el input
                dropdown.classList.add('hidden');                  // Escondo la lista
                callbackSeleccion(c);                              // Ejecuto la acción final (cargar mapa, etc)
            };
            dropdown.appendChild(li);
        });
    }
    dropdown.classList.remove('hidden'); // Muestro la lista si hay resultados
}

// Se dispara cuando hago clic en un cliente del buscador para crear un aviso nuevo
function seleccionarClienteReparacion(cliente) {
    document.getElementById('cliente_id').value = cliente.id; // ¡Súper importante! El ID oculto para la BD

    // Muestro la cajita azul debajo del buscador con su teléfono
    const infoDiv = document.getElementById('cliente_info');
    let botonLlamar = cliente.telefono ? `<a href="tel:${cliente.telefono}" class="ml-3 bg-green-500 text-white px-3 py-1 rounded text-xs">📞 Llamar</a>` : '';
    infoDiv.innerHTML = `<p>📞 <strong>Teléfono:</strong> ${cliente.telefono || 'No especificado'} ${botonLlamar}</p><p>🏠 <strong>Dirección:</strong> ${cliente.direccion || 'No especificada'}</p>`;
    infoDiv.classList.remove('hidden');

    // Si el cliente tiene dirección, inyecto la URL en el iFrame de Google Maps y lo muestro
    if (cliente.direccion) mostrarMapaDeTabla(encodeURIComponent(cliente.direccion));
    else document.getElementById('mapa_container').classList.add('hidden');
}

// --- GENERADORES DE HISTORIALES INTERACTIVOS ---

function cargarHistorialCliente(cliente) {
    document.getElementById('titulo_historial_cliente').innerText = `Avisos de: ${cliente.nombre}`;
    const tbody = document.getElementById('tabla-historial-cliente');
    tbody.innerHTML = '';

    // Saco solo los avisos de este cliente específico
    const historial = todasLasReparaciones.filter(rep => rep.cliente_id === cliente.id);

    if(historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No hay historial.</td></tr>`;
    } else {
        historial.forEach(rep => {
            // Prioridad de fechas: 1º Cierre, 2º Entrada, 3º Creación interna.
            let fecha = rep.fecha_cierre || rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            // TRUCO: Convierto todo el objeto de la reparación en un texto cifrado (URI)
            // Esto me permite pasárselo a la función onClick sin que se rompan las comillas dobles o simples.
            const repCodificada = encodeURIComponent(JSON.stringify(rep));

            tbody.innerHTML += `
            <tr class="border-b hover:bg-blue-100 cursor-pointer transition" onclick="verDetalleReparacion('${repCodificada}')">
                <td class="py-3 px-4">${fecha}</td>
                <td class="py-3 px-4"><strong>${rep.marca?.nombre || 'N/A'}</strong></td>
                <td class="py-3 px-4">${rep.tecnico?.nombre || 'N/A'}</td>
                <td class="py-3 px-4 font-semibold text-green-600">${rep.tiempo_total || '-'}</td>
            </tr>`;
        });
    }
    document.getElementById('contenedor_historial_cliente').classList.remove('hidden');
}

// Filtra la pestaña "Historial de Técnicos" usando los tres inputs de arriba (Desplegable y 2 Fechas)
function filtrarHistorialTecnicos() {
    const tecId = document.getElementById('filtro_tecnico_id').value;
    const fechaInicio = document.getElementById('filtro_fecha_inicio').value;
    const fechaFin = document.getElementById('filtro_fecha_fin').value;
    const tbody = document.getElementById('tabla-historial-tecnico');
    tbody.innerHTML = '';

    let filtrados = todasLasReparaciones; // Parto de todo

    // Voy aplicando filtros como si fuera un embudo
    if (tecId) filtrados = filtrados.filter(rep => rep.tecnico_id == tecId);
    if (fechaInicio) filtrados = filtrados.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) >= fechaInicio);
    if (fechaFin) filtrados = filtrados.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) <= fechaFin);

    if(filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">Sin resultados.</td></tr>`;
        return;
    }

    filtrados.forEach(rep => {
        let fecha = rep.fecha_cierre || rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');
        const repCodificada = encodeURIComponent(JSON.stringify(rep));

        tbody.innerHTML += `
        <tr class="border-b hover:bg-blue-100 cursor-pointer transition" onclick="verDetalleReparacion('${repCodificada}')">
            <td class="py-3 px-4">${fecha}</td>
            <td class="py-3 px-4">${rep.tecnico?.nombre || 'N/A'}</td>
            <td class="py-3 px-4">${rep.cliente?.nombre || 'S/N'}</td>
            <td class="py-3 px-4 font-bold text-green-600">${rep.tiempo_total || '-'}</td>
        </tr>`;
    });
}

// Pequeño script de UX: Si el usuario hace clic fuera de las listas de sugerencias, las cierro.
document.addEventListener('click', function(e) {
    ['cliente_dropdown', 'historial_cliente_dropdown'].forEach(id => {
        const el = document.getElementById(id);
        if(el && !el.contains(e.target) && e.target.id !== id.replace('_dropdown', '_search')) el.classList.add('hidden');
    });
});

// Actualiza el iFrame de Google Maps
function mostrarMapaDeTabla(dir) {
    const map = document.getElementById('mapa_container');
    document.getElementById('google_map_iframe').src = `https://maps.google.com/maps?q=$${dir}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    document.getElementById('link_como_llegar').href = `https://maps.google.com/maps?q=$${dir}`;
    map.classList.remove('hidden');
}

// ==========================================================================
// ⚡ ACCIONES RÁPIDAS (Flujo de Trabajo del Técnico)
// ==========================================================================

// Cuando el técnico pulsa el botón "▶️ Coger Aviso" en la bandeja de libres
async function asignarmeAviso(id) {
    const rep = todasLasReparaciones.find(r => r.id === id);
    if (!rep) return;

    // Creo el paquete de actualización. Lo importante aquí es:
    // 1. Le asigno MI id de usuario (`usuarioActual.id`)
    // 2. Lo paso a estado 'en proceso' del tirón.
    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: usuarioActual.id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada || new Date().toISOString().split('T')[0],
        estado: 'en proceso'
    };

    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            cargarReparaciones(); // Recargo las tablas para que desaparezca de "Libres"
            document.getElementById('btn-menu-reparaciones').click();  // Le llevo a su bandeja personal principal
        }
    } catch (error) { console.error(error); }
}

// Cambiar de 'pendiente' a 'en proceso' directamente desde la tabla principal
async function cambiarEstadoRapido(id, nuevoEstado) {
    const rep = todasLasReparaciones.find(r => r.id === id);
    if (!rep) return;

    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: rep.tecnico_id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada,
        estado: nuevoEstado // Aquí inyecto el nuevo estado
    };

    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });
        if (res.ok) cargarReparaciones();
    } catch (error) { console.error(error); }
}

// ==========================================================================
// 🛠️ FINALIZACIÓN (El Modal de Cierre de Parte)
// ==========================================================================

function abrirModalFinalizar(id) {
    document.getElementById('fin_rep_id').value = id;
    document.getElementById('fin_rep_id_display').innerText = id;
    document.getElementById('fin_resolucion').value = '';

    // AUTOCOMPLETADO DE UX: Calculo la fecha y la hora de AHORA MISMO
    // para que el técnico no tenga que teclearlo (a menos que quiera cambiarlo).
    const hoy = new Date().toISOString().split('T')[0];
    const ahora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if(document.getElementById('fin_fecha_cierre')) document.getElementById('fin_fecha_cierre').value = hoy;
    if(document.getElementById('fin_hora_inicio')) document.getElementById('fin_hora_inicio').value = ''; // La de inicio la dejo vacía para que la ponga él
    if(document.getElementById('fin_hora_fin')) document.getElementById('fin_hora_fin').value = ahora;

    // Reseteo mi "carrito" de piezas por si venía de cerrar otro aviso
    piezasTemporales = [];
    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_cant').value = '1';
    dibujarTablaPiezas(); // Borro la tablita visual

    document.getElementById('modal_finalizar').classList.remove('hidden'); // Muestro el Popup
}

function cerrarModalFinalizar() {
    document.getElementById('modal_finalizar').classList.add('hidden');
}

// Mete una pieza en el Array temporal y redibuja la tabla
function agregarPiezaLista() {
    const ref = document.getElementById('add_pieza_ref').value;
    const desc = document.getElementById('add_pieza_desc').value;
    const cant = document.getElementById('add_pieza_cant').value;

    if(!desc) return alert("La descripción de la pieza es obligatoria");

    piezasTemporales.push({ referencia: ref, descripcion: desc, cantidad: cant });

    // Limpio las casillitas por si quiere meter otra
    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_cant').value = '1';

    dibujarTablaPiezas();
}

function eliminarPiezaLista(index) {
    piezasTemporales.splice(index, 1); // Quito el elemento del array usando su posición
    dibujarTablaPiezas();
}

// Simplemente lee el array 'piezasTemporales' e inyecta HTML en la tablita del modal
function dibujarTablaPiezas() {
    const tbody = document.getElementById('lista_piezas_tbody');
    tbody.innerHTML = '';

    if(piezasTemporales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-3 text-gray-400 italic">No se han añadido piezas.</td></tr>`;
        return;
    }

    piezasTemporales.forEach((pieza, index) => {
        tbody.innerHTML += `
        <tr class="border-b bg-white">
            <td class="p-2 text-xs font-mono">${pieza.referencia || 'S/R'}</td>
            <td class="p-2 text-sm">${pieza.descripcion}</td>
            <td class="p-2 text-center font-bold">${pieza.cantidad}</td>
            <td class="p-2 text-center">
                <button onclick="eliminarPiezaLista(${index})" class="text-red-500 hover:text-red-700">❌</button>
            </td>
        </tr>`;
    });
}

// 🚀 EL GRAN BOTÓN VERDE: Envía todo el "Parte de Trabajo" al servidor
async function guardarFinalizacion() {
    const id = document.getElementById('fin_rep_id').value;
    const resolucion = document.getElementById('fin_resolucion').value;

    const h_inicio = document.getElementById('fin_hora_inicio').value;
    const h_fin = document.getElementById('fin_hora_fin').value;
    const f_cierre = document.getElementById('fin_fecha_cierre').value;

    if(!resolucion) return alert("Por favor, describe el trabajo realizado.");
    if(!h_inicio || !h_fin || !f_cierre) return alert("Rellena todos los campos de horario.");

    // --- MAGIA MATEMÁTICA CON LAS HORAS ---
    // JavaScript no sabe restar "14:00" menos "12:00".
    // El truco es pegarles una fecha falsa (2026-01-01) para convertirlos en Objetos de Fecha.
    const inicioDate = new Date(`2026-01-01T${h_inicio}:00`);
    const finDate = new Date(`2026-01-01T${h_fin}:00`);

    // Al restar dos Objetos de Fecha en JS, te devuelve la diferencia en ¡milisegundos!
    const diffMs = finDate - inicioDate;

    if (diffMs < 0) return alert("La hora de salida no puede ser anterior a la de entrada.");

    // Convierto esos milisegundos a horas (dividiendo entre 3.600.000)
    const diffHrs = Math.floor(diffMs / 3600000);
    // Saco el "resto" de las horas y lo convierto a minutos
    const diffMins = Math.round(((diffMs % 3600000) / 60000));

    const tiempoEmpleo = `${diffHrs}h ${diffMins}min`; // Ej: "1h 30min"

    const rep = todasLasReparaciones.find(r => r.id == id);
    if (!rep) return;

    const datos = {
        cliente_id: rep.cliente_id,
        // PARCHE DE SEGURIDAD: Si yo (Admin) cierro un aviso huérfano, me lo asigno a mí mismo
        // para que la base de datos no dé error de "técnico no encontrado".
        tecnico_id: rep.tecnico_id || usuarioActual.id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada,
        estado: 'terminado',
        resolucion_texto: resolucion,
        hora_inicio: h_inicio,
        hora_fin: h_fin,
        fecha_cierre: f_cierre,
        tiempo_total: tiempoEmpleo,
        // CONVERSIÓN: Laravel (MySQL) no entiende de Arrays de JS, así que lo convierto a texto puro (JSON String)
        piezas_utilizadas: JSON.stringify(piezasTemporales)
    };

    // Bloqueo el botón para que el técnico ansioso no lo pulse 3 veces seguidas
    const btn = document.querySelector('#modal_finalizar button.bg-green-600');
    btn.innerText = 'Cerrando...'; btn.disabled = true;

    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            cerrarModalFinalizar();
            cargarReparaciones();
        } else alert("Error al cerrar el aviso.");
    } catch (error) { console.error(error); }
    finally {
        // Pase lo que pase (éxito o error), desbloqueo el botón al terminar
        btn.innerText = 'Cerrar Aviso'; btn.disabled = false;
    }
}

// ==========================================================================
// 🗄️ MOTOR PRINCIPAL DE TABLAS (La madre de todas las funciones)
// ==========================================================================

async function cargarReparaciones() {
    // 1. CONDICIÓN DE PAUSA:
    // Esta tabla se recarga sola cada 10 segundos para ver si un compañero ha subido algo.
    // PERO si estoy en medio de escribir un aviso, o tengo el Modal abierto... cancelo la recarga
    // para que la pantalla no parpadee y me borre lo que estaba escribiendo.
    const editandoId = document.getElementById('rep-id').value;
    const escribiendoDesc = document.getElementById('descripcion').value;
    const modalFinVisible = !document.getElementById('modal_finalizar').classList.contains('hidden');

    if (editandoId || escribiendoDesc.length > 0 || modalFinVisible) return;

    try {
        const res = await fetch('/api/reparaciones', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();
        // Ordeno el array que me devuelve el servidor para que los avisos más nuevos salgan arriba.
        todasLasReparaciones = data.sort((a,b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));

        const tbodyPrincipal = document.getElementById('tabla-reparaciones');
        const tbodyLibres = document.getElementById('tabla-avisos-libres');

        tbodyPrincipal.innerHTML = '';
        if(tbodyLibres) tbodyLibres.innerHTML = '';

        // Reseteo los marcadores superiores
        let pendientes = 0, proceso = 0, terminado = 0;

        todasLasReparaciones.forEach(rep => {
            // Sumo 1 al marcador correspondiente
            if (rep.estado === 'pendiente') pendientes++;
            if (rep.estado === 'en proceso') proceso++;
            if (rep.estado === 'terminado') terminado++;

            let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            // --- TABLA 1: AVISOS LIBRES (La bolsa común) ---
            // Solo pinto la fila aquí si está pendiente Y no tiene a nadie asignado
            if (rep.estado === 'pendiente' && !rep.tecnico_id && tbodyLibres) {
                tbodyLibres.innerHTML += `
                <tr class="hover:bg-yellow-50 transition border-b">
                    <td class="p-4">
                        <span class="font-bold text-blue-600">#${rep.id}</span><br>
                        <span class="text-xs text-gray-500">📅 ${fechaFormateada}</span>
                    </td>
                    <td class="p-4">
                        <span class="font-medium">${rep.cliente?.nombre || 'S/N'}</span><br>
                        <span class="text-xs font-bold text-blue-600">${rep.marca?.nombre || 'S/N'}</span>
                    </td>
                    <td class="p-4 text-xs text-gray-700 max-w-xs">${rep.descripcion || ''}</td>
                    <td class="p-4 text-center">
                        <button onclick="asignarmeAviso(${rep.id})" class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition hover:scale-105">
                            ▶️ Coger Aviso
                        </button>
                    </td>
                </tr>`;
            }

            // --- TABLA 2: BANDEJA DE TRABAJO PRINCIPAL ---
            // Diccionario de colores rápido: Dependiendo de la palabra del estado, le doy clases CSS distintas.
            let color = { pendiente: 'bg-yellow-100 text-yellow-700', "en proceso": 'bg-blue-100 text-blue-700', terminado: 'bg-green-100 text-green-700' }[rep.estado];

            // Cifro el objeto para el botón de editar
            const repCodificada = encodeURIComponent(JSON.stringify(rep));

            let btnMapa = rep.cliente?.direccion ? `<button type="button" onclick="mostrarMapaDeTabla('${encodeURIComponent(rep.cliente.direccion)}')" class="text-green-600 p-2 hover:scale-125 inline-block">📍</button>` : '';
            let btnLlamar = rep.cliente?.telefono ? `<a href="tel:${rep.cliente.telefono}" class="text-blue-500 p-2 hover:scale-125 inline-block">📞</a>` : '';

            // Botones por defecto (Los que vería un Admin con control total)
            let btnBorrar = `<button onclick="borrarReparacion(${rep.id})" class="text-red-500 p-2 hover:scale-125 inline-block">🗑️</button>`;
            let btnEditar = `<button onclick="editarReparacion('${repCodificada}')" class="text-blue-500 p-2 transition hover:scale-125 inline-block" title="Editar">✏️</button>`;
            let btnEstadoRapido = '';

            // --- PERMISOS DE BOTONES SEGÚN EL ROL ---
            if (usuarioActual && usuarioActual.rol === 'tecnico') {
                btnBorrar = ''; btnEditar = ''; // Los técnicos no tocan la administración pura

                if (rep.estado === 'pendiente') {
                    btnEstadoRapido = `<button onclick="cambiarEstadoRapido(${rep.id}, 'en proceso')" class="text-yellow-500 p-2 transition hover:scale-125 inline-block" title="Empezar a trabajar">▶️</button>`;
                } else if (rep.estado === 'en proceso') {
                    btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Marcar como Terminado y añadir Piezas">✅</button>`;
                }
            } else {
                // Si soy ADMIN: Puedo cerrar con el tick verde cualquier aviso que no esté ya terminado
                if (rep.estado !== 'terminado') {
                    btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Finalizar aviso directamente">✅</button>`;
                }
            }

            // Si soy técnico, ignoro los avisos de la bolsa común para que no ensucien mi bandeja principal (ya están en su pestaña propia)
            if(usuarioActual?.rol === 'tecnico' && rep.estado === 'pendiente' && !rep.tecnico_id) return;

            // Bloque HTML dinámico: Solo se dibuja la cajita verde si el aviso está terminado y tiene resolución escrita
            let cajitaResolucion = '';
            if (rep.estado === 'terminado' && rep.resolucion_texto) {
                cajitaResolucion = `
                <div class="mt-2 bg-green-50 p-3 rounded border border-green-200">
                    <span class="block text-[10px] uppercase font-bold text-green-600 mb-1">✔️ Trabajo Realizado (${rep.tiempo_total || '-'}):</span>
                    <span class="text-sm text-gray-800">${rep.resolucion_texto}</span>
                </div>`;
            }

            // Inyectamos la fila en la tabla principal
            tbodyPrincipal.innerHTML += `
            <tr class="hover:bg-blue-50/30 transition">
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">
                    <div class="font-bold text-blue-600 text-base">#${rep.id}</div>
                    <div class="text-gray-500 text-xs mt-1">📅 ${fechaFormateada}</div>
                </td>
                <td class="pt-4 pb-2 px-4 min-w-[200px] align-top">
                    <div class="font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</div>
                    <div class="text-xs mt-1 font-bold ${rep.tecnico_id ? 'text-purple-600' : 'text-gray-400'}">👷 ${rep.tecnico?.nombre || 'Sin asignar'}</div>
                </td>
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${color}">${rep.estado}</span>
                </td>
                <td class="pt-4 pb-2 px-4 text-center whitespace-nowrap align-top">
                    ${btnEstadoRapido}
                    ${btnLlamar}
                    ${btnMapa}
                    ${btnEditar}
                    ${btnBorrar}
                </td>
            </tr>
            <tr class="border-b hover:bg-blue-50/30 transition">
                <td colspan="4" class="px-4 pb-4 pt-1">
                    <div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border w-full">
                        <span class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Avería:</span>
                        ${rep.descripcion ? rep.descripcion.replace(/\n/g, '<br>') : '<span class="italic text-gray-400">Sin descripción...</span>'}
                        ${cajitaResolucion}
                    </div>
                </td>
            </tr>`;
        });

        // Escribo el resultado de los contadores en los "widgets" grandes de arriba
        document.getElementById('stat-pendientes').innerText = pendientes;
        document.getElementById('stat-proceso').innerText = proceso;
        document.getElementById('stat-terminado').innerText = terminado;

        // Bucle Infinito: Si no existe ya, creo un temporizador que lanza esta misma función cada 10.000 ms (10 seg)
        if (!window.intervaloRealTime) {
            window.intervaloRealTime = setInterval(() => {
                const pantallaReparaciones = document.getElementById('pantalla_reparaciones');
                const pantallaLibres = document.getElementById('pantalla_libres');
                // Solo lo recargo si el usuario está mirando las tablas (ahorra recursos si está en otra pestaña)
                if ((pantallaReparaciones && !pantallaReparaciones.classList.contains('hidden')) ||
                    (pantallaLibres && !pantallaLibres.classList.contains('hidden'))) {
                    cargarReparaciones();
                }
            }, 10000);
        }
        filtrarHistorialTecnicos(); // Refresco los historiales por si ha entrado algo nuevo
    } catch (error) { console.error(error); }
}

// Guarda una reparación nueva o actualiza una existente (Formulario lateral izquierdo)
async function guardarReparacion() {
    const id = document.getElementById('rep-id').value;
    const tecnicoSeleccionado = document.getElementById('tecnico_id').value;

    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        tecnico_id: tecnicoSeleccionado === "" ? null : tecnicoSeleccionado, // Permito que sea nulo para mandarlo a Libres
        marca_id: document.getElementById('marca_id').value,
        descripcion: document.getElementById('descripcion').value,
        fecha_entrada: document.getElementById('fecha_entrada').value,
        estado: document.getElementById('estado').value
    };

    if (!datos.cliente_id || !datos.marca_id) return alert('Faltan datos obligatorios.');

    // TRUCO REST: Si el formulario tiene un ID oculto, significa que estoy editando, así que uso la ruta PUT /id.
    // Si el ID está vacío, significa que es nuevo, así que uso la ruta genérica POST.
    const url = id ? `/api/reparaciones/${id}` : '/api/reparaciones';
    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            limpiarFormulario();
            // Si el técnico estaba editando de alguna manera extraña, le quito el panel al terminar.
            if (usuarioActual && usuarioActual.rol === 'tecnico') {
                document.getElementById('caja-formulario-reparacion').classList.add('hidden');
                document.getElementById('caja-tabla-reparaciones').classList.remove('lg:col-span-2');
                document.getElementById('caja-tabla-reparaciones').classList.add('col-span-1', 'lg:col-span-3');
            }
            cargarReparaciones();
        }
    } catch (error) { console.error(error); }
}

function editarReparacion(repCodificada) {
    const rep = JSON.parse(decodeURIComponent(repCodificada));

    // Despliego el panel (por si acaso estuviera oculto)
    if (usuarioActual && usuarioActual.rol === 'tecnico') {
        const cajaForm = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');
        if (cajaForm && cajaTabla) {
            cajaForm.classList.remove('hidden');
            cajaTabla.classList.remove('col-span-1', 'lg:col-span-3');
            cajaTabla.classList.add('lg:col-span-2');
        }
    }

    // Vuelco los datos del objeto en las casillas del formulario lateral
    document.getElementById('form-title').innerText = 'Editar Reparación #' + rep.id;
    document.getElementById('rep-id').value = rep.id; // Clave para que al guardar haga un PUT y no un POST
    if (rep.cliente_id && rep.cliente) seleccionarClienteReparacion(rep.cliente);

    document.getElementById('tecnico_id').value = rep.tecnico_id || '';
    document.getElementById('marca_id').value = rep.marca_id || '';
    document.getElementById('descripcion').value = rep.descripcion || '';
    document.getElementById('estado').value = rep.estado;
    if(rep.fecha_entrada) document.getElementById('fecha_entrada').value = rep.fecha_entrada;

    // Scroll automático: Llevo la pantalla hacia arriba para que el usuario vea el formulario.
    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
}

async function borrarReparacion(id) {
    // Alerta de seguridad del navegador para evitar clics accidentales
    if (!confirm('¿Seguro que deseas borrar este aviso? No hay marcha atrás.')) return;
    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) cargarReparaciones();
    } catch (error) { console.error(error); }
}

function limpiarFormulario() {
    // Vacío todos los inputs y devuelvo el panel lateral a su estado original "Nuevo"
    document.getElementById('form-title').innerText = 'Nueva Reparación';
    document.getElementById('rep-id').value = '';
    document.getElementById('cliente_id').value = '';
    document.getElementById('cliente_search').value = '';
    document.getElementById('cliente_info').classList.add('hidden');
    document.getElementById('mapa_container').classList.add('hidden');
    if (!usuarioActual || usuarioActual.rol !== 'tecnico') document.getElementById('tecnico_id').value = '';
    document.getElementById('marca_id').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('estado').value = 'pendiente';
    setFechaHoy();
}

// ==========================================================================
// 🧑‍💼 CREACIÓN RÁPIDA DE CLIENTES (Fast-Track)
// ==========================================================================
// Un atajo brutal: Crear clientes sin salir de la pantalla de avisos.

function abrirModalCliente() {
    // Truco UX: Si estaba buscando "Juan", le pongo "Juan" ya escrito en el nombre
    document.getElementById('nuevo_cliente_nombre').value = document.getElementById('cliente_search').value;
    document.getElementById('nuevo_cliente_email').value = '';
    document.getElementById('nuevo_cliente_telefono').value = '';
    document.getElementById('nuevo_cliente_direccion').value = '';
    document.getElementById('modal_cliente').classList.remove('hidden');
}

function cerrarModalCliente() { document.getElementById('modal_cliente').classList.add('hidden'); }

async function guardarNuevoCliente() {
    const nombre = document.getElementById('nuevo_cliente_nombre').value;
    const telefono = document.getElementById('nuevo_cliente_telefono').value;
    const direccion = document.getElementById('nuevo_cliente_direccion').value;
    const inputEmail = document.getElementById('nuevo_cliente_email');

    // Parche: Si añades un cliente rápido por teléfono, rara vez te da su email.
    // Como Laravel exige un email único, me invento uno usando los milisegundos de la hora actual.
    const email = (inputEmail && inputEmail.value) ? inputEmail.value : `sin-email-${Date.now()}@cliente.com`;

    if (!nombre) return alert("El nombre es obligatorio.");

    const btn = document.querySelector('#modal_cliente button.bg-green-600');
    btn.innerText = 'Guardando...'; btn.disabled = true;

    try {
        const res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre, telefono, direccion, email })
        });

        if (res.ok) {
            const nuevoCliente = await res.json();
            await cargarClientes(); // Le digo a mi "bolsillo" global que descargue el cliente nuevo
            cerrarModalCliente();

            // ¡Magia final! Como ya lo acabo de crear, lo dejo autoseleccionado en el formulario
            // listo para crearle su primera reparación sin que el admin tenga que hacer nada más.
            seleccionarClienteReparacion(nuevoCliente.id ? nuevoCliente : nuevoCliente.cliente);
            document.getElementById('cliente_search').value = nombre;
        } else {
            alert("Hubo un problema al guardar el cliente.");
        }
    } catch (error) { console.error(error); }
    finally { btn.innerText = 'Guardar Cliente'; btn.disabled = false; }
}

// ==========================================================================
// 📄 HOJA DE SERVICIO INTERACTIVA (El visualizador de Historiales)
// ==========================================================================

function verDetalleReparacion(jsonRep) {
    // Desempaqueto el objeto seguro que mandé desde las filas de la tabla
    const rep = JSON.parse(decodeURIComponent(jsonRep));

    // El sistema de piezas a veces viene como String JSON y a veces como Array directo
    // (dependiendo de cómo lo procese el modelo de Laravel). Aquí lo normalizo para que nunca explote.
    const arrayPiezas = typeof rep.piezas_utilizadas === 'string'
        ? JSON.parse(rep.piezas_utilizadas)
        : (rep.piezas_utilizadas || []);

    // Convierto el Array de piezas en una lista bonita de texto (ej: "- 2x Tornillo (Ref: 443)")
    let htmlPiezas = arrayPiezas.map(p => `- ${p.cantidad}x ${p.descripcion} (Ref: ${p.referencia || 'N/A'})`).join('\n') || 'Ninguna pieza utilizada.';

    // Levanto una alerta nativa del navegador con un diseño estructurado tipo Ticket.
    alert(`🛠️ REPARACIÓN #${rep.id} - ${rep.estado.toUpperCase()}
-------------------------------------------------
🧑‍🔧 Técnico: ${rep.tecnico?.nombre || 'Sin asignar'}
🏢 Cliente: ${rep.cliente?.nombre || 'S/N'}
📅 Fecha de Cierre: ${rep.fecha_cierre || 'No cerrado'}
⏱️ Horario: ${rep.hora_inicio || '--:--'} a ${rep.hora_fin || '--:--'}
⏳ Tiempo Total: ${rep.tiempo_total || 'N/A'}

⚠️ AVERÍA:
${rep.descripcion || 'Sin descripción'}

✅ TRABAJO REALIZADO:
${rep.resolucion_texto || 'Pendiente de resolución'}

🔧 PIEZAS:
${htmlPiezas}
    `);
}

// ==========================================================================
// 🔌 ARRANQUE DEL MOTOR (Iniciador de la app)
// ==========================================================================

function logout() {
    // Rompo la pulsera VIP y echo al usuario a la página inicial
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Esta es la secuencia de encendido. Llama a todas las API para tener la mesa de trabajo lista.
async function iniciarApp() {
    await cargarPerfilUsuario(); // 1º Saber quién soy para pintar la pantalla
    cargarClientes();            // 2º Rellenar bolsillos
    cargarTecnicos();            // 3º ...
    cargarMarcas();              // 4º ...
    cargarReparaciones();        // 5º Traer la bandeja de trabajo viva
}

// ¡Damos el contacto!
iniciarApp();
