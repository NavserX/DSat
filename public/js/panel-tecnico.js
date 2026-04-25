// --- AUTENTICACIÓN ---
// Saco el token del almacenamiento, si no existe te expulso al login
const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

// Guardo estas variables globales para usarlas en todo el código
let listaClientes = [];
let todasLasReparaciones = [];
let usuarioActual = null;

// --- CARGA DE PERFIL ---
// Pido los datos del usuario logueado al servidor
async function cargarPerfilUsuario() {
    try {
        const res = await fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            usuarioActual = await res.json();
            adaptarInterfazAlRol();
        }
    } catch (error) { console.error("Error cargando perfil", error); }
}

// Oculto menús y botones si el que entra es un técnico
function adaptarInterfazAlRol() {
    if (usuarioActual && usuarioActual.rol === 'tecnico') {
        const btnClientes = document.getElementById('btn-menu-clientes');
        const btnTecnicos = document.getElementById('btn-menu-tecnicos');
        if (btnClientes) btnClientes.classList.add('hidden');
        if (btnTecnicos) btnTecnicos.classList.add('hidden');

        const cajaFormulario = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');

        if (cajaFormulario && cajaTabla) {
            cajaFormulario.classList.add('hidden');
            cajaTabla.classList.remove('lg:col-span-2');
            cajaTabla.classList.add('col-span-1', 'lg:col-span-3');
        }

        document.getElementById('cliente_search').disabled = true;
        document.getElementById('tecnico_id').disabled = true;

        const btnNuevoCliente = document.querySelector('button[onclick="abrirModalCliente()"]');
        if (btnNuevoCliente) btnNuevoCliente.classList.add('hidden');

        const btnLimpiar = document.querySelector('button[onclick="limpiarFormulario()"]');
        if (btnLimpiar) btnLimpiar.classList.add('hidden');
    }
}

// --- NAVEGACIÓN SPA ---
// Oculto todas las pantallas y muestro solo la que has seleccionado
function mostrarPantalla(idPantalla, botonClicado) {
    document.querySelectorAll('.pantalla-seccion').forEach(div => div.classList.add('hidden'));
    document.getElementById(idPantalla).classList.remove('hidden');

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600');
        btn.classList.add('hover:bg-slate-800');
    });
    botonClicado.classList.remove('hover:bg-slate-800');
    botonClicado.classList.add('bg-blue-600');
}

// --- MANEJO DE FECHAS ---
// Pongo la fecha de hoy por defecto en el formulario
function setFechaHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_entrada').value = hoy;
}
setFechaHoy();

// --- CARGAS INICIALES DE API ---
// Me traigo todos los clientes de la base de datos
async function cargarClientes() {
    try {
        const res = await fetch('/api/clientes', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) listaClientes = await res.json();
    } catch (error) { console.error("Error cargando clientes:", error); }
}

// Me traigo todos los técnicos para rellenar los desplegables
async function cargarTecnicos() {
    try {
        const res = await fetch('/api/tecnicos', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const tecnicos = await res.json();
            const selectForm = document.getElementById('tecnico_id');
            const selectFiltro = document.getElementById('filtro_tecnico_id');
            tecnicos.forEach(t => {
                selectForm.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                selectFiltro.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
            });
        }
    } catch (error) { console.error("Error cargando técnicos:", error); }
}

