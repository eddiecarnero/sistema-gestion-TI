const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pool de conexión a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'soportefisi',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// =============================================================================
// RUTAS DE LA API
// =============================================================================

// 1. Obtener listas de personas por rol (Para facilitar las pruebas de Login simulado)
app.get('/api/roles/usuarios', async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id_usuario, nombres, apellidos, cargo FROM usuario WHERE estado = true'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al conectar con la Base de Datos.' });
    }
});

app.get('/api/roles/tecnicos', async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id_tecnico, nombres, apellidos, rango FROM tecnico WHERE estado = true'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al conectar con la Base de Datos.' });
    }
});

// 2. Obtener lista de los equipos del área del usuario (Para el formulario de incidencias)
app.get('/api/equipos/usuario/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await promisePool.query(
            'CALL sp_revisar_equipos_por_area_usuario(?)',
            [id_usuario]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener equipos del área del usuario.' });
    }
});

// 3. Registrar Incidencia (Llama al SP: sp_registrar_incidencia_usuario)
app.post('/api/empleado/incidencia', async (req, res) => {
    const { id_usuario, id_equipo, prioridad, descripcion } = req.body;
    
    if (!id_usuario || !id_equipo || !prioridad || !descripcion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // En nuestro SP actualizado: sp_registrar_incidencia_usuario(id_usuario, id_equipo, prioridad, descripcion)
        await promisePool.query(
            'CALL sp_registrar_incidencia_usuario(?, ?, ?, ?)', 
            [id_usuario, id_equipo, prioridad, descripcion]
        );
        res.json({ success: true, message: 'Incidencia registrada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.sqlMessage || 'Error al ejecutar sp_registrar_incidencia_usuario.' });
    }
});

// 4. Listar incidencias reportadas por un usuario (Usando la vista vw_revision_incidencias_is_usuario)
app.get('/api/empleado/incidencias/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await promisePool.query(
            'SELECT id_incidencia, id_equipo, descripcion, estado FROM vw_revision_incidencias_is_usuario WHERE id_usuario_reporta = ?',
            [id_usuario]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar vw_revision_incidencias_is_usuario.' });
    }
});

// 5. Ver estado de incidencia (Llama al SP: sp_revisar_incidencia_usuario)
app.get('/api/empleado/incidencias/detalle/:id_incidencia', async (req, res) => {
    const { id_incidencia } = req.params;
    try {
        const [rows] = await promisePool.query(
            'CALL sp_revisar_incidencia_usuario(?)',
            [id_incidencia]
        );
        // Los SP en mysql2 devuelven una estructura anidada: [ [resultados], metadata ]
        res.json(rows[0][0] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al ejecutar sp_revisar_incidencia_usuario.' });
    }
});

// 6. Ver seguimiento de incidencia (Llama al SP: sp_ver_seguimiento_incidencia)
app.get('/api/empleado/incidencias/seguimiento/:id_incidencia', async (req, res) => {
    const { id_incidencia } = req.params;
    try {
        const [rows] = await promisePool.query(
            'CALL sp_ver_seguimiento_incidencia(?)',
            [id_incidencia]
        );
        res.json(rows[0]); // Devuelve el historial de seguimientos (puede haber varios registros)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al ejecutar sp_ver_seguimiento_incidencia.' });
    }
});

// =============================================================================
// RUTAS PARA JEFES (SOLICITUDES)
// =============================================================================

// 7. Crear Solicitud (Llama al SP: sp_crear_solicitud_jefe)
app.post('/api/jefe/solicitud', async (req, res) => {
    const { id_usuario, tipo, descripcion } = req.body;

    if (!id_usuario || !tipo || !descripcion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        await promisePool.query(
            'CALL sp_crear_solicitud_jefe(?, ?, ?)',
            [id_usuario, tipo, descripcion]
        );
        res.json({ success: true, message: 'Solicitud creada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.sqlMessage || 'Error al ejecutar sp_crear_solicitud_jefe.' });
    }
});

// 8. Listar solicitudes de un jefe
app.get('/api/jefe/solicitudes/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await promisePool.query(
            'SELECT id_solicitud, tipo, descripcion, estado, fecha_solicitud FROM solicitud WHERE id_usuario_solicita = ?',
            [id_usuario]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar solicitudes del jefe.' });
    }
});

// 9. Ver estado de solicitud (Llama al SP: sp_ver_estado_solicitud)
app.get('/api/jefe/solicitudes/detalle/:id_solicitud', async (req, res) => {
    const { id_solicitud } = req.params;
    try {
        const [rows] = await promisePool.query(
            'CALL sp_ver_estado_solicitud(?)',
            [id_solicitud]
        );
        res.json(rows[0][0] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al ejecutar sp_ver_estado_solicitud.' });
    }
});

// Ruta comodín para redirigir cualquier otra petición a index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de Soporte TI corriendo en http://localhost:${PORT}`);
});
