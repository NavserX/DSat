// ==========================================================================
// PANEL DE GESTION - LOGICA FRONTEND (JavaScript)
// ==========================================================================
// Este archivo es el cerebro de la pagina. Me encargo de comunicarme con Laravel (mi servidor),
// pedirle datos y actualizar lo que veo en pantalla sin necesidad de estar recargando la pagina web todo el tiempo.

// --- 1. EL ACCESO (Autenticación) ---
// Cuando inicio sesion, mi servidor Laravel me entrega una clave unica (el Token).
// Lo primero que hago al cargar esta pagina es intentar leer esa clave del almacenamiento de mi navegador.
const token = localStorage.getItem('token');

// Si me doy cuenta de que no tengo esa clave, significa que estoy intentando entrar aqui saltandome el login. Me auto-expulso mandandome de vuelta a la pantalla de inicio.
if (!token) window.location.href = '/';

// --- 2. EL ALMACEN GLOBAL (Variables Globales) ---
// Me guardo aqui la informacion que voy a estar necesitando de forma constante para no saturar al servidor pidiendole las mismas cosas una y otra vez. Es mucho mas rapido leerlo de estas variables.
let listaClientes = [];         // Para que el buscador del formulario autocomplete rapido.
let todasLasReparaciones = [];  // Para cargar la tabla central y generar los historiales cruzados.
let usuarioActual = null;       // Para recordar que rol tengo (si soy Admin o Tecnico) y capar la interfaz si hace falta.
let piezasTemporales = [];      // Lo uso de carrito virtual para ir metiendo los repuestos que gasto antes de confirmar la finalizacion de un aviso.

// ==========================================================================
// PERFIL Y ADAPTACION DE INTERFAZ
// ==========================================================================

async function cargarPerfilUsuario() {
    try {
        // Hago una peticion a mi servidor preguntandole mis datos de usuario. Le envio mi token de seguridad en la cabecera para que me reconozca.
        const res = await fetch('/api/me', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            // Si la peticion es exitosa, guardo mi perfil en la variable global.
            usuarioActual = await res.json();

            // Inmediatamente despues, llamo a esta funcion para ocultar cosas de la pantalla dependiendo de si soy tecnico o admin.
            adaptarInterfazAlRol();
        }
    } catch (error) { console.error("Error cargando perfil", error); }
}

function adaptarInterfazAlRol() {
    // Si compruebo que la persona que ha iniciado sesion tiene el rol tecnico, procedo a recortarle funcionalidades visuales para evitar errores y que se centre solo en sus avisos.
    if (usuarioActual && usuarioActual.rol === 'tecnico') {

        // 1. Le oculto los botones del menu lateral que dan acceso a los historiales generales, porque no necesita verlos.
        const btnClientes = document.getElementById('btn-menu-clientes');
        const btnTecnicos = document.getElementById('btn-menu-tecnicos');
        if (btnClientes) btnClientes.classList.add('hidden');
        if (btnTecnicos) btnTecnicos.classList.add('hidden');

        // 2. Le oculto el panel entero de creacion de avisos (la columna izquierda), ya que solo la administracion deberia crear partes nuevos.
        const cajaFormulario = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');

        if (cajaFormulario && cajaTabla) {
            cajaFormulario.classList.add('hidden');

            // Al quitar el panel lateral, me queda un hueco en la pantalla. Le digo a la tabla de avisos que se estire y ocupe todo el ancho disponible.
            cajaTabla.classList.remove('lg:col-span-2');
            cajaTabla.classList.add('col-span-1', 'lg:col-span-3');
        }

        // 3. Bloqueo los buscadores para que no pueda fisgonear en bases de datos que no le corresponden, por si acaso el formulario llegara a ser visible de alguna forma.
        document.getElementById('cliente_search').disabled = true;
        document.getElementById('tecnico_id').disabled = true;

        // 4. Quito los botones de acciones rapidas de añadir clientes para mantener la base de datos limpia de duplicados.
        const btnNuevoCliente = document.querySelector('button[onclick="abrirModalCliente()"]');
        if (btnNuevoCliente) btnNuevoCliente.classList.add('hidden');

        const btnLimpiar = document.querySelector('button[onclick="limpiarFormulario()"]');
        if (btnLimpiar) btnLimpiar.classList.add('hidden');
    }
}

// ==========================================================================
// NAVEGACION (Single Page Application)
// ==========================================================================

// Como quiero que la web sea rapida y parezca una app de movil, no recargo la pagina cuando pincho en un menu. Solo uso esta funcion para mostrar y ocultar secciones del HTML.
function mostrarPantalla(idPantalla, botonClicado) {
    // Primero, me aseguro de ocultar todas las pantallas a la vez añadiendoles la clase de ocultacion de Tailwind.
    document.querySelectorAll('.pantalla-seccion').forEach(div => div.classList.add('hidden'));

    // Luego, cojo el ID de la pantalla especifica que quiero ver y se la quito para que aparezca.
    document.getElementById(idPantalla).classList.remove('hidden');

    // Por ultimo, me encargo de la estetica del menu. Recorro todos los botones laterales y les quito el fondo azul para ponerlos en su estado original.
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'border-l-4');
        btn.classList.add('hover:bg-slate-800');
    });

    // Al boton concreto que acabo de pulsar, le pongo el fondo azul brillante para saber en todo momento en que pantalla estoy.
    botonClicado.classList.remove('hover:bg-slate-800');
    botonClicado.classList.add('bg-blue-600');
}