// Me traigo todas las marcas de las máquinas
async function cargarMarcas() {
    try {
        const res = await fetch('/api/marcas', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const marcas = await res.json();
            const select = document.getElementById('marca_id');
            marcas.forEach(m => select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`);
        }
    } catch (error) { console.error("Error cargando marcas:", error); }
}

// --- BUSCADOR REUTILIZABLE DE CLIENTES ---
// Filtro la lista de clientes mientras vas escribiendo
function filtrarClientes(inputId, dropdownId, callbackSeleccion) {
    const query = document.getElementById(inputId).value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = '';

    if (query.length < 1) {
        dropdown.classList.add('hidden');
        return;
    }

    const filtrados = listaClientes.filter(c =>
        c.nombre.toLowerCase().includes(query) ||
        (c.telefono && c.telefono.includes(query))
    );

    if (filtrados.length === 0) {
        dropdown.innerHTML = '<li class="p-3 text-gray-500 text-sm italic">No se encontraron coincidencias...</li>';
    } else {
        filtrados.forEach(c => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-blue-50 cursor-pointer border-b text-gray-800 transition flex justify-between items-center';
            li.innerHTML = `
                <div><div class="font-semibold">${c.nombre}</div><div class="text-xs text-gray-500">${c.telefono || 'Sin teléfono'}</div></div>
                <div class="text-blue-500 text-lg">›</div>
            `;
            li.onclick = () => {
                document.getElementById(inputId).value = c.nombre;
                dropdown.classList.add('hidden');
                callbackSeleccion(c);
            };
            dropdown.appendChild(li);
        });
    }
    dropdown.classList.remove('hidden');
}

// Relleno los datos del cliente abajo al seleccionarlo en una nueva reparación
function seleccionarClienteReparacion(cliente) {
    document.getElementById('cliente_id').value = cliente.id;

    const infoDiv = document.getElementById('cliente_info');

    let botonLlamar = '';
    let textoTelefono = 'No especificado';

    if (cliente.telefono) {
        textoTelefono = cliente.telefono;
        botonLlamar = `<a href="tel:${cliente.telefono}" class="ml-3 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition shadow-md inline-flex items-center">📞 Llamar</a>`;
    }

    infoDiv.innerHTML = `
        <div class="flex justify-between items-center">
            <div class="w-full">
                <p class="flex items-center mb-1">📞 <strong>Teléfono:</strong> <span class="ml-1">${textoTelefono}</span> ${botonLlamar}</p>
                <p>🏠 <strong>Dirección:</strong> ${cliente.direccion || 'No especificada'}</p>
            </div>
        </div>
    `;
    infoDiv.classList.remove('hidden');

    if (cliente.direccion) {
        mostrarMapaDeTabla(encodeURIComponent(cliente.direccion));
    } else {
        document.getElementById('mapa_container').classList.add('hidden');
    }
}

// Cargo el historial de reparaciones de un cliente en la pantalla de clientes
function cargarHistorialCliente(cliente) {
    document.getElementById('titulo_historial_cliente').innerText = `Avisos de: ${cliente.nombre} ${cliente.telefono ? ' - '+cliente.telefono : ''}`;
    const tbody = document.getElementById('tabla-historial-cliente');
    tbody.innerHTML = '';

    const historial = todasLasReparaciones.filter(rep => rep.cliente_id === cliente.id);

    if(historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No hay historial para este cliente.</td></tr>`;
    } else {
        historial.forEach(rep => {
            let fecha = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'Desconocida');
            let color = { pendiente: 'text-yellow-600', "en proceso": 'text-blue-600', terminado: 'text-green-600' }[rep.estado] || 'text-gray-600';

            tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4 font-mono text-xs text-blue-600 whitespace-nowrap">${fecha}</td>
                <td class="py-3 px-4"><strong>${rep.marca?.nombre || 'N/A'}</strong><br><span class="text-xs text-gray-500">${rep.descripcion || ''}</span></td>
                <td class="py-3 px-4 text-sm">${rep.tecnico?.nombre || 'N/A'}</td>
                <td class="py-3 px-4 font-semibold uppercase text-xs ${color}">${rep.estado}</td>
            </tr>`;
        });
    }
    document.getElementById('contenedor_historial_cliente').classList.remove('hidden');
}

// Filtro la tabla de los técnicos según los campos seleccionados arriba
function filtrarHistorialTecnicos() {
    const tecId = document.getElementById('filtro_tecnico_id').value;
    const fechaInicio = document.getElementById('filtro_fecha_inicio').value;
    const fechaFin = document.getElementById('filtro_fecha_fin').value;
    const tbody = document.getElementById('tabla-historial-tecnico');
    tbody.innerHTML = '';

    let filtrados = todasLasReparaciones;

    if (tecId) {
        filtrados = filtrados.filter(rep => rep.tecnico_id == tecId);
    }
    if (fechaInicio) {
        filtrados = filtrados.filter(rep => {
            let fecha = rep.fecha_entrada || rep.created_at?.substring(0,10);
            return fecha && fecha >= fechaInicio;
        });
    }
    if (fechaFin) {
        filtrados = filtrados.filter(rep => {
            let fecha = rep.fecha_entrada || rep.created_at?.substring(0,10);
            return fecha && fecha <= fechaFin;
        });
    }

    if(filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No se encontraron avisos con estos filtros.</td></tr>`;
        return;
    }

    filtrados.forEach(rep => {
        let fecha = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'Desconocida');
        tbody.innerHTML += `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4 font-mono text-xs text-blue-600 whitespace-nowrap">${fecha}</td>
            <td class="py-3 px-4 font-semibold text-gray-700">${rep.tecnico?.nombre || 'N/A'}</td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</td>
            <td class="py-3 px-4 text-xs text-gray-500 max-w-xs truncate" title="${rep.descripcion || ''}">${rep.descripcion || ''}</td>
        </tr>`;
    });
}

// Oculto los desplegables de búsqueda de clientes si pinchas fuera de ellos
document.addEventListener('click', function(e) {
    ['cliente_dropdown', 'historial_cliente_dropdown'].forEach(id => {
        const el = document.getElementById(id);
        if(el && !el.contains(e.target) && e.target.id !== id.replace('_dropdown', '_search')) {
            el.classList.add('hidden');
        }
    });
});

// --- MAPA DINÁMICO ---
// Muestro el mapa de google con la dirección del cliente codificada
function mostrarMapaDeTabla(direccionCodificada) {
    const mapContainer = document.getElementById('mapa_container');
    const iframe = document.getElementById('google_map_iframe');
    const link = document.getElementById('link_como_llegar');

    iframe.src = `https://maps.google.com/maps?q=$${direccionCodificada}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    link.href = `https://maps.google.com/maps?q=$${direccionCodificada}`;

    mapContainer.classList.remove('hidden');
    mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- ACCIÓN RÁPIDA DE ESTADO ---
// Cambio el estado a en proceso o terminado directamente desde el botón de la tabla
async function cambiarEstadoRapido(id, nuevoEstado) {
    const rep = todasLasReparaciones.find(r => r.id === id);
    if (!rep) return;

    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: rep.tecnico_id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada || new Date().toISOString().split('T')[0],
        estado: nuevoEstado
    };

    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            cargarReparaciones();
        } else {
            alert('Error al actualizar el estado.');
        }
    } catch (error) { console.error(error); }
}

