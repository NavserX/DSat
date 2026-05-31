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

    <main class="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-y-auto relative">
        <h1 class="text-2xl lg:text-3xl font-bold mb-2 text-blue-300">Hola, <span id="nombre_cliente_display"></span></h1>
        <p class="text-blue-200 mb-8">¿En qué equipo necesitas asistencia técnica hoy?</p>

        <div class="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            <div class="bg-white text-gray-800 p-6 lg:p-8 rounded-2xl shadow-xl w-full lg:w-1/2 h-fit fade-in">
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
                    <textarea id="texto_averia" rows="5" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-700" placeholder="Ej: La impresora hace ruido al coger el papel..."></textarea>
                </div>

                <div id="exito-aviso" class="hidden mt-6 bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium border border-green-200">
                    <i class="fas fa-check-circle mr-2"></i> ¡Aviso registrado! Un técnico lo revisará pronto.
                </div>

                <button id="btn-enviar" onclick="enviarAvisoCliente()" class="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md">
                    <i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller
                </button>
            </div>

            <div class="bg-white text-gray-800 p-6 lg:p-8 rounded-2xl shadow-xl w-full lg:w-1/2 h-fit fade-in">
                <h2 class="text-xl font-semibold mb-6 border-b pb-2 text-gray-700">Tus últimos 5 avisos</h2>

                <div id="lista_historial_cliente" class="space-y-4">
                    <p class="text-center text-gray-400 py-4 italic">Cargando avisos...</p>
                </div>
            </div>

        </div>
    </main>
</div>

