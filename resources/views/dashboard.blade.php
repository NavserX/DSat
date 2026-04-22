<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Soluciones - Panel Técnico</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
</head>

<body class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative">

<div class="flex flex-col lg:flex-row min-h-screen">

    <aside class="w-full lg:w-64 bg-slate-950/60 backdrop-blur-lg p-4 lg:p-6 flex flex-col shrink-0">
        <div class="mb-4 lg:mb-10 flex flex-row lg:flex-col items-center lg:items-start justify-between">
            <div class="flex items-center lg:flex-col lg:items-start">
                <img src="img/logo-web-ofimatica-digital2.webp" class="w-32 lg:w-40 mr-4 lg:mr-0 lg:mb-4" alt="Logo" onerror="this.style.display='none'">
                <h2 class="text-base lg:text-lg font-semibold text-blue-300">Panel Técnico</h2>
            </div>
            <button onclick="logout()" class="block lg:hidden bg-red-600 text-sm px-4 py-2 rounded hover:bg-red-700 transition">
                Salir
            </button>
        </div>

        <nav class="flex gap-2 lg:flex-col lg:space-y-2 flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <button onclick="mostrarPantalla('pantalla_reparaciones', this)" class="menu-btn w-full text-left px-4 py-2 rounded bg-blue-600 whitespace-nowrap transition">Reparaciones</button>
            <button onclick="mostrarPantalla('pantalla_clientes', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">Historial Clientes</button>
            <button onclick="mostrarPantalla('pantalla_tecnicos', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">Historial Técnicos</button>
            <button onclick="mostrarPantalla('pantalla_recursos', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">Recursos Técnicos</button>
        </nav>

        <button onclick="logout()" class="hidden lg:block mt-6 bg-red-600 py-2 rounded hover:bg-red-700 transition">
            Cerrar sesión
        </button>
    </aside>

    <main class="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden relative">

        <div id="pantalla_reparaciones" class="pantalla-seccion block">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Gestión de Reparaciones</h1>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
                <div class="bg-white/10 backdrop-blur-lg p-4 lg:p-6 rounded-xl shadow-lg">
                    <p class="text-sm text-blue-200">Pendientes</p>
                    <p id="stat-pendientes" class="text-2xl lg:text-3xl font-bold text-yellow-400">0</p>
                </div>
                <div class="bg-white/10 backdrop-blur-lg p-4 lg:p-6 rounded-xl shadow-lg">
                    <p class="text-sm text-blue-200">En proceso</p>
                    <p id="stat-proceso" class="text-2xl lg:text-3xl font-bold text-blue-400">0</p>
                </div>
                <div class="bg-white/10 backdrop-blur-lg p-4 lg:p-6 rounded-xl shadow-lg">
                    <p class="text-sm text-blue-200">Terminadas</p>
                    <p id="stat-terminado" class="text-2xl lg:text-3xl font-bold text-green-400">0</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-2 lg:order-1 relative">
                    <h2 class="text-xl font-semibold mb-4 border-b pb-2" id="form-title">Nueva Reparación</h2>
                    <input type="hidden" id="rep-id">

                    <label class="block text-sm mt-3">Cliente</label>
                    <div class="flex gap-2 mt-1 relative">
                        <div class="relative flex-1">
                            <input type="hidden" id="cliente_id">
                            <input type="text" id="cliente_search" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" placeholder="Buscar cliente..." autocomplete="off" onkeyup="filtrarClientes('cliente_search', 'cliente_dropdown', seleccionarClienteReparacion)">
                            <ul id="cliente_dropdown" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 hidden max-h-48 overflow-y-auto shadow-xl"></ul>
                        </div>
                        <button type="button" onclick="abrirModalCliente()" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition shadow-md" title="Nuevo Cliente">➕</button>
                    </div>

                    <div id="cliente_info" class="text-sm mt-2 p-3 bg-blue-50 text-blue-800 rounded hidden border border-blue-200"></div>

                    <label class="block text-sm mt-3">Técnico</label>
                    <select id="tecnico_id" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400">
                        <option value="">Seleccione un técnico...</option>
                    </select>

                    <label class="block text-sm mt-3">Marca</label>
                    <select id="marca_id" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400">
                        <option value="">Seleccione una marca...</option>
                    </select>

                    <label class="block text-sm mt-3">Descripción</label>
                    <textarea id="descripcion" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400" rows="3"></textarea>

                    <label class="block text-sm mt-3 font-semibold text-blue-800">Fecha de Entrada</label>
                    <input type="date" id="fecha_entrada" class="w-full p-2 border border-blue-300 rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-blue-50">

                    <label class="block text-sm mt-3">Estado</label>
                    <select id="estado" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400">
                        <option value="pendiente">Pendiente</option>
                        <option value="en proceso">En proceso</option>
                        <option value="terminado">Terminado</option>
                    </select>

                    <div class="flex flex-col sm:flex-row gap-2 mt-6">
                        <button onclick="guardarReparacion()" class="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold shadow-md">Guardar</button>
                        <button onclick="limpiarFormulario()" type="button" class="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition font-semibold shadow-md">Limpiar</button>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-1 lg:order-2">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                            <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                                <th class="py-3 px-4 text-left whitespace-nowrap">Aviso</th>
                                <th class="py-3 px-4 text-left whitespace-nowrap">Cliente / Marca</th>
                                <th class="py-3 px-4 text-left whitespace-nowrap">Estado</th>
                                <th class="py-3 px-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                            </thead>
                            <tbody id="tabla-reparaciones"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="mapa_container" class="mt-8 bg-white p-5 lg:p-6 rounded-2xl shadow-xl hidden">
                <h2 class="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Ubicación del Cliente</h2>
                <div class="w-full h-72 rounded-xl overflow-hidden shadow-inner">
                    <iframe id="google_map_iframe" class="w-full h-full border-0" allowfullscreen="" loading="lazy"></iframe>
                </div>
                <div class="mt-6 text-center lg:text-left">
                    <a id="link_como_llegar" href="#" target="_blank" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md">
                        📍 Cómo llegar (Abrir en Google Maps)
                    </a>
                </div>
            </div>
        </div>

        <div id="pantalla_clientes" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Historial por Cliente</h1>

            <div class="bg-white p-5 lg:p-6 rounded-2xl shadow-xl text-gray-800 mb-8">
                <label class="block text-sm font-semibold mb-2">Busca un Cliente para ver su historial:</label>
                <div class="relative w-full lg:w-1/2">
                    <input type="text" id="historial_cliente_search" class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-400 bg-gray-50 text-lg" placeholder="Escribe el nombre o teléfono..." autocomplete="off" onkeyup="filtrarClientes('historial_cliente_search', 'historial_cliente_dropdown', cargarHistorialCliente)">
                    <ul id="historial_cliente_dropdown" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 hidden max-h-60 overflow-y-auto shadow-2xl text-lg"></ul>
                </div>
            </div>

            <div id="contenedor_historial_cliente" class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl hidden">
                <h2 class="text-xl font-semibold mb-4 border-b pb-2 text-blue-600" id="titulo_historial_cliente">Reparaciones de Cliente</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                        <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                            <th class="py-3 px-4 text-left whitespace-nowrap">Fecha Entrada</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Equipo/Avería</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Técnico Asignado</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Estado</th>
                        </tr>
                        </thead>
                        <tbody id="tabla-historial-cliente"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="pantalla_tecnicos" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Trabajo de Técnicos</h1>

            <div class="bg-white p-5 lg:p-6 rounded-2xl shadow-xl text-gray-800 mb-8 flex flex-col md:flex-row gap-4 items-end">
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-semibold mb-2">Selecciona un Técnico:</label>
                    <select id="filtro_tecnico_id" class="w-full p-2.5 border rounded focus:ring-2 focus:ring-blue-400 bg-gray-50">
                        <option value="">Todos los técnicos</option>
                    </select>
                </div>
                <div class="w-full md:w-1/4">
                    <label class="block text-sm font-semibold mb-2">Desde (Fecha Entrada):</label>
                    <input type="date" id="filtro_fecha_inicio" class="w-full p-2.5 border rounded bg-gray-50">
                </div>
                <div class="w-full md:w-1/4">
                    <label class="block text-sm font-semibold mb-2">Hasta (Fecha):</label>
                    <input type="date" id="filtro_fecha_fin" class="w-full p-2.5 border rounded bg-gray-50">
                </div>
                <div class="w-full md:w-auto flex-1">
                    <button onclick="filtrarHistorialTecnicos()" class="w-full bg-blue-600 text-white px-6 py-2.5 rounded hover:bg-blue-700 transition font-semibold shadow-md">Filtrar Avisos</button>
                </div>
            </div>

            <div class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                        <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                            <th class="py-3 px-4 text-left whitespace-nowrap">Fecha Entrada</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Técnico</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Cliente</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Avería Registrada</th>
                        </tr>
                        </thead>
                        <tbody id="tabla-historial-tecnico">
                        <tr><td colspan="4" class="text-center py-8 text-gray-500">Selecciona filtros arriba y pulsa Filtrar Avisos.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="pantalla_recursos" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Recursos y Enlaces Útiles</h1>

            <p class="text-blue-100 mb-8">Selecciona un recurso para abrirlo en una nueva pestaña:</p>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <a href="https://infohub.konicaminolta.eu/openmind/publicnav.nsf/nav?OpenForm" target="_blank" class="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition duration-300 flex items-start gap-4 group">
                    <div class="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">Infohub Konica Minolta</h3>
                        <p class="text-sm text-gray-500 mt-1">Portal oficial de documentación y recursos de Konica Minolta.</p>
                    </div>
                </a>

            </div>
        </div>

    </main>
