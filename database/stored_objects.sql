-- =============================================================================
-- STORED OBJECTS - Sistema de Soporte FISI (soportefisi)
-- Archivo de Stored Procedures
-- =============================================================================

USE `soportefisi`;

DROP PROCEDURE IF EXISTS `sp_registrar_incidencia`;

DELIMITER $$
-- -----------------------------------------------------------------------------
-- SP: sp_registrar_incidencia
-- Parámetros de entrada:
--   p_id_usuario        : ID del usuario que reporta
--   p_descripcion_falla : Descripción del problema/falla
--   p_prioridad         : Prioridad ('baja', 'media', 'alta')
-- -----------------------------------------------------------------------------
CREATE PROCEDURE `sp_registrar_incidencia`(
    IN p_id_usuario INT,
    IN p_descripcion_falla TEXT,
    IN p_prioridad ENUM('baja', 'media', 'alta')
)
BEGIN
    DECLARE v_id_equipo INT;

    -- Obtener el equipo asignado al usuario (necesario por restricción NOT NULL en la tabla incidencia)
    SELECT `id_equipo` INTO v_id_equipo 
    FROM `equipo` 
    WHERE `id_usuario` = p_id_usuario 
    LIMIT 1;

    -- Validar que el usuario tenga un equipo asignado
    IF v_id_equipo IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: El usuario no tiene un equipo asignado para registrar la incidencia.';
    ELSE
        -- Insertar la incidencia respetando los valores automáticos solicitados
        INSERT INTO `incidencia` (
            `id_equipo`,
            `id_usuario_reporta`,
            `descripcion`,
            `prioridad`,
            `estado`,
            `fecha_creacion`
        ) VALUES (
            v_id_equipo,
            p_id_usuario,
            p_descripcion_falla,
            p_prioridad,
            'pendiente',
            NOW()
        );
    END IF;
END $$

DELIMITER ;
