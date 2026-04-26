// ==========================================================================
// CLIENTES.JS - BUSCADOR Y MODAL
// ==========================================================================
import { token, AppState, cargarClientes } from './api.js';
import { mostrarMapaDeTabla } from './ui.js';

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
