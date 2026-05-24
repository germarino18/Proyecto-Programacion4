## ADDED Requirements

### Requirement: Unit of Work para manejo transaccional
El sistema SHALL implementar un patrón Unit of Work (UoW) que encapsule las operaciones de base de datos en transacciones atómicas.

#### Scenario: Commit exitoso
- **WHEN** se ejecutan múltiples operaciones dentro de un contexto UoW sin errores
- **THEN** el sistema hace commit de todas las operaciones al salir del contexto

#### Scenario: Rollback automático en error
- **WHEN** ocurre una excepción dentro del contexto UoW
- **THEN** el sistema hace rollback automático de todas las operaciones al salir del contexto

#### Scenario: Commit manual
- **WHEN** se llama explícitamente a `uow.commit()`
- **THEN** el sistema persiste los cambios inmediatamente

#### Scenario: Rollback manual
- **WHEN** se llama explícitamente a `uow.rollback()`
- **THEN** el sistema descarta los cambios no persistidos

### Requirement: UoW expone session para queries directas
El sistema SHALL exponer la propiedad `session` en UnitOfWork para permitir consultas directas cuando sea necesario.

#### Scenario: Query a través de UoW
- **WHEN** se necesita ejecutar un `session.exec(select(...))`
- **THEN** se accede a `uow.session` para obtener la sesión activa

### Requirement: UoW como dependencia de servicios
El sistema SHALL inyectar UnitOfWork en los servicios a través del constructor.

#### Scenario: Servicio recibe UoW
- **WHEN** se instancia un servicio
- **THEN** recibe una instancia de UnitOfWork para sus operaciones

#### Scenario: Operación multi-entidad atómica
- **WHEN** se crea un producto y se le asignan categorías e ingredientes
- **THEN** todas las operaciones se ejecutan dentro del mismo UoW
- **THEN** si falla alguna, todas se revierten
