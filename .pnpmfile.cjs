// Removes @next/swc-* optional deps that require native binary downloads.
// Next.js falls back to WASM bindings when native SWC is unavailable.
function readPackage(pkg) {
  if (pkg.name === 'next') {
    pkg.optionalDependencies = Object.fromEntries(
      Object.entries(pkg.optionalDependencies || {}).filter(
        ([key]) => !key.startsWith('@next/swc-')
      )
    )
  }
  return pkg
}

module.exports = { hooks: { readPackage } }
