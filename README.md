# Book Manager API

A comprehensive bookstore management system built with NestJS, featuring role-based authentication, store management, and book inventory tracking.

## Project Overview

This project is a RESTful API that manages bookstores, their inventory, and users. It provides a robust system for:
- Managing multiple bookstores
- Book inventory tracking
- User management with role-based access control
- Secure authentication system

## Database Structure

The system uses a relational database with the following main entities:

![Database Schema](db_diagram.png)

### Entity Descriptions:

- **user_entity**: 
  - Manages user accounts and authentication
  - Stores email, password, and role information
  - Roles can be admin, store_manager, or user. Permissions vary according to these roles.

- **bookstore_entity**: 
  - Stores bookstore information (name, address, phone)
  - Contains store management details

- **book_entity**: 
  - Contains book details (title, author, price, description)
  - Manages book metadata and pricing information

- **store_manager_store_entity**: 
  - Links store managers (users) to their assigned bookstores
  - Tracks which stores are managed by users with store manager permissions. A manager can manage multiple stores.
  - Manages the many-to-many relationship between users and stores

- **bookstore_book_entity**: 
  - Tracks book inventory for each bookstore
  - Manages quantity of books available in each store

## Authentication & Authorization

The system implements a role-based access control (RBAC) with the following roles:
- **Admin**: Full system access
- **Store Manager**: Can manage assigned bookstore inventory
- **Customer**: Can view books and make purchases

Authentication is handled via JWT tokens with secure password hashing. User roles and associated store information are cached in Redis.
This information is cached when the program starts. The cache is updated when user roles and store relationships change. The reason for not including
role and associated store information in the JWT is that if a user's role or associated store information is updated, the user would need to log in again,
which would negatively impact the user experience.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL
- Redis
- Make (for Makefile usage)

## Quick Start

The project includes Docker configuration for easy deployment. 

1. Clone the repository:
```bash
git clone <repository-url>
cd book_manager
```

2. Setup the project and install dependencies:
```bash
make setup
```

3. Build and start all services:
```bash
make rebuild
```

4. Show logs of all services in docker compose:
```bash
make logs
```

## Seed Data

The project includes seed data for testing. When the database is empty and the API is first launched, the database will be seeded. An admin user, regular users, and store information will be seeded. You can use the following admin credentials for testing:

- email: admin@bookmanager.com
- password: admin123

## Makefile Commands

The project includes various Makefile commands for convenience:

```bash
make test          # Run tests
make test-watch    # Run tests in watch mode
make test-file     # Run a specific test file
make test-coverage # Run tests with coverage
make clean         # Clean up the project
make setup         # Setup the project
make rebuild       # Build and start all services
make logs          # Show logs
make ps            # Show running containers
make stop          # Stop all services
make start         # Start all services
make logs-api      # Show api logs
```

## API Documentation

The API documentation is available at `/api#/` when running the application. It provides detailed information about all available endpoints and their usage.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Environment Variables

The project uses environment variables for configuration. A template file `.env.template` is provided in the root directory. Copy this file to `.env` and update the values according to your environment:

