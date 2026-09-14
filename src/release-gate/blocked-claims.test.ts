import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import gate from './blocked-claims.json'

// The website may only describe what the public store builds actually ship.
// While the 1.1.0 candidate is not store-verified (publicClaimsAllowed=false),
// none of its feature claims may appear on any rendered marketing surface.
// This is the automated twin of the manual revert in f948606. When 1.1.0 is
// live in both stores, flip publicClaimsAllowed to true in the JSON (with the
// verification note) and this test becomes a no-op.

const ROOTS = ['src/app', 'src/components', 'src/content', 'public'].map((p) => path.resolve(__dirname, '..', '..', p))
const TEXT_EXT = new Set(['.tsx', '.ts', '.jsx', '.js', '.md', '.mdx', '.json', '.html', '.txt', '.svg'])
const SKIP = /(\.test\.[tj]sx?$|\.spec\.[tj]sx?$|[\\/]release-gate[\\/])/

function walk(dir: string, out: string[] = []): string[] {
    let entries: string[] = []
    try { entries = readdirSync(dir) } catch { return out }
    for (const entry of entries) {
        const full = path.join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) walk(full, out)
        else if (TEXT_EXT.has(path.extname(entry)) && !SKIP.test(full)) out.push(full)
    }
    return out
}

describe('release gate: unreleased feature claims stay off the site', () => {
    const rules = gate.patterns.map((rule) => ({ ...rule, regex: new RegExp(rule.re, rule.flags) }))

    it('gate file is well formed', () => {
        expect(gate.candidateVersion).toMatch(/^\d+\.\d+\.\d+/)
        expect(rules.length).toBeGreaterThan(0)
    })

    it('no blocked claim appears in any rendered surface while publicClaimsAllowed is false', () => {
        if (gate.publicClaimsAllowed) return
        const hits: string[] = []
        for (const file of ROOTS.flatMap((root) => walk(root))) {
            const text = readFileSync(file, 'utf8')
            for (const rule of rules) {
                const match = text.match(rule.regex)
                if (match) hits.push(`${path.relative(process.cwd(), file)}: "${match[0]}" (${rule.why})`)
            }
        }
        expect(hits, `blocked 1.1.0 claims found:\n${hits.join('\n')}`).toEqual([])
    })
})