// --- CRUD DE REPARACIONES (CON AUTO-REFRESCO) ---
// Pido las reparaciones al servidor y dibujo la tabla principal
async function cargarReparaciones() {
    // Si el usuario está editando o escribiendo en el formulario no actualizo la tabla para no molestar
    const editandoId = document.getElementById('rep-id').value;
    const escribiendoDesc = document.getElementById('descripcion').value;
    if (editandoId || escribiendoDesc.length > 0) return;

    try {
        const res = await fetch('/api/reparaciones', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Error al cargar reparaciones');
        const data = await res.json();

        todasLasReparaciones = data.sort((a,b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));

        const tbody = document.getElementById('tabla-reparaciones');
        tbody.innerHTML = '';
        let pendientes = 0, proceso = 0, terminado = 0;

        todasLasReparaciones.forEach(rep => {
            if (rep.estado === 'pendiente') pendientes++;
            if (rep.estado === 'en proceso') proceso++;
            if (rep.estado === 'terminado') terminado++;

            let color = {
                pendiente: 'bg-yellow-100 text-yellow-700',
                "en proceso": 'bg-blue-100 text-blue-700',
                terminado: 'bg-green-100 text-green-700'
            }[rep.estado] || 'bg-gray-100 text-gray-700';

            // Codifico la reparación entera para que no rompa el botón con saltos de línea o comillas
            const repCodificada = encodeURIComponent(JSON.stringify(rep));
            let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            let btnMapa = '';
            if (rep.cliente && rep.cliente.direccion) {
                btnMapa = `<button type="button" onclick="mostrarMapaDeTabla('${encodeURIComponent(rep.cliente.direccion)}')" class="text-green-600 hover:text-green-800 p-2 transition hover:scale-125 inline-block" title="Ver en mapa">📍</button>`;
            }

            let btnLlamar = '';
            if (rep.cliente && rep.cliente.telefono) {
                btnLlamar = `<a href="tel:${rep.cliente.telefono}" class="text-blue-500 hover:text-blue-800 p-2 transition hover:scale-125 inline-block" title="Llamar al cliente">📞</a>`;
            }

            let btnBorrar = `<button onclick="borrarReparacion(${rep.id})" class="text-red-500 hover:text-red-700 p-2 transition hover:scale-125 inline-block" title="Borrar">🗑️</button>`;
            let btnEstadoRapido = '';

            if (usuarioActual && usuarioActual.rol === 'tecnico') {
                btnBorrar = '';
                if (rep.estado === 'pendiente') {
                    btnEstadoRapido = `<button onclick="cambiarEstadoRapido(${rep.id}, 'en proceso')" class="text-yellow-500 hover:text-yellow-700 p-2 transition hover:scale-125 inline-block" title="Empezar a trabajar">▶️</button>`;
                } else if (rep.estado === 'en proceso') {
                    btnEstadoRapido = `<button onclick="cambiarEstadoRapido(${rep.id}, 'terminado')" class="text-green-500 hover:text-green-700 p-2 transition hover:scale-125 inline-block" title="Marcar como Terminado">✅</button>`;
                }
            }

            tbody.innerHTML += `
            <tr class="hover:bg-blue-50/30 transition">
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">
                    <div class="font-bold text-blue-600 text-base">#${rep.id}</div>
                    <div class="text-gray-500 text-xs mt-1">📅 ${fechaFormateada}</div>
                </td>
                <td class="pt-4 pb-2 px-4 min-w-[200px] align-top">
                    <div class="font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</div>
                    <div class="text-gray-500 text-xs mt-1 text-blue-600 font-semibold">${rep.marca?.nombre || 'S/N'}</div>
                </td>
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${color}">${rep.estado}</span>
                </td>
                <td class="pt-4 pb-2 px-4 text-center whitespace-nowrap align-top">
                    ${btnEstadoRapido}
                    ${btnLlamar}
                    ${btnMapa}
                    <button onclick="editarReparacion('${repCodificada}')" class="text-blue-500 hover:text-blue-700 p-2 transition hover:scale-125 inline-block" title="Editar">✏️</button>
                    ${btnBorrar}
                </td>
            </tr>
            <tr class="border-b hover:bg-blue-50/30 transition">
                <td colspan="4" class="px-4 pb-4 pt-1">
                    <div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm w-full">
                        <span class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Descripción de la avería:</span>
                        ${rep.descripcion ? rep.descripcion.replace(/\n/g, '<br>') : '<span class="italic text-gray-400">Sin descripción detallada...</span>'}
                    </div>
                </td>
            </tr>`;
        });

        document.getElementById('stat-pendientes').innerText = pendientes;
        document.getElementById('stat-proceso').innerText = proceso;
        document.getElementById('stat-terminado').innerText = terminado;

        // Compruebo que no haya otro temporizador y refresco la tabla cada 10 segundos
        if (!window.intervaloRealTime) {
            window.intervaloRealTime = setInterval(() => {
                const pantallaReparaciones = document.getElementById('pantalla_reparaciones');
                if (pantallaReparaciones && !pantallaReparaciones.classList.contains('hidden')) {
                    cargarReparaciones();
                }
            }, 10000);
        }

        filtrarHistorialTecnicos();
    } catch (error) { console.error(error); }
}

// Guardo la reparación enviando los datos del formulario a la API
async function guardarReparacion() {
    const id = document.getElementById('rep-id').value;
    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        tecnico_id: document.getElementById('tecnico_id').value,
        marca_id: document.getElementById('marca_id').value,
        descripcion: document.getElementById('descripcion').value,
        fecha_entrada: document.getElementById('fecha_entrada').value,
        estado: document.getElementById('estado').value
    };

    if (!datos.cliente_id || !datos.tecnico_id || !datos.marca_id || !datos.fecha_entrada) {
        alert('Faltan datos. Revisa Cliente, Técnico, Marca y Fecha.');
        return;
    }

    const url = id ? `/api/reparaciones/${id}` : '/api/reparaciones';
    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            limpiarFormulario();
            if (usuarioActual && usuarioActual.rol === 'tecnico') {
                document.getElementById('caja-formulario-reparacion').classList.add('hidden');
                document.getElementById('caja-tabla-reparaciones').classList.remove('lg:col-span-2');
                document.getElementById('caja-tabla-reparaciones').classList.add('col-span-1', 'lg:col-span-3');
            }
            cargarReparaciones();
        } else alert('Error al guardar la reparación en la base de datos.');
    } catch (error) { console.error(error); }
}

