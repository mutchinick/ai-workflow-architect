// This file was coded (or vibe coded?) with the help of AI.
// It's kind of a mess so at some point will likely clean it up.
import fg from 'fast-glob'
import fs from 'fs/promises'
import { CallExpression, NoSubstitutionTemplateLiteral, Project, StringLiteral, SyntaxKind } from 'ts-morph'

// Valid Jest function names we want to process
const TEST_FUNCTIONS = ['describe', 'it', 'test']

// Max characters allowed per line before breaking test name descriptions
const MAX_LINE_LENGTH = 80

// Parse CLI arguments
const args = process.argv.slice(2)
const pattern = args.find((arg) => !arg.startsWith('--')) ?? 'src/**/*.{ts,tsx}'
const dryRun = args.includes('--dry-run')
const shouldFixQuotes = args.includes('--fix-quotes')
const collapse = args.includes('--collapse')

/**
 * Breaks a string into multiple lines based on the max line length,
 * preserving indentation for subsequent lines.
 */
function wrapText(text: string, indent: string): string {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > MAX_LINE_LENGTH) {
      lines.push(currentLine.trim())
      currentLine = word
    } else {
      currentLine += ' ' + word
    }
  }

  lines.push(currentLine.trim())
  return lines.map((line, i) => (i === 0 ? line : indent + line)).join('\n')
}

/**
 * Collapses multiple spaces into a single space and trims the text.
 * This is used to clean up the text before wrapping it.
 */
function collapseText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Determines whether a given call expression is one of the recognized test functions.
 */
function isSupportedTestFunction(call: CallExpression): boolean {
  const identifier = call.getExpression().getText()
  return TEST_FUNCTIONS.includes(identifier)
}

/**
 * Checks whether the string argument is valid for processing (either a backtick or quoted string).
 */
function shouldProcessArgument(firstArg: StringLiteral | NoSubstitutionTemplateLiteral): boolean {
  return (
    firstArg.isKind(SyntaxKind.NoSubstitutionTemplateLiteral) ||
    (firstArg.isKind(SyntaxKind.StringLiteral) && shouldFixQuotes)
  )
}

/**
 * Returns the raw string content from the argument, regardless of literal type.
 */
function getRawText(firstArg: StringLiteral | NoSubstitutionTemplateLiteral): string {
  return firstArg.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
    ? firstArg.getLiteralText()
    : firstArg.getLiteralText()
}

/**
 * Processes a single file, finding matching test cases and formatting long descriptions.
 */
async function processFile(filePath: string): Promise<boolean> {
  const project = new Project()
  const sourceFile = project.addSourceFileAtPath(filePath)
  let modified = false

  // Traverse all nodes in the AST
  sourceFile.forEachDescendant((node) => {
    if (!node.isKind(SyntaxKind.CallExpression)) return
    const call = node

    // Only handle describe, it, or test calls
    if (!isSupportedTestFunction(call)) return
    const args = call.getArguments()
    if (args.length === 0) return

    const firstArg = args[0]

    // Used to determine alignment of wrapped lines
    const columnOffset = firstArg.getStart() - firstArg.getStartLinePos() + 1
    const indentation = ' '.repeat(Math.max(columnOffset, 0))

    // Skip if the argument uses template expressions like `${...}`
    if (firstArg.isKind(SyntaxKind.TemplateExpression)) return
    if (!(firstArg.isKind(SyntaxKind.StringLiteral) || firstArg.isKind(SyntaxKind.NoSubstitutionTemplateLiteral))) {
      return
    }
    if (!shouldProcessArgument(firstArg)) return

    // Extract the inner string and decide if it should be re-wrapped
    const rawText = getRawText(firstArg)
    const formatted = collapse ? collapseText(rawText) : wrapText(rawText, indentation)

    // Conditions to replace the string literal with formatted backticks
    const shouldReplace =
      (firstArg.isKind(SyntaxKind.StringLiteral) && shouldFixQuotes) ||
      (firstArg.isKind(SyntaxKind.NoSubstitutionTemplateLiteral) && formatted !== rawText)

    if (shouldReplace) {
      firstArg.replaceWithText('`' + formatted + '`')
      modified = true
    }
  })

  // If modifications were made, write back to disk
  if (modified) {
    const output = sourceFile.getFullText()
    if (dryRun) {
      console.log(`[dry-run] Would format: ${filePath}`)
    } else {
      await fs.writeFile(filePath, output, 'utf-8')
      console.log(`Formatted: ${filePath}`)
    }
  }

  return modified
}

/**
 * Entry point of the script. Resolves all matching files and processes them.
 */
async function main(): Promise<void> {
  const files = await fg(pattern, { absolute: true })
  if (files.length === 0) {
    console.log('No matching files found.')
    return
  }

  console.log(`Processing ${files.length} file(s)...`)
  let changedCount = 0

  for (const file of files) {
    const changed = await processFile(file)
    if (changed) changedCount++
  }

  console.log(`Done. ${changedCount} file(s) updated.`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
