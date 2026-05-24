## ADDED Requirements

### Requirement: User list with pagination and filters
The system SHALL provide a GET /api/v1/admin/usuarios endpoint available to ADMIN role only, with pagination and filter by role.

#### Scenario: List all users as admin
- **WHEN** an ADMIN requests GET /api/v1/admin/usuarios
- **THEN** the system returns a paginated list of all users

#### Scenario: Filter by role
- **WHEN** an ADMIN requests GET /api/v1/admin/usuarios?rol=CLIENT
- **THEN** the system returns only users with the CLIENT role

#### Scenario: Non-admin cannot access
- **WHEN** a non-ADMIN user requests GET /api/v1/admin/usuarios
- **THEN** the system returns 403 Forbidden

### Requirement: User update
The system SHALL allow ADMIN to update user details (nombre, email, active status).

#### Scenario: Update user
- **WHEN** an ADMIN submits PATCH /api/v1/admin/usuarios/{id} with valid data
- **THEN** the system updates the user record and returns the updated user

### Requirement: Role assignment
The system SHALL allow ADMIN to assign or remove roles from users.

#### Scenario: Assign role
- **WHEN** an ADMIN submits POST /api/v1/admin/usuarios/{id}/roles with a role code
- **THEN** the system creates a UsuarioRol record and returns the updated user roles

#### Scenario: Remove role
- **WHEN** an ADMIN submits DELETE /api/v1/admin/usuarios/{id}/roles/{rol_codigo}
- **THEN** the system removes the UsuarioRol record
