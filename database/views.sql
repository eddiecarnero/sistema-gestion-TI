-- =============================================================================
-- VIEWS - Sistema de Soporte FISI (soportefisi)
-- Archivo de Vistas
-- =============================================================================

USE `soportefisi`;

-- -----------------------------------------------------------------------------
-- VISTA 1: vw_revision_incidencias_is_usuario
-- Descripción : Permite a los usuarios revisar las incidencias de sus equipos.
-- Columnas    : id_incidencia, id_usuario_reporta, id_equipo, descripcion, estado
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_revision_incidencias_is_usuario` AS
SELECT 
    `id_incidencia`,
    `id_usuario_reporta`,
    `id_equipo`,
    `descripcion`,
    `estado`
FROM `incidencia`;

-- -----------------------------------------------------------------------------
-- VISTA 2: vw_seguimiento_incidencias_usuario
-- Descripción : Muestra el seguimiento y avance de cada incidencia para el usuario.
-- Columnas    : id_incidencia, id_tecnico, tecnico_nombre, diagnostico, trabajo_realizado, horas_invertidas, fecha
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_seguimiento_incidencias_usuario` AS
SELECT 
    si.`id_incidencia`,
    si.`id_tecnico`,
    CONCAT(t.`nombres`, ' ', t.`apellidos`) AS `tecnico_nombre`,
    si.`diagnostico`,
    si.`trabajo_realizado`,
    si.`horas_invertidas`,
    si.`fecha`
FROM `seguimiento_incidencia` si
INNER JOIN `tecnico` t ON si.`id_tecnico` = t.`id_tecnico`;
