#!/bin/bash

# Pre-commit hook for Monarch Legal Platform
# This script runs security checks before each commit

echo "🔒 Running security checks..."

# Check for secrets and API keys
echo "🔍 Checking for secrets..."
if grep -r "sk-\|api_key\|secret\|password\|token" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git --exclude=".env.example" .; then
    echo "❌ Found potential secrets in code! Please remove them before committing."
    exit 1
fi

# Check for .env files
echo "🔍 Checking for .env files..."
if find . -name ".env" -o -name ".env.local" -o -name ".env.production" | grep -v node_modules | head -1; then
    echo "❌ Found .env files! These should not be committed."
    exit 1
fi

# Check for premium/enterprise code
echo "🔍 Checking for premium code..."
if find . -path "*/premium/*" -o -path "*/enterprise/*" -o -path "*/business-model/*" | grep -v node_modules | grep -v .git | head -1; then
    echo "❌ Found premium/enterprise code! This should not be in open source."
    exit 1
fi

# Check for private keys
echo "🔍 Checking for private keys..."
if find . -name "*.key" -o -name "*.pem" -o -name "*.p12" | grep -v node_modules | head -1; then
    echo "❌ Found private keys! These should not be committed."
    exit 1
fi

# Run npm audit
echo "🔍 Running npm audit..."
if ! npm audit --audit-level=high; then
    echo "❌ npm audit found high severity vulnerabilities!"
    exit 1
fi

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
if ! npx tsc --noEmit; then
    echo "❌ TypeScript compilation failed!"
    exit 1
fi

# Run tests
echo "🔍 Running tests..."
if ! npm test -- --passWithNoTests; then
    echo "❌ Tests failed!"
    exit 1
fi

# Check for AGPL-3 license compliance
echo "🔍 Checking license compliance..."
if [ ! -f "LICENSE" ]; then
    echo "❌ LICENSE file missing!"
    exit 1
fi

if ! grep -q "AGPL" LICENSE; then
    echo "❌ License is not AGPL-3!"
    exit 1
fi

echo "✅ All security checks passed!"
echo "🚀 Ready to commit!"