// Me fabrico esta funcion para extraer la fecha actual del reloj de mi ordenador, darle el formato correcto para base de datos y ponersela a mis casillas de fecha por defecto. Me ahorra mucho tiempo tecleando.
function setFechaHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_entrada').value = hoy;
}
setFechaHoy();

// ==========================================================================
// CARGA DE DATOS MAESTROS
// ==========================================================================

async function cargarClientes() {
    try {
        // Me descargo de golpe la lista entera de clientes.
        const res = await fetch('/api/clientes', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) listaClientes = await res.json(); // La guardo en mi array global para poder buscar a traves de ella en local sin saturar la red.
    } catch (error) { console.error(error); }
}

async function cargarTecnicos() {
    try {
        // Me descargo a mis trabajadores.
        const res = await fetch('/api/tecnicos', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const tecnicos = await res.json();

            // Busco donde tengo que pintar la lista de tecnicos en la interfaz (tengo un selector en el panel de crear avisos y otro en la pestaña de historiales).
            const selectForm = document.getElementById('tecnico_id');
            const selectFiltro = document.getElementById('filtro_tecnico_id');

            // Recorro la lista y voy creando opciones HTML para los dos desplegables a la vez.
            tecnicos.forEach(t => {
                selectForm.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                selectFiltro.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
            });
        }
    } catch (error) { console.error(error); }
}

