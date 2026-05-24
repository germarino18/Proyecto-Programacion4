## ADDED Requirements

### Requirement: CRUD direcciones de entrega
The system SHALL allow authenticated users to create, read, update, and soft-delete their delivery addresses via /api/v1/direcciones.

#### Scenario: Create address
- **WHEN** an authenticated user submits POST /api/v1/direcciones with valid address data
- **THEN** the system creates a DireccionEntrega for that user and returns 201

#### Scenario: List own addresses
- **WHEN** an authenticated user requests GET /api/v1/direcciones
- **THEN** the system returns only that user's non-deleted addresses

#### Scenario: Update address
- **WHEN** an authenticated user submits PUT /api/v1/direcciones/{id} for their own address
- **THEN** the system updates the address fields

#### Scenario: Cannot update another user's address
- **WHEN** a user tries to update an address belonging to another user
- **THEN** the system returns 403 Forbidden

### Requirement: Primary address
The system SHALL allow one address per user to be marked as "principal". Setting a new primary SHALL unset the previous one.

#### Scenario: Set address as principal
- **WHEN** a user submits PATCH /api/v1/direcciones/{id}/principal
- **THEN** that address becomes the user's primary address and any previous primary is unset

### Requirement: Address fields
Each DireccionEntrega SHALL have: alias (e.g., "Casa", "Trabajo"), direccion (street address), ciudad, region, codigo_postal, es_principal.

#### Scenario: Create with all fields
- **WHEN** a user creates an address with all required fields
- **THEN** the address is stored with alias, direccion, ciudad, region, codigo_postal, and es_principal=false
