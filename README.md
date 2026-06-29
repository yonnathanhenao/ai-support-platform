# AI Support Platform

AI-powered support platform monorepo. Managed with [Bun](https://bun.com) + [Turbo](https://turbo.build).

## Structure

```
apps/
├── mcp-server      → MCP server (@platform/mcp-server)
├── support-agent   → AI support agent
└── widget          → Chat widget (@platform/widget)
packages/
├── core            → Shared logic (@platform/core)
└── db              → Data layer (@platform/db)
```

## Usage

```bash
bun install        # Install dependencies
bun run dev        # Start in development mode
bun run build      # Build
bun run type-check # Type-check
```
