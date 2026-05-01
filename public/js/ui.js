// ==========================================================================
// INTERFAZ Y NAVEGACION
// ==========================================================================
import { AppState } from './api.js';

export function adaptarInterfazAlRol() {
    // Aquí reviso si la persona que ha entrado tiene el rol de técnico. Si es así, saco la tijera y empiezo a esconderle cosas de la pantalla.
    if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {

        // Primero cojo todos los botones del menú lateral izquierdo que son de gestión administrativa y de inventario.
        const btnClientes = document.getElementById('btn-menu-clientes');
        const btnTecnicos = document.getElementById('btn-menu-tecnicos');
        const btnGestionClientes = document.getElementById('btn-menu-gestion-clientes');
        const btnMaquinas = document.getElementById('btn-menu-maquinas');
        const btnInventario = document.getElementById('btn-menu-inventario');

        // Los oculto todos de golpe. El técnico no necesita ver bases de datos ni el inventario general.
        if (btnClientes) btnClientes.classList.add('hidden');
        if (btnTecnicos) btnTecnicos.classList.add('hidden');
        if (btnGestionClientes) btnGestionClientes.classList.add('hidden');
        if (btnMaquinas) btnMaquinas.classList.add('hidden');
        if (btnInventario) btnInventario.classList.add('hidden');

        // Luego le escondo todo el bloque de la izquierda que sirve para crear nuevas reparaciones, porque los técnicos solo gestionan las que ya están creadas.
        const cajaFormulario = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');

        if (cajaFormulario && cajaTabla) {
            cajaFormulario.classList.add('hidden');

            // Como acabo de quitar el bloque de la izquierda, le digo a su tabla de avisos que se estire para ocupar toda la pantalla y no dejar huecos feos.
            cajaTabla.classList.remove('lg:col-span-2');
            cajaTabla.classList.add('col-span-1', 'lg:col-span-3');
        }

        // Por seguridad, si el formulario llegase a verse por algún bug, desactivo las casillas de búsqueda para que no pueda fisgonear en los clientes.
        document.getElementById('cliente_search').disabled = true;
        document.getElementById('tecnico_id').disabled = true;

        // Por último, hago desaparecer los botones de crear clientes sobre la marcha y el de limpiar el formulario.
        const btnNuevoCliente = document.querySelector('button[onclick="abrirModalCliente()"]');
        if (btnNuevoCliente) btnNuevoCliente.classList.add('hidden');

        const btnLimpiar = document.querySelector('button[onclick="limpiarFormulario()"]');
        if (btnLimpiar) btnLimpiar.classList.add('hidden');
    }
}

export function mostrarPantalla(idPantalla, botonClicado) {
    // Con esta función controlo el cambio de pantallas sin recargar la web (Single Page Application).

    // 1. Primero agarro absolutamente todas las pantallas de la aplicación y las escondo.
    // Además, las preparo para la animación haciéndolas transparentes y bajándolas un poco hacia abajo.
    document.querySelectorAll('.pantalla-seccion').forEach(div => {
        if(div) {
            div.classList.add('hidden');
            div.style.opacity = '0';
            div.style.transform = 'translateY(15px)';
        }
    });

    // 2. Busco la pantalla exacta que el usuario quiere ver usando el ID que me han pasado.
    const pantallaDestino = document.getElementById(idPantalla);
    if (pantallaDestino) {

        // Le quito la clase que la mantenía oculta del código HTML.
        pantallaDestino.classList.remove('hidden');

        // Hago una pequeña trampa: le doy al navegador una fracción de segundo (10 milisegundos) para que se dé cuenta de que el bloque ya existe en pantalla. Entonces le aplico la animación suave para que suba y se vuelva opaca. Da un efecto de carga muy profesional.
        setTimeout(() => {
            pantallaDestino.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            pantallaDestino.style.opacity = '1';
            pantallaDestino.style.transform = 'translateY(0)';
        }, 10);

    } else {
        // Me dejo un aviso en la consola de desarrollador por si alguna vez intento abrir una pantalla que no existe o he escrito mal el nombre.
        console.warn(`Ojo: No se encontró la pantalla con ID: ${idPantalla}`);
    }

    // 3. Me encargo del diseño del menú lateral. Agarro todos los botones y les quito el fondo azul brillante y la rayita lateral.
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'border-l-4');
        btn.classList.add('hover:bg-slate-800');
    });

    // 4. Si me han pasado por parámetro cuál es el botón que acabo de clicar, a ese en concreto sí le pongo el fondo azul para saber siempre en qué sección estoy navegando.
    if (botonClicado) {
        botonClicado.classList.remove('hover:bg-slate-800');
        botonClicado.classList.add('bg-blue-600');
    }
}

