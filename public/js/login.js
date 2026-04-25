// --- ACCESO AL SISTEMA ---
// Compruebo las credenciales del usuario para dejarle entrar a la plataforma
async function login() {
    // Recojo los datos que el usuario ha escrito en las casillas
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Envío el usuario y la contraseña al servidor para que los compruebe
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // Convierto la respuesta del servidor para poder leerla
        const data = await response.json();

        if (response.ok) {
            // Si todo está correcto, guardo la llave de seguridad y te mando al panel
            localStorage.setItem('token', data.access_token);
            window.location.href = '/dashboard';
        } else {
            // Si la contraseña está mal, muestro el mensaje de error en rojo
            document.getElementById('error').innerText = data.message || 'Credenciales incorrectas';
        }

    } catch (error) {
        // Si el servidor está apagado o no hay internet, aviso del problema
        document.getElementById('error').innerText = 'No se puede conectar con el servidor';
    }
}
