# Decisions

- Não criar pasta de preview nem renderer de telefone neste repo.
- O backend só guarda screens. Plugin, evento e trigger nascem no editor e vão no Rainbow. Não há tabela nem CRUD disso.
- Não devolver o Rainbow formatado quando a revisão do `PUT` estiver velha. O `409 revision_conflict` deixa a linha como está para o editor propor o merge.
- PUT com o mesmo nome, descrição, Rainbow formatado e root devolve a linha atual. `revision` e `version` não mudam e `screen_versions` não ganha linha.
- Não acrescentar `401` ou `403` enquanto não houver autenticação.
- Não colocar `ok` na resposta. O status escolhe `{ "data" }` ou `{ "error" }`.
