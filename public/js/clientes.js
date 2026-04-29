// ==========================================================================
// 🧑‍💼 CLIENTES.JS - BUSCADOR, MODAL RÁPIDO Y GESTIÓN (CRM)
// ==========================================================================
import { token, AppState, cargarClientes } from './api.js';
import { mostrarMapaDeTabla } from './ui.js';

// --- 1. BUSCADOR Y MODAL RÁPIDO (Para la pantalla de Reparaciones) ---

export function filtrarClientes(inputId, dropdownId, callbackSeleccion) {
    const query = document.getElementById(inputId).value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = '';

    if (query.length < 1) { dropdown.classList.add('hidden'); return; }

    const filtrados = AppState.listaClientes.filter(c => c.nombre.toLowerCase().includes(query) || (c.telefono && c.telefono.includes(query)));

    if (filtrados.length === 0) {
        dropdown.innerHTML = '<li class="p-3 text-gray-500 text-sm italic">No se encontraron coincidencias...</li>';
    } else {
        filtrados.forEach(c => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-blue-50 cursor-pointer border-b text-gray-800 flex justify-between items-center';
            li.innerHTML = `<div><div class="font-semibold">${c.nombre}</div><div class="text-xs text-gray-500">${c.telefono || 'Sin teléfono'}</div></div>`;

            li.onclick = () => {
                document.getElementById(inputId).value = c.nombre;
                dropdown.classList.add('hidden');
                callbackSeleccion(c);
            };
            dropdown.appendChild(li);
        });
    }
    dropdown.classList.remove('hidden');
}

export function seleccionarClienteReparacion(cliente) {
    document.getElementById('cliente_id').value = cliente.id;

    const infoDiv = document.getElementById('cliente_info');
    let botonLlamar = cliente.telefono ? `<a href="tel:${cliente.telefono}" class="ml-3 bg-green-500 text-white px-3 py-1 rounded text-xs">📞 Llamar</a>` : '';
    infoDiv.innerHTML = `<p>📞 <strong>Teléfono:</strong> ${cliente.telefono || 'No especificado'} ${botonLlamar}</p><p>🏠 <strong>Dirección:</strong> ${cliente.direccion || 'No especificada'}</p>`;
    infoDiv.classList.remove('hidden');

    if (cliente.direccion) mostrarMapaDeTabla(encodeURIComponent(cliente.direccion));
    else document.getElementById('mapa_container').classList.add('hidden');

    const selectMaquina = document.getElementById('reparacion_maquina_id');
    if (selectMaquina) {
        selectMaquina.innerHTML = '<option value="">-- Aviso general / Sin máquina --</option>';
        const susMaquinas = AppState.listaMaquinas.filter(m => m.cliente_id === cliente.id);
        if (susMaquinas.length > 0) {
            susMaquinas.forEach(m => {
                selectMaquina.innerHTML += `<option value="${m.id}">${m.modelo} (S/N: ${m.numero_serie})</option>`;
            });
            selectMaquina.classList.add('bg-green-50', 'border-green-400');
        } else {
            selectMaquina.innerHTML = '<option value="">Este cliente no tiene máquinas asignadas</option>';
            selectMaquina.classList.remove('bg-green-50', 'border-green-400');
        }
    }
}

export function abrirModalCliente() {
    document.getElementById('nuevo_cliente_nombre').value = document.getElementById('cliente_search').value;
    document.getElementById('nuevo_cliente_email').value = '';
    document.getElementById('nuevo_cliente_telefono').value = '';
    document.getElementById('nuevo_cliente_direccion').value = '';
    document.getElementById('modal_cliente').classList.remove('hidden');
}

export function cerrarModalCliente() {
    document.getElementById('modal_cliente').classList.add('hidden');
}

export async function guardarNuevoCliente() {
    const nombre = document.getElementById('nuevo_cliente_nombre').value;
    const telefono = document.getElementById('nuevo_cliente_telefono').value;
    const direccion = document.getElementById('nuevo_cliente_direccion').value;
    const inputEmail = document.getElementById('nuevo_cliente_email');

    const email = (inputEmail && inputEmail.value) ? inputEmail.value : `sin-email-${Date.now()}@cliente.com`;

    if (!nombre) return alert("El nombre es obligatorio.");

    const btn = document.querySelector('#modal_cliente button.bg-green-600');
    btn.innerText = 'Guardando...'; btn.disabled = true;

    try {
        const res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre, telefono, direccion, email })
        });

        if (res.ok) {
            const nuevoCliente = await res.json();
            await cargarClientes();
            cerrarModalCliente();
            seleccionarClienteReparacion(nuevoCliente.id ? nuevoCliente : nuevoCliente.cliente);
            document.getElementById('cliente_search').value = nombre;
        } else {
            alert("Hubo un problema al guardar el cliente.");
        }
    } catch (error) { console.error(error); }
    finally { btn.innerText = 'Guardar Cliente'; btn.disabled = false; }
}


// ==========================================================================
// --- 2. GESTIÓN DE CLIENTES (FILTRADO POR BUSCADOR CON MÁQUINAS) ---
// ==========================================================================