<script>
    // =================================================================
    // VARIABLES GLOBALES
    // =================================================================
    // Aquí guardo los datos del cliente temporalmente mientras usa la web
    let datosClienteActual = null;

    // Aquí guardo el "reloj" que actualiza la pantalla de fondo para poder pararlo cuando cierre sesión
    let temporizadorCliente = null;

    // =================================================================
    // 1. INICIAR SESIÓN
    // =================================================================
    async function intentarLoginCliente() {
        // Recojo lo que ha escrito en las casillas
        const email = document.getElementById('cli_email').value;
        const telefono = document.getElementById('cli_telefono').value;
        const errorBox = document.getElementById('error-login');

        // Si se deja algo en blanco, le aviso y me salgo de la función
        if(!email || !telefono) {
            errorBox.textContent = "Por favor, rellena ambos campos para acceder.";
            errorBox.classList.remove('hidden');
            return;
        }

        try {
            // Llamo a la puerta de mi servidor para ver si existe este cliente
            const response = await fetch('/api/portal-cliente/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email: email, telefono: telefono })
            });

            if (response.ok) {
                // Si me deja entrar, me guardo sus datos en mi variable global
                datosClienteActual = await response.json();

                // Oculto el mensaje de error por si estaba visible
                errorBox.classList.add('hidden');

                // Cambio a la pantalla del panel
                abrirPanelCliente();

                // Arranco el motor automático que actualiza la tabla de fondo cada 5 segundos (5000 ms)
                // Primero me aseguro de matar el temporizador viejo si lo hubiera, para no duplicar procesos
                if (temporizadorCliente) clearInterval(temporizadorCliente);
                temporizadorCliente = setInterval(actualizarHistorialFondo, 5000);

            } else {
                // Si el servidor me dice que no lo encuentra
                errorBox.textContent = "Credenciales incorrectas. Comprueba tu email y teléfono.";
                errorBox.classList.remove('hidden');
            }
        } catch (error) {
            errorBox.textContent = "Error de red. Inténtalo más tarde.";
            errorBox.classList.remove('hidden');
        }
    }

    // =================================================================
    // 2. PREPARAR Y ABRIR EL PANEL PRINCIPAL
    // =================================================================
    function abrirPanelCliente() {
        // Escribo el nombre del cliente arriba del todo
        document.getElementById('nombre_cliente_display').textContent = datosClienteActual.nombre;

        // Relleno el desplegable SOLO con las máquinas que le pertenecen a este cliente
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

        // Llamo a mi función para que dibuje las tarjetitas de la derecha
        dibujarHistorialCliente();

        // Transición: Oculto la pantalla de login y muestro el panel usando las clases flex de Tailwind
        document.getElementById('vista-login').classList.add('hidden');
        document.getElementById('vista-login').classList.remove('flex');

        document.getElementById('vista-dashboard').classList.remove('hidden');
        document.getElementById('vista-dashboard').classList.add('flex');
    }

    // =================================================================
    // 3. DIBUJAR LAS TARJETAS DEL HISTORIAL (Sin tocar el formulario)
    // =================================================================
    function dibujarHistorialCliente() {
        const listaHistorial = document.getElementById('lista_historial_cliente');
        listaHistorial.innerHTML = ''; // Vacio la caja por completo antes de empezar a pintar

        if(datosClienteActual.ultimos_avisos && datosClienteActual.ultimos_avisos.length > 0) {
            datosClienteActual.ultimos_avisos.forEach(aviso => {

                // Preparo los colores y textos exactamente iguales a mi panel técnico
                let badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                let icon = 'fa-clock';
                let textoEstado = 'Pendiente';

                if(aviso.estado === 'en proceso') {
                    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                    icon = 'fa-tools';
                    textoEstado = 'En proceso';
                } else if(aviso.estado === 'terminado') {
                    badgeColor = 'bg-green-100 text-green-800 border-green-200';
                    icon = 'fa-check-circle';
                    textoEstado = 'Terminada';
                }

                // Saco el nombre de la máquina (si la puso)
                let nombreMaquina = aviso.maquina ? aviso.maquina.modelo : 'Equipo sin especificar';

                // Cojo solo la fecha (los 10 primeros caracteres) y le doy la vuelta para leerla bien en España
                let fechaRaw = aviso.created_at ? aviso.created_at.substring(0, 10) : aviso.fecha_entrada;
                let partes = fechaRaw.split('-');
                let fechaFormateada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaRaw;

                // Inyecto la tarjetita directamente en el HTML
                listaHistorial.innerHTML += `
                        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition shadow-sm">
                            <div class="flex justify-between items-start mb-2">
                                <span class="font-bold text-gray-800 text-sm">#${aviso.id} - ${nombreMaquina}</span>
                                <span class="text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColor}">
                                    <i class="fas ${icon} mr-1"></i> ${textoEstado}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 line-clamp-2">${aviso.descripcion}</p>
                            <p class="text-xs text-gray-400 mt-3 font-medium">Registrado: ${fechaFormateada}</p>
                        </div>
                    `;
            });
        } else {
            // Si no tiene historial, le pinto un icono de carpeta vacía
            listaHistorial.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-folder-open text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-500 italic">Aún no tienes avisos registrados.</p>
                    </div>`;
        }
    }

    // =================================================================
    // 4. ACTUALIZACIÓN INVISIBLE (El radar que busca cambios en los avisos)
    // =================================================================
    async function actualizarHistorialFondo() {
        // Si no hay ningún cliente logueado, corto la función de raíz
        if (!datosClienteActual) return;

        // Vuelvo a leer sus contraseñas de las cajas para preguntar a la base de datos de forma segura
        const email = document.getElementById('cli_email').value;
        const telefono = document.getElementById('cli_telefono').value;

        try {
            const response = await fetch('/api/portal-cliente/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email: email, telefono: telefono })
            });

            if (response.ok) {
                const datosActualizados = await response.json();

                // Sustituyo mi lista vieja de avisos por la nueva recién descargada
                datosClienteActual.ultimos_avisos = datosActualizados.ultimos_avisos;

                // Redibujo la zona de la derecha
                dibujarHistorialCliente();
            }
        } catch (error) {
            // Lo dejo vacío a propósito. Si hay un micro-corte de internet, no asusto al cliente con errores.
        }
    }

    // =================================================================
    // 5. ENVIAR UN NUEVO AVISO AL TALLER
    // =================================================================
    async function enviarAvisoCliente() {
        // Recojo la avería y qué máquina ha seleccionado
        const averia = document.getElementById('texto_averia').value;
        const idMaquina = document.getElementById('select_maquina').value;
        const btn = document.getElementById('btn-enviar');

        // Contramedida: no le dejo enviar si la avería está en blanco
        if(averia.trim() === '') {
            alert("Por favor, explícanos el problema que tiene la máquina.");
            return;
        }

        // Bloqueo el botón para que no me haga doble click y meta 2 avisos iguales
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

        try {
            // Disparo la orden de guardar al servidor
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
                // El servidor me devuelve el ticket que acaba de generar en la base de datos
                const nuevoAviso = await response.json();

                // Le pego el nombre de la máquina para que al pintar la tarjeta se vea bonito
                if (nuevoAviso.maquina_id) {
                    nuevoAviso.maquina = datosClienteActual.maquinas.find(m => m.id == nuevoAviso.maquina_id);
                }

                // Lo meto a la fuerza en el primer puesto (arriba del todo) de mi lista de últimos avisos
                if (!datosClienteActual.ultimos_avisos) datosClienteActual.ultimos_avisos = [];
                datosClienteActual.ultimos_avisos.unshift(nuevoAviso);

                // Si por meter este ahora tengo 6 avisos, borro el más viejo (el último) para no pasarme de 5
                if (datosClienteActual.ultimos_avisos.length > 5) {
                    datosClienteActual.ultimos_avisos.pop();
                }

                // Doy la orden de redibujar la columna de la derecha para que el cliente vea el aviso al instante
                dibujarHistorialCliente();

                // Muestro el mensaje verde de éxito
                document.getElementById('exito-aviso').classList.remove('hidden');

                // Vacio el formulario para dejarlo listo
                document.getElementById('texto_averia').value = "";
                document.getElementById('select_maquina').value = "";

                // Oculto el botón de enviar
                if (btn) btn.classList.add('hidden');

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
    // 6. LIMPIAR PANTALLA PARA ESCRIBIR UN AVISO NUEVO
    // =================================================================
    function prepararNuevoAviso() {
        // Vacio la caja de texto y la selección de la máquina
        document.getElementById('texto_averia').value = "";
        document.getElementById('select_maquina').value = "";

        // Oculto el mensaje verde de éxito si estaba puesto
        const mensajeExito = document.getElementById('exito-aviso');
        if (mensajeExito) mensajeExito.classList.add('hidden');

        // Vuelvo a activar y a mostrar el botón de enviar
        const btn = document.getElementById('btn-enviar');
        if (btn) {
            btn.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller';
        }
    }

    // =================================================================
    // 7. SALIR DE LA CUENTA
    // =================================================================
    function cerrarSesionCliente() {
        // MATO EL TEMPORIZADOR para que deje de pedir datos a lo tonto en la pantalla de login
        if (temporizadorCliente) clearInterval(temporizadorCliente);

        // Vacio la memoria
        datosClienteActual = null;

        // Vacio los inputs y limpio el formulario
        document.getElementById('cli_email').value = "";
        document.getElementById('cli_telefono').value = "";
        document.getElementById('texto_averia').value = "";
        document.getElementById('exito-aviso').classList.add('hidden');

        // Restauro el botón por si el siguiente cliente quiere usarlo
        const btn = document.getElementById('btn-enviar');
        if (btn) {
            btn.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Aviso al Taller';
        }

        // Hago la transición a la inversa, oculto el dashboard y muestro el login
        document.getElementById('vista-dashboard').classList.add('hidden');
        document.getElementById('vista-dashboard').classList.remove('flex');

        document.getElementById('vista-login').classList.remove('hidden');
        document.getElementById('vista-login').classList.add('flex');
    }
</script>
</body>
</html>
