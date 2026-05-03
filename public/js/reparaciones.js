// ==========================================================================
// MOTOR PRINCIPAL
// ==========================================================================
import { token, AppState, cargarPiezas } from './api.js';
import { mostrarMapaDeTabla, setFechaHoy, obtenerBadgeEstado } from './ui.js';
import { seleccionarClienteReparacion } from './clientes.js';

// --- VARIABLES DE PAGINACION ---
// Uso estas variables para controlar la tabla principal. Guardo en que pestaña estoy (pendiente, en proceso o terminado), en que pagina me encuentro y cuantos avisos quiero ver por pagina de golpe.
export let filtroEstadoReparaciones = 'pendiente';
export let paginaActualReparaciones = 1;
export const itemsPorPaginaReparaciones = 5;

// --- FUNCIONES DE PAGINACION Y FILTRADO ---

export function filtrarPorEstado(estado) {
    // Si pulso el boton del estado en el que ya estoy, lo desactivo y muestro "todos". Si pulso uno diferente, cambio a ese estado. Luego reinicio la pagina a la 1 para no quedarme en una pagina vacia y repinto la tabla.
    if (filtroEstadoReparaciones === estado) {
        filtroEstadoReparaciones = 'todos';
    } else {
        filtroEstadoReparaciones = estado;
    }
    paginaActualReparaciones = 1;
    renderizarTablaReparaciones();
}

export function cambiarPaginaReparaciones(direccion) {
    // Recibo un +1 o un -1 desde los botones de Siguiente o Anterior, se lo sumo a mi pagina actual y vuelvo a dibujar la tabla con los nuevos registros.
    paginaActualReparaciones += direccion;
    renderizarTablaReparaciones();
}

// --- HISTORIALES ---

export function cargarHistorialCliente(cliente) {
    // Me guardo globalmente de que cliente estoy consultando el historial, muestro el bloque de fechas y le aplico el filtro directamente por si ya habia fechas puestas.
    AppState.clienteHistorialActual = cliente;
    const divFiltros = document.getElementById('filtros_fechas_cliente');
    if (divFiltros) divFiltros.classList.remove('hidden');
    document.getElementById('titulo_historial_cliente').innerText = `Avisos de: ${cliente.nombre}`;
    aplicarFiltroFechasCliente();
}

