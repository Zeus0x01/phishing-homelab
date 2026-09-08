# Lab definition template

Each file in this directory is a `LabDefinition` validated by `src/lib/labs/schema.ts`.

```json
{
  "id": "short-kebab-id",
  "title": "Human-readable training title",
  "description": "What the trainee investigates.",
  "difficulty": "intro",
  "category": "email",
  "minutes": 20,
  "learningObjectives": ["Identify the sender domain"],
  "steps": [{
    "id": "step-1",
    "title": "Inspect the sender",
    "prompt": "What is suspicious?",
    "checkType": "choice",
    "choices": ["Spoofed domain", "Nothing"],
    "expected": ["Spoofed domain"],
    "points": 10
  }],
  "hints": ["Read the address after the @ sign."],
  "scoringRubric": [{ "id": "rubric-1", "description": "Spots the domain", "points": 10 }],
  "flags": [{ "id": "flag-1", "label": "Lookalike", "check": "contains", "value": "paypa1", "points": 10 }],
  "renderer": "email-analysis",
  "published": true,
  "emailSamples": []
}
```

An `emailSample` should provide `fromAddr`, `replyTo`, authentication results, raw headers/source, and explicit static URL metadata. Attachment hashes and redirect chains must be fictional fixture values. Do not add live credentials, real mailboxes, real secrets, or network callbacks.