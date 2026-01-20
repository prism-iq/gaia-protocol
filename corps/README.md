# Corps - Biological Systems

> Polyglot organ architecture

## Organs

| Organ | Language | Port | Function |
|-------|----------|------|----------|
| cytoplasme | Python | 8091 | LLM brain (Claude API) |
| membrane | Go | 8092 | Gateway I/O, routing |
| quantique | Rust | 8095 | Post-quantum crypto (Kyber + Dilithium) |
| synapse | Node.js | 3001 | Async events, SSE |
| mitochondrie | C++ | 8096 | Metrics, energy |
| anticorps | Nim | 8097 | Security, validation |
| myeline | Zig | 8098 | Ultra-fast cache |
| hypnos | Python | 8099 | Dreams, consolidation |

## Fluids

| System | Function |
|--------|----------|
| sang | Circulation, fetch fresh data |
| bile | Digestion, decompose into nutrients |
| pus | Immune system, inflammation |
| flore | Microbiome, symbiotic patterns |
| lymphe | Garbage collection, detox |

## Architecture

```
Client → membrane:8092 → cytoplasme:8091 → Claude API
              ↓
        quantique:8095 (sign/verify)
              ↓
        mitochondrie:8096 (metrics)
```

## License

MIT + The Code
