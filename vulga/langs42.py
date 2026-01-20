# -*- coding: utf-8 -*-
"""
42 langages
no cap
"""

LANGS = [
    "cpp", "c", "rust", "go", "zig", "nim",
    "python", "ruby", "perl", "lua", "php",
    "java", "kotlin", "scala", "groovy",
    "javascript", "typescript", "coffeescript",
    "haskell", "ocaml", "fsharp", "erlang", "elixir",
    "lisp", "scheme", "clojure", "racket",
    "fortran", "cobol", "ada", "pascal",
    "swift", "objective-c", "dart",
    "julia", "r", "matlab",
    "prolog", "mercury",
    "assembly", "wasm",
    "sql", "bash"
]

assert len(LANGS) >= 42, f"need 42, got {len(LANGS)}"

print(f"langs: {len(LANGS)}")
for i, l in enumerate(LANGS):
    print(f"{i+1:2d}. {l}")
