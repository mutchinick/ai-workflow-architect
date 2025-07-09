// Type helper to expand types and make them more visible
export type TypeUtilsPretty<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: TypeUtilsPretty<O[K]> }
    : never
  : T

// Type helper to resolve some prettier/vscode syntax highlighting issues
export type TypeUtilsWrapper<T> = T

// Type helper to make types mutable for testing edge cases
export type TypeUtilsMutable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? TypeUtilsMutable<T[K]> : T[K]
}
