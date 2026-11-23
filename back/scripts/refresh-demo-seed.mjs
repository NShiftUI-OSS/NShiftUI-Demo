import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const back = fileURLToPath(new URL('../', import.meta.url))
const seed = new URL('../sql/005_demo_screens.sql', import.meta.url)
const delimiter = '$screen_snapshot$'
const source = await readFile(seed, 'utf8')
const sections = source.split(delimiter)
if (sections.length !== 3) throw new Error('Seed snapshot delimiters are missing or duplicated')

const result = execFileSync('docker', [
  'compose', 'exec', '-T', 'db',
  'psql', '-XAt', '-v', 'ON_ERROR_STOP=1', '-U', 'nshift', '-d', 'nshift',
  '-c', 'select coalesce(jsonb_agg(to_jsonb(s) order by s.name), \'[]\'::jsonb) from screens s',
], { cwd: back, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })

const screens = JSON.parse(result)
if (!Array.isArray(screens) || screens.length === 0) {
  throw new Error('Refusing to replace the demo seed with an empty catalog')
}
const snapshot = JSON.stringify(screens, null, 2)
if ([delimiter, '$seed$'].some((tag) => snapshot.includes(tag))) {
  throw new Error('A screen contains a reserved SQL delimiter')
}

await writeFile(seed, [sections[0], `\n${snapshot}\n`, sections[2]].join(delimiter))
console.log(`Updated the seed with ${screens.length} published screens`)
