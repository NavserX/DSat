<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Digital Soluciones - Panel Técnico</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
</head>

<body class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">

<div class="flex">

    <aside class="w-64 min-h-screen bg-slate-950/60 backdrop-blur-lg p-6 flex flex-col">

        <div class="mb-10">
            <img src="img/logo-web-ofimatica-digital2.webp" class="w-40 mb-4" alt="Logo">
            <h2 class="text-lg font-semibold text-blue-300">Panel Técnico</h2>
        </div>

        <nav class="space-y-2 flex-1">
            <a href="#" class="block px-4 py-2 rounded bg-blue-600">Reparaciones</a>
            <a href="#" class="block px-4 py-2 rounded hover:bg-slate-800 transition">Clientes</a>
            <a href="#" class="block px-4 py-2 rounded hover:bg-slate-800 transition">Técnicos</a>
            <a href="#" class="block px-4 py-2 rounded hover:bg-slate-800 transition">Estadísticas</a>
        </nav>

        <button onclick="logout()"
                class="mt-6 bg-red-600 py-2 rounded hover:bg-red-700 transition">
            Cerrar sesión
        </button>
    </aside>

    <main class="flex-1 p-10">

        <h1 class="text-3xl font-bold mb-8 text-blue-300">
            Gestión de Reparaciones
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg">
                <p class="text-sm text-blue-200">Pendientes</p>
                <p id="stat-pendientes" class="text-3xl font-bold text-yellow-400">0</p>
            </div>

            <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg">
                <p class="text-sm text-blue-200">En proceso</p>
                <p id="stat-proceso" class="text-3xl font-bold text-blue-400">0</p>
            </div>

            <div class="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg">
                <p class="text-sm text-blue-200">Terminadas</p>
                <p id="stat-terminado" class="text-3xl font-bold text-green-400">0</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div class="bg-white text-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 class="text-xl font-semibold mb-4 border-b pb-2" id="form-title">
                    Nueva Reparación
                </h2>

                <input type="hidden" id="rep-id">

                <label class="block text-sm mt-3">Cliente</label>
                <select id="cliente_id" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400">
                    <option value="">Seleccione un cliente...</option>
                </select>

                <label class="block text-sm mt-3">Técnico</label>
                <select id="tecnico_id" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400">
                    <option value="">Seleccione un técnico...</option>
                </select>

                <label class="block text-sm mt-3">Marca</label>
                <select id="marca_id" class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400">
                    <option value="">Seleccione una marca...</option>
                </select>

                <label class="block text-sm mt-3">Descripción</label>
                <textarea id="descripcion"
                          class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400"
                          rows="3"></textarea>

                <label class="block text-sm mt-3">Estado</label>
                <select id="estado"
                        class="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-400">
                    <option value="pendiente">Pendiente</option>
                    <option value="en proceso">En proceso</option>
                    <option value="terminado">Terminado</option>
                </select>

                <div class="flex gap-2 mt-6">
                    <button onclick="guardarReparacion()"
                            class="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold">
                        Guardar
                    </button>
                    <button onclick="limpiarFormulario()" type="button"
                            class="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition font-semibold">
                        Limpiar
                    </button>
                </div>
            </div>

            <div class="lg:col-span-2 bg-white text-gray-800 p-6 rounded-2xl shadow-xl">
                <table class="min-w-full text-sm">
                    <thead>
                    <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                        <th class="py-3 px-4 text-left">ID</th>
                        <th class="py-3 px-4 text-left">Cliente / Marca</th>
                        <th class="py-3 px-4 text-left">Estado</th>
                        <th class="py-3 px-4 text-center">Acciones</th>
                    </tr>
                    </thead>
                    <tbody id="tabla-reparaciones"></tbody>
                </table>
            </div>

        </div>

        <!-- Mapas de Google
        <div id="mapa-container" class="hidden mt-8 bg-white text-gray-800 p-6 rounded-2xl shadow-xl transition-all">
            <h2 class="text-xl font-semibold mb-4 border-b pb-2">
                Ubicación del Cliente
            </h2>

            <div class="relative w-full h-72 rounded-lg overflow-hidden group cursor-pointer border">
                <a id="link-ruta" href="#" target="_blank" class="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/20 transition duration-300">
                    <span class="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition transform translate-y-4 group-hover:translate-y-0">
                        📍 Ver ruta en Google Maps
                    </span>
                </a>

                <iframe id="mapa-iframe" class="w-full h-full border-0 pointer-events-none" allowfullscreen="" loading="lazy"></iframe>
            </div>
        </div> -->

    </main>
