// ==========================================================================
// BUSCADOR, MODAL RÁPIDO Y GESTIÓN (CRM)
// ==========================================================================
import { token, AppState, cargarClientes } from './api.js';
import { mostrarMapaDeTabla } from './ui.js';

// --- 1. BUSCADOR Y MODAL RÁPIDO (Para la pantalla de Reparaciones) ---

export function filtrarClientes(inputId, dropdownId, callbackSeleccion) {
    // Aquí leo lo que estoy escribiendo en el buscador de clientes.
    const query = document.getElementById(inputId).value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = '';

    // Si borro el texto y no hay nada escrito, oculto el desplegable y me salgo de la función.
    if (query.length < 1) { dropdown.classList.add('hidden'); return; }

    // Busco en mi almacén global de clientes si hay alguno cuyo nombre o teléfono coincida con lo que he escrito.
    const filtrados = AppState.listaClientes.filter(c => c.nombre.toLowerCase().includes(query) || (c.telefono && c.telefono.includes(query)));

    // Si no encuentro a nadie, muestro un mensaje en el desplegable diciendo que no hay coincidencias.
    if (filtrados.length === 0) {
        dropdown.innerHTML = '<li class="p-3 text-gray-500 text-sm italic">No se encontraron coincidencias...</li>';
    } else {
        // Si encuentro clientes, creo una lista visual con sus nombres y teléfonos.
        filtrados.forEach(c => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-blue-50 cursor-pointer border-b text-gray-800 flex justify-between items-center';
            li.innerHTML = `<div><div class="font-semibold">${c.nombre}</div><div class="text-xs text-gray-500">${c.telefono || 'Sin teléfono'}</div></div>`;

            // Le añado un evento para que, cuando haga clic en un cliente de la lista, su nombre se ponga en el input, se oculte el desplegable y se ejecute la función que me hayan pasado.
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
    // Con esta función preparo el formulario de reparación cuando selecciono a un cliente. Primero guardo su ID de forma oculta.
    document.getElementById('cliente_id').value = cliente.id;

    // Muestro una cajita con los datos de contacto del cliente y un boton para llamarle directamente si estoy desde el movil.
    const infoDiv = document.getElementById('cliente_info');
    let botonLlamar = cliente.telefono ? `<a href="tel:${cliente.telefono}" class="ml-3 bg-green-500 text-white px-3 py-1 rounded text-xs">Llamar</a>` : '';
    infoDiv.innerHTML = `<p><strong>Teléfono:</strong> ${cliente.telefono || 'No especificado'} ${botonLlamar}</p><p><strong>Dirección:</strong> ${cliente.direccion || 'No especificada'}</p>`;
    infoDiv.classList.remove('hidden');

    // Si el cliente tiene dirección física, le paso el dato a mi funcion del mapa para que me lo pinte. Si no tiene, lo oculto.
    if (cliente.direccion) mostrarMapaDeTabla(encodeURIComponent(cliente.direccion));
    else document.getElementById('mapa_container').classList.add('hidden');

    // Aquí me encargo de las máquinas. Busco en mi almacén global todas las máquinas que pertenecen al ID de este cliente en concreto.
    const selectMaquina = document.getElementById('reparacion_maquina_id');
    if (selectMaquina) {
        selectMaquina.innerHTML = '<option value="">-- Aviso general / Sin máquina --</option>';
        const susMaquinas = AppState.listaMaquinas.filter(m => m.cliente_id === cliente.id);

        // Si tiene máquinas, las meto en el desplegable y lo pinto de verde para que llame la atención.
        if (susMaquinas.length > 0) {
            susMaquinas.forEach(m => {
                selectMaquina.innerHTML += `<option value="${m.id}">${m.modelo} (S/N: ${m.numero_serie})</option>`;
            });
            selectMaquina.classList.add('bg-green-50', 'border-green-400');
        } else {
            // Si no tiene, dejo un mensaje avisando y le quito los colores llamativos al desplegable.
            selectMaquina.innerHTML = '<option value="">Este cliente no tiene máquinas asignadas</option>';
            selectMaquina.classList.remove('bg-green-50', 'border-green-400');
        }
    }
}

export function abrirModalCliente() {
    // Funciones simples para abrir la ventana flotante de crear cliente rápido. Aprovecho y le meto al campo de nombre lo que sea que estuviera buscando el usuario para ahorrarle escribirlo otra vez.
    document.getElementById('nuevo_cliente_nombre').value = document.getElementById('cliente_search').value;
    document.getElementById('nuevo_cliente_email').value = '';
    document.getElementById('nuevo_cliente_telefono').value = '';
    document.getElementById('nuevo_cliente_direccion').value = '';
    document.getElementById('modal_cliente').classList.remove('hidden');
}

export function cerrarModalCliente() {
    // Oculto la ventana flotante.
    document.getElementById('modal_cliente').classList.add('hidden');
}

export async function guardarNuevoCliente() {
    // Aquí recojo todos los datos que el usuario ha metido en la ventana flotante.
    const nombre = document.getElementById('nuevo_cliente_nombre').value;
    const telefono = document.getElementById('nuevo_cliente_telefono').value;
    const direccion = document.getElementById('nuevo_cliente_direccion').value;
    const inputEmail = document.getElementById('nuevo_cliente_email');

    // Como mi base de datos de Laravel me exige que el email no esté vacío, si el usuario no pone ninguno me invento uno temporal usando la fecha actual para que el sistema no explote.
    const email = (inputEmail && inputEmail.value) ? inputEmail.value : `sin-email-${Date.now()}@cliente.com`;

    // No dejo guardar si se les olvida el nombre.
    if (!nombre) return alert("El nombre es obligatorio.");

    // Cambio el texto del boton mientras carga para dar feedback visual.
    const btn = document.querySelector('#modal_cliente button.bg-green-600');
    btn.innerText = 'Guardando...'; btn.disabled = true;

    try {
        // Le envío los datos al servidor por POST para crear el registro.
        const res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre, telefono, direccion, email })
        });

        if (res.ok) {
            // Si todo ha ido bien, descargo la base de datos de clientes otra vez para tener al nuevo incluido, cierro el modal y le asigno este nuevo cliente a la reparación que estaba haciendo.
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

    // Esta funcion es la que arranca la tabla de gestión de clientes (el CRM). Si veo que el buscador está en blanco, corto aquí la ejecución y pido al usuario que escriba algo.
    const query = document.getElementById('buscador_gestion_clientes')?.value.toLowerCase().trim() || "";

    if (query === "") {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400 italic">Escribe en el buscador para encontrar un cliente...</td></tr>`;
        return;
    }

    filtrarTablaGestionClientes();
}

