import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const selfsigned = require('selfsigned')

function localCertDirectory() {
  if (process.env.NSHIFTUI_LOCAL_CERT_DIR) {
    return path.resolve(process.env.NSHIFTUI_LOCAL_CERT_DIR)
  }

  const home = os.homedir()
  const base =
    process.platform === 'win32'
      ? process.env.LOCALAPPDATA ?? path.join(home, 'AppData', 'Local')
      : process.platform === 'darwin'
        ? path.join(home, 'Library', 'Application Support')
        : process.env.XDG_DATA_HOME ?? path.join(home, '.local', 'share')

  return path.join(base, 'NShiftUI', 'local-certs')
}

const certDirectory = localCertDirectory()
const force = process.argv.includes('--force')
const certificatePath = path.join(certDirectory, 'local-ca.crt')
const keyPath = path.join(certDirectory, 'local-ca.key')

mkdirSync(certDirectory, { recursive: true })

if (force || !existsSync(certificatePath) || !existsSync(keyPath)) {
  const attributes = [{ name: 'commonName', value: 'NShiftUI Local CA' }]
  const generated = selfsigned.generate(attributes, {
    algorithm: 'sha256',
    days: 825,
    keySize: 2048,
    extensions: [
      {
        name: 'basicConstraints',
        cA: true,
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        keyEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 2, value: 'host.docker.internal' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '10.0.2.2' },
        ],
      },
    ],
  })

  writeFileSync(certificatePath, generated.cert)
  writeFileSync(keyPath, generated.private)
  chmodSync(keyPath, 0o600)
}

const backendDir = fileURLToPath(new URL('..', import.meta.url))
const envPath = path.join(backendDir, '.env')
const escapedDirectory = certDirectory.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
writeFileSync(
  envPath,
  `NSHIFTUI_LOCAL_CERT_DIR="${escapedDirectory}"\n`,
)

installCertificateTrust(certificatePath)

console.log(`Local HTTPS certificates: ${certDirectory}`)
console.log(`Backend environment file: ${envPath}`)

function installCertificateTrust(certificate) {
  if (process.env.NSHIFTUI_SKIP_CERT_TRUST === '1') {
    console.log('Certificate trust installation skipped by NSHIFTUI_SKIP_CERT_TRUST.')
    return
  }

  if (process.platform === 'darwin') {
    const keychain = path.join(
      os.homedir(),
      'Library/Keychains/login.keychain-db',
    )
    if (
      run('security', [
        'add-trusted-cert',
        '-d',
        '-r',
        'trustRoot',
        '-k',
        keychain,
        certificate,
      ])
    ) {
      console.log('Certificate trusted in the macOS login Keychain.')
    } else {
      console.log(
        `Authorize this command to trust the certificate in macOS:\n` +
          `security add-trusted-cert -d -r trustRoot -k "${keychain}" "${certificate}"`,
      )
    }
    return
  }

  if (process.platform === 'win32') {
    if (run('certutil', ['-user', '-addstore', 'Root', certificate])) {
      console.log('Certificate trusted in the Windows user Root store.')
    } else {
      console.log(
        `Run PowerShell as the current user to trust the certificate:\n` +
          `Import-Certificate -FilePath "${certificate}" -CertStoreLocation Cert:\\CurrentUser\\Root`,
      )
    }
    return
  }

  if (run('trust', ['anchor', certificate])) {
    console.log('Certificate trusted with the Linux p11-kit trust store.')
    return
  }

  console.log(
    `Trust the certificate with your Linux distribution, then restart Chrome:\n` +
      `sudo cp "${certificate}" /usr/local/share/ca-certificates/nshiftui-local-ca.crt && ` +
      `sudo update-ca-certificates`,
  )
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    windowsHide: true,
  })
  return result.status === 0
}
