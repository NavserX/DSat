// ==========================================================================
// 🛠️ REPARACIONES.JS - MOTOR PRINCIPAL
// ==========================================================================
import { token, AppState, cargarPiezas } from './api.js';
import { mostrarMapaDeTabla, setFechaHoy, obtenerBadgeEstado } from './ui.js';
import { seleccionarClienteReparacion } from './clientes.js';

// --- VARIABLES DE PAGINACIÓN ---
export let filtroEstadoReparaciones = 'pendiente';
export let paginaActualReparaciones = 1;
export const itemsPorPaginaReparaciones = 5;

// --- FUNCIONES DE PAGINACIÓN Y FILTRADO ---
export function filtrarPorEstado(estado) {
    if (filtroEstadoReparaciones === estado) {
        filtroEstadoReparaciones = 'todos';
    } else {
        filtroEstadoReparaciones = estado;
    }
    paginaActualReparaciones = 1;
    renderizarTablaReparaciones();
}

export function cambiarPaginaReparaciones(direccion) {
    paginaActualReparaciones += direccion;
    renderizarTablaReparaciones();
}

// --- HISTORIALES ---
export function cargarHistorialCliente(cliente) {
    AppState.clienteHistorialActual = cliente;
    const divFiltros = document.getElementById('filtros_fechas_cliente');
    if (divFiltros) divFiltros.classList.remove('hidden');
    document.getElementById('titulo_historial_cliente').innerText = `Avisos de: ${cliente.nombre}`;
    aplicarFiltroFechasCliente();
}

