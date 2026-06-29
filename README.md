# AI Support Platform

Monorepo de plataforma de soporte con IA. Gestionado con [Bun](https://bun.com) + [Turbo](https://turbo.build).

## Estructura

```
apps/
├── mcp-server      → Servidor MCP (@platform/mcp-server)
├── support-agent   → Agente de soporte IA
└── widget          → Widget de chat (@platform/widget)
packages/
├── core            → Lógica compartida (@platform/core)
└── db              → Capa de datos (@platform/db)
```

## Uso

```bash
bun install        # Instalar dependencias
bun run dev        # Levantar en modo desarrollo
bun run build      # Compilar
bun run type-check # Verificar tipos
```
