# lambdas

To install dependencies:

```bash
bun i
```

Formatting and linting the code:

```bash
# Check code formatting
bun run format

# Fix code formatting
bun run format --write

# Lint the code
bun run lint

# Fix lint errors
bun run lint --apply

# Check for TypeScript errors
bunx tsc

```

Building the code for deployment:

```bash
# Clean build artifacts
bun run clean

# Compile lambda into js
bun run build

# Zip build artifacts for AWS upload
bun run zip

# Clean and bundle compiled code for AWS upload
bun run bundle
```

This project was created using `bun init` in bun v1.0.30. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