// Descodifico los datos seguros que pasé al botón del lápiz y relleno el formulario
function editarReparacion(repCodificada) {
    const rep = JSON.parse(decodeURIComponent(repCodificada));

    if (usuarioActual && usuarioActual.rol === 'tecnico') {
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
    }

    document.getElementById('tecnico_id').value = rep.tecnico_id;
    document.getElementById('marca_id').value = rep.marca_id;
    document.getElementById('descripcion').value = rep.descripcion || '';
    document.getElementById('estado').value = rep.estado;

    if(rep.fecha_entrada) {
        document.getElementById('fecha_entrada').value = rep.fecha_entrada;
    }

    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
}

// Elimino la reparación tras preguntar por confirmación
async function borrarReparacion(id) {
    if (!confirm('¿Estás seguro de que deseas borrar este aviso permanentemente?')) return;
    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) cargarReparaciones();
        else alert('Error al borrar la reparación');
    } catch (error) { console.error(error); }
}

// Dejo los campos vacíos y oculto el mapa para dejarlo todo listo para uno nuevo
function limpiarFormulario() {
    document.getElementById('form-title').innerText = 'Nueva Reparación';
    document.getElementById('rep-id').value = '';
    document.getElementById('cliente_id').value = '';
    document.getElementById('cliente_search').value = '';
    document.getElementById('cliente_info').classList.add('hidden');
    document.getElementById('mapa_container').classList.add('hidden');

    if (!usuarioActual || usuarioActual.rol !== 'tecnico') {
        document.getElementById('tecnico_id').value = '';
    }

    document.getElementById('marca_id').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('estado').value = 'pendiente';
    setFechaHoy();
}