export function aplicarFiltroFechasCliente() {
    const cliente = AppState.clienteHistorialActual;
    const tbody = document.getElementById('tabla-historial-cliente');
    if (!tbody) return;

    tbody.innerHTML = '';
    const fechaInicio = document.getElementById('filtro_cli_fecha_inicio').value;
    const fechaFin = document.getElementById('filtro_cli_fecha_fin').value;

    if (!cliente || !fechaInicio || !fechaFin) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500 italic">Selecciona un cliente y define fecha de inicio y fin para ver el historial.</td></tr>`;
        return;
    }

    let historial = AppState.todasLasReparaciones.filter(rep => rep.cliente_id === cliente.id);

    historial = historial.filter(rep => {
        let f = rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10);
        return f >= fechaInicio && f <= fechaFin;
    });

    if(historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No hay historial para este cliente en las fechas indicadas.</td></tr>`;
    } else {
        historial.forEach(rep => {
            let fecha = rep.fecha_cierre || rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');
            const repCodificada = encodeURIComponent(JSON.stringify(rep));

            let btnImprimir = rep.estado === 'terminado'
                ? `<button onclick="generarPDFReparacion('${repCodificada}')" class="text-gray-600 p-1 hover:scale-125 transition ml-2" title="Imprimir">🖨️</button>`
                : '';

            tbody.innerHTML += `
            <tr class="border-b hover:bg-blue-100 transition cursor-pointer">
                <td class="py-3 px-4" onclick="verDetalleReparacion('${repCodificada}')">${fecha}</td>
                <td class="py-3 px-4" onclick="verDetalleReparacion('${repCodificada}')"><strong>${rep.maquina?.modelo || 'Sin máquina'}</strong></td>
                <td class="py-3 px-4" onclick="verDetalleReparacion('${repCodificada}')">${rep.tecnico?.nombre || 'N/A'}</td>
                <td class="py-3 px-4 font-bold flex items-center justify-between">
                    <span onclick="verDetalleReparacion('${repCodificada}')">${obtenerBadgeEstado(rep.estado)}</span>
                    ${btnImprimir}
                </td>
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

    if (!fechaInicio || !fechaFin) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500 italic">Selecciona fecha de inicio y fin para ver el historial del técnico.</td></tr>`;
        return;
    }

    let filtrados = AppState.todasLasReparaciones;

    if (tecId) filtrados = filtrados.filter(rep => rep.tecnico_id == tecId);
    if (fechaInicio) filtrados = filtrados.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) >= fechaInicio);
    if (fechaFin) filtrados = filtrados.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) <= fechaFin);

    if(filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">Sin resultados para los filtros aplicados.</td></tr>`;
        return;
    }

    filtrados.forEach(rep => {
        let fecha = rep.fecha_cierre || rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');
        const repCodificada = encodeURIComponent(JSON.stringify(rep));

        let btnImprimir = rep.estado === 'terminado'
            ? `<button onclick="generarPDFReparacion('${repCodificada}')" class="text-gray-600 p-1 hover:scale-125 transition ml-2" title="Imprimir">🖨️</button>`
            : '';

        tbody.innerHTML += `
        <tr class="border-b hover:bg-blue-100 transition cursor-pointer">
            <td class="py-3 px-4" onclick="verDetalleReparacion('${repCodificada}')">${fecha}</td>
            <td class="py-3 px-4" onclick="verDetalleReparacion('${repCodificada}')">${rep.tecnico?.nombre || 'N/A'}</td>
            <td class="py-3 px-4" onclick="verDetalleReparacion('${repCodificada}')">${rep.cliente?.nombre || 'S/N'}</td>
            <td class="py-3 px-4 font-bold flex items-center justify-between">
                <span onclick="verDetalleReparacion('${repCodificada}')">${obtenerBadgeEstado(rep.estado)}</span>
                ${btnImprimir}
            </td>
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
        maquina_id: rep.maquina_id,
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
            await cargarReparaciones(true);
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
        maquina_id: rep.maquina_id,
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
        if (res.ok) await cargarReparaciones(true);
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
    document.getElementById('add_pieza_desc').readOnly = false;
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
        maquina_id: rep.maquina_id,
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
            await cargarReparaciones(true);
            await cargarPiezas();
        } else alert("Error al cerrar el aviso.");
    } catch (error) { console.error(error); }
    finally { btn.innerText = 'Cerrar Aviso'; btn.disabled = false; }
}

// --- CARGA DE TABLAS Y CRUD ---
export async function cargarReparaciones(forzar = false) {
    const editandoId = document.getElementById('rep-id').value;
    const escribiendoDesc = document.getElementById('descripcion').value;
    const modalFinVisible = !document.getElementById('modal_finalizar').classList.contains('hidden');

    if (!forzar && (editandoId || escribiendoDesc.length > 0 || modalFinVisible)) return;

    try {
        const res = await fetch('/api/reparaciones', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();
        AppState.todasLasReparaciones = data.sort((a,b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));

        // 🛡️ Novedad: Si es técnico, por defecto que vea la pestaña 'En proceso'
        if (!window.filtroInicializado) {
            filtroEstadoReparaciones = (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') ? 'en proceso' : 'pendiente';
            window.filtroInicializado = true;
        }

        let pendientes = 0, proceso = 0, terminado = 0;
        const tbodyLibres = document.getElementById('tabla-avisos-libres');
        if(tbodyLibres) tbodyLibres.innerHTML = '';

        AppState.todasLasReparaciones.forEach(rep => {
            let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            // Llenar tabla de "Avisos Libres"
            if (rep.estado === 'pendiente' && !rep.tecnico_id && tbodyLibres) {
                tbodyLibres.innerHTML += `
                <tr class="hover:bg-yellow-50 transition border-b">
                    <td class="p-4"><span class="font-bold text-blue-600">#${rep.id}</span><br><span class="text-xs text-gray-500">📅 ${fechaFormateada}</span></td>
                    <td class="p-4">
                        <span class="font-medium">${rep.cliente?.nombre || 'S/N'}</span><br>
                        <span class="text-xs font-bold text-blue-600">🖨️ ${rep.maquina?.modelo || 'Sin máquina'}</span>
                    </td>
                    <td class="p-4 text-xs text-gray-700 max-w-xs">${rep.descripcion || ''}</td>
                    <td class="p-4 text-center"><button onclick="asignarmeAviso(${rep.id})" class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition hover:scale-105">▶️ Coger Aviso</button></td>
                </tr>`;
            }

            // 🛡️ Novedad: Filtramos los contadores. Si eres técnico, solo sumas los tuyos.
            const esMio = (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico')
                ? (rep.tecnico_id == AppState.usuarioActual.id)
                : true;

            if (esMio) {
                if (rep.estado === 'pendiente') pendientes++;
                if (rep.estado === 'en proceso') proceso++;
                if (rep.estado === 'terminado') terminado++;
            }
        });

        document.getElementById('stat-pendientes').innerText = pendientes;
        document.getElementById('stat-proceso').innerText = proceso;
        document.getElementById('stat-terminado').innerText = terminado;

        renderizarTablaReparaciones();

        if (!window.intervaloRealTime) {
            window.intervaloRealTime = setInterval(async () => {
                const pRep = document.getElementById('pantalla_reparaciones');
                const pLib = document.getElementById('pantalla_libres');
                const pInv = document.getElementById('pantalla_inventario');
                if ((pRep && !pRep.classList.contains('hidden')) || (pLib && !pLib.classList.contains('hidden')) || (pInv && !pInv.classList.contains('hidden'))) {
                    await cargarReparaciones();
                    await cargarPiezas();
                }
            }, 10000);
        }
        filtrarHistorialTecnicos();
        if (AppState.clienteHistorialActual) aplicarFiltroFechasCliente();
    } catch (error) { console.error(error); }
}

// --- DIBUJAR TABLA (PAGINADA Y FILTRADA) ---
export function renderizarTablaReparaciones() {
    const tbodyPrincipal = document.getElementById('tabla-reparaciones');
    if(!tbodyPrincipal) return;

    tbodyPrincipal.innerHTML = '';

    ['pendiente', 'en proceso', 'terminado'].forEach(estado => {
        const id = `tarjeta-${estado.replace(' ', '-')}`;
        const tarjeta = document.getElementById(id);
        if (tarjeta) {
            if (filtroEstadoReparaciones === estado) {
                tarjeta.classList.add('bg-white/30', 'border-white/50');
                tarjeta.classList.remove('bg-white/10', 'border-transparent');
            } else {
                tarjeta.classList.add('bg-white/10', 'border-transparent');
                tarjeta.classList.remove('bg-white/30', 'border-white/50');
            }
        }
    });

    let filtradas = AppState.todasLasReparaciones;

    // 🛡️ Novedad: El técnico solo ve en su tabla sus propios avisos
    if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
        filtradas = filtradas.filter(rep => rep.tecnico_id == AppState.usuarioActual.id);
    }

    // Filtrar por pestaña pulsada
    if (filtroEstadoReparaciones !== 'todos') {
        filtradas = filtradas.filter(rep => rep.estado === filtroEstadoReparaciones);
    }

    const totalItems = filtradas.length;
    const totalPaginas = Math.ceil(totalItems / itemsPorPaginaReparaciones) || 1;

    if (paginaActualReparaciones > totalPaginas) paginaActualReparaciones = totalPaginas;
    if (paginaActualReparaciones < 1) paginaActualReparaciones = 1;

    const inicio = (paginaActualReparaciones - 1) * itemsPorPaginaReparaciones;
    const fin = inicio + itemsPorPaginaReparaciones;
    const paginadas = filtradas.slice(inicio, fin);

    if (paginadas.length === 0) {
        tbodyPrincipal.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500 italic">No hay avisos para mostrar.</td></tr>`;
    } else {
        paginadas.forEach(rep => {
            let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');
            const repCodificada = encodeURIComponent(JSON.stringify(rep));

            let btnMapa = rep.cliente?.direccion ? `<button type="button" onclick="mostrarMapaDeTabla('${encodeURIComponent(rep.cliente.direccion)}')" class="text-green-600 p-2 hover:scale-125 inline-block">📍</button>` : '';
            let btnLlamar = rep.cliente?.telefono ? `<a href="tel:${rep.cliente.telefono}" class="text-blue-500 p-2 hover:scale-125 inline-block">📞</a>` : '';
            let btnBorrar = `<button onclick="borrarReparacion(${rep.id})" class="text-red-500 p-2 hover:scale-125 inline-block">🗑️</button>`;
            let btnEditar = `<button onclick="editarReparacion('${repCodificada}')" class="text-blue-500 p-2 transition hover:scale-125 inline-block" title="Editar">✏️</button>`;
            let btnEstadoRapido = '';

            let btnImprimir = '';
            if (rep.estado === 'terminado') {
                btnImprimir = `<button onclick="generarPDFReparacion('${repCodificada}')" class="text-gray-600 p-2 hover:scale-125 inline-block" title="Imprimir Parte">🖨️</button>`;
            }

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

            let infoMaquina = rep.maquina_id && rep.maquina ? `<div class="text-xs mt-1 text-teal-600 font-bold">🖨️ ${rep.maquina.modelo}</div>` : '';

            tbodyPrincipal.innerHTML += `
            <tr class="hover:bg-blue-50/30 transition">
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top"><div class="font-bold text-blue-600 text-base">#${rep.id}</div><div class="text-gray-500 text-xs mt-1">📅 ${fechaFormateada}</div></td>
                <td class="pt-4 pb-2 px-4 min-w-[200px] align-top">
                    <div class="font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</div>
                    ${infoMaquina}
                    <div class="text-xs mt-1 font-bold ${rep.tecnico_id ? 'text-purple-600' : 'text-gray-400'}">👷 ${rep.tecnico?.nombre || 'Sin asignar'}</div>
                </td>
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">${obtenerBadgeEstado(rep.estado)}</td>
                <td class="pt-4 pb-2 px-4 text-center whitespace-nowrap align-top">${btnEstadoRapido}${btnLlamar}${btnMapa}${btnImprimir}${btnEditar}${btnBorrar}</td>
            </tr>
            <tr class="border-b hover:bg-blue-50/30 transition">
                <td colspan="4" class="px-4 pb-4 pt-1"><div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border w-full"><span class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Avería:</span>${rep.descripcion ? rep.descripcion.replace(/\n/g, '<br>') : '<span class="italic text-gray-400">Sin descripción...</span>'}${cajitaResolucion}</div></td>
            </tr>`;
        });
    }

    const divPaginacion = document.getElementById('paginacion-reparaciones');
    if (divPaginacion) {
        divPaginacion.classList.remove('hidden');
        let filtroTxt = filtroEstadoReparaciones === 'todos' ? 'TODOS LOS AVISOS' : `AVISOS ${filtroEstadoReparaciones.toUpperCase()}S`;
        document.getElementById('texto-paginacion-rep').innerText = `Página ${paginaActualReparaciones} de ${totalPaginas} - (${totalItems} ${filtroTxt})`;
        document.getElementById('btn-prev-rep').disabled = paginaActualReparaciones === 1;
        document.getElementById('btn-next-rep').disabled = paginaActualReparaciones === totalPaginas;
    }
}

