# HTTPS local

O desenvolvimento local usa uma CA própria para que o backend, o CMS-WEB e
os dois POCs usem HTTPS desde o primeiro build.

Depois de clonar os projetos, execute uma vez em qualquer sistema operacional:

```bash
cd CMS-BACK
npm run setup:local-https
```

O comando:

- gera os certificados em uma pasta de dados do usuário;
- grava `NSHIFTUI_LOCAL_CERT_DIR` no `.env` do CMS-BACK;
- não depende de os repositórios estarem lado a lado;
- não versiona a chave privada.
- tenta registrar a CA no trust store do usuário para o Chrome confiar no HTTPS.

No macOS o Keychain pode pedir autorização. No Windows o setup usa o Root store
do usuário. No Linux o setup tenta o `p11-kit` e, se ele não existir ou exigir
permissão administrativa, imprime o comando específico da distribuição.

Para apenas gerar os arquivos sem alterar o trust store:

```bash
NSHIFTUI_SKIP_CERT_TRUST=1 npm run setup:local-https
```

O diretório padrão é:

- macOS: `~/Library/Application Support/NShiftUI/local-certs`;
- Windows: `%LOCALAPPDATA%\NShiftUI\local-certs`;
- Linux: `${XDG_DATA_HOME:-~/.local/share}/NShiftUI/local-certs`.

Para escolher outro local, defina `NSHIFTUI_LOCAL_CERT_DIR` antes de executar
o setup.

Em seguida, suba os serviços:

```bash
docker compose up -d --build
cd ../CMS-WEB
npm run dev -- --host 127.0.0.1 --port 5174
```

URLs locais:

- backend: `https://127.0.0.1:3000`;
- CMS-WEB: `https://127.0.0.1:5174`;
- Android Emulator: `https://10.0.2.2:3000`.

O iOS copia a CA pública durante o build pelo build phase do Xcode quando o
ambiente é `LOCAL`. O Android copia a mesma CA para um resource gerado pelo
Gradle. Nenhum dos dois instala certificado manualmente no simulador.

Para o navegador/macOS confiar no certificado do CMS-WEB, a CA pública deve
ser autorizada no Keychain pelo usuário.
