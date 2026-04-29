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

    <aside class="sticky top-0 z-50 w-full lg:w-64 lg:h-screen overflow-y-auto shadow-2xl bg-slate-950/60 backdrop-blur-lg p-4 lg:p-6 flex flex-col shrink-0">

        <div class="mb-4 lg:mb-10 flex flex-row lg:flex-col items-center lg:items-start justify-between">
            <div class="flex items-center lg:flex-col lg:items-start">
                <img src="{{ asset('img/logo-web-ofimatica-digital2.webp') }}" class="w-32 lg:w-40 mr-4 lg:mr-0 lg:mb-4" alt="Logo" onerror="this.style.display='none'">
                <h2 class="text-base lg:text-lg font-semibold text-blue-300">Panel Técnico</h2>
            </div>
            <button onclick="logout()" class="block lg:hidden bg-red-600 text-sm px-4 py-2 rounded hover:bg-red-700 transition">
                Salir
            </button>
        </div>

        <nav class="flex gap-2 lg:flex-col lg:space-y-2 flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <button id="btn-menu-reparaciones" onclick="mostrarPantalla('pantalla_reparaciones', this)" class="menu-btn w-full text-left px-4 py-2 rounded bg-blue-600 whitespace-nowrap transition">🛠️ Reparaciones</button>
            <button id="btn-menu-libres" onclick="mostrarPantalla('pantalla_libres', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition border-l-4 border-yellow-500">📥 Avisos Libres</button>
            <button id="btn-menu-clientes" onclick="mostrarPantalla('pantalla_clientes', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">📋 Historial Clientes</button>
            <button id="btn-menu-tecnicos" onclick="mostrarPantalla('pantalla_tecnicos', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">👷 Historial Técnicos</button>
            <button id="btn-menu-gestion-clientes" onclick="mostrarPantalla('pantalla_gestion_clientes', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">👥 Gestión Clientes</button>
            <button id="btn-menu-maquinas" onclick="mostrarPantalla('pantalla_maquinas', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">🖨️ Parque Máquinas</button>
            <button id="btn-menu-inventario" onclick="mostrarPantalla('pantalla_inventario', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">📦 Inventario Piezas</button>
            <button onclick="mostrarPantalla('pantalla_recursos', this)" class="menu-btn w-full text-left px-4 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition">📚 Recursos Técnicos</button>
        </nav>

        <button onclick="logout()" class="hidden lg:block mt-6 bg-red-600 py-2 rounded hover:bg-red-700 transition">
            Cerrar sesión
        </button>
    </aside>

    <main class="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden relative">

        <div id="pantalla_reparaciones" class="pantalla-seccion block">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Gestión de Reparaciones</h1>

            <div class="grid grid-cols-3 gap-3 sm:gap-6 mb-8 lg:mb-10">
                <div id="tarjeta-pendiente" onclick="filtrarPorEstado('pendiente')" class="bg-white/10 backdrop-blur-lg p-3 sm:p-6 rounded-xl shadow-lg text-center cursor-pointer hover:bg-white/20 hover:scale-105 transition border border-transparent">
                    <p class="text-xs sm:text-sm text-blue-200">Pendientes</p>
                    <p id="stat-pendientes" class="text-xl sm:text-3xl font-bold text-yellow-400">0</p>
                </div>
                <div id="tarjeta-en-proceso" onclick="filtrarPorEstado('en proceso')" class="bg-white/10 backdrop-blur-lg p-3 sm:p-6 rounded-xl shadow-lg text-center cursor-pointer hover:bg-white/20 hover:scale-105 transition border border-transparent">
                    <p class="text-xs sm:text-sm text-blue-200">En proceso</p>
                    <p id="stat-proceso" class="text-xl sm:text-3xl font-bold text-blue-400">0</p>
                </div>
                <div id="tarjeta-terminado" onclick="filtrarPorEstado('terminado')" class="bg-white/10 backdrop-blur-lg p-3 sm:p-6 rounded-xl shadow-lg text-center cursor-pointer hover:bg-white/20 hover:scale-105 transition border border-transparent">
                    <p class="text-xs sm:text-sm text-blue-200">Terminadas</p>
                    <p id="stat-terminado" class="text-xl sm:text-3xl font-bold text-green-400">0</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div id="caja-formulario-reparacion" class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-2 lg:order-1 relative">
                    <h2 class="text-xl font-semibold mb-4 border-b pb-2" id="form-title">Nueva Reparación</h2>
                    <input type="hidden" id="rep-id">

                    <label class="block text-sm mt-3 font-semibold text-gray-700">Cliente</label>
                    <div class="mt-1 relative">
                        <input type="hidden" id="cliente_id">
                        <input type="text" id="cliente_search" class="w-full p-2.5 border rounded focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800" placeholder="Escribe para buscar cliente..." autocomplete="off" onkeyup="filtrarClientes('cliente_search', 'cliente_dropdown', seleccionarClienteReparacion)">
                        <ul id="cliente_dropdown" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 hidden max-h-48 overflow-y-auto shadow-xl"></ul>
                    </div>

                    <div id="cliente_info" class="text-sm mt-2 p-3 bg-blue-50 text-blue-800 rounded hidden border border-blue-200"></div>

                    <label class="block text-sm mt-3 font-semibold text-gray-700">Máquina del Cliente</label>
                    <select id="reparacion_maquina_id" class="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800">
                        <option value="">Selecciona primero un cliente...</option>
                    </select>

                    <label class="block text-sm mt-3 font-semibold text-gray-700">Técnico</label>
                    <select id="tecnico_id" class="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800">
                        <option value="">Seleccione un técnico...</option>
                    </select>

                    <label class="block text-sm mt-3 font-semibold text-gray-700">Descripción</label>
                    <textarea id="descripcion" class="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800" rows="3"></textarea>

                    <label class="block text-sm mt-3 font-semibold text-gray-700">Fecha de Entrada</label>
                    <input type="date" id="fecha_entrada" class="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800">

                    <label class="block text-sm mt-3 font-semibold text-gray-700">Estado</label>
                    <select id="estado" class="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800">
                        <option value="pendiente">Pendiente</option>
                        <option value="en proceso">En proceso</option>
                        <option value="terminado">Terminado</option>
                    </select>

                    <div class="flex flex-col sm:flex-row gap-2 mt-6">
                        <button onclick="guardarReparacion()" class="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold shadow-md">Guardar</button>
                        <button onclick="limpiarFormulario()" type="button" class="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition font-semibold shadow-md">Limpiar</button>
                    </div>
                </div>

                <div id="caja-tabla-reparaciones" class="lg:col-span-2 bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-1 lg:order-2">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                            <tr class="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <th class="py-3 px-4 text-left whitespace-nowrap">Aviso</th>
                                <th class="py-3 px-4 text-left whitespace-nowrap">Cliente / Máquina</th>
                                <th class="py-3 px-4 text-left whitespace-nowrap">Estado</th>
                                <th class="py-3 px-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                            </thead>
                            <tbody id="tabla-reparaciones"></tbody>
                        </table>
                    </div>
                    <div id="paginacion-reparaciones" class="flex justify-between items-center mt-4 bg-gray-50 p-3 rounded-lg border hidden">
                        <button onclick="cambiarPaginaReparaciones(-1)" id="btn-prev-rep" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed">⬅️ Anterior</button>
                        <span id="texto-paginacion-rep" class="text-sm font-bold text-gray-700 uppercase">Página 1 de 1</span>
                        <button onclick="cambiarPaginaReparaciones(1)" id="btn-next-rep" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed">Siguiente ➡️</button>
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

        <div id="pantalla_libres" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-yellow-400">Bandeja de Avisos Libres</h1>
            <p class="text-blue-200 mb-6">Avisos pendientes que aún no tienen ningún técnico asignado. Pulsa ▶️ para asignártelo y empezar a trabajar.</p>

            <div class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                        <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                            <th class="py-3 px-4 text-left whitespace-nowrap">Fecha / Aviso</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Cliente / Máquina</th>
                            <th class="py-3 px-4 text-left whitespace-nowrap">Avería</th>
                            <th class="py-3 px-4 text-center whitespace-nowrap">Asignarme</th>
                        </tr>
                        </thead>
                        <tbody id="tabla-avisos-libres"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="pantalla_clientes" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Historial por Cliente</h1>

            <div class="bg-white p-5 lg:p-6 rounded-2xl shadow-xl text-gray-800 mb-8 flex flex-col md:flex-row gap-6 items-end">
                <div class="w-full md:w-1/3 relative">
                    <label class="block text-sm font-semibold mb-2">Busca un Cliente:</label>
                    <input type="text" id="historial_cliente_search" class="w-full p-2.5 border rounded focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Escribe nombre o teléfono..." autocomplete="off" onkeyup="filtrarClientes('historial_cliente_search', 'historial_cliente_dropdown', cargarHistorialCliente)">
                    <ul id="historial_cliente_dropdown" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 hidden max-h-60 overflow-y-auto shadow-2xl text-sm"></ul>
                </div>
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-semibold mb-2">Desde:</label>
                    <input type="date" id="filtro_cli_fecha_inicio" class="w-full p-2.5 border rounded bg-gray-50" onchange="aplicarFiltroFechasCliente()">
                </div>
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-semibold mb-2">Hasta:</label>
                    <input type="date" id="filtro_cli_fecha_fin" class="w-full p-2.5 border rounded bg-gray-50" onchange="aplicarFiltroFechasCliente()">
                </div>
            </div>

            <div id="contenedor_historial_cliente" class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl">
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
                        <tbody id="tabla-historial-cliente">
                        <tr><td colspan="4" class="text-center py-8 text-gray-500 italic">Selecciona un cliente y un rango de fechas para ver el historial.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="pantalla_tecnicos" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Trabajo de Técnicos</h1>

            <div class="bg-white p-5 lg:p-6 rounded-2xl shadow-xl text-gray-800 mb-8 flex flex-col md:flex-row gap-6 items-end">
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-semibold mb-2">Selecciona un Técnico:</label>
                    <select id="filtro_tecnico_id" onchange="filtrarHistorialTecnicos()" class="w-full p-2.5 border rounded focus:ring-2 focus:ring-blue-400 bg-gray-50">
                        <option value="">Todos los técnicos</option>
                    </select>
                </div>
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-semibold mb-2">Desde :</label>
                    <input type="date" id="filtro_fecha_inicio" onchange="filtrarHistorialTecnicos()" class="w-full p-2.5 border rounded bg-gray-50">
                </div>
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-semibold mb-2">Hasta:</label>
                    <input type="date" id="filtro_fecha_fin" onchange="filtrarHistorialTecnicos()" class="w-full p-2.5 border rounded bg-gray-50">
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
                            <th class="py-3 px-4 text-left whitespace-nowrap">Estado</th>
                        </tr>
                        </thead>
                        <tbody id="tabla-historial-tecnico">
                        <tr><td colspan="4" class="text-center py-8 text-gray-500">Selecciona filtros arriba para ver el historial.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="pantalla_gestion_clientes" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Gestión de Clientes</h1>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-2 lg:order-1 relative">
                    <h2 class="text-xl font-semibold mb-4 border-b pb-2" id="form-title-cliente">Añadir Cliente</h2>
                    <input type="hidden" id="gestion_cli_id">

                    <label class="block text-sm mt-3 font-semibold">Nombre <span class="text-red-500">*</span></label>
                    <input type="text" id="gestion_cli_nombre" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50">

                    <label class="block text-sm mt-3 font-semibold">Email</label>
                    <input type="email" id="gestion_cli_email" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50">

                    <label class="block text-sm mt-3 font-semibold">Teléfono</label>
                    <input type="text" id="gestion_cli_telefono" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50">

                    <label class="block text-sm mt-3 font-semibold">Dirección</label>
                    <input type="text" id="gestion_cli_direccion" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50">

                    <div class="flex gap-2 mt-6">
                        <button onclick="guardarClienteGestion()" class="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold shadow-md">Guardar</button>
                        <button onclick="limpiarFormClienteGestion()" type="button" class="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition font-semibold shadow-md">Limpiar</button>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-1 lg:order-2">
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-gray-600 mb-2">Buscar Cliente:</label>
                        <div class="relative">
                            <input type="text" id="buscador_gestion_clientes"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800"
                                   placeholder="Escribe nombre, email o teléfono..."
                                   onkeyup="filtrarTablaGestionClientes()">
                            <span class="absolute right-3 top-3 text-gray-400">🔍</span>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                            <tr class="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <th class="py-3 px-4 text-left whitespace-nowrap">Nombre / Email</th>
                                <th class="py-3 px-4 text-left whitespace-nowrap">Contacto</th>
                                <th class="py-3 px-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                            </thead>
                            <tbody id="tabla-gestion-clientes">
                            <tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar un cliente...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div id="pantalla_maquinas" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Parque de Máquinas</h1>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-2 lg:order-1 relative">
                    <h2 class="text-xl font-semibold mb-4 border-b pb-2" id="form-title-maquina">Añadir Máquina</h2>
                    <input type="hidden" id="maq_id">

                    <label class="block text-sm mt-3 font-semibold">Modelo <span class="text-red-500">*</span></label>
                    <input type="text" id="maq_modelo" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Ej: Konica Minolta C258">

                    <label class="block text-sm mt-3 font-semibold">Número de Serie <span class="text-red-500">*</span></label>
                    <input type="text" id="maq_sn" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Ej: A0ED021...">

                    <label class="block text-sm mt-3 font-semibold">Asignar a Cliente</label>
                    <div class="relative w-full mt-1">
                        <input type="hidden" id="maq_cliente_id">
                        <input type="text" id="maq_cliente_search" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Buscar cliente o dejar en blanco para Taller..." autocomplete="off" onkeyup="filtrarClientes('maq_cliente_search', 'maq_cliente_dropdown', seleccionarClienteMaquina)">
                        <ul id="maq_cliente_dropdown" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 hidden max-h-48 overflow-y-auto shadow-xl"></ul>
                    </div>

                    <div class="flex gap-2 mt-6">
                        <button onclick="guardarMaquina()" class="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold shadow-md">Guardar</button>
                        <button onclick="limpiarFormMaquina()" type="button" class="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition font-semibold shadow-md">Limpiar</button>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-1 lg:order-2">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                            <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                                <th class="py-3 px-4 text-left whitespace-nowrap">Modelo / S.N.</th>
                                <th class="py-3 px-4 text-left whitespace-nowrap">Cliente Asignado</th>
                                <th class="py-3 px-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                            </thead>
                            <tbody id="tabla-maquinas">
                            <tr><td colspan="3" class="text-center py-4">Cargando parque...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div id="pantalla_inventario" class="pantalla-seccion hidden">
            <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">Inventario de Piezas</h1>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-2 lg:order-1 relative">
                    <h2 class="text-xl font-semibold mb-4 border-b pb-2" id="form-title-pieza">Añadir Pieza</h2>
                    <input type="hidden" id="inv_id">

                    <label class="block text-sm mt-3 font-semibold">Referencia <span class="text-red-500">*</span></label>
                    <input type="text" id="inv_ref" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Ej: A0ED021...">

                    <label class="block text-sm mt-3 font-semibold">Descripción <span class="text-red-500">*</span></label>
                    <input type="text" id="inv_desc" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Ej: Tambor Cian">

                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block text-sm mt-3 font-semibold">Stock</label>
                            <input type="number" id="inv_stock" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" value="0">
                        </div>
                        <div class="flex-1">
                            <label class="block text-sm mt-3 font-semibold">Precio (€)</label>
                            <input type="number" step="0.01" id="inv_precio" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" value="0.00">
                        </div>
                    </div>

                    <div class="flex gap-2 mt-6">
                        <button onclick="guardarPiezaInventario()" class="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold shadow-md">Guardar</button>
                        <button onclick="limpiarFormPieza()" type="button" class="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition font-semibold shadow-md">Limpiar</button>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-1 lg:order-2">
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-gray-600 mb-2">Buscar Pieza en Inventario:</label>
                        <div class="relative">
                            <input type="text" id="buscador_inventario"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800"
                                   placeholder="Escribe la referencia o descripción (ej: Tambor Cian)..."
                                   onkeyup="filtrarTablaInventario()">
                            <span class="absolute right-3 top-3 text-gray-400">🔍</span>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                            <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                                <th class="py-3 px-4 text-left whitespace-nowrap">Ref / Desc</th>
                                <th class="py-3 px-4 text-center whitespace-nowrap">Stock / Precio</th>
                                <th class="py-3 px-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                            </thead>
                            <tbody id="tabla-inventario">
                            <tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar una pieza...</td></tr>
                            </tbody>
                        </table>
                    </div>
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

        <label class="block text-sm mt-3 font-semibold">Email <span class="text-red-500">*</span></label>
        <input type="email" id="nuevo_cliente_email" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="taller@ofimaticadigital.es">

        <label class="block text-sm mt-3 font-semibold">Teléfono</label>
        <input type="text" id="nuevo_cliente_telefono" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50">

        <label class="block text-sm mt-3 font-semibold">Dirección</label>
        <input type="text" id="nuevo_cliente_direccion" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400 bg-gray-50" placeholder="Ej: Avda. de la Libertad, 19, Petrer">

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

