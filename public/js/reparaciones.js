// ==========================================================================
// REPARACIONES.JS - MOTOR PRINCIPAL
// ==========================================================================
import { token, AppState } from './api.js';
import { mostrarMapaDeTabla, setFechaHoy } from './ui.js';
import { seleccionarClienteReparacion } from './clientes.js';

// --- HISTORIALES ---

// Se llama al hacer clic en el nombre del cliente en el buscador
export function cargarHistorialCliente(cliente) {
    // 1. Me guardo el cliente en el "bolsillo" global
    AppState.clienteHistorialActual = cliente;

    // 2. Muestro los cuadros de fecha que estaban ocultos
    const divFiltros = document.getElementById('filtros_fechas_cliente');
    if (divFiltros) divFiltros.classList.remove('hidden');

    document.getElementById('titulo_historial_cliente').innerText = `Avisos de: ${cliente.nombre}`;

    // 3. Ejecuto el filtro directamente (que por defecto sacará todo porque las fechas están vacías)
    aplicarFiltroFechasCliente();
}

// Lee el cliente actual y las fechas, y pinta la tabla
export function aplicarFiltroFechasCliente() {
    const cliente = AppState.clienteHistorialActual;
    if (!cliente) return; // Si no hay cliente seleccionado, no hago nada

    const tbody = document.getElementById('tabla-historial-cliente');
    if (!tbody) return;

    tbody.innerHTML = '';

    const fechaInicio = document.getElementById('filtro_cli_fecha_inicio').value;
    const fechaFin = document.getElementById('filtro_cli_fecha_fin').value;

    // Primer filtro: Solo los avisos de este cliente
    let historial = AppState.todasLasReparaciones.filter(rep => rep.cliente_id === cliente.id);

    // Segundo filtro: Acotar por fechas
    if (fechaInicio) historial = historial.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) >= fechaInicio);
    if (fechaFin) historial = historial.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) <= fechaFin);

    if(historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No hay historial en este rango de fechas.</td></tr>`;
    } else {
        historial.forEach(rep => {
            let fecha = rep.fecha_cierre || rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');
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

export function filtrarHistorialTecnicos() {
    const tecId = document.getElementById('filtro_tecnico_id').value;
    const fechaInicio = document.getElementById('filtro_fecha_inicio').value;
    const fechaFin = document.getElementById('filtro_fecha_fin').value;
    const tbody = document.getElementById('tabla-historial-tecnico');
    if(!tbody) return;

    tbody.innerHTML = '';

    let filtrados = AppState.todasLasReparaciones;
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

// --- ACCIONES RÁPIDAS ---
export async function asignarmeAviso(id) {
    const rep = AppState.todasLasReparaciones.find(r => r.id === id);
    if (!rep) return;

    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: AppState.usuarioActual.id,
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
            cargarReparaciones();
            document.getElementById('btn-menu-reparaciones').click();
        }
    } catch (error) { console.error(error); }
}

export async function cambiarEstadoRapido(id, nuevoEstado) {
    const rep = AppState.todasLasReparaciones.find(r => r.id === id);
    if (!rep) return;

    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: rep.tecnico_id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada,
        estado: nuevoEstado
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

// --- MODAL DE FINALIZACIÓN ---
export function abrirModalFinalizar(id) {
    document.getElementById('fin_rep_id').value = id;
    document.getElementById('fin_rep_id_display').innerText = id;
    document.getElementById('fin_resolucion').value = '';

    const hoy = new Date().toISOString().split('T')[0];
    const ahora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if(document.getElementById('fin_fecha_cierre')) document.getElementById('fin_fecha_cierre').value = hoy;
    if(document.getElementById('fin_hora_inicio')) document.getElementById('fin_hora_inicio').value = '';
    if(document.getElementById('fin_hora_fin')) document.getElementById('fin_hora_fin').value = ahora;

    AppState.piezasTemporales = [];
    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_cant').value = '1';
    dibujarTablaPiezas();

    document.getElementById('modal_finalizar').classList.remove('hidden');
}

export function cerrarModalFinalizar() {
    document.getElementById('modal_finalizar').classList.add('hidden');
}

export function agregarPiezaLista() {
    const ref = document.getElementById('add_pieza_ref').value;
    const desc = document.getElementById('add_pieza_desc').value;
    const cant = document.getElementById('add_pieza_cant').value;

    if(!desc) return alert("La descripción de la pieza es obligatoria");

    AppState.piezasTemporales.push({ referencia: ref, descripcion: desc, cantidad: cant });
    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_cant').value = '1';

    dibujarTablaPiezas();
}

export function eliminarPiezaLista(index) {
    AppState.piezasTemporales.splice(index, 1);
    dibujarTablaPiezas();
}

export function dibujarTablaPiezas() {
    const tbody = document.getElementById('lista_piezas_tbody');
    tbody.innerHTML = '';

    if(AppState.piezasTemporales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-3 text-gray-400 italic">No se han añadido piezas.</td></tr>`;
        return;
    }

    AppState.piezasTemporales.forEach((pieza, index) => {
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

export async function guardarFinalizacion() {
    const id = document.getElementById('fin_rep_id').value;
    const resolucion = document.getElementById('fin_resolucion').value;

    const h_inicio = document.getElementById('fin_hora_inicio').value;
    const h_fin = document.getElementById('fin_hora_fin').value;
    const f_cierre = document.getElementById('fin_fecha_cierre').value;

    if(!resolucion) return alert("Por favor, describe el trabajo realizado.");
    if(!h_inicio || !h_fin || !f_cierre) return alert("Rellena todos los campos de horario.");

    const inicioDate = new Date(`2026-01-01T${h_inicio}:00`);
    const finDate = new Date(`2026-01-01T${h_fin}:00`);
    const diffMs = finDate - inicioDate;

    if (diffMs < 0) return alert("La hora de salida no puede ser anterior a la de entrada.");

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round(((diffMs % 3600000) / 60000));
    const tiempoEmpleo = `${diffHrs}h ${diffMins}min`;

    const rep = AppState.todasLasReparaciones.find(r => r.id == id);
    if (!rep) return;

    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: rep.tecnico_id || AppState.usuarioActual.id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada,
        estado: 'terminado',
        resolucion_texto: resolucion,
        hora_inicio: h_inicio,
        hora_fin: h_fin,
        fecha_cierre: f_cierre,
        tiempo_total: tiempoEmpleo,
        piezas_utilizadas: JSON.stringify(AppState.piezasTemporales)
    };

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
    finally { btn.innerText = 'Cerrar Aviso'; btn.disabled = false; }
}

// --- CARGA DE TABLAS Y CRUD ---
export async function cargarReparaciones() {
    const editandoId = document.getElementById('rep-id').value;
    const escribiendoDesc = document.getElementById('descripcion').value;
    const modalFinVisible = !document.getElementById('modal_finalizar').classList.contains('hidden');

    if (editandoId || escribiendoDesc.length > 0 || modalFinVisible) return;

    try {
        const res = await fetch('/api/reparaciones', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();
        AppState.todasLasReparaciones = data.sort((a,b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));

        const tbodyPrincipal = document.getElementById('tabla-reparaciones');
        const tbodyLibres = document.getElementById('tabla-avisos-libres');

        if(tbodyPrincipal) tbodyPrincipal.innerHTML = '';
        if(tbodyLibres) tbodyLibres.innerHTML = '';

        let pendientes = 0, proceso = 0, terminado = 0;

        AppState.todasLasReparaciones.forEach(rep => {
            if (rep.estado === 'pendiente') pendientes++;
            if (rep.estado === 'en proceso') proceso++;
            if (rep.estado === 'terminado') terminado++;

            let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            // TABLA LIBRES
            if (rep.estado === 'pendiente' && !rep.tecnico_id && tbodyLibres) {
                tbodyLibres.innerHTML += `
                <tr class="hover:bg-yellow-50 transition border-b">
                    <td class="p-4"><span class="font-bold text-blue-600">#${rep.id}</span><br><span class="text-xs text-gray-500">📅 ${fechaFormateada}</span></td>
                    <td class="p-4"><span class="font-medium">${rep.cliente?.nombre || 'S/N'}</span><br><span class="text-xs font-bold text-blue-600">${rep.marca?.nombre || 'S/N'}</span></td>
                    <td class="p-4 text-xs text-gray-700 max-w-xs">${rep.descripcion || ''}</td>
                    <td class="p-4 text-center"><button onclick="asignarmeAviso(${rep.id})" class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition hover:scale-105">▶️ Coger Aviso</button></td>
                </tr>`;
            }

            // TABLA PRINCIPAL
            let color = { pendiente: 'bg-yellow-100 text-yellow-700', "en proceso": 'bg-blue-100 text-blue-700', terminado: 'bg-green-100 text-green-700' }[rep.estado];
            const repCodificada = encodeURIComponent(JSON.stringify(rep));

            let btnMapa = rep.cliente?.direccion ? `<button type="button" onclick="mostrarMapaDeTabla('${encodeURIComponent(rep.cliente.direccion)}')" class="text-green-600 p-2 hover:scale-125 inline-block">📍</button>` : '';
            let btnLlamar = rep.cliente?.telefono ? `<a href="tel:${rep.cliente.telefono}" class="text-blue-500 p-2 hover:scale-125 inline-block">📞</a>` : '';

            let btnBorrar = `<button onclick="borrarReparacion(${rep.id})" class="text-red-500 p-2 hover:scale-125 inline-block">🗑️</button>`;
            let btnEditar = `<button onclick="editarReparacion('${repCodificada}')" class="text-blue-500 p-2 transition hover:scale-125 inline-block" title="Editar">✏️</button>`;
            let btnEstadoRapido = '';

            if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
                btnBorrar = ''; btnEditar = '';
                if (rep.estado === 'pendiente') btnEstadoRapido = `<button onclick="cambiarEstadoRapido(${rep.id}, 'en proceso')" class="text-yellow-500 p-2 transition hover:scale-125 inline-block" title="Empezar a trabajar">▶️</button>`;
                else if (rep.estado === 'en proceso') btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Marcar como Terminado y añadir Piezas">✅</button>`;
            } else {
                if (rep.estado !== 'terminado') btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Finalizar aviso directamente">✅</button>`;
            }

            if(AppState.usuarioActual?.rol === 'tecnico' && rep.estado === 'pendiente' && !rep.tecnico_id) return;

            let cajitaResolucion = '';
            if (rep.estado === 'terminado' && rep.resolucion_texto) {
                cajitaResolucion = `<div class="mt-2 bg-green-50 p-3 rounded border border-green-200"><span class="block text-[10px] uppercase font-bold text-green-600 mb-1">✔️ Trabajo Realizado (${rep.tiempo_total || '-'}):</span><span class="text-sm text-gray-800">${rep.resolucion_texto}</span></div>`;
            }

            if(tbodyPrincipal) {
                tbodyPrincipal.innerHTML += `
                <tr class="hover:bg-blue-50/30 transition">
                    <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top"><div class="font-bold text-blue-600 text-base">#${rep.id}</div><div class="text-gray-500 text-xs mt-1">📅 ${fechaFormateada}</div></td>
                    <td class="pt-4 pb-2 px-4 min-w-[200px] align-top"><div class="font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</div><div class="text-xs mt-1 font-bold ${rep.tecnico_id ? 'text-purple-600' : 'text-gray-400'}">👷 ${rep.tecnico?.nombre || 'Sin asignar'}</div></td>
                    <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top"><span class="px-3 py-1 rounded-full text-xs font-bold ${color}">${rep.estado}</span></td>
                    <td class="pt-4 pb-2 px-4 text-center whitespace-nowrap align-top">${btnEstadoRapido}${btnLlamar}${btnMapa}${btnEditar}${btnBorrar}</td>
                </tr>
                <tr class="border-b hover:bg-blue-50/30 transition">
                    <td colspan="4" class="px-4 pb-4 pt-1"><div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border w-full"><span class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Avería:</span>${rep.descripcion ? rep.descripcion.replace(/\n/g, '<br>') : '<span class="italic text-gray-400">Sin descripción...</span>'}${cajitaResolucion}</div></td>
                </tr>`;
            }
        });

        document.getElementById('stat-pendientes').innerText = pendientes;
        document.getElementById('stat-proceso').innerText = proceso;
        document.getElementById('stat-terminado').innerText = terminado;

        if (!window.intervaloRealTime) {
            window.intervaloRealTime = setInterval(() => {
                const pantallaReparaciones = document.getElementById('pantalla_reparaciones');
                const pantallaLibres = document.getElementById('pantalla_libres');
                if ((pantallaReparaciones && !pantallaReparaciones.classList.contains('hidden')) ||
                    (pantallaLibres && !pantallaLibres.classList.contains('hidden'))) {
                    cargarReparaciones();
                }
            }, 10000);
        }
        filtrarHistorialTecnicos();

        // Si hay un cliente seleccionado, también refrescamos su historial al recargar reparaciones
        if (AppState.clienteHistorialActual) {
            aplicarFiltroFechasCliente();
        }
    } catch (error) { console.error(error); }
}

export async function guardarReparacion() {
    const id = document.getElementById('rep-id').value;
    const tecnicoSeleccionado = document.getElementById('tecnico_id').value;

    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        tecnico_id: tecnicoSeleccionado === "" ? null : tecnicoSeleccionado,
        marca_id: document.getElementById('marca_id').value,
        descripcion: document.getElementById('descripcion').value,
        fecha_entrada: document.getElementById('fecha_entrada').value,
        estado: document.getElementById('estado').value
    };

    if (!datos.cliente_id || !datos.marca_id) return alert('Faltan datos obligatorios.');

    const url = id ? `/api/reparaciones/${id}` : '/api/reparaciones';
    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            limpiarFormulario();
            if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
                document.getElementById('caja-formulario-reparacion').classList.add('hidden');
                document.getElementById('caja-tabla-reparaciones').classList.remove('lg:col-span-2');
                document.getElementById('caja-tabla-reparaciones').classList.add('col-span-1', 'lg:col-span-3');
            }
            cargarReparaciones();
        }
    } catch (error) { console.error(error); }
}

