# Decisions

- O preview do telefone continua no frontend. O backend devolve Rainbow, não uma imagem.
- O catálogo de plugins, eventos e triggers vive no editor. O backend só persiste a screen e o Rainbow.
- `Sheet` e `Screen` ficam sem preview até definirmos como bottom sheet e navigation bar aparecem no canvas.
- O sub design system usa a classe `.scn` e variáveis `--scn-*`. Não reaproveitar `--background` do CMS dentro do telefone.
- O canvas do telefone segue `.cursor/rules/phone-preview-layout.mdc`. Não realinhar o preview no topo nem trocar a divisão de largura.
- Não copiar `Experiments/TypedRegistryPrototype` do NShiftUI-iOS. Não é o produto.
- Placeholders `#{Name}` não entram no Rainbow salvo pelo editor.
- Conflito de revisão abre o merge no editor de texto. Não tratar esse `409` como toast.
- Os docs `01` e `02` desta pasta `docs/` estão defasados.
- Mudança de preview, layout, fonte, formulário ou rota só está pronta depois de exercitar a tela no navegador. `tsc` limpo com erro novo no console do Vite não conta.
