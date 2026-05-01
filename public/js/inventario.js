// ==========================================================================
// GESTIÓN DE PIEZAS Y REPUESTOS
// ==========================================================================
import { token, AppState, cargarPiezas } from './api.js';

export function dibujarTablaInventario() {
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;

    // Esta función es la que arranca la tabla del inventario. Primero miro si hay algo escrito en el buscador.
    // Si el buscador está vacío, decido no cargar toda la base de datos de golpe en la pantalla. En su lugar, muestro un mensaje pidiendo que escriban algo.
    const query = document.getElementById('buscador_inventario')?.value.toLowerCase().trim() || "";

    if (query === "") {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar una pieza...</td></tr>`;
        return;
    }

    // Si hay texto, llamo a la función que hace el filtrado real.
    filtrarTablaInventario();
}

export function filtrarTablaInventario() {
    // Aquí es donde hago la búsqueda real. Leo lo que he escrito en el buscador y lo paso a minúsculas para que no importe cómo escriba.
    const query = document.getElementById('buscador_inventario').value.toLowerCase().trim();
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;

    // Si borro el texto mientras busco, vuelvo a dejar la tabla con el mensaje inicial.
    if (query.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar una pieza...</td></tr>`;
        return;
    }

    // Filtro mi almacén global de piezas buscando si lo que he escrito coincide con la referencia de la pieza o con su descripción.
    const filtrados = AppState.listaPiezas.filter(p =>
        p.referencia.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query)
    );

    tbody.innerHTML = '';

    // Si después de buscar no hay coincidencias, aviso de que no se ha encontrado nada.
    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-red-400 italic">No se encontraron piezas con "${query}"</td></tr>`;
        return;
    }

    // Si encuentro piezas, recorro la lista y voy montando el código HTML de cada fila.
    filtrados.forEach(p => {
        const pCod = encodeURIComponent(JSON.stringify(p));

        // Hago una pequeña comprobación: si me queda stock, pongo el número en verde. Si estoy a cero, lo pongo en rojo para darme cuenta rápido.
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
                <button onclick="editarPieza('${pCod}')" class="text-blue-500 p-2 hover:scale-125 transition" title="Editar">Editar</button>
                <button onclick="borrarPieza(${p.id})" class="text-red-500 p-2 hover:scale-125 transition" title="Borrar">Borrar</button>
            </td>
        </tr>`;
    });
}

export async function guardarPiezaInventario() {
    // Uso esta función tanto para crear repuestos nuevos como para modificar los que ya tengo. Empiezo recogiendo los datos del formulario.
    const id = document.getElementById('inv_id').value;
    const referencia = document.getElementById('inv_ref').value;
    const descripcion = document.getElementById('inv_desc').value;

    // Si no pongo stock o precio, me aseguro de enviar un cero para que la base de datos no falle.
    const stock = document.getElementById('inv_stock').value || 0;
    const precio = document.getElementById('inv_precio').value || 0.00;

    // Hago un bloqueo de seguridad para no guardar piezas a medias.
    if (!referencia || !descripcion) return alert('La referencia y descripción son obligatorias.');

    const datos = { referencia, descripcion, stock, precio };

    // Si el campo oculto del ID tiene algo, sé que estoy editando, así que uso el método PUT. Si no hay ID, es una pieza nueva y uso POST.
    const url = id ? `/api/piezas/${id}` : '/api/piezas';

    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            // Cuando el servidor me confirma que se ha guardado, limpio el formulario, descargo el inventario actualizado y vuelvo a buscar en la tabla para ver el cambio reflejado.
            limpiarFormPieza();
            await cargarPiezas();
            filtrarTablaInventario();
        } else {
            alert("Error al guardar la pieza.");
        }
    } catch (error) { console.error(error); }
}

export function editarPieza(pCod) {
    // Recojo los datos codificados que me manda el botón de editar de la tabla, los descodifico y relleno todos los inputs del formulario.
    const p = JSON.parse(decodeURIComponent(pCod));
    document.getElementById('form-title-pieza').innerText = 'Editar Pieza';
    document.getElementById('inv_id').value = p.id;
    document.getElementById('inv_ref').value = p.referencia;
    document.getElementById('inv_desc').value = p.descripcion;
    document.getElementById('inv_stock').value = p.stock;
    document.getElementById('inv_precio').value = p.precio;

    // Le digo al navegador que haga un scroll suave hasta el formulario para no tener que subir manualmente.
    document.getElementById('form-title-pieza').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarPieza(id) {
    // Pongo un cuadro de confirmación para evitar borrar repuestos por un clic accidental.
    if (!confirm('¿Seguro que deseas borrar esta pieza del inventario?')) return;

    try {
        // Le envío la orden de destruir el registro al servidor.
        const res = await fetch(`/api/piezas/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            // Me descargo la base de datos actualizada y aplico mi filtro otra vez para que la pieza borrada desaparezca inmediatamente de mi vista.
            await cargarPiezas();
            filtrarTablaInventario();
        }
    } catch (error) { console.error(error); }
}

export function limpiarFormPieza() {
    // Con esto vacío todos los campos y dejo el formulario en blanco, listo por si quiero registrar un repuesto totalmente nuevo.
    document.getElementById('form-title-pieza').innerText = 'Añadir Pieza';
    document.getElementById('inv_id').value = '';
    document.getElementById('inv_ref').value = '';
    document.getElementById('inv_desc').value = '';
    document.getElementById('inv_stock').value = '0';
    document.getElementById('inv_precio').value = '0.00';
}