export function filtrarTablaGestionClientes() {
    // Aquí hago la busqueda real para el apartado de gestión. Miro qué han escrito y busco en mi array global de clientes.
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

    // Si encuentro clientes, los recorro para pintar sus filas en la tabla.
    filtrados.forEach(c => {
        const cCod = encodeURIComponent(JSON.stringify(c));

        // Compruebo si el email es uno de los inventados. Si lo es, en lugar de mostrar ese email feo, pongo un texto indicando que no tiene email real.
        const emailMostrar = (c.email && !c.email.includes('sin-email-')) ? c.email : '<span class="italic text-gray-400">Sin email</span>';

        // Ahora busco en el almacén global de máquinas cuáles pertenecen a este cliente en concreto que estoy procesando.
        const maquinasCliente = AppState.listaMaquinas.filter(m => m.cliente_id === c.id);
        let htmlMaquinas = '';

        // Si tiene máquinas, le fabrico unas pequeñas etiquetas visuales azules para que quede claro de un vistazo qué equipos tiene instalados.
        if (maquinasCliente.length > 0) {
            htmlMaquinas = `<div class="mt-2 flex flex-wrap gap-1">`;
            maquinasCliente.forEach(m => {
                htmlMaquinas += `<span class="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-medium border border-blue-200">${m.modelo}</span>`;
            });
            htmlMaquinas += `</div>`;
        } else {
            htmlMaquinas = `<div class="mt-1 text-[10px] text-gray-400 italic">Sin máquinas asignadas</div>`;
        }

        // Pego todo el código HTML montado dentro de la tabla.
        tbody.innerHTML += `
        <tr class="border-b hover:bg-gray-50 transition">
            <td class="py-3 px-4">
                <div class="font-bold text-gray-800">${c.nombre}</div>
                <div class="text-xs text-gray-500">Email: ${emailMostrar}</div>
                ${htmlMaquinas}
            </td>
            <td class="py-3 px-4">
                <div class="font-medium text-sm text-gray-700">Tel: ${c.telefono || '-'}</div>
                <div class="text-xs text-gray-400 italic">Dir: ${c.direccion || '-'}</div>
            </td>
            <td class="py-3 px-4 text-center">
                <div class="flex justify-center gap-1">
                    <button onclick="editarClienteGestion('${cCod}')" class="text-blue-500 p-2 hover:scale-125 transition" title="Editar Cliente">✏️</button>
                    <button onclick="borrarClienteGestion(${c.id})" class="text-red-500 p-2 hover:scale-125 transition" title="Borrar Cliente">🗑️</button>
                </div>
            </td>
        </tr>`;
    });
}