export async function guardarReparacion() {
    const id = document.getElementById('rep-id').value;
    const tecnicoSeleccionado = document.getElementById('tecnico_id').value;
    const maquinaSeleccionada = document.getElementById('reparacion_maquina_id').value;

    // Cambiamos el const por let para poder modificar la fecha si está vacía
    let fechaIngresada = document.getElementById('fecha_entrada').value;
    let estadoSeleccionado = document.getElementById('estado').value;

    if (!document.getElementById('cliente_id').value) return alert('Selecciona un cliente para el aviso.');

    // 🛡️ Novedad: Si la fecha está vacía, le asignamos automáticamente la de hoy
    if (!fechaIngresada) {
        fechaIngresada = new Date().toISOString().split('T')[0];
    }

    // 🛡️ Reglas de estado automáticas
    if (tecnicoSeleccionado === "") {
        estadoSeleccionado = 'pendiente'; // Si no hay técnico, por fuerza es pendiente
    } else {
        // Si le has asignado técnico y estaba en pendiente, pasa a en proceso
        if (estadoSeleccionado === 'pendiente') {
            estadoSeleccionado = 'en proceso';
        }
    }

    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        tecnico_id: tecnicoSeleccionado === "" ? null : tecnicoSeleccionado,
        maquina_id: maquinaSeleccionada === "" ? null : maquinaSeleccionada,
        descripcion: document.getElementById('descripcion').value,
        fecha_entrada: fechaIngresada,
        estado: estadoSeleccionado
    };

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
            await cargarReparaciones(true);
        } else {
            const errorHtml = await res.text();
            console.error("🔥 ERROR DEL SERVIDOR (LARAVEL):", errorHtml);
            alert("El servidor ha rechazado los datos. Revisa la consola (F12) para ver el motivo exacto.");
        }
    } catch (error) { console.error("Fallo de conexión:", error); }
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
    if (rep.cliente_id && rep.cliente) {
        seleccionarClienteReparacion(rep.cliente);
        setTimeout(() => {
            const selectMaq = document.getElementById('reparacion_maquina_id');
            if(selectMaq) selectMaq.value = rep.maquina_id || '';
        }, 10);
    }
    document.getElementById('tecnico_id').value = rep.tecnico_id || '';
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

        if (res.ok) {
            if (document.getElementById('rep-id').value == id) {
                limpiarFormulario();
            }
            await cargarReparaciones(true);
        }
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
    const selectMaquina = document.getElementById('reparacion_maquina_id');
    if(selectMaquina) {
        selectMaquina.innerHTML = '<option value="">Selecciona primero un cliente...</option>';
        selectMaquina.classList.remove('bg-green-50', 'border-green-400');
    }
    document.getElementById('descripcion').value = '';
    document.getElementById('estado').value = 'pendiente';
    setFechaHoy();
}

