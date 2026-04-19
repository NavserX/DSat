<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Soluciones - Gestión Técnica</title>
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

<body class="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">

<div class="w-full lg:w-1/2 text-white flex flex-col justify-center items-center p-8 lg:p-12">

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

    <div class="mt-6 lg:mt-8 space-y-2 lg:space-y-3 text-blue-300">
        <p><i class="fas fa-tools mr-2"></i> Gestión de averías</p>
        <p><i class="fas fa-print mr-2"></i> Control de copiadoras</p>
        <p><i class="fas fa-user-cog mr-2"></i> Panel de técnicos</p>
        <p><i class="fas fa-chart-line mr-2"></i> Seguimiento de reparaciones</p>
    </div>
</div>

<div class="flex w-full lg:w-1/2 justify-center items-center p-6 pb-12 lg:p-12">

    <div class="bg-white p-8 lg:p-10 rounded-2xl shadow-2xl w-full max-w-sm fade-in">

        <h1 class="text-xl lg:text-2xl font-semibold text-gray-700 text-center mb-6">
            Acceso Plataforma
        </h1>

        <div class="mb-4 relative">
            <i class="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
            <input type="email"
                   id="email"
                   placeholder="Correo corporativo"
                   value="admin@test.com"
                   class="w-full pl-10 p-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          transition duration-200">
        </div>

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

        <button onclick="login()"
                class="w-full bg-blue-600 text-white p-3 rounded-lg
                       hover:bg-blue-700 hover:shadow-lg
                       active:scale-95 transition duration-200 font-semibold">
            Iniciar Sesión
        </button>

        <p id="error"
           class="text-red-500 text-sm mt-4 text-center font-medium"></p>

        <div class="text-center text-xs text-gray-400 mt-6">
            © 2026 Digital SAT - Sistema interno
        </div>

    </div>

</div>

<script>
    async function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                window.location.href = '/dashboard';
            } else {
                document.getElementById('error').innerText =
                    data.message || 'Credenciales incorrectas';
            }

        } catch (error) {
            document.getElementById('error').innerText =
                'No se puede conectar con el servidor';
        }
    }
</script>

</body>
</html>
