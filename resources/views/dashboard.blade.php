<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Soluciones - Panel Técnico</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
</head>

<body class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">

<div class="flex flex-col lg:flex-row min-h-screen">

    <aside class="w-full lg:w-64 bg-slate-950/60 backdrop-blur-lg p-4 lg:p-6 flex flex-col shrink-0">

        <div class="mb-4 lg:mb-10 flex flex-row lg:flex-col items-center lg:items-start justify-between">
            <div class="flex items-center lg:flex-col lg:items-start">
                <img src="img/logo-web-ofimatica-digital2.webp" class="w-32 lg:w-40 mr-4 lg:mr-0 lg:mb-4" alt="Logo">
                <h2 class="text-base lg:text-lg font-semibold text-blue-300">Panel Técnico</h2>
            </div>

            <button onclick="logout()"
                    class="block lg:hidden bg-red-600 text-sm px-4 py-2 rounded hover:bg-red-700 transition">
                Salir
            </button>
        </div>

        <nav class="flex gap-2 lg:flex-col lg:space-y-2 flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <a href="#" class="px-4 py-2 rounded bg-blue-600 whitespace-nowrap">Reparaciones</a>
            <a href="#" class="px-4 py-2 rounded hover:bg-slate-800 transition whitespace-nowrap">Clientes</a>
            <a href="#" class="px-4 py-2 rounded hover:bg-slate-800 transition whitespace-nowrap">Técnicos</a>
            <a href="#" class="px-4 py-2 rounded hover:bg-slate-800 transition whitespace-nowrap">Estadísticas</a>
        </nav>

        <button onclick="logout()"
                class="hidden lg:block mt-6 bg-red-600 py-2 rounded hover:bg-red-700 transition">
            Cerrar sesión
        </button>
    </aside>

    <main class="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden">

        <h1 class="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-blue-300">
            Gestión de Reparaciones
        </h1>

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

            <div class="bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-2 lg:order-1">
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

                <div class="flex flex-col sm:flex-row gap-2 mt-6">
                    <button onclick="guardarReparacion()"
                            class="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold">
                        Guardar
                    </button>
                    <button onclick="limpiarFormulario()" type="button"
                            class="flex-1 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition font-semibold">
                        Limpiar
                    </button>
                </div>
            </div>

            <div class="lg:col-span-2 bg-white text-gray-800 p-5 lg:p-6 rounded-2xl shadow-xl order-1 lg:order-2">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                        <tr class="bg-gray-100 text-gray-600 uppercase text-xs">
                            <th class="py-3 px-4 text-left whitespace-nowrap">ID</th>
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
    </main>
</div>

<script>
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';

    // --- CARGA DE DESPLEGABLES ---
    let listaClientes = [];

    async function cargarClientes() {
        try {
            const res = await fetch('/api/clientes', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Error al cargar clientes');
            listaClientes = await res.json();
            const select = document.getElementById('cliente_id');
            select.innerHTML = '<option value="">Seleccione un cliente...</option>';
            listaClientes.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
        } catch (error) { console.error(error); }
    }

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

                const repJSON = JSON.stringify(rep).replace(/'/g, "\\'").replace(/"/g, "&quot;");

                tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="py-4 px-4 font-bold text-blue-600 whitespace-nowrap">#${rep.id}</td>
                    <td class="py-4 px-4 min-w-[200px]">
                        <div class="font-medium">${rep.cliente?.nombre || 'S/N'}</div>
                        <div class="text-gray-500 text-xs">${rep.marca?.nombre || 'S/N'}</div>
                    </td>
                    <td class="py-4 px-4 whitespace-nowrap">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${color}">
                            ${rep.estado}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-center space-x-2 whitespace-nowrap">
                        <button onclick="editarReparacion('${repJSON}')"
                                class="text-blue-500 hover:text-blue-700 p-2" title="Editar">✏️</button>
                        <button onclick="borrarReparacion(${rep.id})"
                                class="text-red-500 hover:text-red-700 p-2" title="Borrar">🗑️</button>
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
                cargarReparaciones();
            } else {
                alert('Error al guardar la reparación');
            }
        } catch (error) { console.error(error); }
    }

    function editarReparacion(repJSON) {
        // Restaurar entidades HTML para parsear correctamente
        const decodedJSON = repJSON.replace(/&quot;/g, '"');
        const rep = JSON.parse(decodedJSON);

        document.getElementById('form-title').innerText = 'Editar Reparación #' + rep.id;
        document.getElementById('rep-id').value = rep.id;
        document.getElementById('cliente_id').value = rep.cliente_id;
        document.getElementById('tecnico_id').value = rep.tecnico_id;
        document.getElementById('marca_id').value = rep.marca_id;
        document.getElementById('descripcion').value = rep.descripcion || '';
        document.getElementById('estado').value = rep.estado;

        // Hacer scroll automático al formulario en móviles
        document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
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
        window.location.href = '/';
    }

    // --- INICIALIZACIÓN ---
    cargarClientes();
    cargarTecnicos();
    cargarMarcas();
    cargarReparaciones();

</script>

</body>
</html>