export function verDetalleReparacion(jsonRep) {
    const rep = JSON.parse(decodeURIComponent(jsonRep));
    const arrayPiezas = typeof rep.piezas_utilizadas === 'string' ? JSON.parse(rep.piezas_utilizadas) : (rep.piezas_utilizadas || []);
    let htmlPiezas = arrayPiezas.map(p => `- ${p.cantidad}x ${p.descripcion} (Ref: ${p.referencia || 'N/A'})`).join('\n') || 'Ninguna pieza utilizada.';
    let stringMaquina = rep.maquina ? `🖨️ Máquina: ${rep.maquina.modelo} (S/N: ${rep.maquina.numero_serie})\n` : '';
    alert(`🛠️ REPARACIÓN #${rep.id} - ${rep.estado.toUpperCase()}
-------------------------------------------------
🧑‍🔧 Técnico: ${rep.tecnico?.nombre || 'Sin asignar'}
🏢 Cliente: ${rep.cliente?.nombre || 'S/N'}
${stringMaquina}📅 Fecha de Cierre: ${rep.fecha_cierre || 'No cerrado'}
⏱️ Horario: ${rep.hora_inicio || '--:--'} a ${rep.hora_fin || '--:--'}
⏳ Tiempo Total: ${rep.tiempo_total || 'N/A'}

⚠️ AVERÍA:
${rep.descripcion || 'Sin descripción'}

✅ TRABAJO REALIZADO:
${rep.resolucion_texto || 'Pendiente de resolución'}

🔧 PIEZAS:
${htmlPiezas}`);
}

