CREATE TABLE `area` (
  `id_area` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255) UNIQUE NOT NULL
);

CREATE TABLE `usuario` (
  `id_usuario` int PRIMARY KEY AUTO_INCREMENT,
  `id_area` int NOT NULL,
  `cargo` ENUM ('empleado', 'jefe') NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) UNIQUE NOT NULL,
  `telefono` varchar(255),
  `estado` boolean DEFAULT true
);

CREATE TABLE `rango_tecnico` (
  `id_rango` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255) UNIQUE NOT NULL
);

CREATE TABLE `tecnico` (
  `id_tecnico` int PRIMARY KEY AUTO_INCREMENT,
  `id_rango` int NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) UNIQUE NOT NULL,
  `telefono` varchar(255),
  `estado` boolean DEFAULT true
);

CREATE TABLE `ambiente` (
  `id_ambiente` int PRIMARY KEY AUTO_INCREMENT,
  `numero` int NOT NULL,
  `pabellon` varchar(255) NOT NULL,
  `piso` int NOT NULL
);

CREATE TABLE `equipo` (
  `id_equipo` int PRIMARY KEY AUTO_INCREMENT,
  `codigo_inventario` varchar(255) UNIQUE NOT NULL,
  `tipo` ENUM ('laptop', 'pc_escritorio', 'proyector', 'teclado', 'mouse', 'monitor', 'otro') NOT NULL,
  `tipo_origen` ENUM ('ensamblado_facultad', 'comprado_ensamblado') NOT NULL,
  `marca` varchar(255),
  `estado` ENUM ('operativo', 'mantenimiento', 'baja') NOT NULL DEFAULT 'operativo'
);

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
  `nombre_grafica` varchar(255)
);

CREATE TABLE `componente` (
  `id_componente` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `estado_componente` ENUM ('opertivo', 'almacenado', 'mantenimiento', 'baja')
);

CREATE TABLE `procesador` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255)
);

CREATE TABLE `memoria_ram` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `capacidad_gb` int,
  `tipo_ddr` ENUM ('DDR3', 'DDR4', 'DDR5')
);

CREATE TABLE `almacenamiento` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `tipo` ENUM ('ssd', 'hdd'),
  `capacidad_gb` int
);

CREATE TABLE `tarjeta_grafica` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `vram_gb` int
);

CREATE TABLE `placa_madre` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `socket` varchar(255),
  `factor_forma` varchar(255)
);

CREATE TABLE `fuente_poder` (
  `id_componente` int PRIMARY KEY,
  `marca` varchar(255),
  `modelo` varchar(255),
  `potencia_watts` int,
  `certificacion` varchar(255)
);

CREATE TABLE `incidencia` (
  `id_incidencia` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_usuario_reporta` int NOT NULL,
  `id_tecnico_recibe` int,
  `descripcion` text NOT NULL,
  `prioridad` ENUM ('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  `estado` ENUM ('pendiente', 'en_proceso', 'resuelta', 'cerrada') NOT NULL DEFAULT 'pendiente',
  `fecha_creacion` datetime NOT NULL,
  `fecha_resolucion` datetime
);

CREATE TABLE `seguimiento_incidencia` (
  `id_seguimiento` int PRIMARY KEY AUTO_INCREMENT,
  `id_incidencia` int NOT NULL,
  `id_tecnico` int NOT NULL,
  `diagnostico` text,
  `trabajo_realizado` text,
  `horas_invertidas` decimal(4,2) NOT NULL,
  `id_componente_cambiado` int,
  `fecha` datetime NOT NULL
);

CREATE TABLE `solicitud` (
  `id_solicitud` int PRIMARY KEY AUTO_INCREMENT,
  `id_usuario_solicita` int NOT NULL,
  `tipo` ENUM ('remodelacion', 'mejora', 'reemplazo') NOT NULL,
  `descripcion` text NOT NULL,
  `estado` ENUM ('pendiente', 'aprobada', 'rechazada', 'completada') NOT NULL DEFAULT 'pendiente',
  `fecha_solicitud` datetime NOT NULL,
  `fecha_respuesta` datetime
);

CREATE TABLE `asignacion_historial` (
  `id_asignacion` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_usuario` int,
  `id_ambiente` int,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime
);

CREATE TABLE `software` (
  `id_software` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255) UNIQUE NOT NULL
);

CREATE TABLE `software_instalado` (
  `id_software_instalado` int PRIMARY KEY AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_software` int NOT NULL,
  `tipo_licencia` ENUM ('libre', 'propietaria', 'educativa', 'trial') NOT NULL,
  `clave_licencia` varchar(255),
  `fecha_instalacion` date NOT NULL,
  `fecha_expiracion` date
);

CREATE TABLE `auditoria_tecnico` (
  `id_auditoria_tecnico` int PRIMARY KEY AUTO_INCREMENT,
  `id_tecnico` int NOT NULL,
  `tabla_afectada` varchar(255) NOT NULL,
  `permiso_realizado` ENUM ('INSERT', 'UPDATE', 'SELECT') NOT NULL,
  `valor_agregado` json,
  `valor_anterior` json,
  `fecha_realizado` timestamp NOT NULL DEFAULT (now())
);

ALTER TABLE `usuario` ADD FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`);

ALTER TABLE `tecnico` ADD FOREIGN KEY (`id_rango`) REFERENCES `rango_tecnico` (`id_rango`);

ALTER TABLE `laptop_detalle` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`);

ALTER TABLE `componente` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`);

ALTER TABLE `procesador` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`);

ALTER TABLE `memoria_ram` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`);

ALTER TABLE `almacenamiento` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`);

ALTER TABLE `tarjeta_grafica` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`);

ALTER TABLE `placa_madre` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`);

ALTER TABLE `fuente_poder` ADD FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`);

ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`);

ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_usuario_reporta`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `incidencia` ADD FOREIGN KEY (`id_tecnico_recibe`) REFERENCES `tecnico` (`id_tecnico`);

ALTER TABLE `seguimiento_incidencia` ADD FOREIGN KEY (`id_incidencia`) REFERENCES `incidencia` (`id_incidencia`);

ALTER TABLE `seguimiento_incidencia` ADD FOREIGN KEY (`id_tecnico`) REFERENCES `tecnico` (`id_tecnico`);

ALTER TABLE `seguimiento_incidencia` ADD FOREIGN KEY (`id_componente_cambiado`) REFERENCES `componente` (`id_componente`);

ALTER TABLE `solicitud` ADD FOREIGN KEY (`id_usuario_solicita`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `asignacion_historial` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`);

ALTER TABLE `asignacion_historial` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `asignacion_historial` ADD FOREIGN KEY (`id_ambiente`) REFERENCES `ambiente` (`id_ambiente`);

ALTER TABLE `software_instalado` ADD FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`);

ALTER TABLE `software_instalado` ADD FOREIGN KEY (`id_software`) REFERENCES `software` (`id_software`);

ALTER TABLE `auditoria_tecnico` ADD FOREIGN KEY (`id_tecnico`) REFERENCES `tecnico` (`id_tecnico`);
