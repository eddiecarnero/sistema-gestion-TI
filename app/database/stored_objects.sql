-- =============================================================================
-- PROCEDIMIENTOS ALMACENADOS Y FUNCIONES - SOPORTE FISI
-- =============================================================================

USE soportefisi;

-- 1. Eliminar objetos previos si existen para evitar conflictos
DROP PROCEDURE IF EXISTS sp_asignar_equipo;
DROP PROCEDURE IF EXISTS sp_registrar_seguimiento;
DROP FUNCTION IF EXISTS fn_incidencias_asignadas;
DROP FUNCTION IF EXISTS fn_incidencias_resueltas;
DROP FUNCTION IF EXISTS fn_horas_invertidas;

DELIMITER $$

-- 2. Procedimiento Almacenado: sp_asignar_equipo
-- Termina cualquier asignación activa del equipo y registra la nueva asignación de forma transaccional.
CREATE PROCEDURE sp_asignar_equipo(
    IN p_id_equipo INT,
    IN p_id_usuario INT,
    IN p_id_ambiente INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        -- Terminar asignación activa anterior
        UPDATE asignacion_historial 
        SET fecha_fin = NOW() 
        WHERE id_equipo = p_id_equipo AND fecha_fin IS NULL;

        -- Insertar la nueva asignación
        INSERT INTO asignacion_historial (id_equipo, id_usuario, id_ambiente, fecha_inicio)
        VALUES (p_id_equipo, p_id_usuario, p_id_ambiente, NOW());
    COMMIT;
END$$

-- 3. Procedimiento Almacenado: sp_registrar_seguimiento
-- Registra el seguimiento y actualiza el estado del ticket.
-- Si el técnico responsable es un practicante, el estado final se fuerza a 'por_confirmar' si se intenta resolver o cerrar.
CREATE PROCEDURE sp_registrar_seguimiento(
    IN p_id_incidencia INT,
    IN p_id_tecnico INT,
    IN p_diagnostico TEXT,
    IN p_trabajo_realizado TEXT,
    IN p_horas_invertidas DECIMAL(4,2),
    IN p_id_componente_cambiado INT,
    IN p_estado_incidencia VARCHAR(20)
)
BEGIN
    DECLARE v_rango VARCHAR(50);
    DECLARE v_final_estado VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Obtener el rol del técnico
    SELECT r.nombre INTO v_rango
    FROM tecnico t
    JOIN rango_tecnico r ON t.id_rango = r.id_rango
    WHERE t.id_tecnico = p_id_tecnico;

    -- Determinar estado final
    SET v_final_estado = p_estado_incidencia;
    IF v_rango = 'practicante' AND (p_estado_incidencia = 'resuelta' OR p_estado_incidencia = 'cerrada') THEN
        SET v_final_estado = 'por_confirmar';
    END IF;

    START TRANSACTION;
        -- Insertar seguimiento técnico
        INSERT INTO seguimiento_incidencia (id_incidencia, id_tecnico, diagnostico, trabajo_realizado, horas_invertidas, id_componente_cambiado, fecha)
        VALUES (p_id_incidencia, p_id_tecnico, p_diagnostico, p_trabajo_realizado, p_horas_invertidas, p_id_componente_cambiado, NOW());

        -- Actualizar incidencia
        UPDATE incidencia
        SET estado = v_final_estado,
            fecha_resolucion = IF(v_final_estado IN ('resuelta', 'cerrada'), NOW(), NULL)
        WHERE id_incidencia = p_id_incidencia;
    COMMIT;
END$$

-- 4. Función Almacenada: fn_incidencias_asignadas
-- Retorna el total de incidencias asignadas a un técnico.
CREATE FUNCTION fn_incidencias_asignadas(p_id_tecnico INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM incidencia WHERE id_tecnico_recibe = p_id_tecnico;
    RETURN v_count;
END$$

-- 5. Función Almacenada: fn_incidencias_resueltas
-- Retorna el total de incidencias resueltas o cerradas por un técnico.
CREATE FUNCTION fn_incidencias_resueltas(p_id_tecnico INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM incidencia WHERE id_tecnico_recibe = p_id_tecnico AND estado IN ('resuelta', 'cerrada');
    RETURN v_count;
END$$

-- 6. Función Almacenada: fn_horas_invertidas
-- Retorna la sumatoria de horas invertidas en seguimientos por un técnico.
CREATE FUNCTION fn_horas_invertidas(p_id_tecnico INT) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_hours DECIMAL(10,2);
    SELECT IFNULL(SUM(horas_invertidas), 0) INTO v_hours FROM seguimiento_incidencia WHERE id_tecnico = p_id_tecnico;
    RETURN v_hours;
END$$

DELIMITER ;

-- 7. Recreación de vista_metricas_personal usando las funciones almacenadas para optimizar cálculos
CREATE OR REPLACE VIEW vista_metricas_personal AS
SELECT 
    t.id_tecnico,
    t.nombres,
    t.apellidos,
    r.nombre AS rango,
    fn_incidencias_asignadas(t.id_tecnico) AS total_incidencias_asignadas,
    fn_incidencias_resueltas(t.id_tecnico) AS total_incidencias_resueltas,
    fn_horas_invertidas(t.id_tecnico) AS total_horas_invertidas,
    CASE 
        WHEN fn_incidencias_resueltas(t.id_tecnico) > 0 
        THEN ROUND(fn_horas_invertidas(t.id_tecnico) / fn_incidencias_resueltas(t.id_tecnico), 2)
        ELSE 0.00
    END AS promedio_horas_por_incidencia,
    (fn_incidencias_asignadas(t.id_tecnico) - fn_incidencias_resueltas(t.id_tecnico)) AS incidencias_pendientes
FROM tecnico t
JOIN rango_tecnico r ON t.id_rango = r.id_rango;
