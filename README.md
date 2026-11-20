# NShiftUI-Demo

Demonstração pública do NShiftUI. O comando `rainbow demo` baixa a tag `0.1.0` deste repositório.

| Pasta | Conteúdo |
| --- | --- |
| `web` | Editor do CMS |
| `back` | API e Postgres |
| `ios` | App de iOS |
| `android` | App de Android |

As bibliotecas nativas não estão aqui. O app de iOS depende da tag publicada de `NShiftUI-iOS`. O app de Android baixa o AAR publicado de `NShiftUI-Android`. O catálogo começa vazio: as telas são criadas no editor e publicadas na API.

## Requisitos

- Node.js e Docker, para o editor e a API
- Xcode, para o app de iOS
- Android Studio, para o app de Android

## Certificado local

O editor e a API usam HTTPS local. Gere o certificado uma vez, a partir de `back`:

```bash
cd back
npm install
npm run setup:local-https
```

## API

```bash
cd back
docker compose up --build
```

A API fica em `https://127.0.0.1:3000`.

## Editor

```bash
cd web
npm install
npm run dev
```

O editor fica em `https://localhost:5173`.

## Apps

Abra `ios/NShiftUI-POC-iOS.xcodeproj` no Xcode.

Abra a pasta `android` no Android Studio.

## Licença

MIT. Copyright (c) 2026 NShiftUI-OSS.
