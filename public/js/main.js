// ==========================================================================
// INICIO Y CONECTO TODO
// ==========================================================================

// Aquí me traigo todas las herramientas y funciones que he ido fabricando en mis otros archivos JS para poder manejarlas y conectarlas desde este archivo central.
import { cargarPerfilUsuario, cargarClientes, cargarTecnicos, cargarMaquinas, cargarPiezas } from './api.js';
import { adaptarInterfazAlRol, mostrarPantalla, mostrarMapaDeTabla } from './ui.js';

import {
    filtrarClientes,
    seleccionarClienteReparacion,
    abrirModalCliente,
    cerrarModalCliente,
    guardarNuevoCliente,
    dibujarTablaClientes,
    filtrarTablaGestionClientes,
    guardarClienteGestion,
    editarClienteGestion,
    borrarClienteGestion,
    limpiarFormClienteGestion
} from './clientes.js';

import {
    cargarHistorialCliente,
    aplicarFiltroFechasCliente,
    filtrarHistorialTecnicos,
    asignarmeAviso,
    cambiarEstadoRapido,
    abrirModalFinalizar,
    cerrarModalFinalizar,
    agregarPiezaLista,
    eliminarPiezaLista,
    guardarFinalizacion,
    cargarReparaciones,
    guardarReparacion,
    editarReparacion,
    borrarReparacion,
    limpiarFormulario,
    verDetalleReparacion,
    buscarPiezaModal,
    generarPDFReparacion,
    filtrarPorEstado,          // Con esto filtro la tabla pulsando en las tarjetas
    cambiarPaginaReparaciones  // Con esto controlo los botones de pagina siguiente/anterior
} from './reparaciones.js';

import { dibujarTablaMaquinas, guardarMaquina, editarMaquina, borrarMaquina, limpiarFormMaquina, seleccionarClienteMaquina } from './maquinas.js';

import { dibujarTablaInventario, filtrarTablaInventario, guardarPiezaInventario, editarPieza, borrarPieza, limpiarFormPieza } from './inventario.js';

// ==========================================================================
// ORGANIZACION PARA EL HTML
// ==========================================================================

// Como estoy trabajando con un sistema moderno de modulos de JavaScript, mis botones del HTML ("onclick") no pueden ver estas funciones porque estan aisladas.
// Para solucionarlo, en este bloque engancho manualmente cada una de mis funciones al objeto global "window". De esta forma, el navegador sabe donde ir a buscarlas cuando hago clic en algo.

window.mostrarPantalla = mostrarPantalla;
window.filtrarClientes = filtrarClientes;
window.seleccionarClienteReparacion = seleccionarClienteReparacion;
window.abrirModalCliente = abrirModalCliente;
window.cerrarModalCliente = cerrarModalCliente;
window.guardarNuevoCliente = guardarNuevoCliente;

// Enlaces para la gestion de clientes
window.dibujarTablaClientes = dibujarTablaClientes;
window.filtrarTablaGestionClientes = filtrarTablaGestionClientes;
window.guardarClienteGestion = guardarClienteGestion;
window.editarClienteGestion = editarClienteGestion;
window.borrarClienteGestion = borrarClienteGestion;
window.limpiarFormClienteGestion = limpiarFormClienteGestion;

// Enlaces para las reparaciones y avisos
window.cargarHistorialCliente = cargarHistorialCliente;
window.aplicarFiltroFechasCliente = aplicarFiltroFechasCliente;
window.filtrarHistorialTecnicos = filtrarHistorialTecnicos;
window.asignarmeAviso = asignarmeAviso;
window.cambiarEstadoRapido = cambiarEstadoRapido;
window.abrirModalFinalizar = abrirModalFinalizar;
window.cerrarModalFinalizar = cerrarModalFinalizar;
window.agregarPiezaLista = agregarPiezaLista;
window.eliminarPiezaLista = eliminarPiezaLista;
window.guardarFinalizacion = guardarFinalizacion;
window.guardarReparacion = guardarReparacion;
window.editarReparacion = editarReparacion;
window.borrarReparacion = borrarReparacion;
window.limpiarFormulario = limpiarFormulario;
window.verDetalleReparacion = verDetalleReparacion;
window.mostrarMapaDeTabla = mostrarMapaDeTabla;
window.generarPDFReparacion = generarPDFReparacion;
window.buscarPiezaModal = buscarPiezaModal;

// Enlaces para la paginacion y filtros
window.filtrarPorEstado = filtrarPorEstado;
window.cambiarPaginaReparaciones = cambiarPaginaReparaciones;

// Enlaces para la gestion de maquinas
window.dibujarTablaMaquinas = dibujarTablaMaquinas;
window.guardarMaquina = guardarMaquina;
window.editarMaquina = editarMaquina;
window.borrarMaquina = borrarMaquina;
window.limpiarFormMaquina = limpiarFormMaquina;
window.seleccionarClienteMaquina = seleccionarClienteMaquina;

// Enlaces para el inventario de piezas
window.dibujarTablaInventario = dibujarTablaInventario;
window.filtrarTablaInventario = filtrarTablaInventario;
window.guardarPiezaInventario = guardarPiezaInventario;
window.editarPieza = editarPieza;
window.borrarPieza = borrarPieza;
window.limpiarFormPieza = limpiarFormPieza;

// Con esta funcion me encargo de cerrar la sesion del usuario. Simplemente destruyo el token de seguridad que guarde en el navegador local y le expulso a la pantalla de login.
window.logout = function() {
    localStorage.removeItem('token');
    window.location.href = '/';
};


// ==========================================================================
// ARRANQUE DEL SISTEMA
// ==========================================================================

// Esta es mi secuencia de encendido de la aplicacion. Obligo a que se ejecuten las cosas en un orden estricto esperando (con "await") a que acabe una tarea antes de empezar la siguiente.
async function iniciarApp() {
    // 1. Primero le pregunto al servidor quien soy para saber si tengo rol de Admin o de Tecnico.
    await cargarPerfilUsuario();

    // 2. Dependiendo del rol que tenga, oculto los menus y botones que no debo ver.
    adaptarInterfazAlRol();

    // 3. Me descargo de golpe todas las bases de datos a mi memoria local para que la app funcione super rapido y sin esperas.
    await cargarClientes();
    await cargarTecnicos();
    await cargarMaquinas();
    await cargarPiezas();
    await cargarReparaciones();
}

// Por ultimo, nada mas leer este archivo (es decir, en cuanto se carga la web), ejecuto la secuencia de arranque.
iniciarApp();