export function aplicarFiltroFechasCliente() {
    // Recupero al cliente y vacio la tabla para prepararla.
    const cliente = AppState.clienteHistorialActual;
    const tbody = document.getElementById('tabla-historial-cliente');
    if (!tbody) return;

    tbody.innerHTML = '';
    const fechaInicio = document.getElementById('filtro_cli_fecha_inicio').value;
    const fechaFin = document.getElementById('filtro_cli_fecha_fin').value;

    // Si falta algun dato, aviso de que tienen que rellenarlo todo antes de buscar.
    if (!cliente || !fechaInicio || !fechaFin) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500 italic">Selecciona un cliente y define fecha de inicio y fin para ver el historial.</td></tr>`;
        return;
    }

    // Busco en mi cajon global de reparaciones solo las que sean de este cliente.
    let historial = AppState.todasLasReparaciones.filter(rep => rep.cliente_id === cliente.id);

    // Vuelvo a filtrar ese resultado quedandome solo con las reparaciones que encajen entre las dos fechas que he puesto. Doy prioridad a la fecha de cierre si existe.
    historial = historial.filter(rep => {
        let f = rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10);
        return f >= fechaInicio && f <= fechaFin;
    });

    if(historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No hay historial para este cliente en las fechas indicadas.</td></tr>`;
    } else {
        // Si tengo resultados, pinto las filas. Si el aviso esta terminado, le pego un boton extra para poder imprimir el PDF del parte de trabajo.
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
    // Funciona casi igual que el de clientes, pero uso los inputs de la pestaña de tecnicos.
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

    // Aplico los filtros en cascada.
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

// --- ACCIONES RAPIDAS ---

export async function asignarmeAviso(id) {
    // Busco el aviso libre y lo actualizo mandandole a la base de datos mi ID de tecnico. Ademas, lo muevo de "pendiente" a "en proceso" de un solo golpe.
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
    // Esta funcion es para avanzar los estados con los botones rapidos de la tabla principal. Reutilizo la misma informacion del aviso, pero piso el estado.
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

// --- MODAL DE FINALIZACION ---

// Variable para el cuadro de firma
let pizarraFirma;

// Función para limpiar la firma si el cliente se equivoca
export function limpiarFirma() {
    if(pizarraFirma) pizarraFirma.clear();
}
window.limpiarFirma = limpiarFirma;

export function abrirModalFinalizar(id) {
    // Preparo el cuadro para cerrar el aviso rellenando la fecha actual y la hora en la que he abierto el modal para ahorrarle teclear al tecnico.
    document.getElementById('fin_rep_id').value = id;
    document.getElementById('fin_rep_id_display').innerText = id;
    document.getElementById('fin_resolucion').value = '';

    const hoy = new Date().toISOString().split('T')[0];
    const ahora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if(document.getElementById('fin_fecha_cierre')) document.getElementById('fin_fecha_cierre').value = hoy;
    if(document.getElementById('fin_hora_inicio')) document.getElementById('fin_hora_inicio').value = '';
    if(document.getElementById('fin_hora_fin')) document.getElementById('fin_hora_fin').value = ahora;

    // Limpio la matriz virtual de piezas de cualquier cierre anterior.
    AppState.piezasTemporales = [];
    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_cant').value = '1';
    dibujarTablaPiezas();

    // Hacemos visible el modal ANTES de calcular el tamaño del lienzo
    document.getElementById('modal_finalizar').classList.remove('hidden');

    // --- INICIO DE MODIFICACIÓN FIRMA ---
    // Inicio el cuadro de firma cada vez que abro el modal
    const canvas = document.getElementById('lienzo_firma');
    if (canvas) {
        // Esto es un truco para evitar firmas borrosas en móviles
        const ratio =  Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);

        if (!pizarraFirma) {
            pizarraFirma = new SignaturePad(canvas, {
                penColor: "rgb(17, 24, 39)",
                backgroundColor: "rgb(249, 250, 251)"
            });
        } else {
            pizarraFirma.clear();
        }
    }
    // --- FIN DE MODIFICACIÓN FIRMA ---

}

export function cerrarModalFinalizar() {
    document.getElementById('modal_finalizar').classList.add('hidden');
}

export function agregarPiezaLista() {
    // Añado la pieza a mi carrito temporal y limpio las casillas por si quiere escanear otra.
    const ref = document.getElementById('add_pieza_ref').value;
    const desc = document.getElementById('add_pieza_desc').value;
    const cant = document.getElementById('add_pieza_cant').value;
    if(!desc) return alert("La descripción de la pieza es obligatoria");

    // Busco en mi almacén global la pieza que acabo de añadir para copiarle su precio. Si es una pieza manual que no esta en la base de datos, le pongo 0 euros.
    const piezaInventario = AppState.listaPiezas.find(p => p.referencia === ref);
    const precio = piezaInventario ? parseFloat(piezaInventario.precio || 0) : 0;

    // Ahora guardo la pieza incluyendo su precio unitario en mi memoria temporal.
    AppState.piezasTemporales.push({ referencia: ref, descripcion: desc, cantidad: cant, precio: precio });

    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_desc').readOnly = false;
    document.getElementById('add_pieza_cant').value = '1';
    dibujarTablaPiezas();
}

export function eliminarPiezaLista(index) {
    // Si meto una pieza mal en el modal, la elimino usando su indice del array.
    AppState.piezasTemporales.splice(index, 1);
    dibujarTablaPiezas();
}

export function dibujarTablaPiezas() {
    // Genero el listado visual de las piezas que estoy a punto de usar en esta reparacion.
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
    // Recojo los datos clave del cierre. Me aseguro de que el tecnico me rellena como soluciono el problema y las horas invertidas.
    const id = document.getElementById('fin_rep_id').value;
    const resolucion = document.getElementById('fin_resolucion').value;
    const h_inicio = document.getElementById('fin_hora_inicio').value;
    const h_fin = document.getElementById('fin_hora_fin').value;
    const f_cierre = document.getElementById('fin_fecha_cierre').value;

    if(!resolucion) return alert("Por favor, describe el trabajo realizado.");
    if(!h_inicio || !h_fin || !f_cierre) return alert("Rellena todos los campos de horario.");

    // Hago el calculo del tiempo total. Transformo las horas de texto a objetos de fecha reales y los resto.
    const inicioDate = new Date(`2026-01-01T${h_inicio}:00`);
    const finDate = new Date(`2026-01-01T${h_fin}:00`);
    const diffMs = finDate - inicioDate;

    // Si la resta es negativa, significa que puso la hora de inicio despues de la de fin, asi que le aviso.
    if (diffMs < 0) return alert("La hora de salida no puede ser anterior a la de entrada.");

    // Saco las horas y los minutos a partir de los milisegundos de diferencia.
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round(((diffMs % 3600000) / 60000));
    const tiempoEmpleo = `${diffHrs}h ${diffMins}min`;

    const rep = AppState.todasLasReparaciones.find(r => r.id == id);
    if (!rep) return;

    // --- INICIO DE MODIFICACIÓN FIRMA ---
    // Extraigo la firma en formato Base64
    let firmaBase64 = null;
    if (pizarraFirma && !pizarraFirma.isEmpty()) {
        firmaBase64 = pizarraFirma.toDataURL("image/png");
    }
    // --- FIN DE MODIFICACIÓN FIRMA ---

    // Empaqueto la peticion completa añadiendo la firma
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
        piezas_utilizadas: JSON.stringify(AppState.piezasTemporales),
        firma_cliente: firmaBase64 // <- AQUÍ ENVIAMOS LA FIRMA
    };

    // Apago el boton para que no le den dobles clics y creen corrupcion de datos.
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
            await cargarPiezas(); // Recargo las piezas por si he consumido stock
        } else alert("Error al cerrar el aviso.");
    } catch (error) { console.error(error); }
    finally { btn.innerText = 'Cerrar Aviso'; btn.disabled = false; }
}

// --- CARGO DE TABLAS Y CRUD ---

export async function cargarReparaciones(forzar = false) {
    // Metodo core de la pantalla. Si estoy escribiendo no la recargo para no borrarme el texto a mi mismo. Si fuerzo la carga, ignoro esto.
    const editandoId = document.getElementById('rep-id').value;
    const escribiendoDesc = document.getElementById('descripcion').value;
    const modalFinVisible = !document.getElementById('modal_finalizar').classList.contains('hidden');

    if (!forzar && (editandoId || escribiendoDesc.length > 0 || modalFinVisible)) return;

    try {
        const res = await fetch('/api/reparaciones', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();

        // Reordeno los avisos cronologicamente para ver primero el mas reciente.
        AppState.todasLasReparaciones = data.sort((a,b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));

        // Si soy tecnico, la primera vez que entro me posiciono automaticamente en la pestaña de "En Proceso" para no ver los huecos en blanco.
        if (!window.filtroInicializado) {
            filtroEstadoReparaciones = (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') ? 'en proceso' : 'pendiente';
            window.filtroInicializado = true;
        }

        let pendientes = 0, proceso = 0, terminado = 0;
        let contadorLibres = 0; // Creo un contador exclusivo para la franja amarilla
        const tbodyLibres = document.getElementById('tabla-avisos-libres');
        if(tbodyLibres) tbodyLibres.innerHTML = '';

        AppState.todasLasReparaciones.forEach(rep => {
            let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            // Lleno primero la bandeja general de avisos huerfanos.
            if (rep.estado === 'pendiente' && !rep.tecnico_id && tbodyLibres) {

                contadorLibres++; // Sumo 1 cada vez que encuentro un aviso suelto

                tbodyLibres.innerHTML += `
                <tr class="hover:bg-yellow-50 transition border-b">
                    <td class="p-4"><span class="font-bold text-blue-600">#${rep.id}</span><br><span class="text-xs text-gray-500">📅 ${fechaFormateada}</span></td>
                    <td class="p-4">
                        <span class="font-medium">${rep.cliente?.nombre || 'S/N'}</span><br>
                        <span class="text-xs font-bold text-blue-600">🖨️ ${rep.maquina?.modelo || 'Sin máquina'}</span>
                    </td>
                    <td class="p-4 text-sm text-gray-700 max-w-xs">${rep.descripcion || ''}</td>
                    <td class="p-4 text-center"><button onclick="asignarmeAviso(${rep.id})" class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition hover:scale-105">▶️ Coger Aviso</button></td>
                </tr>`;
            }

            // Calculo los contadores globales para ponerlos en los widgets de arriba. Si soy tecnico, solo cuento las reparaciones que tengan mi nombre.
            const esMio = (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico')
                ? (rep.tecnico_id == AppState.usuarioActual.id)
                : true;

            // Identifico si es un aviso que esté libre
            const esLibre = (rep.estado === 'pendiente' && !rep.tecnico_id);

            // Si el aviso es mío o si está libre , lo sumo al contador de Pendientes para que el técnico vea el número total.
            if (esMio || esLibre) {
                if (rep.estado === 'pendiente') pendientes++;
            }
            if (esMio) {
                if (rep.estado === 'en proceso') proceso++;
                if (rep.estado === 'terminado') terminado++;
            }
        });

        // Con esta lógica controlo el encendido y apagado de la franja amarilla para la notificación de avisos pendientes
        const btnMenuLibres = document.getElementById('btn-menu-libres');
        if (btnMenuLibres) {
            if (contadorLibres > 0) {
                // Si hay 1 o más, le inyecto las clases de la raya amarilla
                btnMenuLibres.classList.add('border-l-4', 'border-yellow-500');
            } else {
                // Si está a cero, se las arranco para que quede oculto
                btnMenuLibres.classList.remove('border-l-4', 'border-yellow-500');
            }
        }

        document.getElementById('stat-pendientes').innerText = pendientes;
        document.getElementById('stat-proceso').innerText = proceso;
        document.getElementById('stat-terminado').innerText = terminado;

        // Disparo la maquina de dibujado de la tabla, que tiene en cuenta la paginacion.
        renderizarTablaReparaciones();

        // El pulso en segundo plano que vigila los cambios.
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

// --- DIBUJO TABLA (PAGINADA Y FILTRADA) ---

export function renderizarTablaReparaciones() {
    // Localizo el cuerpo de la tabla principal en el HTML. Si no existe, corto la ejecución.
    const tbodyPrincipal = document.getElementById('tabla-reparaciones');
    if(!tbodyPrincipal) return;

    tbodyPrincipal.innerHTML = '';

    // Gestiono el brillo y opacidad de las 3 tarjetas superiores para saber en qué pestaña estoy.
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

    // Filtro para técnicos: Ven sus propios avisos Y los avisos huérfanos pendientes.
    if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
        filtradas = filtradas.filter(rep => rep.tecnico_id == AppState.usuarioActual.id || (!rep.tecnico_id && rep.estado === 'pendiente'));
    }

    if (filtroEstadoReparaciones !== 'todos') {
        filtradas = filtradas.filter(rep => rep.estado === filtroEstadoReparaciones);
    }

    // Lógica matemática para la paginación.
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

            // Preparo todos los iconos estándar.
            let btnMapa = rep.cliente?.direccion ? `<button type="button" onclick="mostrarMapaDeTabla('${encodeURIComponent(rep.cliente.direccion)}')" class="text-green-600 p-2 hover:scale-125 inline-block">📍</button>` : '';
            let btnLlamar = rep.cliente?.telefono ? `<a href="tel:${rep.cliente.telefono}" class="text-blue-500 p-2 hover:scale-125 inline-block">📞</a>` : '';
            let btnBorrar = `<button onclick="borrarReparacion(${rep.id})" class="text-red-500 p-2 hover:scale-125 inline-block">🗑️</button>`;
            let btnEditar = `<button onclick="editarReparacion('${repCodificada}')" class="text-blue-500 p-2 transition hover:scale-125 inline-block" title="Editar">✏️</button>`;
            let btnEstadoRapido = '';

            let btnImprimir = '';
            if (rep.estado === 'terminado') {
                btnImprimir = `<button onclick="generarPDFReparacion('${repCodificada}')" class="text-gray-600 p-2 hover:scale-125 inline-block" title="Imprimir Parte">🖨️</button>`;
            }

            // GESTIÓN DE PERMISOS Y BOTONES PARA EL TÉCNICO
            if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
                btnBorrar = ''; btnEditar = ''; // El técnico no edita ni borra tickets enteros

                if (rep.estado === 'pendiente') {
                    if (!rep.tecnico_id) {
                        // Si el aviso está libre, le inyecto el mismo botón amarillo gigante de la otra pantalla.
                        btnEstadoRapido = `<button onclick="asignarmeAviso(${rep.id})" class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition hover:scale-105 whitespace-nowrap">▶️ Coger Aviso</button>`;

                        // Y cumplo con la regla de "y ya está": le borro el teléfono y el mapa para que solo vea el botón amarillo.
                        btnLlamar = '';
                        btnMapa = '';
                    } else {
                        // Si el aviso ya es suyo, le dejo el botón normal de "Play" para empezarlo, y aquí sí verá el teléfono y el mapa.
                        btnEstadoRapido = `<button onclick="cambiarEstadoRapido(${rep.id}, 'en proceso')" class="text-yellow-500 p-2 transition hover:scale-125 inline-block" title="Empezar a trabajar">▶️</button>`;
                    }
                }
                else if (rep.estado === 'en proceso') {
                    btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Marcar como Terminado y añadir Piezas">✅</button>`;
                }
            } else {
                // Vista del Administrador
                if (rep.estado !== 'terminado') btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Finalizar aviso directamente">✅</button>`;
            }

            let cajitaResolucion = '';
            if (rep.estado === 'terminado' && rep.resolucion_texto) {
                cajitaResolucion = `<div class="mt-2 bg-green-50 p-3 rounded border border-green-200"><span class="block text-[10px] uppercase font-bold text-green-600 mb-1">✔️ Trabajo Realizado (${rep.tiempo_total || '-'}):</span><span class="text-sm text-gray-800">${rep.resolucion_texto}</span></div>`;
            }

            let infoMaquina = rep.maquina_id && rep.maquina ? `<div class="text-xs mt-1 text-teal-600 font-bold">🖨️ ${rep.maquina.modelo}</div>` : '';

            // Construyo las filas HTML usando todo lo que he preparado arriba y las inyecto en la tabla.
            tbodyPrincipal.innerHTML += `
            <tr class="hover:bg-blue-50/30 transition">
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top"><div class="font-bold text-blue-600 text-base">#${rep.id}</div><div class="text-gray-500 text-xs mt-1">📅 ${fechaFormateada}</div></td>
                <td class="pt-4 pb-2 px-4 min-w-[200px] align-top">
                    <div class="font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</div>
                    ${infoMaquina}
                    <div class="text-xs mt-1 font-bold ${rep.tecnico_id ? 'text-purple-600' : 'text-yellow-600'}">👷 ${rep.tecnico?.nombre || 'Sin Asignar'}</div>
                </td>
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">${obtenerBadgeEstado(rep.estado)}</td>
                <td class="pt-4 pb-2 px-4 text-center whitespace-nowrap align-top">${btnEstadoRapido}${btnLlamar}${btnMapa}${btnImprimir}${btnEditar}${btnBorrar}</td>
            </tr>
            <tr class="border-b hover:bg-blue-50/30 transition">
                <td colspan="4" class="px-4 pb-4 pt-1"><div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border w-full"><span class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Avería:</span>${rep.descripcion ? rep.descripcion.replace(/\n/g, '<br>') : '<span class="italic text-gray-400">Sin descripción...</span>'}${cajitaResolucion}</div></td>
            </tr>`;
        });
    }

    // Finalmente, me encargo de la barra de controles de paginación inferior.
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
    // Para guardar recojo los identificadores, incluyendo el de la maquina y el tecnico al que se le ha asignado la averia.
    const id = document.getElementById('rep-id').value;
    const tecnicoSeleccionado = document.getElementById('tecnico_id').value;
    const maquinaSeleccionada = document.getElementById('reparacion_maquina_id').value;

    let fechaIngresada = document.getElementById('fecha_entrada').value;
    let estadoSeleccionado = document.getElementById('estado').value;

    if (!document.getElementById('cliente_id').value) return alert('Selecciona un cliente para el aviso.');

    // Automatismo de fechas. Si deciden crear un parte sobre la marcha sin seleccionar el dia, asumo que es para hoy y autogenero la fecha.
    if (!fechaIngresada) {
        fechaIngresada = new Date().toISOString().split('T')[0];
    }

    // Automatismo de estados. Si lo guardo en blanco va para libre. Si meto un tecnico y estaba pendiente, arranco el motor pasandolo a "en proceso".
    if (tecnicoSeleccionado === "") {
        estadoSeleccionado = 'pendiente';
    } else {
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
            // Truco visual por si el tecnico estaba trasteando en un formulario donde no debia.
            if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
                document.getElementById('caja-formulario-reparacion').classList.add('hidden');
                document.getElementById('caja-tabla-reparaciones').classList.remove('lg:col-span-2');
                document.getElementById('caja-tabla-reparaciones').classList.add('col-span-1', 'lg:col-span-3');
            }
            await cargarReparaciones(true);
        } else {
            // Me he dejado un chivato de errores de servidor en consola por si la base de datos devuelve errores 500.
            const errorHtml = await res.text();
            console.error("🔥 ERROR DEL SERVIDOR (LARAVEL):", errorHtml);
            alert("El servidor ha rechazado los datos. Revisa la consola (F12) para ver el motivo exacto.");
        }
    } catch (error) { console.error("Fallo de conexión:", error); }
}