async function cargarMarcas() {
    try {
        // Hago lo mismo que antes pero con el catalogo basico de marcas, por si quiero asociarle una generica al aviso en caso de no tener control del parque de maquinas de ese cliente.
        const res = await fetch('/api/marcas', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const marcas = await res.json();
            const select = document.getElementById('marca_id');
            marcas.forEach(m => select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`);
        }
    } catch (error) { console.error(error); }
}

// ==========================================================================
// BUSCADOR DE CLIENTES RAPIDO
// ==========================================================================

function filtrarClientes(inputId, dropdownId, callbackSeleccion) {
    // Capturo lo que estoy escribiendo en el buscador. Lo paso a minusculas para que me de igual escribir con mayusculas o minusculas.
    const query = document.getElementById(inputId).value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);

    // Vacio los resultados de busquedas anteriores.
    dropdown.innerHTML = '';

    // Si no he escrito nada en el buscador, oculto el bloque flotante de resultados y corto aqui la funcion.
    if (query.length < 1) { dropdown.classList.add('hidden'); return; }

    // Utilizo la funcion de filtro en mi variable global. Solo conservo los clientes cuyo nombre contenga las letras que he escrito, o cuyo numero de telefono coincida con lo escrito.
    const filtrados = listaClientes.filter(c => c.nombre.toLowerCase().includes(query) || (c.telefono && c.telefono.includes(query)));

    if (filtrados.length === 0) {
        // Si nadie coincide, muestro un mensajito diciendo que no he encontrado nada.
        dropdown.innerHTML = '<li class="p-3 text-gray-500 text-sm italic">No se encontraron coincidencias...</li>';
    } else {
        // Si hay resultados, recorro mis clientes filtrados y les voy creando un recuadro interactivo (li) a cada uno.
        filtrados.forEach(c => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-blue-50 cursor-pointer border-b text-gray-800 flex justify-between items-center';
            li.innerHTML = `<div><div class="font-semibold">${c.nombre}</div><div class="text-xs text-gray-500">${c.telefono || 'Sin teléfono'}</div></div>`;

            // Le digo al elemento visual que, cuando haga clic sobre el, copie el nombre del cliente en el input, esconda la lista flotante y dispare la funcion que me hayan pasado como parametro para terminar el proceso de seleccion.
            li.onclick = () => {
                document.getElementById(inputId).value = c.nombre;
                dropdown.classList.add('hidden');
                callbackSeleccion(c);
            };
            dropdown.appendChild(li);
        });
    }
    // Hago visible el bloque flotante con las sugerencias.
    dropdown.classList.remove('hidden');
}

function seleccionarClienteReparacion(cliente) {
    // Almaceno el ID tecnico del cliente en un campo oculto del formulario. Esto es fundamental porque Laravel necesita el ID numerico para la base de datos, no el nombre en texto.
    document.getElementById('cliente_id').value = cliente.id;

    // Uso esta division debajo del buscador para darle informacion util de contexto al administrativo.
    const infoDiv = document.getElementById('cliente_info');

    // Le fabrico un enlace de llamada nativa. Si esta usando la web desde un ordenador con softphone o desde un movil, al clicarle le lanzara la aplicacion de llamadas de su dispositivo.
    let botonLlamar = cliente.telefono ? `<a href="tel:${cliente.telefono}" class="ml-3 bg-green-500 text-white px-3 py-1 rounded text-xs">Llamar</a>` : '';
    infoDiv.innerHTML = `<p><strong>Teléfono:</strong> ${cliente.telefono || 'No especificado'} ${botonLlamar}</p><p><strong>Dirección:</strong> ${cliente.direccion || 'No especificada'}</p>`;
    infoDiv.classList.remove('hidden');

    // Si el cliente tiene una direccion registrada, la convierto a formato web seguro (encodeURIComponent) y se la paso a mi funcion del mapa. Si no tiene direccion, oculto el hueco del mapa para que no estorbe.
    if (cliente.direccion) mostrarMapaDeTabla(encodeURIComponent(cliente.direccion));
    else document.getElementById('mapa_container').classList.add('hidden');
}

// ==========================================================================
// HISTORIALES INTERACTIVOS
// ==========================================================================

function cargarHistorialCliente(cliente) {
    document.getElementById('titulo_historial_cliente').innerText = `Avisos de: ${cliente.nombre}`;
    const tbody = document.getElementById('tabla-historial-cliente');
    tbody.innerHTML = '';

    // Uso mi array con todo el volumen de reparaciones y extraigo solo aquellas donde el id de cliente coincida con el que he buscado.
    const historial = todasLasReparaciones.filter(rep => rep.cliente_id === cliente.id);

    if(historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No hay historial.</td></tr>`;
    } else {
        historial.forEach(rep => {
            // Creo una jerarquia de fechas para mostrar siempre la más relevante. Primero intento mostrar cuando se cerro; si no esta cerrado, muestro la fecha en la que entró al sistema; si no tiene fecha de entrada registrada, tiro de la fecha de creacion automatica de la base de datos.
            let fecha = rep.fecha_cierre || rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            // Convierto el objeto complejo de javascript en un texto codificado para no romper el HTML al inyectarlo en la propiedad onclick del boton.
            const repCodificada = encodeURIComponent(JSON.stringify(rep));

            tbody.innerHTML += `
            <tr class="border-b hover:bg-blue-100 cursor-pointer transition" onclick="verDetalleReparacion('${repCodificada}')">
                <td class="py-3 px-4">${fecha}</td>
                <td class="py-3 px-4"><strong>${rep.marca?.nombre || 'N/A'}</strong></td>
                <td class="py-3 px-4">${rep.tecnico?.nombre || 'N/A'}</td>
                <td class="py-3 px-4 font-semibold text-green-600">${rep.tiempo_total || '-'}</td>
            </tr>`;
        });
    }
    document.getElementById('contenedor_historial_cliente').classList.remove('hidden');
}

function filtrarHistorialTecnicos() {
    // Recojo que tecnico he seleccionado en el desplegable y las dos fechas de corte que he marcado.
    const tecId = document.getElementById('filtro_tecnico_id').value;
    const fechaInicio = document.getElementById('filtro_fecha_inicio').value;
    const fechaFin = document.getElementById('filtro_fecha_fin').value;
    const tbody = document.getElementById('tabla-historial-tecnico');
    tbody.innerHTML = '';

    let filtrados = todasLasReparaciones;

    // Empiezo a encadenar filtros uno encima del otro para refinar los datos. Si tengo tecnico, lo aplico. Si tengo fecha de inicio, compruebo que la fecha del aviso sea igual o superior. Si tengo fin, igual o inferior.
    if (tecId) filtrados = filtrados.filter(rep => rep.tecnico_id == tecId);
    if (fechaInicio) filtrados = filtrados.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) >= fechaInicio);
    if (fechaFin) filtrados = filtrados.filter(rep => (rep.fecha_cierre || rep.fecha_entrada || rep.created_at?.substring(0,10)) <= fechaFin);

    if(filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">Sin resultados.</td></tr>`;
        return;
    }

    // Y los pinto en la tabla como de costumbre.
    filtrados.forEach(rep => {
        let fecha = rep.fecha_cierre || rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');
        const repCodificada = encodeURIComponent(JSON.stringify(rep));

        tbody.innerHTML += `
        <tr class="border-b hover:bg-blue-100 cursor-pointer transition" onclick="verDetalleReparacion('${repCodificada}')">
            <td class="py-3 px-4">${fecha}</td>
            <td class="py-3 px-4">${rep.tecnico?.nombre || 'N/A'}</td>
            <td class="py-3 px-4">${rep.cliente?.nombre || 'S/N'}</td>
            <td class="py-3 px-4 font-bold text-green-600">${rep.tiempo_total || '-'}</td>
        </tr>`;
    });
}

// Añado un chivato visual global a la web: Si hago clic fuera de cualquier elemento flotante de busqueda, los fuerzo a esconderse para mantener la interfaz limpia. Me aseguro de exceptuar al propio input de busqueda para no volverme loco al teclear.
document.addEventListener('click', function(e) {
    ['cliente_dropdown', 'historial_cliente_dropdown'].forEach(id => {
        const el = document.getElementById(id);
        if(el && !el.contains(e.target) && e.target.id !== id.replace('_dropdown', '_search')) el.classList.add('hidden');
    });
});

