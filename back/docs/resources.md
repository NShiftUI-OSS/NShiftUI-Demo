# Recursos

O banco guarda só screens.

CRUD de tela:

- `/screens`
- `GET` lista, `GET /:id` lê, `POST` cria com 201, `PUT /:id` substitui, `DELETE /:id` devolve `{ "data": null }`
- `GET /runtime/screens/:name` entrega o Rainbow para o aplicativo

Tela: `name`, `description`, `rainbow` opcional. A resposta inclui `version` no SemVer. Sem `rainbow`, o servidor grava um `Screen` vazio com esse nome e `version` `1.0.0`. O PUT exige `revision` e não recebe `version`.

Plugin, evento e trigger não têm endpoint nem tabela. Eles são escritos no Rainbow pelo editor.