export function editarReparacion(repCodificada) {
    // Desempaqueto los datos de la reparación que pasé a formato de texto seguro en la tabla.
    const rep = JSON.parse(decodeURIComponent(repCodificada));

    // Como normalmente a los técnicos les oculto el panel izquierdo para dejarles la pantalla limpia, si deciden editar un aviso tengo que volver a hacer visible el formulario y reajustar los anchos de la tabla para que quepan las dos columnas.
    if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
        const cajaForm = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');
        if (cajaForm && cajaTabla) {
            cajaForm.classList.remove('hidden');
            cajaTabla.classList.remove('col-span-1', 'lg:col-span-3');
            cajaTabla.classList.add('lg:col-span-2');
        }
    }

    // Cambio el título para saber de un vistazo en qué número de ticket estoy trabajando.
    document.getElementById('form-title').innerText = 'Editar Reparación #' + rep.id;

    // Este paso es crítico. Guardo el ID de la reparación en un campo oculto. Cuando luego le dé al botón de guardar, mi código comprobará este campo; como tiene un valor, sabrá que tiene que hacer un UPDATE en la base de datos en lugar de crear un aviso nuevo.
    document.getElementById('rep-id').value = rep.id;

    if (rep.cliente_id && rep.cliente) {
        // Escribo manualmente el nombre del cliente en la caja de búsqueda visible para que no se quede en blanco, corrigiendo el problema de interfaz que tenía antes.
        document.getElementById('cliente_search').value = rep.cliente.nombre;

        // Disparo la función estándar que carga su bloque azul de información (teléfono, mapa) y busca sus máquinas.
        seleccionarClienteReparacion(rep.cliente);

        // Le doy al navegador una pausa milimétrica de 10 milisegundos. Como la función de arriba tiene que rellenar el selector de máquinas, le doy tiempo a que termine antes de forzar la selección de la máquina exacta de esta avería.
        setTimeout(() => {
            const selectMaq = document.getElementById('reparacion_maquina_id');
            if(selectMaq) selectMaq.value = rep.maquina_id || '';
        }, 10);
    }

    // Vuelco los datos básicos en sus casillas correspondientes.
    document.getElementById('tecnico_id').value = rep.tecnico_id || '';
    document.getElementById('descripcion').value = rep.descripcion || '';

    // Lógica dinámica de seguridad para el estado "Terminado".
    // Como borré la opción del HTML para que nadie creara avisos terminados de cero, tengo que comprobar si el desplegable la tiene ahora mismo.
    const selectEstado = document.getElementById('estado');
    let existeTerminado = false;
    for (let i = 0; i < selectEstado.options.length; i++) {
        if (selectEstado.options[i].value === 'terminado') existeTerminado = true;
    }

    // Si resulta que estoy editando un aviso que ya estaba facturado y cerrado, y la opción no existe en el desplegable, la fabrico al vuelo mediante Javascript y la inyecto en la lista.
    if (rep.estado === 'terminado' && !existeTerminado) {
        const opt = document.createElement('option');
        opt.value = 'terminado';
        opt.text = 'Terminado';
        selectEstado.appendChild(opt);
    }

    // Gracias al paso anterior, ahora puedo asignarle el estado original al desplegable con total tranquilidad, sin miedo a que el navegador no encuentre la opción y me devuelva el aviso a "pendiente" por error.
    selectEstado.value = rep.estado;

    // Restauro la fecha de entrada original.
    if(rep.fecha_entrada) document.getElementById('fecha_entrada').value = rep.fecha_entrada;

    // Hago que la página haga un scroll suave hacia la parte superior del formulario. Es muy útil si le he dado a editar a un aviso que estaba muy abajo en la tabla, para no tener que subir con la rueda del ratón a mano.
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
            // Si el aviso que acabo de borrar resulta que es el que estaba editando en ese momento en el panel izquierdo, reseteo el panel para evitar corrupcion de datos.
            if (document.getElementById('rep-id').value == id) {
                limpiarFormulario();
            }
            await cargarReparaciones(true);
        }
    } catch (error) { console.error(error); }
}