function mostrarMapaDeTabla(dir) {
    // Uso el iFrame embebido de Google Maps y le inyecto dinamicamente la direccion para que la localice.
    const map = document.getElementById('mapa_container');
    document.getElementById('google_map_iframe').src = `https://maps.google.com/maps?q=$${dir}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

    // Ademas creo un boton externo por si quieren abrir la ruta directamente en la aplicacion de Google Maps (muy util en el movil).
    document.getElementById('link_como_llegar').href = `https://maps.google.com/maps?q=$${dir}`;
    map.classList.remove('hidden');
}

// ==========================================================================
// FLUJO DE TRABAJO (Estados rapidos)
// ==========================================================================

async function asignarmeAviso(id) {
    // Esta funcion es para la pestaña de "Avisos Libres". Encuentro cual he pinchado comparando los IDs.
    const rep = todasLasReparaciones.find(r => r.id === id);
    if (!rep) return;

    // Me autoasigno la averia forzando mi ID en la actualizacion, y ademas la paso al estado "en proceso" para quitarla del limbo general.
    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: usuarioActual.id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada || new Date().toISOString().split('T')[0],
        estado: 'en proceso'
    };

    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            // Recargo mis memorias locales para confirmar el cambio.
            cargarReparaciones();
            // Finjo un clic en la pestaña de Mis Avisos para que el tecnico sea redirigido a su mesa de trabajo automaticamente al coger uno libre.
            document.getElementById('btn-menu-reparaciones').click();
        }
    } catch (error) { console.error(error); }
}

async function cambiarEstadoRapido(id, nuevoEstado) {
    const rep = todasLasReparaciones.find(r => r.id === id);
    if (!rep) return;

    // Con esta funcion evito tener que abrir el formulario entero de la izquierda solo para cambiar un estado. Dejo el objeto igual, pero aplasto el campo 'estado' con la peticion del boton que he clicado.
    const datos = {
        cliente_id: rep.cliente_id,
        tecnico_id: rep.tecnico_id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada,
        estado: nuevoEstado
    };

    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });
        if (res.ok) cargarReparaciones();
    } catch (error) { console.error(error); }
}

// ==========================================================================
// CIERRE DE AVISOS Y PIEZAS (Modal)
// ==========================================================================

function abrirModalFinalizar(id) {
    // Al abrir el cuadro flotante, inyecto el identificador de la averia y lo muestro bonito para no equivocarme de maquina. Vacio resoluciones anteriores que pudieran estar cargadas de un error.
    document.getElementById('fin_rep_id').value = id;
    document.getElementById('fin_rep_id_display').innerText = id;
    document.getElementById('fin_resolucion').value = '';

    // Utilizo funciones de javascript para calcular la hora a la que acabo de abrir este modal y auto-rellenarle la hora de cierre y la fecha de hoy, ahorrandole un monton de trabajo de escritura en la tablet.
    const hoy = new Date().toISOString().split('T')[0];
    const ahora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if(document.getElementById('fin_fecha_cierre')) document.getElementById('fin_fecha_cierre').value = hoy;

    // Dejo la hora de inicio en blanco deliberadamente porque la hora de llegada si que va a tener que teclearla.
    if(document.getElementById('fin_hora_inicio')) document.getElementById('fin_hora_inicio').value = '';
    if(document.getElementById('fin_hora_fin')) document.getElementById('fin_hora_fin').value = ahora;

    // Vacio el array que uso de "cesta" de piezas para empezar un registro totalmente en blanco.
    piezasTemporales = [];
    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_cant').value = '1';
    dibujarTablaPiezas();

    document.getElementById('modal_finalizar').classList.remove('hidden');
}

function cerrarModalFinalizar() {
    document.getElementById('modal_finalizar').classList.add('hidden');
}

function agregarPiezaLista() {
    // Leo los mini-inputs que he puesto dentro de la ventana del cierre.
    const ref = document.getElementById('add_pieza_ref').value;
    const desc = document.getElementById('add_pieza_desc').value;
    const cant = document.getElementById('add_pieza_cant').value;

    if(!desc) return alert("La descripción de la pieza es obligatoria");

    // Construyo un mini-objeto y lo guardo en mi array-memoria temporal.
    piezasTemporales.push({ referencia: ref, descripcion: desc, cantidad: cant });

    // Vacio los campos por si necesito reportar una segunda pieza instalada.
    document.getElementById('add_pieza_ref').value = '';
    document.getElementById('add_pieza_desc').value = '';
    document.getElementById('add_pieza_cant').value = '1';

    // Genero visualmente la tabla con lo que acabo de añadir a la lista temporal.
    dibujarTablaPiezas();
}

function eliminarPiezaLista(index) {
    // Si me equivoco poniendo una pieza, uso el indice (su posicion en el array) para sacarlo y repintar la tablita.
    piezasTemporales.splice(index, 1);
    dibujarTablaPiezas();
}

