# NShiftUI-Demo

Demonstração pública do NShiftUI. A tag `v1.0.0` pode ser baixada pelo comando `rainbow demo` da fórmula Homebrew atual ou como [arquivo do GitHub](https://github.com/NShiftUI-OSS/NShiftUI-Demo/archive/refs/tags/v1.0.0.tar.gz).

| Pasta | Conteúdo |
| --- | --- |
| `web` | Editor do CMS |
| `back` | API e Postgres |
| `ios` | App de iOS |
| `android` | App de Android |

Os apps usam as releases `1.0.0` do NShiftUI e dos parsers nativos. O iOS resolve os pacotes pelo Swift Package Manager. O Android baixa os AARs e o JAR do KSP pelo Gradle. O editor e a API usam os pacotes WASM do RainbowParser Rust `1.0.0`.

No primeiro startup com um banco vazio, a API carrega as oito telas da demonstração e a revisão publicada de cada uma. Um banco com telas mantém o próprio conteúdo. As alterações e exclusões feitas no CMS persistem nas próximas inicializações.

Para atualizar o seed depois de publicar alterações no CMS, rode `npm --prefix back run seed:refresh` com o Postgres do Demo ativo e versione `back/sql/005_demo_screens.sql`.

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
