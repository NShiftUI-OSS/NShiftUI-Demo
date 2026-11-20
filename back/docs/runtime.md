# Runtime

`GET /runtime/screens/:name`

O app manda o nome da tela. A resposta 200 é:

```json
{ "data": { "name": "home", "revision": 4, "version": "1.0.3", "rainbow": "use Screen@1.0.0\n\nScreen(name: \"home\") {\n}\n" } }
```

`version` é o SemVer da tela. `revision` continua o contador usado no conflito do editor. Os dois sobem juntos quando a gravação muda a tela. 404 usa o objeto de erro quando o nome não existe. A biblioteca de plugins não vai nessa resposta. O app segue lendo `data.rainbow`.