function dibujarTablaPiezas() {
    const tbody = document.getElementById('lista_piezas_tbody');
    tbody.innerHTML = '';

    if(piezasTemporales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-3 text-gray-400 italic">No se han añadido piezas.</td></tr>`;
        return;
    }

    // Es una tabla diminuta que solo vive en el modal de cierre. Añado un boton de eliminar que recibe el indice del bucle que uso en el foreach, asi sabe a que item atacar.
    piezasTemporales.forEach((pieza, index) => {
        tbody.innerHTML += `
        <tr class="border-b bg-white">
            <td class="p-2 text-xs font-mono">${pieza.referencia || 'S/R'}</td>
            <td class="p-2 text-sm">${pieza.descripcion}</td>
            <td class="p-2 text-center font-bold">${pieza.cantidad}</td>
            <td class="p-2 text-center">
                <button onclick="eliminarPiezaLista(${index})" class="text-red-500 hover:text-red-700">Borrar</button>
            </td>
        </tr>`;
    });
}

async function guardarFinalizacion() {
    const id = document.getElementById('fin_rep_id').value;
    const resolucion = document.getElementById('fin_resolucion').value;

    const h_inicio = document.getElementById('fin_hora_inicio').value;
    const h_fin = document.getElementById('fin_hora_fin').value;
    const f_cierre = document.getElementById('fin_fecha_cierre').value;

    // Obligo a hacer bien los informes. No cierro nada sin la solucion escrita y los partes horarios completados.
    if(!resolucion) return alert("Por favor, describe el trabajo realizado.");
    if(!h_inicio || !h_fin || !f_cierre) return alert("Rellena todos los campos de horario.");

    // Hago un truco para calcular el tiempo entre dos horas en texto plano. Les pego una fecha arbitraria por delante, asi convierto un "15:00" en un objeto que javascript si que sabe operar matematicamente.
    const inicioDate = new Date(`2026-01-01T${h_inicio}:00`);
    const finDate = new Date(`2026-01-01T${h_fin}:00`);

    // Al restar dos fechas en javascript, me devuelven los milisegundos de diferencia.
    const diffMs = finDate - inicioDate;

    // Detecto viajeros en el tiempo y errores de introduccion, rechazando la transaccion si ha puesto hora de salida a las 11 y hora de entrada a las 12.
    if (diffMs < 0) return alert("La hora de salida no puede ser anterior a la de entrada.");

    // Una vez confirmados los tiempos coherentes, traduzco esos milisegundos a una cadena de texto en un formato humano y legible (ejemplo: 2h 15min)
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round(((diffMs % 3600000) / 60000));
    const tiempoEmpleo = `${diffHrs}h ${diffMins}min`;

    const rep = todasLasReparaciones.find(r => r.id == id);
    if (!rep) return;

    // Empaqueto los datos finales
    const datos = {
        cliente_id: rep.cliente_id,
        // Por prevencion, si el admin es quien esta cerrando un aviso que ha quedado libre o huerfano, se autoasigna la accion en la base de datos para no dejar campos requeridos en blanco que podrian dar un error 500 del servidor.
        tecnico_id: rep.tecnico_id || usuarioActual.id,
        marca_id: rep.marca_id,
        descripcion: rep.descripcion,
        fecha_entrada: rep.fecha_entrada,
        estado: 'terminado',
        resolucion_texto: resolucion,
        hora_inicio: h_inicio,
        hora_fin: h_fin,
        fecha_cierre: f_cierre,
        tiempo_total: tiempoEmpleo,
        // El servidor mysql no sabe lo que es un array de objetos de javascript. Para poder meter la matriz temporal de piezas completada en una celda de mysql, transformo mis objetos a texto plano serializado.
        piezas_utilizadas: JSON.stringify(piezasTemporales)
    };

    // Bloqueo fisicamente el boton para evitar duplicidades de llamadas al pulsar varias veces seguidas mientras se procesa la peticion por internet en la red movil 4g.
    const btn = document.querySelector('#modal_finalizar button.bg-green-600');
    btn.innerText = 'Cerrando...'; btn.disabled = true;

    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            cerrarModalFinalizar();
            cargarReparaciones();
        } else alert("Error al cerrar el aviso.");
    } catch (error) { console.error(error); }
    finally {
        btn.innerText = 'Cerrar Aviso'; btn.disabled = false;
    }
}

// ==========================================================================
// GESTION DE TABLAS CENTRAL
// ==========================================================================

