# Administrador del Sistema

Hereda todos los casos de uso del *Técnico* (y por ende del Practicante), además de los siguientes:

## CRUD General

### Gestión completa del sistema
Tiene acceso a operaciones de crear, leer, actualizar y eliminar (CRUD) sobre todos los módulos del sistema, a excepción del módulo de auditoría.

Debe poder hacer CRUD sobre la tabla usuarios, tecnicos, asignar roles, etc. (NO DEBE PODER CREAR OTRO ADMINISTRADOR)

## Auditoría

### Ver Auditoría
Acceso de solo lectura a la tabla de auditoría, donde se registran automáticamente las acciones realizadas por los usuarios en el sistema.

## 6. Solicitudes

### 6.2. Aceptar, Denegar y Asignar Solicitudes
Permite al administrador revisar las solicitudes entrantes y tomar una acción: aceptarlas, denegarlas o asignarlas a un técnico o practicante para su atención.

## 5. Gestión de Incidencias

### 5.7. Asignar Incidencias
Permite al administrador asignar tickets de incidencia a técnicos o practicantes específicos según disponibilidad o especialidad.

## 7. Métricas y Reportes

### 7.1. Ver Métricas del Personal
Permite visualizar indicadores de rendimiento y actividad de todos los técnicos y practicantes, tales como incidencias resueltas, tiempos de atención y carga de trabajo actual.