export function limpiarFormulario() {
    // Vuelvo todos los inputs a su configuracion estandar de inicio.
    document.getElementById('form-title').innerText = 'Nueva Reparación';
    document.getElementById('rep-id').value = '';
    document.getElementById('cliente_id').value = '';
    document.getElementById('cliente_search').value = '';
    document.getElementById('cliente_info').classList.add('hidden');
    document.getElementById('mapa_container').classList.add('hidden');

    if (!AppState.usuarioActual || AppState.usuarioActual.rol !== 'tecnico') document.getElementById('tecnico_id').value = '';

    // Reseteo el desplegable de las maquinas tambien para no mezclar equipos de empresas distintas.
    const selectMaquina = document.getElementById('reparacion_maquina_id');
    if(selectMaquina) {
        selectMaquina.innerHTML = '<option value="">Selecciona primero un cliente...</option>';
        selectMaquina.classList.remove('bg-green-50', 'border-green-400');
    }
    document.getElementById('descripcion').value = '';
    // Limpieza de estado, si inyecte la opcion "Terminado" antes para editar un aviso viejo, ahora que estoy limpiando la pantalla la destruyo para que el proximo aviso nuevo no la tenga.
    const selectEstado = document.getElementById('estado');
    for (let i = 0; i < selectEstado.options.length; i++) {
        if (selectEstado.options[i].value === 'terminado') {
            selectEstado.remove(i);
        }
    }

    // Y lo devuelvo a pendiente por defecto.
    selectEstado.value = 'pendiente';
    setFechaHoy();
}

