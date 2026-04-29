// ==========================================================================
// 📦 INVENTARIO.JS - GESTIÓN DE PIEZAS Y REPUESTOS
// ==========================================================================
import { token, AppState, cargarPiezas } from './api.js';

export function dibujarTablaInventario() {
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;

    // Solo dibujamos si hay algo en el buscador
    const query = document.getElementById('buscador_inventario')?.value.toLowerCase().trim() || "";

    if (query === "") {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar una pieza...</td></tr>`;
        return;
    }

    filtrarTablaInventario();
}

export function filtrarTablaInventario() {
    const query = document.getElementById('buscador_inventario').value.toLowerCase().trim();
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;

    if (query.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar una pieza...</td></tr>`;
        return;
    }

    // Filtramos buscando coincidencias en referencia o descripción
    const filtrados = AppState.listaPiezas.filter(p =>
        p.referencia.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query)
    );

    tbody.innerHTML = '';

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-red-400 italic">No se encontraron piezas con "${query}"</td></tr>`;
        return;
    }

    filtrados.forEach(p => {
        const pCod = encodeURIComponent(JSON.stringify(p));
        const stockColor = p.stock > 0 ? 'text-green-600' : 'text-red-500';

        tbody.innerHTML += `
        <tr class="border-b hover:bg-gray-50 transition">
            <td class="py-3 px-4">
                <div class="font-bold text-gray-800">${p.referencia}</div>
                <div class="text-xs text-gray-500 mt-1">${p.descripcion}</div>
            </td>
            <td class="py-3 px-4 text-center">
                <div class="font-bold text-lg ${stockColor}">${p.stock} <span class="text-sm font-normal text-gray-500">ud.</span></div>
                <div class="text-xs text-gray-500 mt-1">${p.precio} €</div>
            </td>
            <td class="py-3 px-4 text-center">
                <button onclick="editarPieza('${pCod}')" class="text-blue-500 p-2 hover:scale-125 transition" title="Editar">✏️</button>
                <button onclick="borrarPieza(${p.id})" class="text-red-500 p-2 hover:scale-125 transition" title="Borrar">🗑️</button>
            </td>
        </tr>`;
    });
}

export async function guardarPiezaInventario() {
    const id = document.getElementById('inv_id').value;
    const referencia = document.getElementById('inv_ref').value;
    const descripcion = document.getElementById('inv_desc').value;
    const stock = document.getElementById('inv_stock').value || 0;
    const precio = document.getElementById('inv_precio').value || 0.00;

    if (!referencia || !descripcion) return alert('La referencia y descripción son obligatorias.');

    const datos = { referencia, descripcion, stock, precio };
    const url = id ? `/api/piezas/${id}` : '/api/piezas';

    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            limpiarFormPieza();
            await cargarPiezas();
            // Después de guardar, refrescamos la tabla con la búsqueda actual
            filtrarTablaInventario();
        } else {
            alert("Error al guardar la pieza.");
        }
    } catch (error) { console.error(error); }
}

export function editarPieza(pCod) {
    const p = JSON.parse(decodeURIComponent(pCod));
    document.getElementById('form-title-pieza').innerText = 'Editar Pieza';
    document.getElementById('inv_id').value = p.id;
    document.getElementById('inv_ref').value = p.referencia;
    document.getElementById('inv_desc').value = p.descripcion;
    document.getElementById('inv_stock').value = p.stock;
    document.getElementById('inv_precio').value = p.precio;
    document.getElementById('form-title-pieza').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarPieza(id) {
    if (!confirm('¿Seguro que deseas borrar esta pieza del inventario?')) return;
    try {
        const res = await fetch(`/api/piezas/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            await cargarPiezas();
            // Refrescamos la tabla para que desaparezca visualmente al instante
            filtrarTablaInventario();
        }
    } catch (error) { console.error(error); }
}

export function limpiarFormPieza() {
    document.getElementById('form-title-pieza').innerText = 'Añadir Pieza';
    document.getElementById('inv_id').value = '';
    document.getElementById('inv_ref').value = '';
    document.getElementById('inv_desc').value = '';
    document.getElementById('inv_stock').value = '0';
    document.getElementById('inv_precio').value = '0.00';
}