export function editarReparacion(repCodificada) {
    const rep = JSON.parse(decodeURIComponent(repCodificada));

    if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
        const cajaForm = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');
        if (cajaForm && cajaTabla) {
            cajaForm.classList.remove('hidden');
            cajaTabla.classList.remove('col-span-1', 'lg:col-span-3');
            cajaTabla.classList.add('lg:col-span-2');
        }
    }

    document.getElementById('form-title').innerText = 'Editar Reparación #' + rep.id;
    document.getElementById('rep-id').value = rep.id;
    if (rep.cliente_id && rep.cliente) seleccionarClienteReparacion(rep.cliente);

    document.getElementById('tecnico_id').value = rep.tecnico_id || '';
    document.getElementById('marca_id').value = rep.marca_id || '';
    document.getElementById('descripcion').value = rep.descripcion || '';
    document.getElementById('estado').value = rep.estado;
    if(rep.fecha_entrada) document.getElementById('fecha_entrada').value = rep.fecha_entrada;

    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarReparacion(id) {
    if (!confirm('¿Seguro que deseas borrar este aviso? No hay marcha atrás.')) return;
    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) cargarReparaciones();
    } catch (error) { console.error(error); }
}

export function limpiarFormulario() {
    document.getElementById('form-title').innerText = 'Nueva Reparación';
    document.getElementById('rep-id').value = '';
    document.getElementById('cliente_id').value = '';
    document.getElementById('cliente_search').value = '';
    document.getElementById('cliente_info').classList.add('hidden');
    document.getElementById('mapa_container').classList.add('hidden');
    if (!AppState.usuarioActual || AppState.usuarioActual.rol !== 'tecnico') document.getElementById('tecnico_id').value = '';
    document.getElementById('marca_id').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('estado').value = 'pendiente';
    setFechaHoy();
}

export function verDetalleReparacion(jsonRep) {
    const rep = JSON.parse(decodeURIComponent(jsonRep));
    const arrayPiezas = typeof rep.piezas_utilizadas === 'string' ? JSON.parse(rep.piezas_utilizadas) : (rep.piezas_utilizadas || []);
    let htmlPiezas = arrayPiezas.map(p => `- ${p.cantidad}x ${p.descripcion} (Ref: ${p.referencia || 'N/A'})`).join('\n') || 'Ninguna pieza utilizada.';

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
${htmlPiezas}`);
}
