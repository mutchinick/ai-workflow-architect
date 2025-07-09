/**
 * @fileoverview A script to format long unit test descriptions in TypeScript files.
 *
 * This script finds all calls to Jest test functions (`describe`, `it`, `test`)
 * and formats their first argument (the description string) if it exceeds a
 * specified line length. It can also collapse whitespace and convert quoted
 * strings to template literals.
 *
 * @example
 * // Run on all .ts/.tsx files in src
 * node format-tests.js
 *
 * @example
 * // Perform a dry run without saving changes
 * node format-tests.js --dry-run
 */
import fg from 'fast-glob'
import { parseArgs } from 'node:util'
import { CallExpression, Project, SourceFile, SyntaxKind } from 'ts-morph'

// Valid Jest function names we want to process
const TEST_FUNCTIONS = ['describe', 'it', 'test']

// Max characters allowed per line before breaking test name descriptions
const MAX_LINE_LENGTH = 80

// --- Argument Parsing ---
const { values, positionals } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', short: 'd' },
    'fix-quotes': { type: 'boolean', short: 'f' },
    collapse: { type: 'boolean', short: 'c' },
  },
  allowPositionals: true,
})

const pattern = positionals[0] ?? 'src/**/*.{ts,tsx}'
const dryRun = values['dry-run'] ?? false
const shouldFixQuotes = values['fix-quotes'] ?? false
const collapse = values.collapse ?? false

/**
 * Wraps a string to a specified maximum line length.
 * Subsequent lines are indented to match the opening line's alignment.
 * @param text The input string to wrap.
 * @param indent The indentation string to apply to wrapped lines.
 * @returns The formatted, potentially multi-line, string.
 */
function wrapText(text: string, indent: string): string {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (currentLine.length > 0 && currentLine.length + word.length + 1 > MAX_LINE_LENGTH) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine += (currentLine.length > 0 ? ' ' : '') + word
    }
  }
  lines.push(currentLine)

  return lines.map((line, i) => (i === 0 ? line : indent + line)).join('\n')
}

/**
 * Collapses multiple spaces into a single space and trims the text.
 * @param text The string to collapse.
 * @returns The cleaned-up string.
 */
function collapseText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Determines whether a given call expression is one of the recognized test functions.
 * @param call The call expression node to check.
 * @returns True if the function is a supported test function.
 */
function isSupportedTestFunction(call: CallExpression): boolean {
  const identifier = call.getExpression().getText()
  return TEST_FUNCTIONS.includes(identifier)
}

/**
 * Processes a single source file, finding and formatting long test descriptions.
 * @param sourceFile The ts-morph SourceFile object to process.
 * @returns A promise that resolves to true if the file was modified.
 */
async function processFile(sourceFile: SourceFile): Promise<boolean> {
  let modified = false
  const filePath = sourceFile.getFilePath()

  sourceFile.forEachDescendant((node) => {
    // 1. VALIDATION (Guard Clauses)
    // Ensure we're looking at a supported test function call
    if (!node.isKind(SyntaxKind.CallExpression)) return
    if (!isSupportedTestFunction(node)) return

    const firstArg = node.getArguments()[0]
    if (!firstArg) return

    // Ensure the first argument is a string or a no-substitution template literal
    const isProcessableString =
      firstArg.isKind(SyntaxKind.StringLiteral) || firstArg.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
    if (!isProcessableString) return

    // If it's a regular string, skip it unless --fix-quotes is enabled
    if (!shouldFixQuotes && firstArg.isKind(SyntaxKind.StringLiteral)) return

    // 2. PREPARATION (Gather Info)
    const rawText = firstArg.getLiteralText()
    const indentation = ' '.repeat(firstArg.getStart() - firstArg.getStartLinePos() + 1)
    const formattedText = collapse ? collapseText(rawText) : wrapText(rawText, indentation)

    // 3. ACTION
    // Replace if the text changed, or if we're converting a string to backticks
    if (formattedText !== rawText || firstArg.isKind(SyntaxKind.StringLiteral)) {
      firstArg.replaceWithText(`\`${formattedText}\``)
      modified = true
    }
  })

  if (modified) {
    if (dryRun) {
      console.log(`[dry-run] Would format: ${filePath}`)
    } else {
      await sourceFile.save()
      console.log(`Formatted: ${filePath}`)
    }
  }

  return modified
}

/**
 * Main entry point for the script.
 */
async function main(): Promise<void> {
  const project = new Project()
  const filePaths = await fg(pattern, { absolute: true })

  if (filePaths.length === 0) {
    console.log('No matching files found.')
    return
  }

  console.log(`Processing ${filePaths.length} file(s)...`)
  project.addSourceFilesAtPaths(filePaths)

  let changedCount = 0
  for (const sourceFile of project.getSourceFiles()) {
    const changed = await processFile(sourceFile)
    if (changed) {
      changedCount++
    }
  }

  console.log(`✅ Done. ${changedCount} file(s) were updated.`)
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