export function dibujarTablaClientes() {
    const tbody = document.getElementById('tabla-gestion-clientes');
    if (!tbody) return;

    const query = document.getElementById('buscador_gestion_clientes')?.value.toLowerCase().trim() || "";

    if (query === "") {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar un cliente...</td></tr>`;
        return;
    }

    filtrarTablaGestionClientes();
}

export function filtrarTablaGestionClientes() {
    const query = document.getElementById('buscador_gestion_clientes').value.toLowerCase().trim();
    const tbody = document.getElementById('tabla-gestion-clientes');
    if (!tbody) return;

    if (query.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar un cliente...</td></tr>`;
        return;
    }

    const filtrados = AppState.listaClientes.filter(c =>
        c.nombre.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.telefono && c.telefono.includes(query))
    );

    tbody.innerHTML = '';

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-red-400 italic">No se encontraron clientes con "${query}"</td></tr>`;
        return;
    }

    filtrados.forEach(c => {
        const cCod = encodeURIComponent(JSON.stringify(c));
        const emailMostrar = (c.email && !c.email.includes('sin-email-')) ? c.email : '<span class="italic text-gray-400">Sin email</span>';

        // --- BUSCAR MÁQUINAS DEL CLIENTE ---
        const maquinasCliente = AppState.listaMaquinas.filter(m => m.cliente_id === c.id);
        let htmlMaquinas = '';

        if (maquinasCliente.length > 0) {
            htmlMaquinas = `<div class="mt-2 flex flex-wrap gap-1">`;
            maquinasCliente.forEach(m => {
                htmlMaquinas += `<span class="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-medium border border-blue-200">🖨️ ${m.modelo}</span>`;
            });
            htmlMaquinas += `</div>`;
        } else {
            htmlMaquinas = `<div class="mt-1 text-[10px] text-gray-400 italic">Sin máquinas asignadas</div>`;
        }

        tbody.innerHTML += `
        <tr class="border-b hover:bg-gray-50 transition">
            <td class="py-3 px-4">
                <div class="font-bold text-gray-800">${c.nombre}</div>
                <div class="text-xs text-gray-500">📧 ${emailMostrar}</div>
                ${htmlMaquinas}
            </td>
            <td class="py-3 px-4">
                <div class="font-medium text-sm text-gray-700">📞 ${c.telefono || '-'}</div>
                <div class="text-xs text-gray-400 italic">🏠 ${c.direccion || '-'}</div>
            </td>
            <td class="py-3 px-4 text-center">
                <div class="flex justify-center gap-1">
                    <button onclick="editarClienteGestion('${cCod}')" class="text-blue-500 p-2 hover:scale-125 transition" title="Editar">✏️</button>
                    <button onclick="borrarClienteGestion(${c.id})" class="text-red-500 p-2 hover:scale-125 transition" title="Borrar">🗑️</button>
                </div>
            </td>
        </tr>`;
    });
}

export async function guardarClienteGestion() {
    const id = document.getElementById('gestion_cli_id').value;
    const nombre = document.getElementById('gestion_cli_nombre').value;
    const telefono = document.getElementById('gestion_cli_telefono').value;
    const direccion = document.getElementById('gestion_cli_direccion').value;
    const emailRaw = document.getElementById('gestion_cli_email').value;

    const email = emailRaw ? emailRaw : `sin-email-${Date.now()}@cliente.com`;

    if (!nombre) return alert('El nombre es obligatorio.');

    const datos = { nombre, email, telefono, direccion };
    const url = id ? `/api/clientes/${id}` : '/api/clientes';

    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            limpiarFormClienteGestion();
            await cargarClientes();
            filtrarTablaGestionClientes();
        } else { alert("Error al guardar el cliente."); }
    } catch (error) { console.error(error); }
}

export function editarClienteGestion(cCod) {
    const c = JSON.parse(decodeURIComponent(cCod));
    document.getElementById('form-title-cliente').innerText = 'Editar Cliente';
    document.getElementById('gestion_cli_id').value = c.id;
    document.getElementById('gestion_cli_nombre').value = c.nombre;
    document.getElementById('gestion_cli_telefono').value = c.telefono || '';
    document.getElementById('gestion_cli_direccion').value = c.direccion || '';
    document.getElementById('gestion_cli_email').value = (c.email && !c.email.includes('sin-email-')) ? c.email : '';
    document.getElementById('form-title-cliente').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarClienteGestion(id) {
    if (!confirm('¿Seguro que deseas borrar este cliente? Se podrían ver afectados sus avisos y máquinas.')) return;
    try {
        const res = await fetch(`/api/clientes/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            await cargarClientes();
            filtrarTablaGestionClientes();
        }
    } catch (error) { console.error(error); }
}

export function limpiarFormClienteGestion() {
    document.getElementById('form-title-cliente').innerText = 'Añadir Cliente';
    document.getElementById('gestion_cli_id').value = '';
    document.getElementById('gestion_cli_nombre').value = '';
    document.getElementById('gestion_cli_email').value = '';
    document.getElementById('gestion_cli_telefono').value = '';
    document.getElementById('gestion_cli_direccion').value = '';
}
