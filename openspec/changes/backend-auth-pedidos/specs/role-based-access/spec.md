## ADDED Requirements

### Requirement: Role catalog
The system SHALL have a Rol catalog with four predefined roles: ADMIN, STOCK, PEDIDOS, CLIENT. The PK SHALL be the role code (VARCHAR).

#### Scenario: Seed creates roles
- **WHEN** the seed runs for the first time
- **THEN** the system creates the four roles with their codes and descriptions

#### Scenario: Seed is idempotent
- **WHEN** the seed runs a second time
- **THEN** the system does NOT duplicate the role records

### Requirement: User-role assignment
The system SHALL support many-to-many relationship between Usuario and Rol via UsuarioRol table.

#### Scenario: Assign role to user
- **WHEN** a UsuarioRol record is created linking a user to a role
- **THEN** the user inherits all capabilities of that role

### Requirement: Role-based endpoint protection
The system SHALL provide injectable FastAPI dependencies to protect endpoints by required role.

#### Scenario: Admin-only endpoint
- **WHEN** a non-ADMIN user requests an endpoint with require_role("ADMIN")
- **THEN** the system returns 403 Forbidden

#### Scenario: Multiple allowed roles
- **WHEN** a user with any of the allowed roles requests an endpoint with require_role("ADMIN", "PEDIDOS")
- **THEN** the system allows the request

### Requirement: Default admin seed user
The system SHALL create a default admin user on seed: admin@store.com / admin1234 with ADMIN role.

#### Scenario: Default admin exists after seed
- **WHEN** the seed completes
- **THEN** there is a Usuario with email admin@store.com and the ADMIN role assigned