async function cargarReparaciones() {
    // Reviso ciertos inputs que revelarian que estoy en mitad de teclear algo o manipulando los datos, de manera que aborto el refresco periodico del setInterval si es asi para no fastidiarle el trabajo a nadie perdiendo el texto en progreso.
    const editandoId = document.getElementById('rep-id').value;
    const escribiendoDesc = document.getElementById('descripcion').value;
    const modalFinVisible = !document.getElementById('modal_finalizar').classList.contains('hidden');

    if (editandoId || escribiendoDesc.length > 0 || modalFinVisible) return;

    try {
        const res = await fetch('/api/reparaciones', { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();

        // Uso esta formula interna con javascript de reordenar basandome en el timestamp para poner el ultimo creado siempre en la primera linea y tenerlos cronologicamente correctos.
        todasLasReparaciones = data.sort((a,b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));

        const tbodyPrincipal = document.getElementById('tabla-reparaciones');
        const tbodyLibres = document.getElementById('tabla-avisos-libres');

        tbodyPrincipal.innerHTML = '';
        if(tbodyLibres) tbodyLibres.innerHTML = '';

        let pendientes = 0, proceso = 0, terminado = 0;

        todasLasReparaciones.forEach(rep => {
            // Voy analizando el tipo de cada parte en este listado e incremento su contador numerico por categorias segun me los voy encontrando, preparandome para actualizar los bloques visuales al finalizar.
            if (rep.estado === 'pendiente') pendientes++;
            if (rep.estado === 'en proceso') proceso++;
            if (rep.estado === 'terminado') terminado++;

            let fechaFormateada = rep.fecha_entrada || (rep.created_at ? rep.created_at.substring(0,10) : 'S/F');

            // Hago que mis listados sean logicos y contextuales. Si en la carga se da la casualidad de que el objeto es de la bolsa libre comun, no lo pongo en el tablero personal principal y viceversa, separando lo publico de lo individual.
            if (rep.estado === 'pendiente' && !rep.tecnico_id && tbodyLibres) {
                tbodyLibres.innerHTML += `
                <tr class="hover:bg-yellow-50 transition border-b">
                    <td class="p-4">
                        <span class="font-bold text-blue-600">#${rep.id}</span><br>
                        <span class="text-xs text-gray-500">Fecha: ${fechaFormateada}</span>
                    </td>
                    <td class="p-4">
                        <span class="font-medium">${rep.cliente?.nombre || 'S/N'}</span><br>
                        <span class="text-xs font-bold text-blue-600">${rep.marca?.nombre || 'S/N'}</span>
                    </td>
                    <td class="p-4 text-xs text-gray-700 max-w-xs">${rep.descripcion || ''}</td>
                    <td class="p-4 text-center">
                        <button onclick="asignarmeAviso(${rep.id})" class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition hover:scale-105">
                            Coger Aviso
                        </button>
                    </td>
                </tr>`;
            }

            // Diseño estandarizacion de la paleta semantica. Usando una especie de diccionario interno con corchetes el codigo me resuelve el color al que le pertenece de forma instanciada.
            let color = { pendiente: 'bg-yellow-100 text-yellow-700', "en proceso": 'bg-blue-100 text-blue-700', terminado: 'bg-green-100 text-green-700' }[rep.estado];

            const repCodificada = encodeURIComponent(JSON.stringify(rep));

            let btnMapa = rep.cliente?.direccion ? `<button type="button" onclick="mostrarMapaDeTabla('${encodeURIComponent(rep.cliente.direccion)}')" class="text-green-600 p-2 hover:scale-125 inline-block">Mapa</button>` : '';
            let btnLlamar = rep.cliente?.telefono ? `<a href="tel:${rep.cliente.telefono}" class="text-blue-500 p-2 hover:scale-125 inline-block">Llamar</a>` : '';

            let btnBorrar = `<button onclick="borrarReparacion(${rep.id})" class="text-red-500 p-2 hover:scale-125 inline-block">Borrar</button>`;
            let btnEditar = `<button onclick="editarReparacion('${repCodificada}')" class="text-blue-500 p-2 transition hover:scale-125 inline-block" title="Editar">Editar</button>`;
            let btnEstadoRapido = '';

            // Construyo dinamicamente la botonera segun los privilegios que he detectado en un bloque previo de login y con el estado especifico de ese solo objeto individual para impedir que modifique objetos con estados irrevocables.
            if (usuarioActual && usuarioActual.rol === 'tecnico') {
                btnBorrar = ''; btnEditar = '';

                if (rep.estado === 'pendiente') {
                    btnEstadoRapido = `<button onclick="cambiarEstadoRapido(${rep.id}, 'en proceso')" class="text-yellow-500 p-2 transition hover:scale-125 inline-block" title="Empezar a trabajar">Empezar</button>`;
                } else if (rep.estado === 'en proceso') {
                    btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Marcar como Terminado y añadir Piezas">Finalizar</button>`;
                }
            } else {
                if (rep.estado !== 'terminado') {
                    btnEstadoRapido = `<button onclick="abrirModalFinalizar(${rep.id})" class="text-green-500 p-2 transition hover:scale-125 inline-block" title="Finalizar aviso directamente">Cerrar</button>`;
                }
            }

            if(usuarioActual?.rol === 'tecnico' && rep.estado === 'pendiente' && !rep.tecnico_id) return;

            // Inserto HTML anexo subordinado solo si ha completado satisfactoriamente los check eos pertinentes de conclusion, y en caso de que disponga de descripcion real, formateo un line break que la reemplace apropiadamente a salto logico de parrafo real del browser.
            let cajitaResolucion = '';
            if (rep.estado === 'terminado' && rep.resolucion_texto) {
                cajitaResolucion = `
                <div class="mt-2 bg-green-50 p-3 rounded border border-green-200">
                    <span class="block text-[10px] uppercase font-bold text-green-600 mb-1">Trabajo Realizado (${rep.tiempo_total || '-'}):</span>
                    <span class="text-sm text-gray-800">${rep.resolucion_texto}</span>
                </div>`;
            }

            tbodyPrincipal.innerHTML += `
            <tr class="hover:bg-blue-50/30 transition">
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">
                    <div class="font-bold text-blue-600 text-base">#${rep.id}</div>
                    <div class="text-gray-500 text-xs mt-1">Fecha: ${fechaFormateada}</div>
                </td>
                <td class="pt-4 pb-2 px-4 min-w-[200px] align-top">
                    <div class="font-medium text-gray-900">${rep.cliente?.nombre || 'S/N'}</div>
                    <div class="text-xs mt-1 font-bold ${rep.tecnico_id ? 'text-purple-600' : 'text-gray-400'}">Tec: ${rep.tecnico?.nombre || 'Sin asignar'}</div>
                </td>
                <td class="pt-4 pb-2 px-4 whitespace-nowrap align-top">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${color}">${rep.estado}</span>
                </td>
                <td class="pt-4 pb-2 px-4 text-center whitespace-nowrap align-top">
                    ${btnEstadoRapido}
                    ${btnLlamar}
                    ${btnMapa}
                    ${btnEditar}
                    ${btnBorrar}
                </td>
            </tr>
            <tr class="border-b hover:bg-blue-50/30 transition">
                <td colspan="4" class="px-4 pb-4 pt-1">
                    <div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border w-full">
                        <span class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Avería:</span>
                        ${rep.descripcion ? rep.descripcion.replace(/\n/g, '<br>') : '<span class="italic text-gray-400">Sin descripción...</span>'}
                        ${cajitaResolucion}
                    </div>
                </td>
            </tr>`;
        });

        // Vuelco a sus elementos DOM los totalizados tras el bucle global.
        document.getElementById('stat-pendientes').innerText = pendientes;
        document.getElementById('stat-proceso').innerText = proceso;
        document.getElementById('stat-terminado').innerText = terminado;

        // Establezco de forma delegada a todo el ecosistema de la aplicacion que refresque este mismo bucle con un retraso en milisegundos ininterrumpido cada diez segundos asincronos si estoy viendo alguna lista relevante.
        if (!window.intervaloRealTime) {
            window.intervaloRealTime = setInterval(() => {
                const pantallaReparaciones = document.getElementById('pantalla_reparaciones');
                const pantallaLibres = document.getElementById('pantalla_libres');
                if ((pantallaReparaciones && !pantallaReparaciones.classList.contains('hidden')) ||
                    (pantallaLibres && !pantallaLibres.classList.contains('hidden'))) {
                    cargarReparaciones();
                }
            }, 10000);
        }
        filtrarHistorialTecnicos();
    } catch (error) { console.error(error); }
}

async function guardarReparacion() {
    // Metodo principal de creacion de un ticket de trabajo en el formulario persistente e izquierdo de los administradores.
    const id = document.getElementById('rep-id').value;
    const tecnicoSeleccionado = document.getElementById('tecnico_id').value;

    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        tecnico_id: tecnicoSeleccionado === "" ? null : tecnicoSeleccionado,
        marca_id: document.getElementById('marca_id').value,
        descripcion: document.getElementById('descripcion').value,
        fecha_entrada: document.getElementById('fecha_entrada').value,
        estado: document.getElementById('estado').value
    };

    if (!datos.cliente_id || !datos.marca_id) return alert('Faltan datos obligatorios.');

    // Selecciono el canal del verbo de la peticion HTTP a ejecutar mirando el campo input oculto. Si tiene string asume ser actualizacion y viceversa.
    const url = id ? `/api/reparaciones/${id}` : '/api/reparaciones';
    try {
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            // Elimino los valores del formulario al exito, y despues recorro por seguridad logica de interface el rol para asegurarme de retraer paneles en caso de accesos cruzados extraños y reordenar su anchura a columnas unificadas en la rejilla.
            limpiarFormulario();
            if (usuarioActual && usuarioActual.rol === 'tecnico') {
                document.getElementById('caja-formulario-reparacion').classList.add('hidden');
                document.getElementById('caja-tabla-reparaciones').classList.remove('lg:col-span-2');
                document.getElementById('caja-tabla-reparaciones').classList.add('col-span-1', 'lg:col-span-3');
            }
            cargarReparaciones();
        }
    } catch (error) { console.error(error); }
}

