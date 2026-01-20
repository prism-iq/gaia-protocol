# Flow Language

> "Flow reads like English, compiles to C++"

## Overview

Flow is a programming language that transpiles to C++17/20. Natural syntax, native performance.

## Features

- **Natural syntax** - Reads like English
- **Zero runtime** - Pure C++ output
- **Type inference** - Smart defaults
- **Immutable by default** - Explicit mutability

## Quick Example

```flow
to greet someone:
    say "Hello, {someone}!"

to start:
    greet "World"
```

Compiles to native C++ binary.

## Usage

```bash
flow run file.flow      # Compile and run
flow build file.flow    # Compile only
flow show file.flow     # Show generated C++
```

## Requirements

- Go 1.21+
- g++ or clang++

## License

MIT + The Code
