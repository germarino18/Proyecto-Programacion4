## ADDED Requirements

### Requirement: User registration
The system SHALL allow new users to register with email and password. The system MUST assign the CLIENT role automatically upon registration.

#### Scenario: Successful registration
- **WHEN** a user submits a POST /api/v1/auth/register with valid email and password
- **THEN** the system creates a new Usuario record with CLIENT role and returns 201 with user data (excluding password hash)

#### Scenario: Duplicate email
- **WHEN** a user submits registration with an email that already exists
- **THEN** the system returns 409 Conflict with an error message

### Requirement: User login
The system SHALL authenticate users via email/password and issue a JWT access token as an HttpOnly cookie.

#### Scenario: Successful login
- **WHEN** a user submits POST /api/v1/auth/login with valid email and password
- **THEN** the system sets an HttpOnly cookie named "access_token" with a JWT (30 min expiry) and returns user data

#### Scenario: Invalid credentials
- **WHEN** a user submits POST /api/v1/auth/login with incorrect password
- **THEN** the system returns 401 Unauthorized

### Requirement: Get current user
The system SHALL expose a GET /api/v1/auth/me endpoint that returns the authenticated user's data.

#### Scenario: Authenticated request
- **WHEN** a request is made to GET /api/v1/auth/me with a valid JWT cookie
- **THEN** the system returns the user's profile including id, nombre, email, and roles

#### Scenario: Unauthenticated request
- **WHEN** a request is made to GET /api/v1/auth/me without a valid JWT cookie
- **THEN** the system returns 401 Unauthorized

### Requirement: User logout
The system SHALL allow users to logout by clearing the JWT cookie.

#### Scenario: Successful logout
- **WHEN** a user submits POST /api/v1/auth/logout
- **THEN** the system clears the "access_token" cookie and returns 200 OK
