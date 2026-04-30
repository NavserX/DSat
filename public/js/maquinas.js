// ==========================================================================
// 🖨️ MAQUINAS.JS - GESTIÓN DEL PARQUE DE MÁQUINAS
// ==========================================================================
import { token, AppState, cargarMaquinas } from './api.js';

// Cuando pincho un cliente en el buscador, lo guardo en el input oculto
export function seleccionarClienteMaquina(cliente) {
    document.getElementById('maq_cliente_id').value = cliente.id;
    document.getElementById('maq_cliente_search').value = cliente.nombre;
}

export function dibujarTablaMaquinas() {
    const tbody = document.getElementById('tabla-maquinas');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (AppState.listaMaquinas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500">No hay máquinas registradas.</td></tr>`;
        return;
    }

    AppState.listaMaquinas.forEach(maq => {
        const cliente = AppState.listaClientes.find(c => c.id === maq.cliente_id);
        const nombreCliente = cliente ? cliente.nombre : '<span class="text-gray-400 italic">Sin asignar (En taller)</span>';
        const maqCifrada = encodeURIComponent(JSON.stringify(maq));

        tbody.innerHTML += `
        <tr class="border-b hover:bg-blue-50 transition">
            <td class="py-3 px-4">
                <div class="font-bold text-gray-800">${maq.modelo}</div>
                <div class="text-xs text-gray-500 font-mono mt-1">S/N: ${maq.numero_serie}</div>
            </td>
            <td class="py-3 px-4 font-medium text-blue-700">${nombreCliente}</td>
            <td class="py-3 px-4 text-center">
                <button onclick="editarMaquina('${maqCifrada}')" class="text-blue-500 p-2 hover:scale-125 transition" title="Editar / Cambiar Cliente">✏️</button>
                <button onclick="borrarMaquina(${maq.id})" class="text-red-500 p-2 hover:scale-125 transition" title="Borrar">🗑️</button>
            </td>
        </tr>`;
    });
}

export async function guardarMaquina() {
    const id = document.getElementById('maq_id').value;
    const modelo = document.getElementById('maq_modelo').value;
    const numero_serie = document.getElementById('maq_sn').value;
    const cliente_id = document.getElementById('maq_cliente_id').value;
    const search_input = document.getElementById('maq_cliente_search').value;

    if (!modelo || !numero_serie) return alert('El modelo y número de serie son obligatorios.');

    const clienteFinal = (search_input.trim() === '') ? null : cliente_id;

    const datos = {
        modelo: modelo,
        numero_serie: numero_serie,
        cliente_id: clienteFinal
    };

    const url = id ? `/api/maquinas/${id}` : '/api/maquinas';

    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("Máquina guardada correctamente.");

            // 1. Limpiamos y recargamos datos
            limpiarFormMaquina();
            await cargarMaquinas();

            // 2. Intentamos cambiar de pantalla sin romper el código
            const seccionDestino = 'pantalla_maquinas';
            if (document.getElementById(seccionDestino)) {
                mostrarPantalla(seccionDestino);
            } else {
                // Si el ID no existe, forzamos la recarga para que el usuario vea los cambios
                console.warn(`La sección ${seccionDestino} no existe. Recargando página...`);
                window.location.reload();
            }
        } else {
            const errorRes = await res.json();
            if (res.status === 422) {
                alert("⚠️ Error: " + (errorRes.errors.numero_serie ? "Este número de serie ya está registrado." : "Datos inválidos."));
            } else {
                alert("Error en el servidor al guardar.");
            }
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Fallo de conexión con el servidor.");
    }
}

export function editarMaquina(maqCodificada) {
    const maq = JSON.parse(decodeURIComponent(maqCodificada));
    document.getElementById('form-title-maquina').innerText = 'Editar Máquina';
    document.getElementById('maq_id').value = maq.id;
    document.getElementById('maq_modelo').value = maq.modelo;
    document.getElementById('maq_sn').value = maq.numero_serie;

    // Rellenamos el buscador con el nombre del cliente si tiene uno
    document.getElementById('maq_cliente_id').value = maq.cliente_id || '';
    if (maq.cliente_id) {
        const cliente = AppState.listaClientes.find(c => c.id === maq.cliente_id);
        document.getElementById('maq_cliente_search').value = cliente ? cliente.nombre : '';
    } else {
        document.getElementById('maq_cliente_search').value = '';
    }

    document.getElementById('form-title-maquina').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarMaquina(id) {
    if (!confirm('¿Seguro que deseas borrar esta máquina del parque?')) return;
    try {
        const res = await fetch(`/api/maquinas/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) await cargarMaquinas();
    } catch (error) { console.error(error); }
}

export function limpiarFormMaquina() {
    document.getElementById('form-title-maquina').innerText = 'Añadir Máquina';
    document.getElementById('maq_id').value = '';
    document.getElementById('maq_modelo').value = '';
    document.getElementById('maq_sn').value = '';
    document.getElementById('maq_cliente_id').value = '';
    document.getElementById('maq_cliente_search').value = '';
}
