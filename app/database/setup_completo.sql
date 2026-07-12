-- =============================================================================
-- SETUP COMPLETO - Sistema de Soporte FISI (soportefisi)
-- Archivo autogenerado - Configuración completa de base de datos
-- =============================================================================

DROP DATABASE IF EXISTS `soportefisi`;
CREATE DATABASE `soportefisi` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `soportefisi`;

-- =============================================================================
-- 2. TABLAS Y RESTRICCIONES
-- =============================================================================

-- Tabla de áreas
CREATE TABLE `area` (
  `id_area` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE `usuario` (
  `id_usuario` int PRIMARY KEY AUTO_INCREMENT,
  `id_area` int NOT NULL,
  `cargo` ENUM ('empleado', 'jefe') NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) UNIQUE NOT NULL,
  `telefono` varchar(255),
  `contrasena` varchar(255) NOT NULL,
  `estado` boolean DEFAULT true,
  CONSTRAINT `chk_usuario_correo` CHECK (`correo` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT `chk_usuario_telefono` CHECK (`telefono` IS NULL OR `telefono` REGEXP '^[0-9]{7,15}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de rangos de técnicos
CREATE TABLE `rango_tecnico` (
  `id_rango` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de técnicos
CREATE TABLE `tecnico` (
  `id_tecnico` int PRIMARY KEY AUTO_INCREMENT,
  `id_rango` int NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) UNIQUE NOT NULL,
  `telefono` varchar(255),
  `contrasena` varchar(255) NOT NULL,
  `estado` boolean DEFAULT true,
  CONSTRAINT `chk_tecnico_correo` CHECK (`correo` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT `chk_tecnico_telefono` CHECK (`telefono` IS NULL OR `telefono` REGEXP '^[0-9]{7,15}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ambientes
CREATE TABLE `ambiente` (
  `id_ambiente` int PRIMARY KEY AUTO_INCREMENT,
  `numero` int NOT NULL,
  `pabellon` varchar(255) NOT NULL,
  `piso` int NOT NULL,
  CONSTRAINT `chk_ambiente_numero` CHECK (`numero` > 0),
  CONSTRAINT `chk_ambiente_piso` CHECK (`piso` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de equipos
CREATE TABLE `equipo` (
  `id_equipo` int PRIMARY KEY AUTO_INCREMENT,
  `codigo_inventario` varchar(255) UNIQUE NOT NULL,
  `tipo` ENUM ('laptop', 'pc_escritorio', 'proyector', 'teclado', 'mouse', 'monitor', 'otro') NOT NULL,
  `tipo_origen` ENUM ('ensamblado_facultad', 'comprado_ensamblado') NOT NULL,
  `marca` varchar(255),
  `estado` ENUM ('operativo', 'mantenimiento', 'baja') NOT NULL DEFAULT 'operativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de detalles de laptop
CREATE TABLE `laptop_detalle` (
  `id_equipo` int PRIMARY KEY,
  `modelo` varchar(255),
  `serie` varchar(255) UNIQUE NOT NULL,
  `tipo_procesador` ENUM ('intel', 'amd', 'arm'),
  `detalle_procesador` varchar(255),
  `tipo_ram` ENUM ('ddr1', 'ddr2', 'ddr3', 'ddr4', 'ddr5'),
  `cantidad_ram` int,
  `almacenamiento` ENUM ('ssd_sata', 'ssd_nvme', 'hdd'),
  `cantidad_almacenamiento` int,
  `tipo_grafica` ENUM ('dedicada', 'integrada'),
  `nombre_grafica` varchar(255),
  CONSTRAINT `chk_laptop_ram` CHECK (`cantidad_ram` IS NULL OR `cantidad_ram` > 0),
  CONSTRAINT `chk_laptop_almacenamiento` CHECK (`cantidad_almacenamiento` IS NULL OR `cantidad_almacenamiento` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de componentes
CREATE TABLE `componente` (
  `id_componente` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `estado_componente` ENUM ('operativo', 'almacenado', 'mantenimiento', 'baja') NOT NULL DEFAULT 'operativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de procesadores
CREATE TABLE `procesador` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de memorias RAM
CREATE TABLE `memoria_ram` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `capacidad_gb` int,
  `tipo_ddr` ENUM ('DDR3', 'DDR4', 'DDR5'),
  CONSTRAINT `chk_ram_capacidad` CHECK (`capacidad_gb` IS NULL OR `capacidad_gb` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de almacenamiento
CREATE TABLE `almacenamiento` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `tipo` ENUM ('ssd', 'hdd'),
  `capacidad_gb` int,
  CONSTRAINT `chk_almacenamiento_capacidad` CHECK (`capacidad_gb` IS NULL OR `capacidad_gb` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tarjetas gráficas
CREATE TABLE `tarjeta_grafica` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `vram_gb` int,
  CONSTRAINT `chk_grafica_vram` CHECK (`vram_gb` IS NULL OR `vram_gb` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de placas madre
CREATE TABLE `placa_madre` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `socket` varchar(255),
  `factor_forma` varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de fuentes de poder
CREATE TABLE `fuente_poder` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `potencia_watts` int,
  `certificacion` varchar(255),
  CONSTRAINT `chk_fuente_potencia` CHECK (`potencia_watts` IS NULL OR `potencia_watts` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de incidencias
CREATE TABLE `incidencia` (
  `id_incidencia` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_usuario_reporta` int NOT NULL,
  `id_tecnico_recibe` int,
  `descripcion` text NOT NULL,
  `prioridad` ENUM ('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  `estado` ENUM ('pendiente', 'en_proceso', 'resuelta', 'cerrada') NOT NULL DEFAULT 'pendiente',
  `fecha_creacion` datetime NOT NULL,
  `fecha_resolucion` datetime,
  CONSTRAINT `chk_incidencia_fechas` CHECK (`fecha_resolucion` IS NULL OR `fecha_resolucion` >= `fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de seguimientos de incidencia
CREATE TABLE `seguimiento_incidencia` (
  `id_seguimiento` int PRIMARY KEY AUTO_INCREMENT,
  `id_incidencia` int NOT NULL,
  `id_tecnico` int NOT NULL,
  `diagnostico` text,
  `trabajo_realizado` text,
  `horas_invertidas` decimal(4,2) NOT NULL,
  `id_componente_cambiado` int,
  `fecha` datetime NOT NULL,
  CONSTRAINT `chk_seguimiento_horas` CHECK (`horas_invertidas` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de solicitudes
CREATE TABLE `solicitud` (
  `id_solicitud` int PRIMARY KEY AUTO_INCREMENT,
  `id_usuario_solicita` int NOT NULL,
  `tipo` ENUM ('remodelacion', 'mejora', 'reemplazo') NOT NULL,
  `descripcion` text NOT NULL,
  `estado` ENUM ('pendiente', 'aprobada', 'rechazada', 'completada') NOT NULL DEFAULT 'pendiente',
  `fecha_solicitud` datetime NOT NULL,
  `fecha_respuesta` datetime,
  CONSTRAINT `chk_solicitud_fechas` CHECK (`fecha_respuesta` IS NULL OR `fecha_respuesta` >= `fecha_solicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de asignación historial
CREATE TABLE `asignacion_historial` (
  `id_asignacion` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_usuario` int,
  `id_ambiente` int,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime,
  CONSTRAINT `chk_asignacion_fechas` CHECK (`fecha_fin` IS NULL OR `fecha_fin` >= `fecha_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de software
CREATE TABLE `software` (
  `id_software` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de software instalado
CREATE TABLE `software_instalado` (
  `id_software_instalado` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_software` int NOT NULL,
  `tipo_licencia` ENUM ('libre', 'propietaria', 'educativa', 'trial') NOT NULL,
  `clave_licencia` varchar(255),
  `fecha_instalacion` date NOT NULL,
  `fecha_expiracion` date,
  CONSTRAINT `chk_software_fechas` CHECK (`fecha_expiracion` IS NULL OR `fecha_expiracion` >= `fecha_instalacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de auditoría
CREATE TABLE `auditoria_tecnico` (
  `id_auditoria_tecnico` int PRIMARY KEY AUTO_INCREMENT,
  `id_tecnico` int NOT NULL,
  `tabla_afectada` varchar(255) NOT NULL,
  `permiso_realizado` ENUM ('INSERT', 'UPDATE', 'SELECT') NOT NULL,
  `valor_agregado` json,
  `valor_anterior` json,
  `fecha_realizado` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. LLAVES FORÁNEAS (RELACIONES)
-- =============================================================================

ALTER TABLE `usuario` ADD FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`);
ALTER TABLE `tecnico` ADD FOREIGN KEY (`id_rango`) REFERENCES `rango_tecnico` (`id_rango`);
ALTER TABLE `laptop_detalle` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE CASCADE;
ALTER TABLE `componente` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE CASCADE;
ALTER TABLE `procesador` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE;
ALTER TABLE `memoria_ram` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE;
ALTER TABLE `almacenamiento` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE;
ALTER TABLE `tarjeta_grafica` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE;
ALTER TABLE `placa_madre` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE;
ALTER TABLE `fuente_poder` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE;
ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`);
ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_usuario_reporta`) REFERENCES `usuario` (`id_usuario`);
ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_tecnico_recibe`) REFERENCES `tecnico` (`id_tecnico`);
ALTER TABLE `seguimiento_incidencia` ADD FOREIGN KEY (`id_incidencia`) REFERENCES `incidencia` (`id_incidencia`) ON DELETE CASCADE;
ALTER TABLE `seguimiento_incidencia` ADD FOREIGN KEY (`id_tecnico`) REFERENCES `tecnico` (`id_tecnico`);
ALTER TABLE `seguimiento_incidencia` ADD FOREIGN KEY (`id_componente_cambiado`) REFERENCES `componente` (`id_componente`);
ALTER TABLE `solicitud` ADD FOREIGN KEY (`id_usuario_solicita`) REFERENCES `usuario` (`id_usuario`);
ALTER TABLE `asignacion_historial` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE CASCADE;
ALTER TABLE `asignacion_historial` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);
ALTER TABLE `asignacion_historial` ADD FOREIGN KEY (`id_ambiente`) REFERENCES `ambiente` (`id_ambiente`);
ALTER TABLE `software_instalado` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE CASCADE;
ALTER TABLE `software_instalado` ADD FOREIGN KEY (`id_software`) REFERENCES `software` (`id_software`);
ALTER TABLE `auditoria_tecnico` ADD FOREIGN KEY (`id_tecnico`) REFERENCES `tecnico` (`id_tecnico`) ON DELETE CASCADE;

-- =============================================================================
-- 4. ÍNDICES ADICIONALES
-- =============================================================================

CREATE INDEX `idx_incidencia_estado` ON `incidencia` (`estado`);
CREATE INDEX `idx_incidencia_prioridad` ON `incidencia` (`prioridad`);
CREATE INDEX `idx_tecnico_rango` ON `tecnico` (`id_rango`);
CREATE INDEX `idx_usuario_area` ON `usuario` (`id_area`);
CREATE INDEX `idx_equipo_estado` ON `equipo` (`estado`);
CREATE INDEX `idx_componente_equipo` ON `componente` (`id_equipo`);

-- =============================================================================
-- 5. TRIGGERS DE AUDITORÍA
-- =============================================================================

DELIMITER $$

-- Triggers para Equipo
CREATE TRIGGER `trg_auditoria_equipo_insert` AFTER INSERT ON `equipo`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'equipo', 'INSERT', 
            JSON_OBJECT('id_equipo', NEW.id_equipo, 'codigo_inventario', NEW.codigo_inventario, 'tipo', NEW.tipo, 'tipo_origen', NEW.tipo_origen, 'marca', NEW.marca, 'estado', NEW.estado),
            NULL);
  END IF;
END $$

CREATE TRIGGER `trg_auditoria_equipo_update` AFTER UPDATE ON `equipo`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'equipo', 'UPDATE', 
            JSON_OBJECT('id_equipo', NEW.id_equipo, 'codigo_inventario', NEW.codigo_inventario, 'tipo', NEW.tipo, 'tipo_origen', NEW.tipo_origen, 'marca', NEW.marca, 'estado', NEW.estado),
            JSON_OBJECT('id_equipo', OLD.id_equipo, 'codigo_inventario', OLD.codigo_inventario, 'tipo', OLD.tipo, 'tipo_origen', OLD.tipo_origen, 'marca', OLD.marca, 'estado', OLD.estado));
  END IF;
END $$

-- Triggers para Componente
CREATE TRIGGER `trg_auditoria_componente_insert` AFTER INSERT ON `componente`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'componente', 'INSERT', 
            JSON_OBJECT('id_componente', NEW.id_componente, 'id_equipo', NEW.id_equipo, 'estado_componente', NEW.estado_componente),
            NULL);
  END IF;
END $$

CREATE TRIGGER `trg_auditoria_componente_update` AFTER UPDATE ON `componente`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'componente', 'UPDATE', 
            JSON_OBJECT('id_componente', NEW.id_componente, 'id_equipo', NEW.id_equipo, 'estado_componente', NEW.estado_componente),
            JSON_OBJECT('id_componente', OLD.id_componente, 'id_equipo', OLD.id_equipo, 'estado_componente', OLD.estado_componente));
  END IF;
END $$

-- Triggers para Incidencia
CREATE TRIGGER `trg_auditoria_incidencia_insert` AFTER INSERT ON `incidencia`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'incidencia', 'INSERT', 
            JSON_OBJECT('id_incidencia', NEW.id_incidencia, 'id_equipo', NEW.id_equipo, 'id_usuario_reporta', NEW.id_usuario_reporta, 'id_tecnico_recibe', NEW.id_tecnico_recibe, 'descripcion', NEW.descripcion, 'prioridad', NEW.prioridad, 'estado', NEW.estado),
            NULL);
  END IF;
END $$

CREATE TRIGGER `trg_auditoria_incidencia_update` AFTER UPDATE ON `incidencia`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'incidencia', 'UPDATE', 
            JSON_OBJECT('id_incidencia', NEW.id_incidencia, 'id_equipo', NEW.id_equipo, 'id_usuario_reporta', NEW.id_usuario_reporta, 'id_tecnico_recibe', NEW.id_tecnico_recibe, 'descripcion', NEW.descripcion, 'prioridad', NEW.prioridad, 'estado', NEW.estado),
            JSON_OBJECT('id_incidencia', OLD.id_incidencia, 'id_equipo', OLD.id_equipo, 'id_usuario_reporta', OLD.id_usuario_reporta, 'id_tecnico_recibe', OLD.id_tecnico_recibe, 'descripcion', OLD.descripcion, 'prioridad', OLD.prioridad, 'estado', OLD.estado));
  END IF;
END $$

-- Triggers para Seguimiento de Incidencia
CREATE TRIGGER `trg_auditoria_seguimiento_insert` AFTER INSERT ON `seguimiento_incidencia`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'seguimiento_incidencia', 'INSERT', 
            JSON_OBJECT('id_seguimiento', NEW.id_seguimiento, 'id_incidencia', NEW.id_incidencia, 'id_tecnico', NEW.id_tecnico, 'diagnostico', NEW.diagnostico, 'trabajo_realizado', NEW.trabajo_realizado, 'horas_invertidas', NEW.horas_invertidas),
            NULL);
  END IF;
END $$

CREATE TRIGGER `trg_auditoria_seguimiento_update` AFTER UPDATE ON `seguimiento_incidencia`
FOR EACH ROW
BEGIN
  IF @current_tecnico_id IS NOT NULL THEN
    INSERT INTO `auditoria_tecnico` (`id_tecnico`, `tabla_afectada`, `permiso_realizado`, `valor_agregado`, `valor_anterior`)
    VALUES (@current_tecnico_id, 'seguimiento_incidencia', 'UPDATE', 
            JSON_OBJECT('id_seguimiento', NEW.id_seguimiento, 'id_incidencia', NEW.id_incidencia, 'id_tecnico', NEW.id_tecnico, 'diagnostico', NEW.diagnostico, 'trabajo_realizado', NEW.trabajo_realizado, 'horas_invertidas', NEW.horas_invertidas),
            JSON_OBJECT('id_seguimiento', OLD.id_seguimiento, 'id_incidencia', OLD.id_incidencia, 'id_tecnico', OLD.id_tecnico, 'diagnostico', OLD.diagnostico, 'trabajo_realizado', OLD.trabajo_realizado, 'horas_invertidas', OLD.horas_invertidas));
  END IF;
END $$

DELIMITER ;

-- =============================================================================
-- 6. VISTAS SQL PARA REPORTES Y MÉTRICAS
-- =============================================================================

-- Vista de métricas de técnicos y practicantes
CREATE OR REPLACE VIEW `vista_metricas_personal` AS
SELECT 
  t.`id_tecnico`,
  t.`nombres`,
  t.`apellidos`,
  r.`nombre` AS `rango`,
  COUNT(DISTINCT i.`id_incidencia`) AS `total_incidencias_asignadas`,
  SUM(CASE WHEN i.`estado` = 'resuelta' OR i.`estado` = 'cerrada' THEN 1 ELSE 0 END) AS `total_incidencias_resueltas`,
  IFNULL(SUM(s.`horas_invertidas`), 0) AS `total_horas_invertidas`,
  IFNULL(AVG(s.`horas_invertidas`), 0) AS `promedio_horas_por_incidencia`,
  SUM(CASE WHEN i.`estado` IN ('pendiente', 'en_proceso') THEN 1 ELSE 0 END) AS `incidencias_pendientes`
FROM `tecnico` t
JOIN `rango_tecnico` r ON t.`id_rango` = r.`id_rango`
LEFT JOIN `incidencia` i ON t.`id_tecnico` = i.`id_tecnico_recibe`
LEFT JOIN `seguimiento_incidencia` s ON i.`id_incidencia` = s.`id_incidencia`
GROUP BY t.`id_tecnico`, t.`nombres`, t.`apellidos`, r.`nombre`;

-- Vista de incidencias pendientes
CREATE OR REPLACE VIEW `vista_incidencias_pendientes` AS
SELECT 
  i.`id_incidencia`,
  i.`descripcion`,
  i.`prioridad`,
  i.`estado`,
  i.`fecha_creacion`,
  e.`codigo_inventario`,
  e.`tipo` AS `tipo_equipo`,
  u.`nombres` AS `usuario_nombres`,
  u.`apellidos` AS `usuario_apellidos`,
  t.`nombres` AS `tecnico_nombres`,
  t.`apellidos` AS `tecnico_apellidos`
FROM `incidencia` i
JOIN `equipo` e ON i.`id_equipo` = e.`id_equipo`
JOIN `usuario` u ON i.`id_usuario_reporta` = u.`id_usuario`
LEFT JOIN `tecnico` t ON i.`id_tecnico_recibe` = t.`id_tecnico`
WHERE i.`estado` IN ('pendiente', 'en_proceso');

-- Vista de historial de asignación de equipos
CREATE OR REPLACE VIEW `vista_historial_equipo` AS
SELECT 
  e.`id_equipo`,
  e.`codigo_inventario`,
  e.`tipo` AS `tipo_equipo`,
  e.`marca`,
  e.`estado` AS `estado_equipo`,
  ah.`fecha_inicio`,
  ah.`fecha_fin`,
  u.`nombres` AS `usuario_nombres`,
  u.`apellidos` AS `usuario_apellidos`,
  a.`numero` AS `ambiente_numero`,
  a.`pabellon` AS `ambiente_pabellon`
FROM `equipo` e
LEFT JOIN `asignacion_historial` ah ON e.`id_equipo` = ah.`id_equipo`
LEFT JOIN `usuario` u ON ah.`id_usuario` = u.`id_usuario`
LEFT JOIN `ambiente` a ON ah.`id_ambiente` = a.`id_ambiente`;

-- Vista de software por equipo
CREATE OR REPLACE VIEW `vista_software_por_equipo` AS
SELECT 
  e.`id_equipo`,
  e.`codigo_inventario`,
  s.`nombre` AS `software_nombre`,
  si.`tipo_licencia`,
  si.`clave_licencia`,
  si.`fecha_instalacion`,
  si.`fecha_expiracion`
FROM `equipo` e
JOIN `software_instalado` si ON e.`id_equipo` = si.`id_equipo`
JOIN `software` s ON si.`id_software` = s.`id_software`;

-- Vista de componentes por equipo
CREATE OR REPLACE VIEW `vista_componentes_equipo` AS
SELECT 
  e.`id_equipo`,
  e.`codigo_inventario`,
  c.`id_componente`,
  c.`estado_componente`,
  CASE 
    WHEN p.`id_componente` IS NOT NULL THEN 'Procesador'
    WHEN ram.`id_componente` IS NOT NULL THEN 'Memoria RAM'
    WHEN alm.`id_componente` IS NOT NULL THEN 'Almacenamiento'
    WHEN gpu.`id_componente` IS NOT NULL THEN 'Tarjeta Gráfica'
    WHEN mb.`id_componente` IS NOT NULL THEN 'Placa Madre'
    WHEN fp.`id_componente` IS NOT NULL THEN 'Fuente de Poder'
    ELSE 'Otro Componente'
  END AS `tipo_componente`,
  CASE 
    WHEN p.`id_componente` IS NOT NULL THEN CONCAT(p.marca, ' ', p.modelo)
    WHEN ram.`id_componente` IS NOT NULL THEN CONCAT(ram.marca, ' ', ram.capacidad_gb, 'GB ', ram.tipo_ddr)
    WHEN alm.`id_componente` IS NOT NULL THEN CONCAT(alm.marca, ' ', alm.modelo, ' (', alm.capacidad_gb, 'GB ', alm.tipo, ')')
    WHEN gpu.`id_componente` IS NOT NULL THEN CONCAT(gpu.marca, ' ', gpu.modelo, ' ', gpu.vram_gb, 'GB')
    WHEN mb.`id_componente` IS NOT NULL THEN CONCAT(mb.marca, ' ', mb.modelo, ' Socket ', mb.socket, ' ', mb.factor_forma)
    WHEN fp.`id_componente` IS NOT NULL THEN CONCAT(fp.marca, ' ', fp.modelo, ' ', fp.potencia_watts, 'W ', IFNULL(fp.certificacion, ''))
    ELSE 'Detalles no especificados'
  END AS `especificaciones`
FROM `equipo` e
JOIN `componente` c ON e.`id_equipo` = c.`id_equipo`
LEFT JOIN `procesador` p ON c.`id_componente` = p.`id_componente`
LEFT JOIN `memoria_ram` ram ON c.`id_componente` = ram.`id_componente`
LEFT JOIN `almacenamiento` alm ON c.`id_componente` = alm.`id_componente`
LEFT JOIN `tarjeta_grafica` gpu ON c.`id_componente` = gpu.`id_componente`
LEFT JOIN `placa_madre` mb ON c.`id_componente` = mb.`id_componente`
LEFT JOIN `fuente_poder` fp ON c.`id_componente` = fp.`id_componente`;

-- =============================================================================
-- 7. INSERCIÓN DE DATOS DE PRUEBA (SEED DATA)
-- =============================================================================

-- Inserción de Áreas
INSERT INTO `area` (`nombre`) VALUES
('Secretaría Académica'),
('Dirección de Escuela'),
('Laboratorio de Cómputo 104'),
('Biblioteca de Facultad'),
('Departamento de Ingeniería de Sistemas');

-- Inserción de Rangos de Técnicos
INSERT INTO `rango_tecnico` (`nombre`) VALUES
('practicante'),
('tecnico'),
('administrador');

-- Inserción de Técnicos (con contraseñas hasheadas previamente)
INSERT INTO `tecnico` (`id_rango`, `nombres`, `apellidos`, `correo`, `telefono`, `contrasena`, `estado`) VALUES
(3, 'Carlos', 'Mendoza Ríos', 'admin@fisi.edu.pe', '987654321', '$2b$10$Y/3DZ9Csz6H3AzpeGJpkMOeKPl5zep0zfKbMS32l37iDNeLyfti3C', true), -- Admin123!
(2, 'Luis', 'García Torres', 'tecnico@fisi.edu.pe', '987654322', '$2b$10$T6d4KxKA16mRw82ZyKFPr.cRGgABe43YAKu3t7OHUkFEX.h4AjSha', true), -- Tecnico123!
(1, 'Ana', 'Flores López', 'practicante@fisi.edu.pe', '987654323', '$2b$10$nBFP0fLuzadHE9NXydaUje9q92Q4H2Z.FsB4gTdOg8x0YUXdluHRy', true); -- Practicante123!

-- Inserción de Usuarios
INSERT INTO `usuario` (`id_area`, `cargo`, `nombres`, `apellidos`, `correo`, `telefono`, `contrasena`, `estado`) VALUES
(1, 'jefe', 'Roberto', 'Sánchez Vargas', 'jefe@fisi.edu.pe', '987654324', '$2b$10$JeQJZqi6dbY.1/tWPnzR8uLw5L.1Ec3GlGvAigMHDMepzVmpF0Idy', true), -- Jefe123!
(3, 'empleado', 'María', 'Torres Díaz', 'usuario@fisi.edu.pe', '987654325', '$2b$10$Q.UB9/zuOwh.ykiLnIOdieNC818a3jsqrKVp56NrwgiM8MxVoZBmK', true); -- Usuario123!

-- Inserción de Ambientes
INSERT INTO `ambiente` (`numero`, `pabellon`, `piso`) VALUES
(101, 'Antiguo Pabellón', 1),
(202, 'Nuevo Pabellón', 2),
(303, 'Pabellón Administrativo', 3);

-- Inserción de Equipos
INSERT INTO `equipo` (`codigo_inventario`, `tipo`, `tipo_origen`, `marca`, `estado`) VALUES
('EQ-001', 'laptop', 'comprado_ensamblado', 'Lenovo', 'operativo'),
('EQ-002', 'pc_escritorio', 'ensamblado_facultad', 'HP', 'operativo'),
('EQ-003', 'proyector', 'comprado_ensamblado', 'Epson', 'operativo'),
('EQ-004', 'laptop', 'comprado_ensamblado', 'Dell', 'mantenimiento'),
('EQ-005', 'pc_escritorio', 'ensamblado_facultad', 'Custom', 'operativo');

-- Laptop Detalles
INSERT INTO `laptop_detalle` (`id_equipo`, `modelo`, `serie`, `tipo_procesador`, `detalle_procesador`, `tipo_ram`, `cantidad_ram`, `almacenamiento`, `cantidad_almacenamiento`, `tipo_grafica`, `nombre_grafica`) VALUES
(1, 'ThinkPad L14', 'SN-LENOVO123', 'intel', 'Core i7 11th Gen', 'ddr4', 16, 'ssd_nvme', 512, 'integrada', 'Intel Iris Xe Graphics'),
(4, 'Latitude 5420', 'SN-DELL456', 'amd', 'Ryzen 5 5600U', 'ddr4', 8, 'ssd_sata', 256, 'integrada', 'AMD Radeon Graphics');

-- Componentes de EQ-002
INSERT INTO `componente` (`id_componente`, `id_equipo`, `estado_componente`) VALUES
(1, 2, 'operativo'),
(2, 2, 'operativo'),
(3, 2, 'operativo'),
(4, 2, 'operativo'),
(5, 2, 'operativo');

INSERT INTO `procesador` (`id_componente`, `marca`, `modelo`) VALUES (1, 'AMD', 'Ryzen 7 3700X');
INSERT INTO `memoria_ram` (`id_componente`, `marca`, `capacidad_gb`, `tipo_ddr`) VALUES (2, 'Kingston', 16, 'DDR4');
INSERT INTO `almacenamiento` (`id_componente`, `marca`, `modelo`, `tipo`, `capacidad_gb`) VALUES (3, 'Crucial', 'P1 NVMe', 'ssd', 1000);
INSERT INTO `placa_madre` (`id_componente`, `marca`, `modelo`, `socket`, `factor_forma`) VALUES (4, 'ASUS', 'TUF B450-Plus', 'AM4', 'ATX');
INSERT INTO `fuente_poder` (`id_componente`, `marca`, `modelo`, `potencia_watts`, `certificacion`) VALUES (5, 'EVGA', '600 W1', 600, '80 Plus White');

-- Componentes de EQ-005
INSERT INTO `componente` (`id_componente`, `id_equipo`, `estado_componente`) VALUES
(6, 5, 'operativo'),
(7, 5, 'operativo');

INSERT INTO `procesador` (`id_componente`, `marca`, `modelo`) VALUES (6, 'Intel', 'Core i5-10400');
INSERT INTO `memoria_ram` (`id_componente`, `marca`, `capacidad_gb`, `tipo_ddr`) VALUES (7, 'Corsair', 8, 'DDR4');

-- Inserción de Software
INSERT INTO `software` (`nombre`) VALUES
('Windows 11 Education'),
('Microsoft Office 2021 LTSC'),
('Visual Studio Code'),
('MySQL Workbench'),
('Google Chrome');

-- Inserción de Software Instalado
INSERT INTO `software_instalado` (`id_equipo`, `id_software`, `tipo_licencia`, `clave_licencia`, `fecha_instalacion`, `fecha_expiracion`) VALUES
(1, 1, 'educativa', 'W11-EDU-XXXXX', '2026-01-10', '2027-01-10'),
(1, 2, 'propietaria', 'OFF-LTSC-YYYYY', '2026-01-10', NULL),
(2, 1, 'educativa', 'W11-EDU-ZZZZZ', '2026-02-15', '2027-02-15'),
(2, 3, 'libre', NULL, '2026-02-15', NULL),
(4, 1, 'educativa', 'W11-EDU-AAAAA', '2026-03-01', '2027-03-01');

-- Inserción de Incidencias
INSERT INTO `incidencia` (`id_equipo`, `id_usuario_reporta`, `id_tecnico_recibe`, `descripcion`, `prioridad`, `estado`, `fecha_creacion`, `fecha_resolucion`) VALUES
(1, 2, 2, 'La pantalla de la laptop parpadea ocasionalmente al abrir programas de diseño.', 'media', 'en_proceso', '2026-07-10 09:30:00', NULL),
(3, 1, 3, 'El proyector no enciende. Ya se verificó la conexión de energía eléctrica.', 'alta', 'pendiente', '2026-07-11 11:00:00', NULL);

-- Inserción de Solicitudes
INSERT INTO `solicitud` (`id_usuario_solicita`, `tipo`, `descripcion`, `estado`, `fecha_solicitud`, `fecha_respuesta`) VALUES
(1, 'mejora', 'Se solicita ampliación de memoria RAM para las PCs del laboratorio 104.', 'pendiente', '2026-07-10 14:00:00', NULL);

-- Historial de Asignaciones
INSERT INTO `asignacion_historial` (`id_equipo`, `id_usuario`, `id_ambiente`, `fecha_inicio`, `fecha_fin`) VALUES
(1, 2, NULL, '2026-01-15 08:00:00', NULL),
(2, NULL, 1, '2026-02-20 08:00:00', NULL),
(3, NULL, 2, '2026-03-05 08:00:00', NULL);
