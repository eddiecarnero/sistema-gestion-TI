// State management de la sesión simulada
let currentSession = {
    userId: null,
    userName: '',
    role: ''
};

// Elementos del DOM
const DOM = {
    viewRoleSelection: document.getElementById('view-role-selection'),
    viewLoginSimulation: document.getElementById('view-login-simulation'),
    viewEmpleadoDashboard: document.getElementById('view-empleado-dashboard'),
    userSessionInfo: document.getElementById('user-session-info'),
    sessionName: document.getElementById('session-name'),
    sessionBadge: document.getElementById('session-badge'),
    btnLogout: document.getElementById('btn-logout'),
    btnBackRoles: document.getElementById('btn-back-roles'),
    selectUserSimulation: document.getElementById('select-user-simulation'),
    btnConfirmLogin: document.getElementById('btn-confirm-login'),
    
    // Navegación Empleado / Jefe
    btnNavRegistrar: document.getElementById('btn-nav-registrar'),
    btnNavRevisar: document.getElementById('btn-nav-revisar'),
    btnNavCrearSolicitud: document.getElementById('btn-nav-crear-solicitud'),
    btnNavRevisarSolicitudes: document.getElementById('btn-nav-revisar-solicitudes'),
    
    panelRegistrarIncidencia: document.getElementById('panel-registrar-incidencia'),
    panelRevisarIncidencias: document.getElementById('panel-revisar-incidencias'),
    panelCrearSolicitud: document.getElementById('panel-crear-solicitud'),
    panelRevisarSolicitudes: document.getElementById('panel-revisar-solicitudes'),
    
    // Formularios
    formRegistrarIncidencia: document.getElementById('form-registrar-incidencia'),
    regIdEquipo: document.getElementById('reg-id-equipo'),
    regPrioridad: document.getElementById('reg-prioridad'),
    regDescripcion: document.getElementById('reg-descripcion'),
    
    formCrearSolicitud: document.getElementById('form-crear-solicitud'),
    solTipo: document.getElementById('sol-tipo'),
    solDescripcion: document.getElementById('sol-descripcion'),
    
    // Tablas y detalles
    tbodyIncidencias: document.getElementById('tbody-incidencias'),
    cardSeguimientoDetalle: document.getElementById('card-seguimiento-detalle'),
    btnCloseDetail: document.getElementById('btn-close-detail'),
    detailIdIncidencia: document.getElementById('detail-id-incidencia'),
    detailEquipo: document.getElementById('detail-equipo'),
    detailDescripcion: document.getElementById('detail-descripcion'),
    detailEstado: document.getElementById('detail-estado'),
    timelineSeguimiento: document.getElementById('timeline-seguimiento'),
    
    tbodySolicitudes: document.getElementById('tbody-solicitudes'),
    cardSolicitudDetalle: document.getElementById('card-solicitud-detalle'),
    btnCloseSolDetail: document.getElementById('btn-close-sol-detail'),
    solDetailId: document.getElementById('sol-detail-id'),
    solDetailTipo: document.getElementById('sol-detail-tipo'),
    solDetailEstado: document.getElementById('sol-detail-estado'),
    solDetailFecha: document.getElementById('sol-detail-fecha'),
    solDetailDescripcion: document.getElementById('sol-detail-descripcion'),
    solResponseContainer: document.getElementById('sol-response-container'),
    solDetailRespuestaFecha: document.getElementById('sol-detail-respuesta-fecha'),
    
    toastContainer: document.getElementById('toast-container')
};

// =============================================================================
// FUNCIONES AUXILIARES (TOASTS Y CARGAS DE API)
// =============================================================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Cargar equipos disponibles para el SELECT de incidencias (filtrado por su área)
async function loadEquipos() {
    try {
        const res = await fetch(`/api/equipos/usuario/${currentSession.userId}`);
        const equipos = await res.json();
        
        DOM.regIdEquipo.innerHTML = '<option value="" disabled selected>Selecciona el equipo...</option>';
        equipos.forEach(eq => {
            const opt = document.createElement('option');
            opt.value = eq.id_equipo;
            opt.textContent = `${eq.codigo_inventario} - ${eq.tipo.toUpperCase()} (${eq.marca || 'Genérico'}) [${eq.estado}]`;
            DOM.regIdEquipo.appendChild(opt);
        });
    } catch (err) {
        showToast('Error al cargar la lista de equipos.', 'danger');
    }
}

// Cargar incidencias del usuario y pintar la tabla
async function loadIncidencias() {
    try {
        const res = await fetch(`/api/empleado/incidencias/${currentSession.userId}`);
        const incidencias = await res.json();
        
        DOM.tbodyIncidencias.innerHTML = '';
        
        if (incidencias.length === 0) {
            DOM.tbodyIncidencias.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">No tienes incidencias registradas en el sistema.</td>
                </tr>
            `;
            return;
        }

        incidencias.forEach(inc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${inc.id_incidencia}</td>
                <td>EQU-${inc.id_equipo}</td>
                <td>${inc.descripcion}</td>
                <td><span class="badge badge-${inc.estado}">${inc.estado}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm btn-ver-seg" data-id="${inc.id_incidencia}" data-equipo="EQU-${inc.id_equipo}" data-desc="${inc.descripcion}" data-estado="${inc.estado}">
                        Ver Seguimiento
                    </button>
                </td>
            `;
            DOM.tbodyIncidencias.appendChild(row);
        });

        // Registrar eventos click en los botones "Ver Seguimiento"
        document.querySelectorAll('.btn-ver-seg').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                const id = target.getAttribute('data-id');
                const equipo = target.getAttribute('data-equipo');
                const desc = target.getAttribute('data-desc');
                const estado = target.getAttribute('data-estado');
                showIncidenciaSeguimiento(id, equipo, desc, estado);
            });
        });
    } catch (err) {
        showToast('Error al cargar tus incidencias.', 'danger');
    }
}

// Mostrar el detalle y seguimiento de la incidencia seleccionada
async function showIncidenciaSeguimiento(id, equipo, descripcion, estado) {
    DOM.detailIdIncidencia.textContent = id;
    DOM.detailEquipo.textContent = equipo;
    DOM.detailDescripcion.textContent = descripcion;
    DOM.detailEstado.textContent = estado;
    DOM.detailEstado.className = `badge badge-${estado}`;
    
    DOM.timelineSeguimiento.innerHTML = '<p class="empty-state">Buscando seguimiento...</p>';
    DOM.cardSeguimientoDetalle.classList.remove('hidden');
    DOM.cardSeguimientoDetalle.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch(`/api/empleado/incidencias/seguimiento/${id}`);
        const seguimientos = await res.json();
        
        DOM.timelineSeguimiento.innerHTML = '';

        if (seguimientos.length === 0) {
            DOM.timelineSeguimiento.innerHTML = `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-tech">Soporte Técnico</span>
                            <span>Ahora</span>
                        </div>
                        <div class="timeline-body">
                            <p>La incidencia ha sido registrada correctamente. Actualmente se encuentra en estado <strong>${estado}</strong> y está en la cola de revisión por parte de los técnicos.</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        seguimientos.forEach(seg => {
            const fechaStr = new Date(seg.fecha).toLocaleString('es-PE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-tech">Técnico: ${seg.tecnico_nombre || `Técnico ID: ${seg.id_tecnico}`}</span>
                        <span>${fechaStr}</span>
                    </div>
                    <div class="timeline-body">
                        <p><strong>Diagnóstico:</strong> ${seg.diagnostico || 'Sin diagnóstico aún.'}</p>
                        <p><strong>Trabajo Realizado:</strong> ${seg.trabajo_realizado || 'En evaluación.'}</p>
                    </div>
                    <div class="timeline-meta">
                        <span>Horas invertidas: ${seg.horas_invertidas}h</span>
                        ${seg.id_componente_cambiado ? `<span>Componente cambiado: ID ${seg.id_componente_cambiado}</span>` : ''}
                    </div>
                </div>
            `;
            DOM.timelineSeguimiento.appendChild(item);
        });
    } catch (err) {
        showToast('Error al consultar el historial de seguimiento.', 'danger');
    }
}