export function setFechaHoy() {
    // Me he creado este pequeño atajo para rellenar la fecha automáticamente.
    // Extraigo la fecha actual del sistema, la corto por la letra T para quedarme solo con la parte del día y descarto la hora, y la inyecto en la casilla del formulario.
    const hoy = new Date().toISOString().split('T')[0];
    const inputFecha = document.getElementById('fecha_entrada');
    if(inputFecha) inputFecha.value = hoy;
}

export function mostrarMapaDeTabla(dir) {
    // Con esta función controlo el bloque del mapa. Recibo una dirección en texto plano.
    const map = document.getElementById('mapa_container');

    // Convierto la dirección a un formato seguro para internet (encodeURIComponent) y se la pego a la URL interna del iFrame de Google Maps para que la incruste.
    document.getElementById('google_map_iframe').src = `https://maps.google.com/maps?q=${encodeURIComponent(dir)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

    // También actualizo el botón externo para que, si el usuario hace clic, le lleve directamente a Google Maps en otra pestaña o le abra la aplicación en el móvil.
    document.getElementById('link_como_llegar').href = `https://maps.google.com/maps?q=${encodeURIComponent(dir)}`;

    // Hago visible el bloque del mapa.
    if (map) map.classList.remove('hidden');
}

// Añado un vigilante a toda la pantalla. Si detecto un clic, compruebo si ha sido fuera de mis listas desplegables.
document.addEventListener('click', function(e) {

    // Reviso uno por uno mis cuatro buscadores predictivos (clientes, historial, máquinas y piezas).
    ['cliente_dropdown', 'historial_cliente_dropdown', 'maq_cliente_dropdown', 'dropdown_piezas_modal'].forEach(id => {
        const el = document.getElementById(id);

        // Si la lista desplegable existe, y el lugar donde he hecho clic NO es la propia lista, y TAMPOCO es la caja de texto donde estoy escribiendo... entonces deduzco que el usuario quiere cancelar la búsqueda y oculto la lista para no manchar la interfaz.
        if(el && !el.contains(e.target) && e.target.id !== id.replace('_dropdown', '_search') && e.target.id !== 'add_pieza_ref') {
            el.classList.add('hidden');
        }
    });
});

// ==========================================================================
// FABRICA DE DISEÑO DE ESTADOS (BADGES)
// ==========================================================================
export function obtenerBadgeEstado(estado) {
    // He centralizado los colores de los estados aquí para no tener que andar repitiendo clases de Tailwind por todo el código.
    // Primero paso la palabra a minúsculas para evitar problemas si a veces viene escrita como "Pendiente" y otras como "pendiente".
    const est = (estado || '').toLowerCase();

    // Dependiendo de la palabra exacta, devuelvo un fragmento de HTML con una pastilla redonda y los colores exactos que le corresponden a ese estado.
    if (est === 'pendiente') {
        return `<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">${est}</span>`;
    } else if (est === 'en proceso') {
        return `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">${est}</span>`;
    } else if (est === 'terminado') {
        return `<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">${est}</span>`;
    } else {
        // Si por algún casual llega un estado que no conozco o en blanco, devuelvo una etiqueta gris neutra por defecto.
        return `<span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">${est || 'N/A'}</span>`;
    }
}
