#!/bin/bash

# Anonymize sensitive personal data in Monarch Legal Platform
# Replace real case data with generic composite examples

echo "🔒 Anonymizing sensitive personal data..."

# Function to replace in files
replace_in_files() {
    local search="$1"
    local replace="$2"
    local file_pattern="$3"
    
    echo "Replacing '$search' with '$replace' in $file_pattern files..."
    find . -name "$file_pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" -exec sed -i.bak "s/$search/$replace/g" {} \;
}

# Personal Information
replace_in_files "King Yasin Ibrahim-Ally" "Lars Andersen" "*.ts"
replace_in_files "King Yasin Ibrahim-Ally" "Lars Andersen" "*.tsx"
replace_in_files "King Yasin Ibrahim-Ally" "Lars Andersen" "*.js"
replace_in_files "King Yasin Ibrahim-Ally" "Lars Andersen" "*.md"

replace_in_files "KING YASIN IBRAHIM-ALLY" "LARS ANDERSEN" "*.ts"
replace_in_files "KING YASIN IBRAHIM-ALLY" "LARS ANDERSEN" "*.tsx"
replace_in_files "KING YASIN IBRAHIM-ALLY" "LARS ANDERSEN" "*.js"
replace_in_files "KING YASIN IBRAHIM-ALLY" "LARS ANDERSEN" "*.md"

# Address Information
replace_in_files "Bolstadhagen 26" "Storgata 15" "*.ts"
replace_in_files "Bolstadhagen 26" "Storgata 15" "*.tsx"
replace_in_files "Bolstadhagen 26" "Storgata 15" "*.js"
replace_in_files "Bolstadhagen 26" "Storgata 15" "*.md"

replace_in_files "3028 DRAMMEN" "0150 OSLO" "*.ts"
replace_in_files "3028 DRAMMEN" "0150 OSLO" "*.tsx"
replace_in_files "3028 DRAMMEN" "0150 OSLO" "*.js"
replace_in_files "3028 DRAMMEN" "0150 OSLO" "*.md"

# Case References
replace_in_files "PV20955-68" "INS20240001" "*.ts"
replace_in_files "PV20955-68" "INS20240001" "*.tsx"
replace_in_files "PV20955-68" "INS20240001" "*.js"
replace_in_files "PV20955-68" "INS20240001" "*.md"

replace_in_files "202504176" "20240001" "*.ts"
replace_in_files "202504176" "20240001" "*.tsx"
replace_in_files "202504176" "20240001" "*.js"
replace_in_files "202504176" "20240001" "*.md"

# Company Information
replace_in_files "DNB Livsforsikring AS" "Nordic Insurance Group" "*.ts"
replace_in_files "DNB Livsforsikring AS" "Nordic Insurance Group" "*.tsx"
replace_in_files "DNB Livsforsikring AS" "Nordic Insurance Group" "*.js"
replace_in_files "DNB Livsforsikring AS" "Nordic Insurance Group" "*.md"

replace_in_files "Arve Betten" "Erik Hansen" "*.ts"
replace_in_files "Arve Betten" "Erik Hansen" "*.tsx"
replace_in_files "Arve Betten" "Erik Hansen" "*.js"
replace_in_files "Arve Betten" "Erik Hansen" "*.md"

# Email addresses
replace_in_files "test@monarchlegal.no" "demo@example.com" "*.ts"
replace_in_files "test@monarchlegal.no" "demo@example.com" "*.tsx"
replace_in_files "test@monarchlegal.no" "demo@example.com" "*.js"
replace_in_files "test@monarchlegal.no" "demo@example.com" "*.md"

# Generic Norwegian names for other references
replace_in_files "Aly" "Lars" "*.ts"
replace_in_files "Aly" "Lars" "*.tsx"
replace_in_files "Aly" "Lars" "*.js"
replace_in_files "Aly" "Lars" "*.md"

# Date references to generic dates
replace_in_files "16.12.23" "15.06.24" "*.ts"
replace_in_files "16.12.23" "15.06.24" "*.tsx"
replace_in_files "16.12.23" "15.06.24" "*.js"
replace_in_files "16.12.23" "15.06.24" "*.md"

replace_in_files "16\\.12\\.23" "15.06.24" "*.ts"
replace_in_files "16\\.12\\.23" "15.06.24" "*.tsx"
replace_in_files "16\\.12\\.23" "15.06.24" "*.js"
replace_in_files "16\\.12\\.23" "15.06.24" "*.md"

# Replace DNB with generic institution
replace_in_files "'DNB'" "'Nordic Insurance'" "*.ts"
replace_in_files "'DNB'" "'Nordic Insurance'" "*.tsx"
replace_in_files "'DNB'" "'Nordic Insurance'" "*.js"
replace_in_files "'DNB'" "'Nordic Insurance'" "*.md"

replace_in_files "\"DNB\"" "\"Nordic Insurance\"" "*.ts"
replace_in_files "\"DNB\"" "\"Nordic Insurance\"" "*.tsx"
replace_in_files "\"DNB\"" "\"Nordic Insurance\"" "*.js"
replace_in_files "\"DNB\"" "\"Nordic Insurance\"" "*.md"

# Clean up backup files
find . -name "*.bak" -not -path "*/node_modules/*" -not -path "*/.git/*" -delete

echo "✅ Anonymization complete! Personal data replaced with generic composite examples."
echo "🔍 Review the changes before committing to ensure accuracy."