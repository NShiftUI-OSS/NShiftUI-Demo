# NShiftUI for iOS

NShiftUI for iOS is an independent Swift and SwiftUI implementation inspired by the public shadcn/ui design system. It is not affiliated with that project, it is not a fork, and it does not redistribute the TypeScript source. Semantic color names and the component list are a reference. The upstream remains the author of shadcn/ui, under the MIT license.

| Field | Value |
| --- | --- |
| Project | NShiftUI-POC-iOS, undergraduate thesis |
| Upstream | shadcn/ui |
| Upstream author | shadcn |
| Upstream license | MIT, Copyright (c) 2023 shadcn |
| Site | https://ui.shadcn.com |
| Repository | https://github.com/shadcn-ui/ui |
| Reference package | shadcn 4.21.4, in `packages/shadcn/package.json` |
| Commit | `c2a67849be260701852b0977ba15eb5f3a0ce2a4` |
| Short commit | `c2a67849b` |
| Commit date | 10 October 2026, 14:10:36 +0400 |
| Registry consulted | `apps/v4` |
| Recorded | Saturday, 10 October 2026, 21:13, America/Sao_Paulo |

The upstream MIT license is in `LICENSE.md` of the repository https://github.com/shadcn-ui/ui.

## Fonts

The files in `NShiftUI/Resources/Fonts` come from the `google/fonts` repository. Each family lives in its own folder, with the license the upstream ships beside the file. The whole folder is copied into the app bundle, so the redistributed copy carries the copyright notice and the license.

Twenty-five families are under the SIL Open Font License 1.1. The text, with the family copyright, is in `OFL.txt` inside the font folder. Reserved font names stay as published: Plex, Lora, Merriweather, Playfair Display, Raleway, and Source.

Public Sans also includes `LICENSE.md`, the text of the USWDS modified version. GSA’s changes are dedicated under CC0 1.0. The combined work follows OFL 1.1, the more restrictive condition.

Roboto Slab is under the Apache License 2.0. The folder contains `LICENSE.txt`, `COPYRIGHT.txt`, `AUTHORS.txt`, and `TRADEMARKS.md`. Roboto Slab is a trademark of Google.
