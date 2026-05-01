<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Configuro la cabecera básica del documento. Descargo Tailwind directamente para maquetar rápido y FontAwesome para poder usar pequeños iconos vectoriales dentro de las casillas de texto y en la lista de presentación. -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Soluciones - Gestión Técnica</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://kit.fontawesome.com/6b6f3e3b2a.js" crossorigin="anonymous"></script>

    <style>
        /* Me creo una pequeña animación CSS personalizada directamente aquí para no tener que abrir un archivo aparte. La llamo 'fade-in'. */
        .fade-in {
            animation: fadeIn 0.7s ease-in-out;
        }

        /* Aquí le dicto al navegador exactamente qué hace la animación: empieza siendo invisible (opacity 0) y estando desplazada hacia abajo 15 píxeles, y termina subiendo a su sitio original mientras se vuelve completamente sólida. */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
</head>

<!-- El cuerpo de la página obliga a que siempre ocupe el 100% del alto de la pantalla del dispositivo. Uso Flexbox para separar la pantalla en dos mitades (izquierda para la marca, derecha para el formulario) cuando se ve en ordenadores, y ponerlas una encima de otra en móviles. -->
<body class="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">

<!-- MITAD IZQUIERDA: Presentación y marca corporativa -->
<div class="w-full lg:w-1/2 text-white flex flex-col justify-center items-center p-8 lg:p-12">

    <!-- Enlazo el logotipo a la web comercial principal de la empresa. Le añado efectos de escala para que cuando pase el ratón por encima se haga más grande, y cuando haga clic se encoja un poco, dando una sensación de botón físico. -->
    <a href="https://ofimaticadigital.es/" class="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
        <img src="img/logo-web-ofimatica-digital.webp"
             alt="Digital Soluciones"
             class="w-48 lg:w-64 mb-6 lg:mb-8">
    </a>

    <h2 class="text-2xl lg:text-3xl font-bold mb-4 text-center">Servicio Técnico Especializado</h2>

    <p class="text-base lg:text-lg text-blue-200 text-center max-w-md">
        Plataforma interna de gestión de reparaciones, clientes y mantenimiento
        de equipos de impresión profesional.
    </p>

    <!-- Hago una pequeña lista de características para decorar y darle contexto a la herramienta. -->
    <div class="mt-6 lg:mt-8 space-y-2 lg:space-y-3 text-blue-300">
        <p><i class="fas fa-tools mr-2"></i> Gestión de averías</p>
        <p><i class="fas fa-print mr-2"></i> Control de copiadoras</p>
        <p><i class="fas fa-user-cog mr-2"></i> Panel de técnicos</p>
        <p><i class="fas fa-chart-line mr-2"></i> Seguimiento de reparaciones</p>
    </div>
</div>

<!-- MITAD DERECHA: Formulario de inicio de sesión -->
<div class="flex w-full lg:w-1/2 justify-center items-center p-6 pb-12 lg:p-12">

    <!-- A esta caja blanca central le aplico mi clase personalizada 'fade-in' que creé arriba en el CSS para que entre en la pantalla suavemente al cargar. -->
    <div class="bg-white p-8 lg:p-10 rounded-2xl shadow-2xl w-full max-w-sm fade-in">

        <h1 class="text-xl lg:text-2xl font-semibold text-gray-700 text-center mb-6">
            Acceso Plataforma
        </h1>

        <!-- Campo del Email -->
        <div class="mb-4 relative">
            <!-- Pongo el icono en posición absoluta encima del campo de texto, alineado a la izquierda. -->
            <i class="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>

            <!-- Le doy un margen izquierdo extra al campo (pl-10) para que el texto que yo escriba no se monte por encima del icono. Dejo unas credenciales por defecto puestas para hacer las pruebas de desarrollo más rápido. -->
            <input type="email"
                   id="email"
                   placeholder="Correo corporativo"
                   value="admin@test.com"
                   class="w-full pl-10 p-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          transition duration-200">
        </div>

        <!-- Campo de la Contraseña -->
        <div class="mb-6 relative">
            <i class="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
            <input type="password"
                   id="password"
                   placeholder="Contraseña"
                   value="password123"
                   class="w-full pl-10 p-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          transition duration-200">
        </div>

        <!-- Al pulsar este botón, disparo la función javascript que recogerá los dos campos de arriba y hablará con el servidor para ver si me deja entrar o no. -->
        <button onclick="login()"
                class="w-full bg-blue-600 text-white p-3 rounded-lg
                       hover:bg-blue-700 hover:shadow-lg
                       active:scale-95 transition duration-200 font-semibold">
            Iniciar Sesión
        </button>

        <!-- Me dejo este párrafo vacío a propósito. Mi javascript lo utilizará para inyectar un mensaje de error en color rojo si el servidor me devuelve que la contraseña está mal. -->
        <p id="error" class="text-red-500 text-sm mt-4 text-center font-medium"></p>

        <div class="text-center text-xs text-gray-400 mt-6">
            © 2026 Digital SAT - Sistema interno
        </div>

    </div>

</div>

<!-- Por último, cargo el archivo de javascript que contiene la lógica para procesar el login. -->
<script src="{{ asset('js/login.js') }}"></script>

</body>
</html>
