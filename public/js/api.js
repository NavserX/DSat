// ==========================================================================
// API.JS - ESTADO GLOBAL Y CONEXIONES
// ==========================================================================

// --- 1. EL ACCESO ---
export const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

// --- 2. EL ESTADO GLOBAL (App State) ---
// En lugar de variables sueltas, las agrupamos en un objeto.
// Al exportarlo, cualquier otro archivo podrá leer y modificar estos datos.
export const AppState = {
    listaClientes: [],
    todasLasReparaciones: [],
    usuarioActual: null,
    piezasTemporales: [],
    clienteHistorialActual: null
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
        if (res.ok) AppState.listaClientes = await res.json();
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
                selectForm.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                selectFiltro.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
            });
        }
    } catch (error) { console.error(error); }
}

export async function cargarMarcas() {
    try {
        const res = await fetch('/api/marcas', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const marcas = await res.json();
            const select = document.getElementById('marca_id');
            marcas.forEach(m => select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`);
        }
    } catch (error) { console.error(error); }
}
