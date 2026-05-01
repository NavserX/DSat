// ==========================================================================
// ESTADO GLOBAL Y CONEXIONES
// ==========================================================================

// --- 1. EL ACCESO ---

// Aquí intento recuperar el token de seguridad que guardé en el navegador cuando el usuario inició sesión.
export const token = localStorage.getItem('token');

// Si me doy cuenta de que no hay token, significa que alguien está intentando entrar directamente a esta pantalla sin loguearse. Le expulso automáticamente a la pantalla inicial.
if (!token) window.location.href = '/';


// --- 2. EL ESTADO GLOBAL (App State) ---

// Creo una caja de almacenamiento global. En lugar de estar pidiendo datos al servidor cada dos segundos, descargo las cosas una vez y las guardo aquí. Así cualquier otro archivo JS de mi proyecto puede consultar esta información al instante.
export const AppState = {
    listaClientes: [],          // Aquí guardaré todos los clientes para que el buscador vaya muy rápido.
    todasLasReparaciones: [],   // Aquí meto todos los avisos para poder filtrarlos y paginarlos en local.
    usuarioActual: null,        // Aquí guardo si el que está usando la app es el admin o un técnico.
    piezasTemporales: [],       // Uso esto como una "cesta de la compra" para ir guardando las piezas que gasto antes de cerrar un aviso.
    clienteHistorialActual: null, // Si abro el historial de un cliente, lo memorizo aquí para saber de quién estoy viendo las fechas.
    listaMaquinas: [],          // Guardo todo el parque de máquinas aquí para vincularlas rápido a un cliente.
    listaPiezas: []             // Aquí me guardo el inventario entero con sus stocks para el buscador del modal.
};


// ==========================================================================
// CARGA DE DATOS MAESTROS
// ==========================================================================

export async function cargarPerfilUsuario() {
    try {
        // Le pregunto al servidor: "Oye, con este token que tengo, dime quién soy".
        const res = await fetch('/api/me', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            // Cuando el servidor me responde con mis datos (nombre, rol, id), lo guardo en mi estado global para poder aplicar luego los bloqueos visuales si soy técnico.
            AppState.usuarioActual = await res.json();
        }
    } catch (error) { console.error("Error cargando perfil", error); }
}

export async function cargarClientes() {
    try {
        // Con esto hago una petición para traerme toda la base de datos de clientes de golpe.
        const res = await fetch('/api/clientes', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            // Lo guardo en mi almacén global.
            AppState.listaClientes = await res.json();

            // Compruebo si existe en este momento la función para pintar la tabla en la pantalla. Si es así, la disparo para que la tabla se refresque con los nuevos clientes.
            if (window.dibujarTablaClientes) window.dibujarTablaClientes();
        }
    } catch (error) { console.error(error); }
}

export async function cargarTecnicos() {
    try {
        // Pido la lista de trabajadores al servidor.
        const res = await fetch('/api/tecnicos', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const tecnicos = await res.json();

            // Busco los dos desplegables (selects) donde tengo que mostrar la lista de técnicos: el del formulario para asignar y el de los filtros de arriba.
            const selectForm = document.getElementById('tecnico_id');
            const selectFiltro = document.getElementById('filtro_tecnico_id');

            // Recorro la lista que me ha dado el servidor y voy creando las opciones en ambos desplegables uno por uno.
            tecnicos.forEach(t => {
                if (selectForm) selectForm.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                if (selectFiltro) selectFiltro.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
            });
        }
    } catch (error) { console.error(error); }
}

export async function cargarMaquinas() {
    try {
        // Descargo todo el registro de máquinas impresoras de la base de datos.
        const res = await fetch('/api/maquinas', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            // Lo almaceno en la variable global para que cuando seleccione un cliente, pueda buscar aquí sus máquinas súper rápido.
            AppState.listaMaquinas = await res.json();

            // Si la vista del parque de máquinas está activa, obligo a que se repinte la tabla.
            if(window.dibujarTablaMaquinas) window.dibujarTablaMaquinas();
        }
    } catch (error) { console.error("Error cargando máquinas", error); }
}

export async function cargarPiezas() {
    try {
        // Me traigo el catálogo entero de repuestos y sus unidades en stock.
        const res = await fetch('/api/piezas', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            // Lo guardo globalmente porque lo voy a necesitar tanto en la pantalla de Inventario como en el buscador del modal cuando finalice una reparación.
            AppState.listaPiezas = await res.json();

            // Si la función para redibujar la pantalla de inventario existe, la ejecuto para mostrar los cambios más recientes.
            if (window.dibujarTablaInventario) window.dibujarTablaInventario();
        }
    } catch (error) { console.error("Error cargando inventario de piezas", error); }
}
