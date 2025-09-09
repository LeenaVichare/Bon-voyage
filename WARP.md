# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
# Initial setup
npm install
cp .env.example .env
# Edit .env file with your configuration

# Start development environment with all services
docker-compose up -d
npm run dev
```

### Building and Testing
```bash
# Build the application
npm run build

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a single test file
npm run test -- --testPathPattern=auth.test.ts

# Run tests for specific module
npm run test -- --testPathPattern=src/api/auth
```

### Linting and Formatting
```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### Database Operations
```bash
# Run database migrations
npm run migrate

# Seed database with initial data
npm run seed

# Reset and reseed database (development)
npm run migrate && npm run seed
```

### Blockchain Development
```bash
# Deploy smart contracts to local network
npm run blockchain:deploy

# Run blockchain tests
npm run blockchain:test

# Deploy to specific network
hardhat deploy --network polygon-testnet
```

### Docker Operations
```bash
# Build Docker image
npm run docker:build

# Start development environment
npm run docker:dev

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f ml-service
```

## High-Level Architecture

### System Overview
This is a multi-service system for tourist safety monitoring with AI, blockchain, and real-time geofencing capabilities. The architecture follows a microservices pattern with the following core components:

**Main Application (Node.js/NestJS)**
- API Gateway and main business logic
- Real-time WebSocket connections for live tracking
- Authentication and authorization management
- Integration orchestration between services

**AI/ML Service (Python/Flask)**
- Threat detection and risk assessment algorithms  
- Behavioral pattern analysis for anomaly detection
- Runs on separate container for ML workloads
- Communicates via REST APIs and message queues

**Blockchain Service**
- Smart contracts for digital identity management
- Immutable travel history and safety records
- Privacy-preserving identity verification
- IPFS integration for distributed storage

**Database Architecture**
- PostgreSQL: Primary relational data (users, incidents, locations)
- MongoDB: Document storage for AI model data, logs, and analytics
- Redis: Session management, caching, and real-time data

### Key Service Integrations

**Government APIs**
- Aadhaar verification for identity validation
- Passport verification for international tourists
- DigiLocker integration for document storage
- Emergency services (Police, Ambulance, Fire Service)

**External Services**
- Google Maps/Places for location services
- Twilio for SMS/voice emergency communications
- Firebase for push notifications
- OpenAI/Hugging Face for NLP capabilities

**Communication Flow**
```
Mobile App -> API Gateway -> Business Logic Services -> AI/ML Service
     |              |              |                         |
     |              v              v                         v
WebSocket <-- Real-time Updates <-- Event Processing <-- Analysis Results
```

### Module Structure

**src/api/** - REST API endpoints and controllers
- Authentication routes and middleware
- User management and profile endpoints
- Location tracking and geofencing APIs
- Emergency alert and incident management
- Integration endpoints for external services

**src/ai/** - AI/ML service interfaces and models
- Risk assessment algorithms and scoring
- Behavioral pattern detection
- Threat classification models
- Anomaly detection pipelines

**src/blockchain/** - Web3 and smart contract integration
- Digital identity smart contracts
- Blockchain transaction management
- IPFS document storage and retrieval
- Wallet management and security

**src/geofencing/** - Location and geo-spatial services
- Dynamic safety zone creation and management
- Real-time location monitoring
- Geospatial data processing with PostGIS
- Integration with mapping services

**src/models/** - Data models and database schemas
- TypeORM entities for PostgreSQL
- Mongoose schemas for MongoDB
- Data validation and transformation
- Relationship definitions

**src/utils/** - Shared utilities and helpers
- Encryption and security functions
- Logging and monitoring utilities
- Communication helpers (SMS, email, push)
- File upload and processing utilities

### Environment Configuration

The system requires extensive configuration through environment variables:

**Critical Variables:**
- Database connections (PostgreSQL, MongoDB, Redis)
- API keys for Google Maps, OpenAI, Twilio
- Blockchain configuration (RPC URLs, private keys)
- JWT secrets and encryption keys
- Emergency service API endpoints

**Regional Configuration:**
- Specialized for Indian tourism (Northeast India focus)
- Multi-language support (13 Indian languages)
- Integration with Indian government services
- Currency and timezone settings for IST

### Development Workflow

**TypeScript Configuration:**
- Strict type checking enabled
- Path aliases configured for clean imports (@/api/, @/models/, etc.)
- Decorator support for NestJS
- Source maps and declaration files generated

**Testing Strategy:**
- Jest for unit and integration testing
- Separate test database configuration
- Coverage reports generated automatically
- Test files should follow *.test.ts or *.spec.ts naming

**Docker Development:**
- Multi-container setup with docker-compose
- Separate containers for each service (app, databases, ML service)
- Volume mounts for hot-reloading in development
- Monitoring stack (Prometheus, Grafana) included

### Key Architectural Decisions

**Hybrid Database Approach:**
- PostgreSQL for transactional, relational data
- MongoDB for flexible, document-based data (AI models, logs)
- Redis for high-performance caching and sessions

**Microservices Communication:**
- REST APIs for synchronous communication
- WebSocket connections for real-time updates
- RabbitMQ for asynchronous message processing
- Event-driven architecture for loose coupling

**Security Implementation:**
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- End-to-end encryption for sensitive data
- Blockchain for immutable audit trails

**Scalability Considerations:**
- Containerized services for horizontal scaling
- Load balancing capable architecture
- Database connection pooling
- Caching strategies at multiple levels

## Important Notes

- This system handles sensitive tourist data and requires GDPR compliance
- Emergency response features must be thoroughly tested
- Blockchain operations involve real cryptocurrency transactions in production
- AI/ML models require training data and periodic retraining
- Government API integrations may have rate limits and specific compliance requirements
- Real-time location tracking has significant battery and privacy implications