// Cargar solicitudes del jefe y pintar la tabla
async function loadSolicitudes() {
    DOM.tbodySolicitudes.innerHTML = '<tr><td colspan="6" class="loading">Cargando solicitudes...</td></tr>';
    DOM.cardSolicitudDetalle.classList.add('hidden');
    
    try {
        const res = await fetch(`/api/jefe/solicitudes/${currentSession.userId}`);
        const solicitudes = await res.json();
        
        DOM.tbodySolicitudes.innerHTML = '';
        
        if (solicitudes.length === 0) {
            DOM.tbodySolicitudes.innerHTML = '<tr><td colspan="6" class="empty-table">No tienes solicitudes registradas.</td></tr>';
            return;
        }
        
        solicitudes.forEach(sol => {
            const fechaStr = new Date(sol.fecha_solicitud).toLocaleString('es-PE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${sol.id_solicitud}</td>
                <td><span class="badge badge-tipo">${sol.tipo.toUpperCase()}</span></td>
                <td class="text-truncate" style="max-width: 250px;">${sol.descripcion}</td>
                <td><span class="badge badge-${sol.estado}">${sol.estado.toUpperCase()}</span></td>
                <td>${fechaStr}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-view-sol-detail" data-id="${sol.id_solicitud}">Ver Detalle</button>
                </td>
            `;
            DOM.tbodySolicitudes.appendChild(tr);
        });

        // Event listener para ver detalle
        document.querySelectorAll('.btn-view-sol-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showSolicitudDetalle(id);
            });
        });
    } catch (err) {
        showToast('Error al cargar la lista de solicitudes.', 'danger');
    }
}

// Mostrar el detalle completo de la solicitud llamando a sp_ver_estado_solicitud
async function showSolicitudDetalle(id) {
    DOM.solDetailId.textContent = id;
    DOM.solDetailTipo.textContent = 'Buscando...';
    DOM.solDetailEstado.textContent = 'Buscando...';
    DOM.solDetailFecha.textContent = 'Buscando...';
    DOM.solDetailDescripcion.textContent = 'Buscando...';
    DOM.solResponseContainer.classList.add('hidden');
    DOM.cardSolicitudDetalle.classList.remove('hidden');
    DOM.cardSolicitudDetalle.scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch(`/api/jefe/solicitudes/detalle/${id}`);
        const sol = await res.json();
        
        if (!sol) {
            showToast('No se encontró la solicitud.', 'danger');
            DOM.cardSolicitudDetalle.classList.add('hidden');
            return;
        }

        DOM.solDetailTipo.textContent = sol.tipo.toUpperCase();
        DOM.solDetailEstado.textContent = sol.estado.toUpperCase();
        DOM.solDetailEstado.className = `badge badge-${sol.estado}`;
        
        const fechaSolStr = new Date(sol.fecha_solicitud).toLocaleString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        DOM.solDetailFecha.textContent = fechaSolStr;
        DOM.solDetailDescripcion.textContent = sol.descripcion;

        if (sol.fecha_respuesta) {
            const fechaRespStr = new Date(sol.fecha_respuesta).toLocaleString('es-PE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            DOM.solDetailRespuestaFecha.textContent = fechaRespStr;
            DOM.solResponseContainer.classList.remove('hidden');
        }
    } catch (err) {
        showToast('Error al obtener los detalles de la solicitud.', 'danger');
    }
}

// =============================================================================
// NAVEGACIÓN Y EVENTOS DE PANTALLA
// =============================================================================

// Inicializar selección de rol
document.querySelectorAll('.role-card:not(.disabled)').forEach(card => {
    card.addEventListener('click', async () => {
        const role = card.getAttribute('data-role');
        currentSession.role = role;
        
        // Simular flujo de inicio de sesión trayendo los usuarios de la base de datos
        DOM.viewRoleSelection.classList.add('hidden');
        DOM.viewLoginSimulation.classList.remove('hidden');
        
        try {
            const res = await fetch('/api/roles/usuarios');
            const usuarios = await res.json();
            
            // Filtrar usuarios según el rol seleccionado (empleado o jefe)
            const filteredUsers = usuarios.filter(u => u.cargo === currentSession.role);
            
            DOM.selectUserSimulation.innerHTML = '';
            filteredUsers.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp.id_usuario;
                opt.textContent = `${emp.nombres} ${emp.apellidos} (ID: ${emp.id_usuario})`;
                DOM.selectUserSimulation.appendChild(opt);
            });
        } catch (err) {
            showToast('Error al simular la conexión de usuarios.', 'danger');
        }
    });
});

// Confirmar ingreso
DOM.btnConfirmLogin.addEventListener('click', () => {
    const selectedOpt = DOM.selectUserSimulation.options[DOM.selectUserSimulation.selectedIndex];
    if (!selectedOpt) {
        showToast('Por favor selecciona un usuario de prueba.', 'warning');
        return;
    }
    
    currentSession.userId = DOM.selectUserSimulation.value;
    currentSession.userName = selectedOpt.textContent.split(' (ID:')[0];
    
    // Mostrar sesión en el header
    DOM.sessionBadge.textContent = currentSession.role;
    DOM.sessionName.textContent = currentSession.userName;
    DOM.userSessionInfo.classList.remove('hidden');
    
    // Mostrar u ocultar pestañas según el rol
    if (currentSession.role === 'jefe') {
        DOM.btnNavCrearSolicitud.classList.remove('hidden');
        DOM.btnNavRevisarSolicitudes.classList.remove('hidden');
    } else {
        DOM.btnNavCrearSolicitud.classList.add('hidden');
        DOM.btnNavRevisarSolicitudes.classList.add('hidden');
    }

    // Cargar dashboard
    DOM.viewLoginSimulation.classList.add('hidden');
    DOM.viewEmpleadoDashboard.classList.remove('hidden');
    
    // Resetear a pestaña principal (Reportar Falla)
    DOM.btnNavRegistrar.click();
    
    // Carga inicial
    loadEquipos();
    loadIncidencias();
    
    showToast(`Sesión simulada como ${currentSession.userName}.`);
});

// Volver atrás en roles
DOM.btnBackRoles.addEventListener('click', () => {
    DOM.viewLoginSimulation.classList.add('hidden');
    DOM.viewRoleSelection.classList.remove('hidden');
});

// Cerrar sesión
DOM.btnLogout.addEventListener('click', () => {
    currentSession = { userId: null, userName: '', role: '' };
    DOM.userSessionInfo.classList.add('hidden');
    DOM.viewEmpleadoDashboard.classList.add('hidden');
    DOM.viewRoleSelection.classList.remove('hidden');
    DOM.cardSeguimientoDetalle.classList.add('hidden');
    DOM.cardSolicitudDetalle.classList.add('hidden');
    
    DOM.formRegistrarIncidencia.reset();
    DOM.formCrearSolicitud.reset();
    
    DOM.panelRegistrarIncidencia.classList.add('hidden');
    DOM.panelRevisarIncidencias.classList.add('hidden');
    DOM.panelCrearSolicitud.classList.add('hidden');
    DOM.panelRevisarSolicitudes.classList.add('hidden');
});

// Función para limpiar todas las pestañas activas y paneles
function deactivateAllTabs() {
    DOM.btnNavRegistrar.classList.remove('active');
    DOM.btnNavRevisar.classList.remove('active');
    DOM.btnNavCrearSolicitud.classList.remove('active');
    DOM.btnNavRevisarSolicitudes.classList.remove('active');
    
    DOM.panelRegistrarIncidencia.classList.add('hidden');
    DOM.panelRevisarIncidencias.classList.add('hidden');
    DOM.panelCrearSolicitud.classList.add('hidden');
    DOM.panelRevisarSolicitudes.classList.add('hidden');
    
    DOM.cardSeguimientoDetalle.classList.add('hidden');
    DOM.cardSolicitudDetalle.classList.add('hidden');
}

// Navegación interna (Tabs)
DOM.btnNavRegistrar.addEventListener('click', () => {
    deactivateAllTabs();
    DOM.btnNavRegistrar.classList.add('active');
    DOM.panelRegistrarIncidencia.classList.remove('hidden');
});

DOM.btnNavRevisar.addEventListener('click', () => {
    deactivateAllTabs();
    DOM.btnNavRevisar.classList.add('active');
    DOM.panelRevisarIncidencias.classList.remove('hidden');
    loadIncidencias();
});

DOM.btnNavCrearSolicitud.addEventListener('click', () => {
    deactivateAllTabs();
    DOM.btnNavCrearSolicitud.classList.add('active');
    DOM.panelCrearSolicitud.classList.remove('hidden');
});

DOM.btnNavRevisarSolicitudes.addEventListener('click', () => {
    deactivateAllTabs();
    DOM.btnNavRevisarSolicitudes.classList.add('active');
    DOM.panelRevisarSolicitudes.classList.remove('hidden');
    loadSolicitudes();
});

// Cerrar card de seguimiento detallado
DOM.btnCloseDetail.addEventListener('click', () => {
    DOM.cardSeguimientoDetalle.classList.add('hidden');
});

DOM.btnCloseSolDetail.addEventListener('click', () => {
    DOM.cardSolicitudDetalle.classList.add('hidden');
});

// =============================================================================
// SUBMIT DE FORMULARIO - REGISTRAR INCIDENCIA
// =============================================================================

DOM.formRegistrarIncidencia.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        id_usuario: currentSession.userId,
        id_equipo: DOM.regIdEquipo.value,
        prioridad: DOM.regPrioridad.value,
        descripcion: DOM.regDescripcion.value.trim()
    };
    
    if (!data.id_equipo) {
        showToast('Debes seleccionar un equipo.', 'warning');
        return;
    }
    
    try {
        const res = await fetch('/api/empleado/incidencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            showToast('¡Incidencia registrada correctamente en la Base de Datos!');
            DOM.formRegistrarIncidencia.reset();
            // Cargar y cambiar de pestaña automáticamente para ver la tabla
            loadIncidencias();
            DOM.btnNavRevisar.click();
        } else {
            showToast(`Error: ${result.error}`, 'danger');
        }
    } catch (err) {
        showToast('Error de red al intentar registrar la incidencia.', 'danger');
    }
});

// =============================================================================
// SUBMIT DE FORMULARIO - CREAR SOLICITUD (JEFE)
// =============================================================================
DOM.formCrearSolicitud.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        id_usuario: currentSession.userId,
        tipo: DOM.solTipo.value,
        descripcion: DOM.solDescripcion.value.trim()
    };
    
    try {
        const res = await fetch('/api/jefe/solicitud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            showToast('¡Solicitud registrada correctamente en la Base de Datos!');
            DOM.formCrearSolicitud.reset();
            // Cargar y cambiar de pestaña automáticamente para ver la tabla
            loadSolicitudes();
            DOM.btnNavRevisarSolicitudes.click();
        } else {
            showToast(`Error: ${result.error}`, 'danger');
        }
    } catch (err) {
        showToast('Error de red al intentar enviar la solicitud.', 'danger');
    }
});
