// ==========================================================================
// 🌍 API.JS - ESTADO GLOBAL Y CONEXIONES
// ==========================================================================

// --- 1. EL ACCESO ---
export const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

// --- 2. EL ESTADO GLOBAL (App State) ---
export const AppState = {
    listaClientes: [],
    todasLasReparaciones: [],
    usuarioActual: null,
    piezasTemporales: [],
    clienteHistorialActual: null,
    listaMaquinas: [],
    listaPiezas: [] // <-- NUEVO: Para el inventario de piezas
};

// ==========================================================================
// 📦 CARGA DE DATOS MAESTROS
// ==========================================================================

export async function cargarPerfilUsuario() {
    try {
        const res = await fetch('/api/me', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            AppState.usuarioActual = await res.json();
        }
    } catch (error) { console.error("Error cargando perfil", error); }
}

export async function cargarClientes() {
    try {
        const res = await fetch('/api/clientes', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            AppState.listaClientes = await res.json();
            if (window.dibujarTablaClientes) window.dibujarTablaClientes();
        }
    } catch (error) { console.error(error); }
}

export async function cargarTecnicos() {
    try {
        const res = await fetch('/api/tecnicos', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const tecnicos = await res.json();
            const selectForm = document.getElementById('tecnico_id');
            const selectFiltro = document.getElementById('filtro_tecnico_id');
            tecnicos.forEach(t => {
                if (selectForm) selectForm.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                if (selectFiltro) selectFiltro.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
            });
        }
    } catch (error) { console.error(error); }
}

// --- CARGAR PARQUE DE MÁQUINAS ---
export async function cargarMaquinas() {
    try {
        const res = await fetch('/api/maquinas', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            AppState.listaMaquinas = await res.json();
            if(window.dibujarTablaMaquinas) window.dibujarTablaMaquinas();
        }
    } catch (error) { console.error("Error cargando máquinas", error); }
}

// --- NUEVO: CARGAR INVENTARIO DE PIEZAS ---
export async function cargarPiezas() {
    try {
        const res = await fetch('/api/piezas', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            AppState.listaPiezas = await res.json();
            // Si la función para dibujar la tabla de inventario existe, la llamamos
            if (window.dibujarTablaInventario) window.dibujarTablaInventario();
        }
    } catch (error) { console.error("Error cargando inventario de piezas", error); }
}
