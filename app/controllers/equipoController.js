const Equipo = require('../models/equipoModel');
const Usuario = require('../models/usuarioModel');

const equipoController = {
  async index(req, res) {
    const { search, tipo, estado } = req.query;
    try {
      const equipos = await Equipo.getAll(req, { search, tipo, estado });
      res.render('equipos/index', { 
        equipos, 
        filters: { search: search || '', tipo: tipo || 'todos', estado: estado || 'todos' } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al listar los equipos' });
    }
  },

  async show(req, res) {
    const { id } = req.params;
    try {
      const equipo = await Equipo.getById(req, id);
      if (!equipo) {
        return res.status(404).render('error', { message: 'Equipo no encontrado' });
      }
      const asignaciones = await Equipo.getAsignaciones(req, id);
      const Componente = require('../models/componenteModel');
      const componentes = await Componente.getByEquipo(req, id);
      res.render('equipos/show', { equipo, asignaciones, componentes });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al mostrar el equipo' });
    }
  },

  getCreate(req, res) {
    res.render('equipos/create');
  },

  async postCreate(req, res) {
    const { codigo_inventario, tipo, tipo_origen, marca, estado, cantidad } = req.body;
    try {
      const cant = parseInt(cantidad) || 1;
      
      // Store main details in session temporarily
      req.session.tempEquipo = { 
        codigo_inventario, 
        tipo, 
        tipo_origen, 
        marca, 
        estado, 
        cantidad: cant 
      };

      if (tipo === 'laptop') {
        return res.redirect('/equipos/crear/detalle-laptop');
      } else if (tipo === 'pc_escritorio') {
        if (tipo_origen === 'comprado_ensamblado') {
          return res.redirect('/equipos/crear/detalle-pc-comprada');
        } else if (tipo_origen === 'ensamblado_facultad') {
          return res.redirect('/equipos/crear/detalle-pc-ensamblada');
        }
      }

      // For other types of equipment, create immediately
      for (let i = 1; i <= cant; i++) {
        const finalCode = cant === 1 ? codigo_inventario : `${codigo_inventario}-${i}`;
        await Equipo.create(req, { 
          codigo_inventario: finalCode, 
          tipo, 
          tipo_origen, 
          marca, 
          estado 
        });
      }
      delete req.session.tempEquipo;
      res.redirect('/equipos');
    } catch (err) {
      console.error(err);
      res.render('equipos/create', { error: 'Error al registrar el equipo. Asegúrese de que el código de inventario sea único.' });
    }
  },

  // GET and POST laptop step
  getCreateLaptopDetalleStep(req, res) {
    if (!req.session.tempEquipo) return res.redirect('/equipos/crear');
    res.render('equipos/crear_detalle_laptop', { tempEquipo: req.session.tempEquipo });
  },

  async postCreateLaptopDetalleStep(req, res) {
    if (!req.session.tempEquipo) return res.redirect('/equipos/crear');
    const tempEquipo = req.session.tempEquipo;
    try {
      const N = tempEquipo.cantidad;
      for (let i = 1; i <= N; i++) {
        const finalCode = N === 1 ? tempEquipo.codigo_inventario : `${tempEquipo.codigo_inventario}-${i}`;
        const finalSerie = N === 1 ? req.body.serie : `${req.body.serie}-${i}`;
        
        const id_equipo = await Equipo.create(req, {
          codigo_inventario: finalCode,
          tipo: tempEquipo.tipo,
          tipo_origen: tempEquipo.tipo_origen,
          marca: tempEquipo.marca,
          estado: tempEquipo.estado
        });

        await Equipo.createLaptopDetalle(req, id_equipo, {
          ...req.body,
          serie: finalSerie
        });
      }
      delete req.session.tempEquipo;
      res.redirect('/equipos');
    } catch (err) {
      console.error(err);
      res.render('equipos/crear_detalle_laptop', { 
        tempEquipo, 
        error: 'Error al registrar las laptops. Compruebe que el número de serie base no genere duplicados.' 
      });
    }
  },

  // GET and POST pc comprada step
  getCreatePCCompradaStep(req, res) {
    if (!req.session.tempEquipo) return res.redirect('/equipos/crear');
    res.render('equipos/crear_detalle_pc_comprada', { tempEquipo: req.session.tempEquipo });
  },

  async postCreatePCCompradaStep(req, res) {
    if (!req.session.tempEquipo) return res.redirect('/equipos/crear');
    const tempEquipo = req.session.tempEquipo;
    const Componente = require('../models/componenteModel');
    try {
      const N = tempEquipo.cantidad;
      for (let i = 1; i <= N; i++) {
        const finalCode = N === 1 ? tempEquipo.codigo_inventario : `${tempEquipo.codigo_inventario}-${i}`;
        const id_equipo = await Equipo.create(req, {
          codigo_inventario: finalCode,
          tipo: tempEquipo.tipo,
          tipo_origen: tempEquipo.tipo_origen,
          marca: tempEquipo.marca,
          estado: tempEquipo.estado
        });

        // Create components
        await Componente.create(req, id_equipo, 'procesador', {
          marca: req.body.proc_marca,
          modelo: req.body.proc_modelo,
          estado_componente: 'operativo'
        });
        await Componente.create(req, id_equipo, 'memoria_ram', {
          marca: req.body.ram_marca,
          capacidad_gb: req.body.ram_capacidad,
          tipo_ddr: req.body.ram_ddr,
          estado_componente: 'operativo'
        });
        await Componente.create(req, id_equipo, 'almacenamiento', {
          marca: req.body.alm_marca,
          modelo: req.body.alm_modelo,
          disco_tipo: req.body.alm_tipo,
          capacidad_gb: req.body.alm_capacidad,
          estado_componente: 'operativo'
        });
        await Componente.create(req, id_equipo, 'placa_madre', {
          marca: req.body.mb_marca,
          modelo: req.body.mb_modelo,
          socket: req.body.mb_socket,
          factor_forma: req.body.mb_factor,
          estado_componente: 'operativo'
        });
        await Componente.create(req, id_equipo, 'fuente_poder', {
          marca: req.body.fp_marca,
          modelo: req.body.fp_modelo,
          potencia_watts: req.body.fp_potencia,
          certificacion: req.body.fp_certificacion,
          estado_componente: 'operativo'
        });

        if (req.body.gpu_marca && req.body.gpu_modelo) {
          await Componente.create(req, id_equipo, 'tarjeta_grafica', {
            marca: req.body.gpu_marca,
            modelo: req.body.gpu_modelo,
            vram_gb: req.body.gpu_vram,
            estado_componente: 'operativo'
          });
        }
      }
      delete req.session.tempEquipo;
      res.redirect('/equipos');
    } catch (err) {
      console.error(err);
      res.render('equipos/crear_detalle_pc_comprada', { 
        tempEquipo, 
        error: 'Error al registrar las PCs y sus componentes. Verifique los datos.' 
      });
    }
  },

  // GET and POST pc ensamblada step
  async getCreatePCEnsambladaStep(req, res) {
    if (!req.session.tempEquipo) return res.redirect('/equipos/crear');
    const tempEquipo = req.session.tempEquipo;
    const Componente = require('../models/componenteModel');
    try {
      const disponibles = await Componente.getDisponiblesEnAlmacen(req);
      const N = tempEquipo.cantidad;
      const errors = [];
      if (disponibles.procesador.length < N) errors.push(`Procesadores (disponibles: ${disponibles.procesador.length}, requeridos: ${N})`);
      if (disponibles.memoria_ram.length < N) errors.push(`Memorias RAM (disponibles: ${disponibles.memoria_ram.length}, requeridos: ${N})`);
      if (disponibles.almacenamiento.length < N) errors.push(`Almacenamientos (disponibles: ${disponibles.almacenamiento.length}, requeridos: ${N})`);
      if (disponibles.placa_madre.length < N) errors.push(`Placas Madre (disponibles: ${disponibles.placa_madre.length}, requeridos: ${N})`);
      if (disponibles.fuente_poder.length < N) errors.push(`Fuentes de Poder (disponibles: ${disponibles.fuente_poder.length}, requeridos: ${N})`);

      res.render('equipos/crear_detalle_pc_ensamblada', { tempEquipo, disponibles, errors });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar los componentes disponibles' });
    }
  },

  async postCreatePCEnsambladaStep(req, res) {
    if (!req.session.tempEquipo) return res.redirect('/equipos/crear');
    const tempEquipo = req.session.tempEquipo;
    const Componente = require('../models/componenteModel');
    const pool = require('../config/database').pool;
    const { id_proc, id_ram, id_alm, id_mb, id_fp, id_gpu } = req.body;
    try {
      const N = tempEquipo.cantidad;
      
      // PC 1
      const finalCode_1 = N === 1 ? tempEquipo.codigo_inventario : `${tempEquipo.codigo_inventario}-1`;
      const id_equipo_1 = await Equipo.create(req, {
        codigo_inventario: finalCode_1,
        tipo: tempEquipo.tipo,
        tipo_origen: tempEquipo.tipo_origen,
        marca: tempEquipo.marca,
        estado: tempEquipo.estado
      });

      // Move selected warehouse components to PC 1
      await pool.query(`UPDATE componente SET id_equipo = ?, estado_componente = 'operativo' WHERE id_componente IN (?, ?, ?, ?, ?)`, [id_equipo_1, id_proc, id_ram, id_alm, id_mb, id_fp]);
      if (id_gpu) {
        await pool.query(`UPDATE componente SET id_equipo = ?, estado_componente = 'operativo' WHERE id_componente = ?`, [id_equipo_1, id_gpu]);
      }

      // PCs 2 to N: Duplicate the equipment and components
      for (let i = 2; i <= N; i++) {
        const finalCode_i = `${tempEquipo.codigo_inventario}-${i}`;
        const id_equipo_i = await Equipo.create(req, {
          codigo_inventario: finalCode_i,
          tipo: tempEquipo.tipo,
          tipo_origen: tempEquipo.tipo_origen,
          marca: tempEquipo.marca,
          estado: tempEquipo.estado
        });

        // Duplicate components
        await Componente.duplicarComponente(req, id_proc, id_equipo_i);
        await Componente.duplicarComponente(req, id_ram, id_equipo_i);
        await Componente.duplicarComponente(req, id_alm, id_equipo_i);
        await Componente.duplicarComponente(req, id_mb, id_equipo_i);
        await Componente.duplicarComponente(req, id_fp, id_equipo_i);
        if (id_gpu) {
          await Componente.duplicarComponente(req, id_gpu, id_equipo_i);
        }
      }

      delete req.session.tempEquipo;
      res.redirect('/equipos');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al ensamblar las PCs de escritorio' });
    }
  },

  async getEdit(req, res) {
    const { id } = req.params;
    try {
      const equipo = await Equipo.getById(req, id);
      if (!equipo) {
        return res.status(404).render('error', { message: 'Equipo no encontrado' });
      }
      res.render('equipos/edit', { equipo });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de edición' });
    }
  },

  async postEdit(req, res) {
    const { id } = req.params;
    const { codigo_inventario, tipo, tipo_origen, marca, estado } = req.body;
    try {
      await Equipo.update(req, id, { codigo_inventario, tipo, tipo_origen, marca, estado });
      res.redirect(`/equipos/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al actualizar el equipo' });
    }
  },

  async postDelete(req, res) {
    const { id } = req.params;
    try {
      await Equipo.delete(req, id);
      res.redirect('/equipos');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al dar de baja el equipo' });
    }
  },

  // Laptop details (singular view operations)
  async getCreateLaptopDetalle(req, res) {
    const { id } = req.params;
    try {
      const equipo = await Equipo.getById(req, id);
      res.render('equipos/laptop_detalle_crear', { id_equipo: id, equipo });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario' });
    }
  },

  async postCreateLaptopDetalle(req, res) {
    const { id } = req.params;
    try {
      await Equipo.createLaptopDetalle(req, id, req.body);
      res.redirect(`/equipos/${id}`);
    } catch (err) {
      console.error(err);
      res.render('equipos/laptop_detalle_crear', { 
        id_equipo: id, 
        error: 'Error al guardar los detalles de la laptop. Verifique los datos.',
        equipo: await Equipo.getById(req, id)
      });
    }
  },

  async getEditLaptopDetalle(req, res) {
    const { id } = req.params;
    try {
      const equipo = await Equipo.getById(req, id);
      res.render('equipos/laptop_detalle_editar', { id_equipo: id, equipo });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario' });
    }
  },

  async postEditLaptopDetalle(req, res) {
    const { id } = req.params;
    try {
      await Equipo.updateLaptopDetalle(req, id, req.body);
      res.redirect(`/equipos/${id}`);
    } catch (err) {
      console.error(err);
      res.render('equipos/laptop_detalle_editar', { 
        id_equipo: id, 
        error: 'Error al actualizar los detalles de la laptop. Verifique los datos.',
        equipo: await Equipo.getById(req, id)
      });
    }
  },

  // Assignment management
  async getAsignar(req, res) {
    const { id } = req.params;
    const user = req.session.user;
    try {
      const equipo = await Equipo.getById(req, id);
      if (!equipo) {
        return res.status(404).render('error', { message: 'Equipo no encontrado' });
      }

      // Los técnicos solo pueden asignar laptops
      if (user.rol === 'tecnico' && equipo.tipo !== 'laptop') {
        return res.status(403).render('error', { 
          message: 'Los técnicos solo tienen permisos para asignar laptops. Otros dispositivos son asignados únicamente por el administrador.' 
        });
      }

      const usuarios = await Usuario.getAll(req);
      const ambientes = await Equipo.getAmbientes(req);
      res.render('equipos/asignar', { equipo, usuarios, ambientes });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de asignación' });
    }
  },

  async postAsignar(req, res) {
    const { id } = req.params;
    const { id_usuario, id_ambiente } = req.body;
    const user = req.session.user;
    try {
      const equipo = await Equipo.getById(req, id);
      if (!equipo) {
        return res.status(404).render('error', { message: 'Equipo no encontrado' });
      }

      // Los técnicos solo pueden asignar laptops
      if (user.rol === 'tecnico' && equipo.tipo !== 'laptop') {
        return res.status(403).render('error', { 
          message: 'Los técnicos solo tienen permisos para asignar laptops.' 
        });
      }

      await Equipo.createAsignacion(req, {
        id_equipo: id,
        id_usuario: id_usuario || null,
        id_ambiente: id_ambiente || null
      });
      res.redirect(`/equipos/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al realizar la asignación' });
    }
  },

  async postTerminarAsignacion(req, res) {
    const { id, id_asignacion } = req.params;
    const user = req.session.user;
    try {
      const equipo = await Equipo.getById(req, id);
      if (!equipo) {
        return res.status(404).render('error', { message: 'Equipo no encontrado' });
      }

      // Los técnicos solo pueden desasignar laptops
      if (user.rol === 'tecnico' && equipo.tipo !== 'laptop') {
        return res.status(403).render('error', { 
          message: 'Los técnicos solo tienen permisos para desasignar laptops.' 
        });
      }

      await Equipo.terminarAsignacion(req, id_asignacion);
      res.redirect(`/equipos/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al terminar la asignación' });
    }
  }
};

module.exports = equipoController;