// --- MODAL DE CLIENTES ---
// Abro el formulario flotante y limpio los campos (incluido el nuevo email)
function abrirModalCliente() {
    document.getElementById('nuevo_cliente_nombre').value = document.getElementById('cliente_search').value;
    const emailInput = document.getElementById('nuevo_cliente_email');
    if (emailInput) emailInput.value = '';
    document.getElementById('nuevo_cliente_telefono').value = '';
    document.getElementById('nuevo_cliente_direccion').value = '';
    document.getElementById('modal_cliente').classList.remove('hidden');
}

// Cierro la ventana flotante
function cerrarModalCliente() {
    document.getElementById('modal_cliente').classList.add('hidden');
}

// Mando el cliente a la base de datos (con email falso si es necesario) y lo selecciono
async function guardarNuevoCliente() {
    const nombre = document.getElementById('nuevo_cliente_nombre').value;
    const telefono = document.getElementById('nuevo_cliente_telefono').value;
    const direccion = document.getElementById('nuevo_cliente_direccion').value;

    // Recojo el email. Si no lo rellenan, creo uno falso para que MySQL no dé error
    const inputEmail = document.getElementById('nuevo_cliente_email');
    const email = (inputEmail && inputEmail.value) ? inputEmail.value : `sin-email-${Date.now()}@cliente.com`;

    if (!nombre) return alert("El nombre es obligatorio.");

    const btn = document.querySelector('#modal_cliente button.bg-green-600');
    btn.innerText = 'Guardando...'; btn.disabled = true;

    try {
        const res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre, telefono, direccion, email })
        });

        if (res.ok) {
            const nuevoCliente = await res.json();
            await cargarClientes();
            cerrarModalCliente();
            seleccionarClienteReparacion(nuevoCliente.id ? nuevoCliente : nuevoCliente.cliente);
            document.getElementById('cliente_search').value = nombre;
        } else alert('Error al registrar el cliente en el servidor.');
    } catch (error) { console.error(error); alert('Error de conexión'); }
    finally { btn.innerText = 'Guardar Cliente'; btn.disabled = false; }
}

// --- CERRAR SESIÓN ---
// Elimino el token del navegador y devuelvo al usuario al login
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// --- ARRANQUE AL CARGAR LA WEB ---
// Inicio todo trayendo la información necesaria de la base de datos
async function iniciarApp() {
    await cargarPerfilUsuario();
    cargarClientes();
    cargarTecnicos();
    cargarMarcas();
    cargarReparaciones();
}

iniciarApp();
