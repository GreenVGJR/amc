// ForgeLinked's package.json points "main" at dist/index.js but omits a
// "types" field, and its built declarations live under dist/types/ instead
// of next to dist/index.js - so plain `import ... from "ForgeLinked"` can't
// find them via normal resolution. Re-export the real (correctly-built)
// declarations here instead of falling back to `any`.
declare module "ForgeLinked" {
    export * from "ForgeLinked/dist/types/index";
}
