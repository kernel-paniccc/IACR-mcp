#!/usr/bin/env python3
"""Minimal repository-local validation for distributable skills."""

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []

for skill in sorted((ROOT / "skills").glob("*/SKILL.md")):
    text = skill.read_text(encoding="utf-8")
    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        errors.append(f"{skill}: missing YAML frontmatter")
        continue
    frontmatter = text.split("---", 2)[1]
    for field in ("name", "description"):
        if not re.search(rf"^{field}:\s*\S", frontmatter, re.MULTILINE):
            errors.append(f"{skill}: missing {field}")
    if "TODO" in text:
        errors.append(f"{skill}: unfinished TODO")
    for target in re.findall(r"\[[^]]+\]\((references/[^)]+)\)", text):
        if not (skill.parent / target).is_file():
            errors.append(f"{skill}: missing reference {target}")

if errors:
    print("\n".join(errors), file=sys.stderr)
    raise SystemExit(1)

print(f"Validated {len(list((ROOT / 'skills').glob('*/SKILL.md')))} skills")
