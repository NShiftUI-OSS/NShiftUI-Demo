# Rainbow

O desenho da tela é a coluna `screens.rainbow_source`. Não há arquivo `.rbw`.

`PUT /screens/:id` manda o texto e a `revision` que o editor abriu. O WASM formata. Se o parser recusar, a resposta é 422 e a linha não muda. Se outra publicação já aumentou a revisão, a resposta é 409 `revision_conflict` e a linha não muda. Se o nome, a descrição, o Rainbow formatado e o root forem iguais aos gravados, a linha também não muda. Se aceitar uma alteração, o texto formatado é gravado, `revision` aumenta e o patch de `version` sobe (`1.0.0` → `1.0.1`). Essa versão entra em `screen_versions`.

Telas que já existiam na migração `sql/002_screen_versions.sql` ficam em `1.0.{revision}`. Telas criadas depois começam em `1.0.0`. O cliente não envia `version`.

O fonte é livre nesta POC. `use Text@1.0.0` pode aparecer na tela mesmo sem uma linha em `plugins`.

O app recebe esse texto já concreto. Placeholders `#{Name}` continuam só no parser e não fazem parte do fluxo salvo pelo editor.