</div>

<script>
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';

    // --- CARGA DE DESPLEGABLES ---

    // Variable global para almacenar los datos completos de los clientes
    let listaClientes = [];

    async function cargarClientes() {
        try {
            const res = await fetch('/api/clientes', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Error al cargar clientes');

            listaClientes = await res.json(); // Guardamos los clientes aquí

            const select = document.getElementById('cliente_id');
            select.innerHTML = '<option value="">Seleccione un cliente...</option>'; // Resetea opciones
            listaClientes.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
        } catch (error) { console.error(error); }
    }

    // --- LÓGICA DEL MAPA DE GOOGLE ---
    document.getElementById('cliente_id').addEventListener('change', function() {
        const clienteId = this.value;
        const mapContainer = document.getElementById('mapa-container');
        const mapIframe = document.getElementById('mapa-iframe');
        const linkRuta = document.getElementById('link-ruta');

        // Si se vuelve a la opción por defecto, ocultamos el mapa
        if (!clienteId) {
            mapContainer.classList.add('hidden');
            return;
        }

        // Buscamos los datos completos del cliente seleccionado
        const cliente = listaClientes.find(c => c.id == clienteId);

        // OJO: Asegúrate de que tu backend devuelve un campo con la dirección (ej. 'direccion')
        if (cliente && cliente.direccion) {
            // Codificamos la dirección para que sea válida en una URL (cambia espacios por %20, etc.)
            const direccionCodificada = encodeURIComponent(cliente.direccion);

            // 1. Cargamos el mapa visual en el iframe
            mapIframe.src = `https://maps.google.com/maps?q=${direccionCodificada}&output=embed`;

            // 2. Preparamos el enlace para que abra Google Maps con la ruta (destination)
            linkRuta.href = `https://www.google.com/maps/dir/?api=1&destination=${direccionCodificada}`;

            // Mostramos el contenedor
            mapContainer.classList.remove('hidden');
        } else {
            // Si el cliente no tiene dirección registrada en la BD, lo ocultamos
            mapContainer.classList.add('hidden');
        }
    });

    /*async function cargarClientes() {
        try {
            const res = await fetch('/api/clientes', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Error al cargar clientes');
            const clientes = await res.json();
            const select = document.getElementById('cliente_id');
            clientes.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
        } catch (error) { console.error(error); }
    }*/

    async function cargarTecnicos() {
        try {
            const res = await fetch('/api/tecnicos', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Error al cargar técnicos');
            const tecnicos = await res.json();
            const select = document.getElementById('tecnico_id');
            tecnicos.forEach(t => select.innerHTML += `<option value="${t.id}">${t.nombre}</option>`);
        } catch (error) { console.error(error); }
    }

    async function cargarMarcas() {
        try {
            const res = await fetch('/api/marcas', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Error al cargar marcas');
            const marcas = await res.json();
            const select = document.getElementById('marca_id');
            marcas.forEach(m => select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`);
        } catch (error) { console.error(error); }
    }

    // --- CARGA Y GESTIÓN DE REPARACIONES ---

    async function cargarReparaciones() {
        try {
            const res = await fetch('/api/reparaciones', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar reparaciones');
            const data = await res.json();

            const tbody = document.getElementById('tabla-reparaciones');
            tbody.innerHTML = '';

            let pendientes = 0, proceso = 0, terminado = 0;

            data.forEach(rep => {
                if (rep.estado === 'pendiente') pendientes++;
                if (rep.estado === 'en proceso') proceso++;
                if (rep.estado === 'terminado') terminado++;

                let color = {
                    pendiente: 'bg-yellow-100 text-yellow-700',
                    "en proceso": 'bg-blue-100 text-blue-700',
                    terminado: 'bg-green-100 text-green-700'
                }[rep.estado] || 'bg-gray-100 text-gray-700';

                // Usamos JSON.stringify y escapamos las comillas para evitar errores al pasar el objeto
                const repJSON = JSON.stringify(rep).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

                tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="py-4 px-4 font-bold text-blue-600">#${rep.id}</td>
                    <td class="py-4 px-4">
                        <div class="font-medium">${rep.cliente?.nombre || 'S/N'}</div>
                        <div class="text-gray-500 text-xs">${rep.marca?.nombre || 'S/N'}</div>
                    </td>
                    <td class="py-4 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${color}">
                            ${rep.estado}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-center space-x-2">
                        <button onclick="editarReparacion('${repJSON}')"
                                class="text-blue-500 hover:text-blue-700" title="Editar">✏️</button>
                        <button onclick="borrarReparacion(${rep.id})"
                                class="text-red-500 hover:text-red-700" title="Borrar">🗑️</button>
                    </td>
                </tr>
                `;
            });

            document.getElementById('stat-pendientes').innerText = pendientes;
            document.getElementById('stat-proceso').innerText = proceso;
            document.getElementById('stat-terminado').innerText = terminado;
        } catch (error) { console.error(error); }
    }

    async function guardarReparacion() {
        const id = document.getElementById('rep-id').value;
        const datos = {
            cliente_id: document.getElementById('cliente_id').value,
            tecnico_id: document.getElementById('tecnico_id').value,
            marca_id: document.getElementById('marca_id').value,
            descripcion: document.getElementById('descripcion').value,
            estado: document.getElementById('estado').value
        };

        // Validación básica
        if (!datos.cliente_id || !datos.tecnico_id || !datos.marca_id) {
            alert('Por favor, selecciona un Cliente, Técnico y Marca.');
            return;
        }

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `/api/reparaciones/${id}` : '/api/reparaciones';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                limpiarFormulario();
                cargarReparaciones(); // Recargar tabla
            } else {
                alert('Error al guardar la reparación');
            }
        } catch (error) { console.error(error); }
    }

    function editarReparacion(repJSON) {
        // Desparsear el JSON escapado
        const rep = JSON.parse(repJSON.replace(/&quot;/g, '"').replace(/&apos;/g, "'"));

        document.getElementById('form-title').innerText = 'Editar Reparación #' + rep.id;
        document.getElementById('rep-id').value = rep.id;
        document.getElementById('cliente_id').value = rep.cliente_id;
        document.getElementById('tecnico_id').value = rep.tecnico_id;
        document.getElementById('marca_id').value = rep.marca_id;
        document.getElementById('descripcion').value = rep.descripcion || '';
        document.getElementById('estado').value = rep.estado;
    }

    async function borrarReparacion(id) {
        if (!confirm('¿Estás seguro de que deseas borrar esta reparación?')) return;

        try {
            const res = await fetch(`/api/reparaciones/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                cargarReparaciones();
            } else {
                alert('Error al borrar la reparación');
            }
        } catch (error) { console.error(error); }
    }

    function limpiarFormulario() {
        document.getElementById('form-title').innerText = 'Nueva Reparación';
        document.getElementById('rep-id').value = '';
        document.getElementById('cliente_id').value = '';
        document.getElementById('tecnico_id').value = '';
        document.getElementById('marca_id').value = '';
        document.getElementById('descripcion').value = '';
        document.getElementById('estado').value = 'pendiente';
    }

    function logout() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }



    // --- INICIALIZACIÓN ---
    cargarClientes();
    cargarTecnicos();
    cargarMarcas();
    cargarReparaciones();

</script>

</body>
</html>
