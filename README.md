# ChatBotPlatform

A comprehensive, enterprise-grade chatbot platform with multi-user support, JWT authentication, PostgreSQL database, and integrated RAG engine for document-based question answering.

## Features

- � **Multi-User Support**: Hierarchical user roles (admin/manager/user) with access control
- 🔐 **JWT Authentication**: Secure token-based authentication with refresh tokens
- 🗄️ **PostgreSQL Database**: Robust data persistence with async SQLAlchemy
- 📄 **Document Processing**: Upload and process PDF, TXT, MD, and DOCX files
- 🧠 **RAG Engine**: Integrated retrieval-augmented generation with FAISS vector search
- 🤖 **Bot Management**: Create and manage multiple chatbots per user
- 💬 **Real-time Chat**: Conversational AI with citation support
- 🐳 **Docker Ready**: Complete containerization with docker-compose
- � **API Documentation**: Automatic OpenAPI/Swagger documentation

## Architecture

```
ChatBotPlatform/
├── app/                    # FastAPI application
│   ├── auth/              # Authentication & JWT
│   ├── bots/              # Bot management
│   ├── chat/              # Chat conversations
│   ├── documents/         # Document upload/processing
│   ├── rag_engine/        # RAG pipeline integration
│   ├── users/             # User management
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   └── core/              # Configuration & utilities
├── data/                  # Application data
├── alembic/               # Database migrations
└── docker-compose.yml     # Multi-service setup
```

## Quick Start

### 1. Environment Setup

```bash
# Clone or navigate to the project
cd ChatBotPlatform

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/chatbot_db

# JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here

# Application
DEBUG=true
```

### 3. Database Setup

```bash
# Run database migrations
make db-upgrade

# Or manually with alembic
alembic upgrade head
```

### 4. Start the Application

```bash
# Development mode
python run.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://127.0.0.1:8000/` for the web interface and `http://127.0.0.1:8000/docs` for API documentation.

## Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

Services include:
- **FastAPI App**: Main application on port 8000
- **PostgreSQL**: Database on port 5432
- **pgAdmin**: Database admin interface on port 5050

## API Usage

### Authentication

```bash
# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password"

# Use access token for authenticated requests
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:8000/users/me"
```

### Bot Management

```bash
# Create a bot
curl -X POST "http://localhost:8000/bots/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Assistant", "is_public": false}'

# Upload documents
curl -X POST "http://localhost:8000/documents/upload/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### Chat

```bash
# Send a message
curl -X POST "http://localhost:8000/chat/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is machine learning?", "bot_id": 1}'
```

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Short-lived access tokens with refresh mechanism
- **Role-Based Access**: Hierarchical permissions (admin/manager/user)
- **Input Validation**: Pydantic schemas for all API inputs
- **CORS Protection**: Configurable cross-origin resource sharing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Document Processing Pipeline

1. **Ingest**: Extract text from web pages or PDFs
2. **Chunk**: Split text into semantically meaningful chunks
3. **Embed**: Generate vector embeddings for each chunk
4. **Store**: Save embeddings in FAISS vector database
5. **Search**: Find relevant chunks for user queries
6. **Generate**: Use OpenAI GPT to generate contextual responses

## Security

- API keys are encrypted at rest using Fernet symmetric encryption
- Encryption keys are stored separately from encrypted data
- No plain-text API keys in configuration files
- Environment variables used for all sensitive data

## Development

- **Backend**: FastAPI with automatic OpenAPI documentation
- **Vector Store**: FAISS for local, fast similarity search
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: OpenAI GPT-4o-mini for response generation
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)

## Troubleshooting

**Server won't start on Windows**: Try using Docker or WSL for deployment.

**API key errors**: Ensure your encryption key is properly configured in `.env`.

**No responses**: Check that documents have been ingested and embedded.