export function buscarPiezaModal() {
    const query = document.getElementById('add_pieza_ref').value.toLowerCase();
    const dropdown = document.getElementById('dropdown_piezas_modal');
    dropdown.innerHTML = '';
    if (query.length < 1) { dropdown.classList.add('hidden'); document.getElementById('add_pieza_desc').readOnly = false; return; }
    const filtradas = AppState.listaPiezas.filter(p => p.referencia.toLowerCase().includes(query) || p.descripcion.toLowerCase().includes(query));
    if (filtradas.length === 0) { dropdown.innerHTML = '<li class="p-2 text-gray-500 text-xs italic">No coincidencias.</li>'; document.getElementById('add_pieza_desc').readOnly = false; } else {
        filtradas.forEach(p => {
            const li = document.createElement('li');
            li.className = 'p-2 hover:bg-blue-50 cursor-pointer border-b text-gray-800 flex justify-between items-center';
            li.innerHTML = `<div><span class="font-bold text-xs">${p.referencia}</span> - <span class="text-xs text-gray-600">${p.descripcion}</span></div><div class="text-[10px] font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}">Stock: ${p.stock}</div>`;
            li.onclick = () => { document.getElementById('add_pieza_ref').value = p.referencia; document.getElementById('add_pieza_desc').value = p.descripcion; document.getElementById('add_pieza_desc').readOnly = true; dropdown.classList.add('hidden'); };
            dropdown.appendChild(li);
        });
    }
    dropdown.classList.remove('hidden');
}

