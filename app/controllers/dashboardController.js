const db = require('../config/database');

const dashboardController = {
  async getDashboard(req, res) {
    const user = req.session.user;
    try {
      const stats = {};
      let query = '';

      if (user.rol === 'administrador') {
        // 1. Total Equipos
        let [eq] = await db.query("SELECT COUNT(*) as count FROM equipo WHERE estado != 'baja'");
        stats.totalEquipos = eq[0].count;

        // 2. Incidencias Pendientes
        let [inc] = await db.query("SELECT COUNT(*) as count FROM incidencia WHERE estado IN ('pendiente', 'en_proceso')");
        stats.incidenciasPendientes = inc[0].count;

        // 3. Técnicos Activos
        let [tec] = await db.query("SELECT COUNT(*) as count FROM tecnico WHERE estado = true");
        stats.tecnicosActivos = tec[0].count;

        // 4. Solicitudes Pendientes
        let [sol] = await db.query("SELECT COUNT(*) as count FROM solicitud WHERE estado = 'pendiente'");
        stats.solicitudesPendientes = sol[0].count;

        // Recent activity
        let [recientes] = await db.query(`
          SELECT i.id_incidencia, i.descripcion, i.prioridad, i.estado, i.fecha_creacion, u.nombres, u.apellidos
          FROM incidencia i
          JOIN usuario u ON i.id_usuario_reporta = u.id_usuario
          ORDER BY i.fecha_creacion DESC LIMIT 5
        `);
        stats.recientes = recientes;

      } else if (user.rol === 'tecnico' || user.rol === 'practicante') {
        // 1. Incidencias asignadas a mí
        let [miInc] = await db.query("SELECT COUNT(*) as count FROM incidencia WHERE id_tecnico_recibe = ? AND estado IN ('pendiente', 'en_proceso')", [user.id]);
        stats.misAsignadas = miInc[0].count;

        // 2. Incidencias pendientes generales
        let [inc] = await db.query("SELECT COUNT(*) as count FROM incidencia WHERE estado IN ('pendiente', 'en_proceso')");
        stats.incidenciasPendientes = inc[0].count;

        // 3. Mis incidencias resueltas
        let [miRes] = await db.query("SELECT COUNT(*) as count FROM incidencia WHERE id_tecnico_recibe = ? AND estado IN ('resuelta', 'cerrada')", [user.id]);
        stats.misResueltas = miRes[0].count;

        // List of my tickets
        let [tickets] = await db.query(`
          SELECT i.id_incidencia, i.descripcion, i.prioridad, i.estado, i.fecha_creacion, e.codigo_inventario
          FROM incidencia i
          JOIN equipo e ON i.id_equipo = e.id_equipo
          WHERE i.id_tecnico_recibe = ? AND i.estado IN ('pendiente', 'en_proceso')
          ORDER BY i.prioridad DESC, i.fecha_creacion ASC
        `, [user.id]);
        stats.tickets = tickets;

      } else if (user.rol === 'jefe') {
        // 1. Mis incidencias
        let [miInc] = await db.query("SELECT COUNT(*) as count FROM incidencia WHERE id_usuario_reporta = ?", [user.id]);
        stats.misIncidencias = miInc[0].count;

        // 2. Mis solicitudes
        let [miSol] = await db.query("SELECT COUNT(*) as count FROM solicitud WHERE id_usuario_solicita = ?", [user.id]);
        stats.misSolicitudes = miSol[0].count;

        // List of my incidents
        let [incidencias] = await db.query(`
          SELECT i.*, e.codigo_inventario 
          FROM incidencia i 
          JOIN equipo e ON i.id_equipo = e.id_equipo
          WHERE i.id_usuario_reporta = ? 
          ORDER BY i.fecha_creacion DESC LIMIT 5
        `, [user.id]);
        stats.incidencias = incidencias;

        // List of my requests
        let [solicitudes] = await db.query(`
          SELECT * FROM solicitud 
          WHERE id_usuario_solicita = ? 
          ORDER BY fecha_solicitud DESC LIMIT 5
        `, [user.id]);
        stats.solicitudes = solicitudes;

      } else if (user.rol === 'empleado') {
        // 1. Mis incidencias
        let [miInc] = await db.query("SELECT COUNT(*) as count FROM incidencia WHERE id_usuario_reporta = ?", [user.id]);
        stats.misIncidencias = miInc[0].count;

        // List of my incidents
        let [incidencias] = await db.query(`
          SELECT i.*, e.codigo_inventario 
          FROM incidencia i 
          JOIN equipo e ON i.id_equipo = e.id_equipo
          WHERE i.id_usuario_reporta = ? 
          ORDER BY i.fecha_creacion DESC LIMIT 5
        `, [user.id]);
        stats.incidencias = incidencias;
      }

      res.render('dashboard/index', { stats });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el dashboard', user });
    }
  }
};

module.exports = dashboardController;
