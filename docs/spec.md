## 1. Overview

- The In-Memory Data Engine is a high-performance, in-process data management system designed to simulate core backend data handling without external persistence.

- The system follows a strict 4-layer architecture to enforce separation of concerns and predictable behavior. It is optimized for:

# Constant-time (O(1)) primary key operations
# Deterministic validation and error handling
# Clean abstraction between business logic and storage

- This system serves as a foundational backend component for higher-level API systems.

## 2. Supported Entities
# User
id: string (unique, primary key)
name: string (required, non-empty)
email: string (required, unique, valid format)
# Task
id: string (unique, primary key)
title: string (required, non-empty)
status: enum (pending | in-progress | completed)
userId: string (must reference an existing User)
# Product
id: string (unique, primary key)
name: string (required, non-empty)
price: number (> 0)

## 3. ID Strategy (Production-Safe)

- To ensure system integrity and avoid collisions:

# Default Mode (Recommended)
- System generates UUID v4 for all records
- Guarantees uniqueness without client trust dependency
# Override Mode (Controlled Use Only)
- Client-provided IDs allowed only when explicitly enabled
# Use cases:
- Data migration
- External system synchronization
- Still requires uniqueness validation
# Storage Rule
- All IDs are stored as strings
- No mixed ID types allowed

## 4. System Architecture Layers

- The system enforces strict separation of concerns:

# 1. Controller Layer (app.js)
- Handles CLI input/output
- Formats responses
- No business logic
# 2. Service Layer (dataService.js) ❗ Core Layer
- Orchestrates all operations
- Applies business rules:
- e.g., validating userId before creating a Task
# Calls:
- Validation Layer
- Repository Layer
- Returns standardized Result objects
## 3. Repository Layer (dataRepository.js)
- Handles raw data storage using Map
# Responsibilities:
- set, get, delete, list
- No awareness of domain logic (User, Task, etc.)
# 4. Validation Layer (validators.js)
- Enforces schema rules
# Handles:
- Required fields
# Type validation
- Format checks
- Rejects invalid input before it reaches the Repository

## 5. Unified Error Handling (Structured Response Model)

- All Service Layer methods must return a standard Result Object:

{
  "success": boolean,
  "data": object | null,
  "error": {
    "code": "ENTITY_NOT_FOUND" | "VALIDATION_FAILED" | "DUPLICATE_ID" | "INVALID_REFERENCE",
    "message": "string"
  } | null
}
# Rules:
- No raw exceptions returned to the caller
# All errors must be:
- Predictable
- Typed (via code)
- Human-readable (message)

## 6. Execution Model & Concurrency
# Execution Model
- Runs on Node.js single-threaded event loop
# Write Safety
- All operations are synchronous
- No async I/O or parallel writes in Week 1
# Concurrency Assumption
- No locking or race-condition handling required
- System assumes sequential execution

## 7. Performance Matrix
# Operation	Complexity	Notes
- Insert    O(1)	Direct Map assignment
- Get by ID O(1) Key lookup
- Update    O(1)	Lookup + object merge
- Delete	O(1)	Key deletion
- Search	O(n)	Linear scan
- Filter	O(n)	Linear scan

## 8. Query Behavior
- Filter (Strict Matching)
- Matches exact field values
# Example:
- filter({ status: "pending" })
- Search (Fuzzy Matching)
# Case-insensitive partial matching
- Applies to predefined searchable fields:
User: name, email
Task: title
Product: name

## 9. Data Consistency Rules
- No Cascading Deletes
- Deleting a User does NOT delete related Tasks
# Reference Integrity
- Creating a Task requires a valid userId
If invalid:
→ return INVALID_REFERENCE error
# Orphan Handling
- Orphaned records are allowed
# Responsibility lies with:
- Service layer (future)
-Client logic

## 10. Constraints
- Must handle 1,000–10,000 records per entity
- Must maintain consistent response structure
- Must reject all invalid inputs before storage
- Must avoid mixing business logic in Repository layer.