export function generarPDFReparacion(repCodificada) {
    const rep = JSON.parse(decodeURIComponent(repCodificada));
    const piezas = typeof rep.piezas_utilizadas === 'string' ? JSON.parse(rep.piezas_utilizadas) : (rep.piezas_utilizadas || []);

    const dominio = window.location.origin;
    const logoUrl = dominio + '/img/logo-web-ofimatica-digital.webp';

    let piezasHTML = '';
    if (piezas.length > 0) {
        piezasHTML = piezas.map(p => `<tr><td>${p.referencia || 'N/A'}</td><td>${p.descripcion}</td><td style="text-align:center">${p.cantidad}</td></tr>`).join('');
    } else {
        piezasHTML = '<tr><td colspan="3" style="text-align:center; color: #999;">No se utilizaron piezas de repuesto</td></tr>';
    }

    const maquinaNombre = rep.maquina ? rep.maquina.modelo + ' (S/N: ' + rep.maquina.numero_serie + ')' : 'Aviso General';
    const fechaCierreVal = rep.fecha_cierre || rep.fecha_entrada;

    const ventimp = window.open(' ', '_blank');
    ventimp.document.write('<html><head><title>Parte #' + rep.id + '</title>');
    ventimp.document.write('<style>body{font-family:sans-serif;padding:40px;color:#333;}.header{display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:10px;}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;}.caja{border:1px solid #e5e7eb;padding:10px;border-radius:5px;}h3{border-left:4px solid #2563eb;padding-left:10px;color:#1e3a8a;}table{width:100%;border-collapse:collapse;}th{background:#f9fafb;text-align:left;padding:8px;border-bottom:1px solid #ddd;}td{padding:8px;border-bottom:1px solid #eee;}.footer{margin-top:50px;display:flex;justify-content:space-between;}.firma{width:200px;border-top:1px solid #333;text-align:center;padding-top:10px;}</style></head><body>');

    ventimp.document.write('<div class="header"><div><img src="' + logoUrl + '" style="max-width: 350px; height: auto;" alt="Digital Soluciones"></div><div style="text-align:right"><h3>PARTE DE TRABAJO</h3><p>Aviso: #' + rep.id + '</p></div></div>');

    ventimp.document.write('<div class="grid"><div class="caja"><strong>Cliente:</strong><br>' + (rep.cliente?.nombre || 'S/N') + '<br>' + (rep.cliente?.direccion || '') + '</div>');
    ventimp.document.write('<div class="caja"><strong>Fecha:</strong> ' + fechaCierreVal + '<br><strong>Técnico:</strong> ' + (rep.tecnico?.nombre || 'N/A') + '</div></div>');

    ventimp.document.write('<p><strong>Máquina:</strong> ' + maquinaNombre + '</p>');
    ventimp.document.write('<h3>Descripción Avería</h3><p>' + (rep.descripcion || 'Sin datos') + '</p>');
    ventimp.document.write('<h3>Trabajo Realizado</h3><p>' + (rep.resolucion_texto || 'Pendiente') + '</p>');
    ventimp.document.write('<p><strong>Tiempo total:</strong> ' + (rep.tiempo_total || '-') + '</p>');

    ventimp.document.write('<h3>Piezas Utilizadas</h3><table><thead><tr><th>Ref</th><th>Descripción</th><th>Cant</th></tr></thead><tbody>' + piezasHTML + '</tbody></table>');

    ventimp.document.write('<div class="footer"><div class="firma">Firma Técnico</div><div class="firma">Firma Cliente</div></div>');

    ventimp.document.write('<script>setTimeout(function(){ window.print(); window.close(); }, 800);</script></body></html>');
    ventimp.document.close();
}
