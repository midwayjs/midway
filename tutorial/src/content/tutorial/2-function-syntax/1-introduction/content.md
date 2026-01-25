---
type: lesson
title: Introduction to Function Syntax
---

# Function Syntax

Midway also supports a functional programming style using Hooks.

## Function Handler

```typescript
import { useContext } from '@midwayjs/hooks';

export default async () => {
  const ctx = useContext();
  return {
    message: 'Hello Midway Hooks!'
  };
};
```