export function verDetalleReparacion(jsonRep) {
    // Desempaqueto el ticket.
    const rep = JSON.parse(decodeURIComponent(jsonRep));
    const arrayPiezas = typeof rep.piezas_utilizadas === 'string' ? JSON.parse(rep.piezas_utilizadas) : (rep.piezas_utilizadas || []);

    // Preparo los contadores de dinero.
    let costeManoObra = 0;
    let costePiezas = 0;

    // Calculo la mano de obra solo si el aviso tiene horas registradas.
    if (rep.hora_inicio && rep.hora_fin) {
        // Limpio la hora de la base de datos para quitarle los segundos (ej: de "20:00:00" a "20:00")
        const horaInicioLimpia = rep.hora_inicio.substring(0, 5);
        const horaFinLimpia = rep.hora_fin.substring(0, 5);

        // Uso fechas ficticias para que javascript sepa restar las horas correctamente.
        const inicio = new Date(`2026-01-01T${horaInicioLimpia}:00`);
        const fin = new Date(`2026-01-01T${horaFinLimpia}:00`);

        // Saco los minutos totales que ha estado el tecnico.
        let diffMins = Math.round((fin - inicio) / 60000);

        // Si el aviso cruza la medianoche (la resta da negativo), le sumo 24 horas en minutos.
        if (diffMins < 0) {
            diffMins += 24 * 60;
        }

        if (diffMins > 0) {
            // Regla de negocio: la primera hora (o fraccion) siempre son 70€.
            costeManoObra = 70;

            // Si se pasa de 60 minutos, le cobramos los bloques extra.
            if (diffMins > 60) {
                const minutosExtra = diffMins - 60;
                // Uso Math.ceil para redondear siempre hacia arriba. Si esta 1 minuto extra, le cobra el bloque entero de 30 mins.
                costeManoObra += Math.ceil(minutosExtra / 30) * 35;
            }
        }
    }

    // Calculo el coste de las piezas iterando sobre el carrito.
    let htmlPiezas = '';
    if (arrayPiezas.length > 0) {
        htmlPiezas = arrayPiezas.map(p => {
            const precioUnitario = parseFloat(p.precio) || 0;
            const subtotalPieza = precioUnitario * parseInt(p.cantidad);
            costePiezas += subtotalPieza;
            return `- ${p.cantidad}x ${p.descripcion} (Ref: ${p.referencia || 'N/A'}) = ${subtotalPieza.toFixed(2)}€`;
        }).join('\n');
    } else {
        htmlPiezas = 'Ninguna pieza utilizada.';
    }

    const totalFactura = costeManoObra + costePiezas;
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
${htmlPiezas}

💶 Desglose de Costes:
   - Mano de obra: ${costeManoObra.toFixed(2)}€
   - Piezas: ${costePiezas.toFixed(2)}€
-------------------------------------------------
💰 TOTAL ESTIMADO: ${totalFactura.toFixed(2)}€
    `);
}

export function buscarPiezaModal() {
    // Este buscador vive dentro del modal de cierre. Filtra sobre el inventario local segun lo que voy escribiendo en la casilla de referencia.
    const query = document.getElementById('add_pieza_ref').value.toLowerCase();
    const dropdown = document.getElementById('dropdown_piezas_modal');
    dropdown.innerHTML = '';

    // Si me arrepiento y borro, oculto el panel de resultados predictivos y me aseguro de que el input de descripcion vuelva a ser editable.
    if (query.length < 1) { dropdown.classList.add('hidden'); document.getElementById('add_pieza_desc').readOnly = false; return; }

    const filtradas = AppState.listaPiezas.filter(p => p.referencia.toLowerCase().includes(query) || p.descripcion.toLowerCase().includes(query));

    if (filtradas.length === 0) {
        dropdown.innerHTML = '<li class="p-2 text-gray-500 text-xs italic">No coincidencias.</li>';
        document.getElementById('add_pieza_desc').readOnly = false;
    } else {
        filtradas.forEach(p => {
            const li = document.createElement('li');
            li.className = 'p-2 hover:bg-blue-50 cursor-pointer border-b text-gray-800 flex justify-between items-center';

            // Visualmente separo quien tiene stock en verde y quien no en rojo.
            li.innerHTML = `<div><span class="font-bold text-xs">${p.referencia}</span> - <span class="text-xs text-gray-600">${p.descripcion}</span></div><div class="text-[10px] font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}">Stock: ${p.stock}</div>`;

            li.onclick = () => {
                document.getElementById('add_pieza_ref').value = p.referencia;
                document.getElementById('add_pieza_desc').value = p.descripcion;
                // Bloqueo el cuadro descripcion para evitar estropear la semantica de la pieza en base de datos.
                document.getElementById('add_pieza_desc').readOnly = true;
                dropdown.classList.add('hidden');
            };
            dropdown.appendChild(li);
        });
    }
    dropdown.classList.remove('hidden');
}

export function generarPDFReparacion(repCodificada) {
    // Creo el informe final. Decodifico el objeto y me quedo con sus componentes.
    const rep = JSON.parse(decodeURIComponent(repCodificada));
    const piezas = typeof rep.piezas_utilizadas === 'string' ? JSON.parse(rep.piezas_utilizadas) : (rep.piezas_utilizadas || []);

    const dominio = window.location.origin;
    const logoUrl = dominio + '/img/logo-web-ofimatica-digital.webp';

    // Contadores de dinero para el PDF
    let costeManoObra = 0;
    let costePiezas = 0;

    // Calculo de mano de obra
    if (rep.hora_inicio && rep.hora_fin) {
        const horaInicioLimpia = rep.hora_inicio.substring(0, 5);
        const horaFinLimpia = rep.hora_fin.substring(0, 5);

        const inicio = new Date(`2026-01-01T${horaInicioLimpia}:00`);
        const fin = new Date(`2026-01-01T${horaFinLimpia}:00`);
        let diffMins = Math.round((fin - inicio) / 60000);

        if (diffMins < 0) {
            diffMins += 24 * 60;
        }

        if (diffMins > 0) {
            costeManoObra = 70;
            if (diffMins > 60) {
                costeManoObra += Math.ceil((diffMins - 60) / 30) * 35;
            }
        }
    }

    // Calculo y pintado de piezas
    let piezasHTML = '';
    if (piezas.length > 0) {
        piezasHTML = piezas.map(p => {
            const precioUnitario = parseFloat(p.precio) || 0;
            const subtotalPieza = precioUnitario * parseInt(p.cantidad);
            costePiezas += subtotalPieza;
            return `<tr><td>${p.referencia || 'N/A'}</td><td>${p.descripcion}</td><td style="text-align:center">${p.cantidad}</td><td style="text-align:right">${precioUnitario.toFixed(2)} €</td><td style="text-align:right">${subtotalPieza.toFixed(2)} €</td></tr>`;
        }).join('');
    } else {
        piezasHTML = '<tr><td colspan="5" style="text-align:center; color: #999;">No se utilizaron piezas de repuesto</td></tr>';
    }

    const totalFactura = costeManoObra + costePiezas;
    const maquinaNombre = rep.maquina ? rep.maquina.modelo + ' (S/N: ' + rep.maquina.numero_serie + ')' : 'Aviso General';
    const fechaCierreVal = rep.fecha_cierre || rep.fecha_entrada;

    // Inyecto todo el diseño del PDF web en una nueva pestaña. Fíjate en align-items:flex-end en .footer
    const ventimp = window.open(' ', '_blank');
    ventimp.document.write('<html><head><title>Parte #' + rep.id + '</title>');

    ventimp.document.write('<style>body{font-family:sans-serif;padding:40px;color:#333;}.header{display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:10px;}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;}.caja{border:1px solid #e5e7eb;padding:10px;border-radius:5px;}h3{border-left:4px solid #2563eb;padding-left:10px;color:#1e3a8a;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}th{background:#f9fafb;text-align:left;padding:8px;border-bottom:1px solid #ddd;}td{padding:8px;border-bottom:1px solid #eee;}.totales{float:right; width:300px; border:2px solid #1e3a8a; padding:15px; border-radius:5px; background:#f8fafc;}.totales-linea{display:flex; justify-content:space-between; margin-bottom:5px;}.totales-gran{font-size:1.2em; font-weight:bold; border-top:1px solid #ccc; padding-top:10px; margin-top:10px;}.clear{clear:both;}.footer{margin-top:80px;display:flex;justify-content:space-between;align-items:flex-end;}</style></head><body>');

    ventimp.document.write('<div class="header"><div><img src="' + logoUrl + '" style="max-width: 300px; height: auto;" alt="Digital Soluciones"></div><div style="text-align:right"><h3>PARTE DE TRABAJO</h3><p>Aviso: #' + rep.id + '</p></div></div>');

    ventimp.document.write('<div class="grid"><div class="caja"><strong>Cliente:</strong><br>' + (rep.cliente?.nombre || 'S/N') + '<br>' + (rep.cliente?.direccion || '') + '</div>');
    ventimp.document.write('<div class="caja"><strong>Fecha:</strong> ' + fechaCierreVal + '<br><strong>Técnico:</strong> ' + (rep.tecnico?.nombre || 'N/A') + '</div></div>');

    ventimp.document.write('<p><strong>Máquina:</strong> ' + maquinaNombre + '</p>');
    ventimp.document.write('<h3>Descripción Avería</h3><p>' + (rep.descripcion || 'Sin datos') + '</p>');
    ventimp.document.write('<h3>Trabajo Realizado</h3><p>' + (rep.resolucion_texto || 'Pendiente') + '</p>');
    ventimp.document.write('<p><strong>Horario:</strong> ' + (rep.hora_inicio || '--:--') + ' a ' + (rep.hora_fin || '--:--') + ' (' + (rep.tiempo_total || '-') + ')</p>');

    ventimp.document.write('<h3>Piezas Utilizadas</h3><table><thead><tr><th>Ref</th><th>Descripción</th><th style="text-align:center">Cant</th><th style="text-align:right">Precio Ud.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>' + piezasHTML + '</tbody></table>');

    ventimp.document.write('<div class="totales"><div class="totales-linea"><span>Mano de obra:</span><span>' + costeManoObra.toFixed(2) + ' €</span></div><div class="totales-linea"><span>Total Piezas:</span><span>' + costePiezas.toFixed(2) + ' €</span></div><div class="totales-linea totales-gran"><span>TOTAL ESTIMADO:</span><span>' + totalFactura.toFixed(2) + ' €</span></div></div><div class="clear"></div>');

    // ==========================================
    // SELLO AUTOMÁTICO DEL TÉCNICO
    // ==========================================
    let nombreTecnico = rep.tecnico?.nombre || 'Sin asignar';
    let horaFinLimpia = rep.hora_fin ? rep.hora_fin.substring(0, 5) : '--:--';
    let fechaHoraCierre = (rep.fecha_cierre || 'S/F') + ' a las ' + horaFinLimpia;

    let cajaInfoTecnico = `
        <div style="width:250px; text-align:center; color:#4b5563;">
            <strong style="color:#1e3a8a; font-size:1.1em;">Validación Técnica:</strong><br>
            <span style="font-size:1.1em; display:block; margin-top:8px;">🧑‍🔧 ${nombreTecnico}</span>
            <span style="font-size:0.85em; color:#6b7280; display:block; margin-top:4px;">Cerrado el: ${fechaHoraCierre}</span>
        </div>`;

    // ==========================================
    // FIRMA DEL CLIENTE
    // ==========================================
    let cajaFirmaCliente = '';
    if (rep.firma_cliente) {
        cajaFirmaCliente = `
        <div style="width:200px; text-align:center;">
            <img src="${rep.firma_cliente}" style="max-width:200px; max-height:80px;"><br>
            <span style="border-top:1px solid #333; padding-top:5px; display:inline-block; width:100%;">Firma Cliente</span>
        </div>`;
    } else {
        cajaFirmaCliente = `
        <div style="width:200px; text-align:center; border-top:1px solid #333; padding-top:10px;">
            Firma Cliente
        </div>`;
    }

    // Inyectamos ambas cajas en el pie de página
    ventimp.document.write('<div class="footer">' + cajaInfoTecnico + cajaFirmaCliente + '</div>');

    ventimp.document.write('<script>setTimeout(function(){ window.print(); window.close(); }, 800);</script></body></html>');
    ventimp.document.close();
}
