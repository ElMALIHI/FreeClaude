# Contributing to Claude OpenAI Wrapper

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start Redis (or use `docker-compose up redis`)
5. Run the server: `npm run dev`

## Project Structure

```
claude-openai-wrapper/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
├── test.js            # Test script
└── README.md          # Documentation
```

## Code Style

- Use ES6+ features
- Use async/await for asynchronous operations
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

## Testing

Before submitting a PR, test your changes:

```bash
# Generate an API key
curl -X POST http://localhost:3000/v1/admin/generate_key \
  -H "x-master-key: your_master_key"

# Run tests
node test.js YOUR_API_KEY
```

## Submitting Changes

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages: `git commit -m "Add: description"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

## Commit Message Format

- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for improvements
- `Docs:` for documentation
- `Refactor:` for code refactoring

## Areas for Contribution

- Additional OpenAI-compatible endpoints
- Enhanced error handling
- Rate limiting improvements
- Monitoring and metrics
- Documentation improvements
- Test coverage
- Performance optimizations

## Questions?

Open an issue for questions or discussions!