export async function guardarClienteGestion() {
    // Esta función la uso en el panel de gestión para guardar clientes, me sirve tanto para crear uno nuevo como para actualizar uno que ya existe.
    const id = document.getElementById('gestion_cli_id').value;
    const nombre = document.getElementById('gestion_cli_nombre').value;
    const telefono = document.getElementById('gestion_cli_telefono').value;
    const direccion = document.getElementById('gestion_cli_direccion').value;
    const emailRaw = document.getElementById('gestion_cli_email').value;

    // Vuelvo a aplicar mi truco del email temporal si el usuario me lo deja vacío para evitar que la base de datos se queje.
    const email = emailRaw ? emailRaw : `sin-email-${Date.now()}@cliente.com`;

    if (!nombre) return alert('El nombre es obligatorio.');

    const datos = { nombre, email, telefono, direccion };

    // Aquí hago que el código sea inteligente: si el input oculto de ID tiene un valor, le digo que ataque a la ruta de actualizar y uso el método PUT. Si está vacío, uso el POST normal para crear.
    const url = id ? `/api/clientes/${id}` : '/api/clientes';

    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            // Limpio el formulario, descargo los clientes actualizados y refresco la tabla para ver el resultado de lo que acabo de hacer.
            limpiarFormClienteGestion();
            await cargarClientes();
            filtrarTablaGestionClientes();
        } else { alert("Error al guardar el cliente."); }
    } catch (error) { console.error(error); }
}

export function editarClienteGestion(cCod) {
    // Con esta funcion recojo el cliente codificado que viene del boton Editar de la tabla, lo transformo en un objeto normal y relleno todos los campos del formulario para que pueda modificarlos.
    const c = JSON.parse(decodeURIComponent(cCod));
    document.getElementById('form-title-cliente').innerText = 'Editar Cliente';
    document.getElementById('gestion_cli_id').value = c.id;
    document.getElementById('gestion_cli_nombre').value = c.nombre;
    document.getElementById('gestion_cli_telefono').value = c.telefono || '';
    document.getElementById('gestion_cli_direccion').value = c.direccion || '';

    // Si el email es uno de mis inventados, dejo el campo en blanco para no confundir.
    document.getElementById('gestion_cli_email').value = (c.email && !c.email.includes('sin-email-')) ? c.email : '';

    // Hago un scroll suave para que la pantalla suba automáticamente hasta el formulario y no tenga que hacerlo yo a mano.
    document.getElementById('form-title-cliente').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarClienteGestion(id) {
    // Bloqueo de seguridad básico para evitar que pulse sin querer y borre un cliente importante.
    if (!confirm('¿Seguro que deseas borrar este cliente? Se podrían ver afectados sus avisos y máquinas.')) return;

    try {
        // Le paso el ID a la ruta de borrado y le digo al servidor que use el método DELETE.
        const res = await fetch(`/api/clientes/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            // Recargo todo para que desaparezca visualmente.
            await cargarClientes();
            filtrarTablaGestionClientes();
        }
    } catch (error) { console.error(error); }
}

export function limpiarFormClienteGestion() {
    // Simplemente devuelvo el formulario de gestión a su estado inicial para que esté listo para añadir gente nueva, asegurándome de vaciar el campo oculto del ID.
    document.getElementById('form-title-cliente').innerText = 'Añadir Cliente';
    document.getElementById('gestion_cli_id').value = '';
    document.getElementById('gestion_cli_nombre').value = '';
    document.getElementById('gestion_cli_email').value = '';
    document.getElementById('gestion_cli_telefono').value = '';
    document.getElementById('gestion_cli_direccion').value = '';
}