function editarReparacion(repCodificada) {
    const rep = JSON.parse(decodeURIComponent(repCodificada));

    if (usuarioActual && usuarioActual.rol === 'tecnico') {
        const cajaForm = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');
        if (cajaForm && cajaTabla) {
            cajaForm.classList.remove('hidden');
            cajaTabla.classList.remove('col-span-1', 'lg:col-span-3');
            cajaTabla.classList.add('lg:col-span-2');
        }
    }

    // Tras el decoding procedo a volcar sus datos recuperados al UI para interactuar con los values. El ID queda almacenado sin visualizacion para el switch del controlador posterior.
    document.getElementById('form-title').innerText = 'Editar Reparación #' + rep.id;
    document.getElementById('rep-id').value = rep.id;
    if (rep.cliente_id && rep.cliente) seleccionarClienteReparacion(rep.cliente);

    document.getElementById('tecnico_id').value = rep.tecnico_id || '';
    document.getElementById('marca_id').value = rep.marca_id || '';
    document.getElementById('descripcion').value = rep.descripcion || '';
    document.getElementById('estado').value = rep.estado;
    if(rep.fecha_entrada) document.getElementById('fecha_entrada').value = rep.fecha_entrada;

    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
}

async function borrarReparacion(id) {
    if (!confirm('¿Seguro que deseas borrar este aviso? No hay marcha atrás.')) return;
    try {
        const res = await fetch(`/api/reparaciones/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) cargarReparaciones();
    } catch (error) { console.error(error); }
}

function limpiarFormulario() {
    // Un simple reseteo a valor basico y ocultacion estandar.
    document.getElementById('form-title').innerText = 'Nueva Reparación';
    document.getElementById('rep-id').value = '';
    document.getElementById('cliente_id').value = '';
    document.getElementById('cliente_search').value = '';
    document.getElementById('cliente_info').classList.add('hidden');
    document.getElementById('mapa_container').classList.add('hidden');
    if (!usuarioActual || usuarioActual.rol !== 'tecnico') document.getElementById('tecnico_id').value = '';
    document.getElementById('marca_id').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('estado').value = 'pendiente';
    setFechaHoy();
}

// ==========================================================================
// ACCESOS RAPIDOS A TAREAS DE CRM (Crear cliente on-the-fly)
// ==========================================================================

function abrirModalCliente() {
    // Utilidad extra de aceleracion, usando de forma especular lo tecleado que no haya logrado concordancia como nombre principal.
    document.getElementById('nuevo_cliente_nombre').value = document.getElementById('cliente_search').value;
    document.getElementById('nuevo_cliente_email').value = '';
    document.getElementById('nuevo_cliente_telefono').value = '';
    document.getElementById('nuevo_cliente_direccion').value = '';
    document.getElementById('modal_cliente').classList.remove('hidden');
}

function cerrarModalCliente() { document.getElementById('modal_cliente').classList.add('hidden'); }

async function guardarNuevoCliente() {
    const nombre = document.getElementById('nuevo_cliente_nombre').value;
    const telefono = document.getElementById('nuevo_cliente_telefono').value;
    const direccion = document.getElementById('nuevo_cliente_direccion').value;
    const inputEmail = document.getElementById('nuevo_cliente_email');

    // Dado el requerimiento en back-end a un email especifico formo una falsificacion logica con sufijo aleatorio mediante instanciacion de la fecha para mantener unicosidad y prevenir interrupcion de servicio.
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
            // Procedimiento secundario y util tras grabar a base de datos. Lo selecciono para iniciar todo su contexto general subyacente.
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
// VISTAS DE DETALLES ADICIONALES E HISTORIALES ESPECIFICOS
// ==========================================================================

function verDetalleReparacion(jsonRep) {
    const rep = JSON.parse(decodeURIComponent(jsonRep));

    // Abordando las rarezas del framework de back en el volcado segun como empaquete el json del campo subyacente fuerzo mi parser segun typo.
    const arrayPiezas = typeof rep.piezas_utilizadas === 'string'
        ? JSON.parse(rep.piezas_utilizadas)
        : (rep.piezas_utilizadas || []);

    // Construccion del listado de inventariado asociado al ticket para presentar su desglose en crudo via native popup alert con saltos estandar a traves del array formateado.
    let htmlPiezas = arrayPiezas.map(p => `- ${p.cantidad}x ${p.descripcion} (Ref: ${p.referencia || 'N/A'})`).join('\n') || 'Ninguna pieza utilizada.';

    alert(`REPARACIÓN #${rep.id} - ${rep.estado.toUpperCase()}
-------------------------------------------------
Técnico: ${rep.tecnico?.nombre || 'Sin asignar'}
Cliente: ${rep.cliente?.nombre || 'S/N'}
Fecha de Cierre: ${rep.fecha_cierre || 'No cerrado'}
Horario: ${rep.hora_inicio || '--:--'} a ${rep.hora_fin || '--:--'}
Tiempo Total: ${rep.tiempo_total || 'N/A'}

AVERÍA:
${rep.descripcion || 'Sin descripción'}

TRABAJO REALIZADO:
${rep.resolucion_texto || 'Pendiente de resolución'}

PIEZAS:
${htmlPiezas}
    `);
}

// ==========================================================================
// ARRANQUE DEL MOTOR (Iniciador de la app)
// ==========================================================================

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

async function iniciarApp() {
    await cargarPerfilUsuario();
    cargarClientes();
    cargarTecnicos();
    cargarMarcas();
    cargarReparaciones();
}

iniciarApp();
