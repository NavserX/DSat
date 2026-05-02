// ==========================================================================
// GESTION DEL PARQUE DE MAQUINAS
// ==========================================================================
import { token, AppState, cargarMaquinas } from './api.js';

export function seleccionarClienteMaquina(cliente) {
    // Cuando selecciono un cliente en el buscador de la sección de máquinas, uso esta función para guardarme su ID en un campo oculto. Así sé exactamente a quién pertenece la máquina, y dejo su nombre visible en el buscador para confirmarlo visualmente.
    document.getElementById('maq_cliente_id').value = cliente.id;
    document.getElementById('maq_cliente_search').value = cliente.nombre;
}

export function dibujarTablaMaquinas() {
    const tbody = document.getElementById('tabla-maquinas');
    if (!tbody) return;

    // Capturo lo que el usuario ha escrito en el buscador de la derecha.
    const buscador = document.getElementById('buscador_maquinas');
    const query = buscador ? buscador.value.trim().toLowerCase() : '';

    // Primero vacío la tabla entera para que no se dupliquen las cosas cuando la vuelva a pintar.
    tbody.innerHTML = '';

    // Si la caja de búsqueda está vacía, pinto el aviso y corto la ejecución aquí. Así no cargo toda la base de datos de golpe.
    if (query.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500 italic">Escribe el modelo o el número de serie en el buscador para ver los resultados...</td></tr>`;
        return;
    }

    // Si ha pasado hay texto, filtro mi almacén global buscando coincidencias.
    const filtradas = AppState.listaMaquinas.filter(maq =>
        (maq.modelo && maq.modelo.toLowerCase().includes(query)) ||
        (maq.numero_serie && maq.numero_serie.toLowerCase().includes(query))
    );

    // Si después de buscar resulta que no hay ninguna coincidencia, aviso al usuario.
    if (filtradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-gray-500">No se han encontrado máquinas con esos datos.</td></tr>`;
        return;
    }

    // Si tengo máquinas que coinciden, las recorro una a una.
    filtradas.forEach(maq => {
        // Por cada máquina, busco en mi lista de clientes a quién le pertenece usando el ID.
        const cliente = AppState.listaClientes.find(c => c.id === maq.cliente_id);

        // Si encuentro al cliente, guardo su nombre. Si la máquina no tiene cliente asignado, pongo un texto indicando que la tenemos nosotros en el taller.
        const nombreCliente = cliente ? cliente.nombre : '<span class="text-gray-400 italic">Sin asignar (En taller)</span>';

        // Codifico toda la información de la máquina para poder pasársela al botón de editar sin que se rompa el HTML.
        const maqCifrada = encodeURIComponent(JSON.stringify(maq));

        // Inyecto la fila en la tabla con los datos y los botones.
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
    // Esta es la función principal para registrar máquinas nuevas o guardar los cambios si estoy editando. Primero recojo todo lo que hay en el formulario.
    const id = document.getElementById('maq_id').value;
    const modelo = document.getElementById('maq_modelo').value;
    const numero_serie = document.getElementById('maq_sn').value;
    const cliente_id = document.getElementById('maq_cliente_id').value;
    const search_input = document.getElementById('maq_cliente_search').value;

    // No dejo que se guarde nada si me faltan los datos principales.
    if (!modelo || !numero_serie) return alert('El modelo y número de serie son obligatorios.');

    // Aquí hago una comprobación importante: si he borrado el texto del buscador de clientes, entiendo que quiero desvincular la máquina. En ese caso le paso un valor nulo para que vuelva al taller.
    const clienteFinal = (search_input.trim() === '') ? null : cliente_id;

    const datos = {
        modelo: modelo,
        numero_serie: numero_serie,
        cliente_id: clienteFinal
    };

    // Si el campo oculto del ID tiene valor, ataco a la ruta de actualizar (PUT). Si está vacío, uso la ruta de crear (POST).
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

            // Cuando el servidor me da el OK, limpio el formulario y vuelvo a descargar las máquinas para tenerlas actualizadas en memoria.
            limpiarFormMaquina();
            await cargarMaquinas();

            // Intento mandar al usuario de vuelta a la pantalla donde está la lista de máquinas.
            const seccionDestino = 'pantalla_maquinas';
            if (document.getElementById(seccionDestino)) {
                // Hago una pequeña trampa para saltarnos los imports cíclicos: como enganché mostrarPantalla al objeto window en el main, puedo llamarla así.
                window.mostrarPantalla(seccionDestino);
            } else {
                // Si por algún motivo la pantalla no existe, fuerzo que la web entera se recargue para no quedarme atascado.
                console.warn(`La sección ${seccionDestino} no existe. Recargando página...`);
                window.location.reload();
            }
        } else {
            // Si el servidor se queja, miro si es un error 422. Si lo es, probablemente sea porque estoy intentando meter un número de serie que ya existe. Lo capturo y me aviso.
            const errorRes = await res.json();
            if (res.status === 422) {
                alert("Error: " + (errorRes.errors.numero_serie ? "Este número de serie ya está registrado." : "Datos inválidos."));
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
    // Cojo el paquete de texto que me llega del botón, lo convierto a un objeto normal y relleno todos los inputs del formulario.
    const maq = JSON.parse(decodeURIComponent(maqCodificada));
    document.getElementById('form-title-maquina').innerText = 'Editar Máquina';
    document.getElementById('maq_id').value = maq.id;
    document.getElementById('maq_modelo').value = maq.modelo;
    document.getElementById('maq_sn').value = maq.numero_serie;

    // Con el cliente tengo que tener más cuidado. Primero me guardo su ID.
    document.getElementById('maq_cliente_id').value = maq.cliente_id || '';

    // Luego busco en mi lista global de clientes el nombre que corresponde a ese ID para dejarlo escrito en el buscador. Si la máquina no tiene cliente, lo dejo vacío.
    if (maq.cliente_id) {
        const cliente = AppState.listaClientes.find(c => c.id === maq.cliente_id);
        document.getElementById('maq_cliente_search').value = cliente ? cliente.nombre : '';
    } else {
        document.getElementById('maq_cliente_search').value = '';
    }

    // Le pido a la página que baje hasta el título del formulario para que sea cómodo empezar a editar sin tener que hacer scroll manual.
    document.getElementById('form-title-maquina').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarMaquina(id) {
    // Lanzo un aviso antes de borrar nada para evitar accidentes.
    if (!confirm('¿Seguro que deseas borrar esta máquina del parque?')) return;
    try {
        // Le paso el ID a la API y uso el método DELETE para destruirla.
        const res = await fetch(`/api/maquinas/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        // Si todo va bien, recargo la lista de máquinas en memoria y la tabla se actualizará sola.
        if (res.ok) await cargarMaquinas();
    } catch (error) { console.error(error); }
}

export function limpiarFormMaquina() {
    // Esta función solo se encarga de devolver el formulario a su estado original, vaciando todos los campos para poder meter una máquina nueva desde cero.
    document.getElementById('form-title-maquina').innerText = 'Añadir Máquina';
    document.getElementById('maq_id').value = '';
    document.getElementById('maq_modelo').value = '';
    document.getElementById('maq_sn').value = '';
    document.getElementById('maq_cliente_id').value = '';
    document.getElementById('maq_cliente_search').value = '';
}