<div id="modal_finalizar" class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex justify-center items-center hidden overflow-y-auto py-10">
    <div class="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 mx-4">
        <h2 class="text-2xl font-bold mb-2 border-b pb-2 text-green-600">✅ Finalizar Reparación #<span id="fin_rep_id_display"></span></h2>
        <input type="hidden" id="fin_rep_id">

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
                <label class="block text-xs font-bold text-gray-700">Fecha Cierre <span class="text-red-500">*</span></label>
                <input type="date" id="fin_fecha_cierre" class="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 bg-gray-50">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700">Hora Inicio <span class="text-red-500">*</span></label>
                <input type="time" id="fin_hora_inicio" class="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 bg-gray-50">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700">Hora Fin <span class="text-red-500">*</span></label>
                <input type="time" id="fin_hora_fin" class="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 bg-gray-50">
            </div>
        </div>

        <label class="block text-sm mt-4 font-semibold text-gray-700">Trabajo Realizado / Resolución <span class="text-red-500">*</span></label>
        <textarea id="fin_resolucion" class="w-full p-3 border rounded mt-1 focus:ring-2 focus:ring-green-400 bg-gray-50" rows="4" placeholder="Describe qué se ha reparado, ajustado o limpiado..."></textarea>

        <div class="mt-6 border-t pt-4">
            <h3 class="text-lg font-bold text-blue-800 mb-3">🛠️ Piezas Utilizadas</h3>

            <div class="flex flex-col sm:flex-row gap-2 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 relative overflow-visible">
                <div class="relative flex-1">
                    <input type="text" id="add_pieza_ref" placeholder="Ref. / Código (Buscar...)" autocomplete="off" onkeyup="buscarPiezaModal()" class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-400">
                    <ul id="dropdown_piezas_modal" class="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 hidden max-h-40 overflow-y-auto shadow-2xl text-sm"></ul>
                </div>
                <input type="text" id="add_pieza_desc" placeholder="Descripción de la pieza" class="flex-[2] p-2 border rounded text-sm bg-gray-100" readonly>
                <input type="number" id="add_pieza_cant" placeholder="Cant." value="1" min="1" class="w-20 p-2 border rounded text-sm">
                <button type="button" onclick="agregarPiezaLista()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold text-sm">Añadir</button>
            </div>

            <table class="min-w-full text-sm border">
                <thead class="bg-gray-100">
                <tr>
                    <th class="p-2 text-left">Ref.</th>
                    <th class="p-2 text-left">Descripción</th>
                    <th class="p-2 text-center">Cant.</th>
                    <th class="p-2 text-center"></th>
                </tr>
                </thead>
                <tbody id="lista_piezas_tbody">
                <tr><td colspan="4" class="text-center p-3 text-gray-400 italic">No se han añadido piezas.</td></tr>
                </tbody>
            </table>
        </div>

        <div class="flex gap-3 mt-8">
            <button onclick="guardarFinalizacion()" class="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 transition font-bold text-lg shadow-lg">
                Cerrar Aviso
            </button>
            <button onclick="cerrarModalFinalizar()" type="button" class="flex-1 bg-gray-200 text-gray-700 p-3 rounded hover:bg-gray-300 transition font-bold text-lg shadow">
                Cancelar
            </button>
        </div>
    </div>
</div>

<script type="module" src="{{ asset('js/main.js') }}?v={{ time() }}"></script>

</body>
</html>
