<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal del Cliente - Digital Soluciones</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://kit.fontawesome.com/6b6f3e3b2a.js" crossorigin="anonymous"></script>

    <style>
        .fade-in {
            animation: fadeIn 0.7s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
</head>

<body class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white font-sans relative">

<div id="vista-login" class="flex flex-col lg:flex-row min-h-screen w-full transition-all duration-300">

    <div class="w-full lg:w-1/2 text-white flex flex-col justify-center items-center p-8 lg:p-12">
        <a href="https://ofimaticadigital.es/" class="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
            <img src="{{ asset('img/logo-web-ofimatica-digital.webp') }}" alt="Digital Soluciones" class="w-48 lg:w-64 mb-6 lg:mb-8" onerror="this.src='{{ asset('img/logo.png') }}'; this.onerror=null;">
        </a>
        <h2 class="text-2xl lg:text-3xl font-bold mb-4 text-center">Portal del Cliente</h2>
        <p class="text-base lg:text-lg text-blue-200 text-center max-w-md">
            Accede con tus datos para solicitar asistencia técnica de forma rápida, ver tus equipos y enviarnos un aviso directamente al taller.
        </p>
        <div class="mt-6 lg:mt-8 space-y-2 lg:space-y-3 text-blue-300 text-center lg:text-left">
            <p><i class="fas fa-bolt mr-2"></i> Asistencia rápida</p>
            <p><i class="fas fa-print mr-2"></i> Selección de tu equipo</p>
            <p><i class="fas fa-headset mr-2"></i> Conexión directa con técnicos</p>
        </div>
    </div>

    <div class="flex w-full lg:w-1/2 justify-center items-center p-6 pb-12 lg:p-12">
        <div class="bg-white p-8 lg:p-10 rounded-2xl shadow-2xl w-full max-w-sm fade-in text-gray-800">
            <h1 class="text-xl lg:text-2xl font-semibold text-gray-700 text-center mb-6">
                Acceso Clientes
            </h1>

            <div class="mb-4 relative">
                <i class="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
                <input type="email" id="cli_email" placeholder="Correo electrónico" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-gray-50">
            </div>

            <div class="mb-6 relative">
                <i class="fas fa-phone absolute left-3 top-3.5 text-gray-400"></i>
                <input type="tel" id="cli_telefono" placeholder="Teléfono" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-gray-50">
            </div>

            <button onclick="intentarLoginCliente()" class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 hover:shadow-lg active:scale-95 transition duration-200 font-semibold">
                Entrar al Portal
            </button>

            <p id="error-login" class="hidden text-red-500 text-sm mt-4 text-center font-medium">
                Datos incorrectos. Verifica tu email y teléfono.
            </p>

            <div class="text-center text-xs text-gray-400 mt-6">
                © 2026 Digital SAT - Portal Cliente
            </div>
        </div>
    </div>
</div>


<div id="vista-dashboard" class="hidden flex-col lg:flex-row min-h-screen w-full transition-all duration-300">

    <aside class="sticky top-0 z-50 w-full lg:w-64 lg:h-screen overflow-y-auto shadow-2xl bg-slate-950/60 backdrop-blur-lg p-4 lg:p-6 flex flex-col shrink-0">
        <div class="mb-4 lg:mb-10 flex flex-row lg:flex-col items-center lg:items-start justify-between">
            <div class="flex items-center lg:flex-col lg:items-start">
                <img src="{{ asset('img/logo-web-ofimatica-digital2.webp') }}" class="w-40 lg:w-48 mr-4 lg:mr-0 lg:mb-4" alt="Logo" onerror="this.src='{{ asset('img/logo.png') }}'; this.onerror=null;">
                <h2 class="text-base lg:text-lg font-semibold text-blue-300">Área de Cliente</h2>
            </div>
            <button onclick="cerrarSesionCliente()" class="block lg:hidden bg-red-600 text-sm px-4 py-2 rounded hover:bg-red-700 transition text-white">
                Salir
            </button>
        </div>

        <nav class="flex gap-2 lg:flex-col lg:space-y-2 flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <button onclick="prepararNuevoAviso()" class="w-full text-left px-4 py-2 rounded bg-blue-600 whitespace-nowrap text-white font-semibold hover:bg-blue-700 transition">
                ➕ Nuevo Aviso
            </button>
        </nav>

        <button onclick="cerrarSesionCliente()" class="hidden lg:block mt-6 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
            Cerrar sesión
        </button>
    </aside>

    <main class="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden relative">
        <h1 class="text-2xl lg:text-3xl font-bold mb-2 text-blue-300">Hola, <span id="nombre_cliente_display"></span></h1>
        <p class="text-blue-200 mb-8">¿En qué equipo necesitas asistencia técnica hoy?</p>

        <div class="bg-white text-gray-800 p-6 lg:p-8 rounded-2xl shadow-xl w-full max-w-2xl h-fit fade-in">
            <h2 class="text-xl font-semibold mb-6 border-b pb-2 text-gray-700">Registrar nueva avería</h2>

            <div id="bloque-maquinas">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Selecciona tu equipo</label>
                <div class="relative">
                    <i class="fas fa-print absolute left-3 top-3.5 text-gray-400"></i>
                    <select id="select_maquina" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-700 cursor-pointer">
                        <option value="">No lo sé / Es otro equipo distinto...</option>
                    </select>
                </div>
            </div>

            <div class="mt-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Describe el problema <span class="text-red-500">*</span></label>
                <textarea id="texto_averia" rows="5" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-700" placeholder="Ej: La impresora hace ruido al coger el papel y salen manchas negras en el lateral..."></textarea>
            </div>

            <div id="exito-aviso" class="hidden mt-6 bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium border border-green-200">
                <i class="fas fa-check-circle mr-2"></i> ¡Aviso registrado correctamente! Un técnico lo revisará lo antes posible.
            </div>

            <button id="btn-enviar" onclick="enviarAvisoCliente()" class="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md">
                <i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller
            </button>
        </div>
    </main>
</div>

<script>
    let datosClienteActual = null;

    async function intentarLoginCliente() {
        const email = document.getElementById('cli_email').value;
        const telefono = document.getElementById('cli_telefono').value;
        const errorBox = document.getElementById('error-login');

        if(!email || !telefono) {
            errorBox.textContent = "Por favor, rellena ambos campos para acceder.";
            errorBox.classList.remove('hidden');
            return;
        }

        try {
            // Llama al controlador independiente que creamos en el paso anterior
            const response = await fetch('/api/portal-cliente/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email: email, telefono: telefono })
            });

            if (response.ok) {
                datosClienteActual = await response.json();
                errorBox.classList.add('hidden');
                abrirPanelCliente();
            } else {
                errorBox.textContent = "Credenciales incorrectas. Comprueba tu email y teléfono.";
                errorBox.classList.remove('hidden');
            }
        } catch (error) {
            errorBox.textContent = "Error de red. Inténtalo más tarde.";
            errorBox.classList.remove('hidden');
        }
    }

    function abrirPanelCliente() {
        // Escribo el nombre del cliente
        document.getElementById('nombre_cliente_display').textContent = datosClienteActual.nombre;

        // Relleno el select SOLO con las máquinas que pertenecen a este cliente
        const select = document.getElementById('select_maquina');
        select.innerHTML = '<option value="">No lo sé / Es otro equipo distinto...</option>';

        if(datosClienteActual.maquinas && datosClienteActual.maquinas.length > 0) {
            datosClienteActual.maquinas.forEach(maq => {
                const option = document.createElement('option');
                option.value = maq.id;
                option.textContent = maq.modelo + " (S/N: " + maq.numero_serie + ")";
                select.appendChild(option);
            });
        }

        // Transición de cambio de pantalla usando clases de Flexbox
        document.getElementById('vista-login').classList.add('hidden');
        document.getElementById('vista-login').classList.remove('flex');

        document.getElementById('vista-dashboard').classList.remove('hidden');
        document.getElementById('vista-dashboard').classList.add('flex');
    }

    async function enviarAvisoCliente() {
        const averia = document.getElementById('texto_averia').value;
        const idMaquina = document.getElementById('select_maquina').value;
        const btn = document.getElementById('btn-enviar');

        if(averia.trim() === '') {
            alert("Por favor, explícanos el problema que tiene la máquina.");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

        try {
            const response = await fetch('/api/portal-cliente/aviso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    cliente_id: datosClienteActual.id,
                    maquina_id: idMaquina !== "" ? idMaquina : null,
                    descripcion: averia
                })
            });

            if (response.ok) {
                document.getElementById('exito-aviso').classList.remove('hidden');
                document.getElementById('texto_averia').value = "";
                if (btn) btn.classList.add('hidden'); // <-- Añadido el if (btn) para evitar el error
            } else {
                alert("No hemos podido registrar el aviso. Llámanos por teléfono.");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller';
            }
        } catch (error) {
            alert("Error de conexión al enviar el aviso.");
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller';
        }
    }

    // =================================================================
    // Función para limpiar la pantalla y escribir un aviso nuevo
    // =================================================================
    function prepararNuevoAviso() {
        // Vacio la caja de texto
        document.getElementById('texto_averia').value = "";
        // Vacio también la selección de maquina
        document.getElementById('select_maquina').value = "";

        // Oculto el mensaje verde de éxito
        const mensajeExito = document.getElementById('exito-aviso');
        if (mensajeExito) mensajeExito.classList.add('hidden');

        // Vuelvo a mostrar el botón de enviar
        const btn = document.getElementById('btn-enviar');
        if (btn) {
            btn.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller';
        }
    }

    function cerrarSesionCliente() {
        // Borro los datos temporales
        datosClienteActual = null;
        document.getElementById('cli_email').value = "";
        document.getElementById('cli_telefono').value = "";
        document.getElementById('texto_averia').value = "";
        document.getElementById('exito-aviso').classList.add('hidden');

        // Restauro el botón de enviar por si quiere poner otro aviso más tarde
        const btn = document.getElementById('btn-enviar');
        btn.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller';

        // Vuelvo a la pantalla de login
        document.getElementById('vista-dashboard').classList.add('hidden');
        document.getElementById('vista-dashboard').classList.remove('flex');

        document.getElementById('vista-login').classList.remove('hidden');
        document.getElementById('vista-login').classList.add('flex');
    }
</script>
</body>
</html>