</div>

<div id="modal_cliente" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center hidden">
    <div class="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <h2 class="text-xl font-bold mb-4 border-b pb-2 text-blue-600">Registrar Nuevo Cliente</h2>

        <label class="block text-sm mt-3 font-semibold">Nombre <span class="text-red-500">*</span></label>
        <input type="text" id="nuevo_cliente_nombre" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50">

        <label class="block text-sm mt-3 font-semibold">Teléfono</label>
        <input type="text" id="nuevo_cliente_telefono" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50">

        <label class="block text-sm mt-3 font-semibold">Dirección</label>
        <input type="text" id="nuevo_cliente_direccion" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Ej: Calle Mayor 1, Madrid">

        <div class="flex gap-2 mt-6">
            <button onclick="guardarNuevoCliente()" class="flex-1 bg-green-600 text-white p-2.5 rounded hover:bg-green-700 transition font-semibold shadow">
                Guardar Cliente
            </button>
            <button onclick="cerrarModalCliente()" type="button" class="flex-1 bg-gray-200 text-gray-700 p-2.5 rounded hover:bg-gray-300 transition font-semibold shadow">
                Cancelar
            </button>
        </div>
    </div>
</div>

<script>
    // --- AUTENTICACIÓN ---
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/';

    let listaClientes = [];
    let todasLasReparaciones = []; // Almacena todos los avisos para los historiales locales

    // --- NAVEGACIÓN SPA ---
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
    function setFechaHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha_entrada').value = hoy;
    }
    setFechaHoy();

    // --- CARGAS INICIALES DE API ---
    async function cargarClientes() {
        try {
            const res = await fetch('/api/clientes', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) listaClientes = await res.json();
        } catch (error) { console.error("Error cargando clientes:", error); }
    }

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

    // Acción: Cliente seleccionado para nueva reparación
    function seleccionarClienteReparacion(cliente) {
        document.getElementById('cliente_id').value = cliente.id;

        const infoDiv = document.getElementById('cliente_info');
        infoDiv.innerHTML = `
            <div class="flex justify-between">
                <div>
                    <p>📞 <strong>Teléfono:</strong> ${cliente.telefono || 'No especificado'}</p>
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

    // Acción: Cliente seleccionado para ver historial
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

    // Acción: Filtrar técnicos
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

    // Ocultar desplegables si haces click fuera de ellos
    document.addEventListener('click', function(e) {
        ['cliente_dropdown', 'historial_cliente_dropdown'].forEach(id => {
            const el = document.getElementById(id);
            if(el && !el.contains(e.target) && e.target.id !== id.replace('_dropdown', '_search')) {
                el.classList.add('hidden');
            }
        });
    });

    // --- MAPA DINÁMICO ---
    function mostrarMapaDeTabla(direccionCodificada) {
        const mapContainer = document.getElementById('mapa_container');
        const iframe = document.getElementById('google_map_iframe');
        const link = document.getElementById('link_como_llegar');

        iframe.src = `https://maps.google.com/maps?q=${direccionCodificada}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        link.href = `https://maps.google.com/maps?q=${direccionCodificada}`;

        mapContainer.classList.remove('hidden');
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- CRUD DE REPARACIONES ---
    async function cargarReparaciones() {
        try {
            const res = await fetch('/api/reparaciones', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Error al cargar reparaciones');
            const data = await res.json();

            // Guardamos en variable global y ordenamos de más nuevas a más viejas
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

                // Codificamos el JSON para poder inyectarlo en el HTML del botón sin romper las comillas
                const repJSON = JSON.stringify(rep).replace(/"/g, '"');
                let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

                let btnMapa = '';
                if (rep.cliente && rep.cliente.direccion) {
                    btnMapa = `<button type="button" onclick="mostrarMapaDeTabla('${encodeURIComponent(rep.cliente.direccion)}')" class="text-green-600 hover:text-green-800 p-2 transition hover:scale-125 inline-block" title="Ver en mapa">📍</button>`;
                }

                tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="py-4 px-4 whitespace-nowrap">
                        <div class="font-bold text-blue-600 text-base">#${rep.id}</div>
                        <div class="text-gray-500 text-xs mt-1">📅 ${fechaFormateada}</div>
                    </td>
                    <td class="py-4 px-4 min-w-[200px]">
                        <div class="font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</div>
                        <div class="text-gray-500 text-xs mt-1">${rep.marca?.nombre || 'S/N'}</div>
                    </td>
                    <td class="py-4 px-4 whitespace-nowrap">
                        <span class="px-3 py-1 rounded-full text-xs font-bold ${color}">${rep.estado}</span>
                    </td>
                    <td class="py-4 px-4 text-center whitespace-nowrap align-middle">
                        ${btnMapa}
                        <button onclick="editarReparacion('${repJSON}')" class="text-blue-500 hover:text-blue-700 p-2 transition hover:scale-125 inline-block" title="Editar">✏️</button>
                        <button onclick="borrarReparacion(${rep.id})" class="text-red-500 hover:text-red-700 p-2 transition hover:scale-125 inline-block" title="Borrar">🗑️</button>
                    </td>
                </tr>
                `;
            });

            document.getElementById('stat-pendientes').innerText = pendientes;
            document.getElementById('stat-proceso').innerText = proceso;
            document.getElementById('stat-terminado').innerText = terminado;

            // Refrescar el filtro de técnicos por si estábamos en esa pantalla
            filtrarHistorialTecnicos();

        } catch (error) { console.error(error); }
    }

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
                cargarReparaciones();
            } else alert('Error al guardar la reparación en la base de datos.');
        } catch (error) { console.error(error); }
    }

    function editarReparacion(repJSON) {
        // Descodificamos el JSON
        const decodedJSON = repJSON.replace(/"/g, '"');
        const rep = JSON.parse(decodedJSON);

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

    function limpiarFormulario() {
        document.getElementById('form-title').innerText = 'Nueva Reparación';
        document.getElementById('rep-id').value = '';
        document.getElementById('cliente_id').value = '';
        document.getElementById('cliente_search').value = '';
        document.getElementById('cliente_info').classList.add('hidden');
        document.getElementById('mapa_container').classList.add('hidden');
        document.getElementById('tecnico_id').value = '';
        document.getElementById('marca_id').value = '';
        document.getElementById('descripcion').value = '';
        document.getElementById('estado').value = 'pendiente';
        setFechaHoy(); // Restablece a la fecha de hoy
    }

    // --- MODAL DE CLIENTES ---
    function abrirModalCliente() {
        document.getElementById('nuevo_cliente_nombre').value = document.getElementById('cliente_search').value;
        document.getElementById('nuevo_cliente_telefono').value = '';
        document.getElementById('nuevo_cliente_direccion').value = '';
        document.getElementById('modal_cliente').classList.remove('hidden');
    }

    function cerrarModalCliente() {
        document.getElementById('modal_cliente').classList.add('hidden');
    }

    async function guardarNuevoCliente() {
        const nombre = document.getElementById('nuevo_cliente_nombre').value;
        const telefono = document.getElementById('nuevo_cliente_telefono').value;
        const direccion = document.getElementById('nuevo_cliente_direccion').value;

        if (!nombre) return alert("El nombre es obligatorio.");

        const btn = document.querySelector('#modal_cliente button.bg-green-600');
        btn.innerText = 'Guardando...'; btn.disabled = true;

        try {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre, telefono, direccion })
            });

            if (res.ok) {
                const nuevoCliente = await res.json();
                await cargarClientes(); // Refrescar el array de clientes
                cerrarModalCliente();
                seleccionarClienteReparacion(nuevoCliente.id ? nuevoCliente : nuevoCliente.cliente);
            } else alert('Error al registrar el cliente en el servidor.');
        } catch (error) { console.error(error); alert('Error de conexión'); }
        finally { btn.innerText = 'Guardar Cliente'; btn.disabled = false; }
    }

    // --- CERRAR SESIÓN ---
    function logout() {
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    // --- ARRANQUE AL CARGAR LA WEB ---
    cargarClientes();
    cargarTecnicos();
    cargarMarcas();
    cargarReparaciones();

</script>

</body>
</html>
