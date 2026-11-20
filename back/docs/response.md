# Resposta

Dois objetos. O status HTTP escolhe qual ler.

Sucesso, família 2xx:

```json
{ "data": {} }
```

`data` é o modelo da rota. Na exclusão é `null` e o status continua 200.

Erro, famílias 4xx e 5xx:

```json
{ "error": { "status": 404, "code": "screen_not_found", "message": "Tela home não existe" } }
```

`code` é escolhido pela rota na hora. Esta lista de status é a que a POC usa. Ela pode crescer.

| Status | Quando |
| --- | --- |
| 200 | Leitura, atualização, exclusão |
| 201 | Criação de screen |
| 400 | Corpo ou parâmetro inválido |
| 404 | Id ou nome não existe |
| 409 | Nome já existe. No lote, nada é gravado |
| 422 | O parser recusou o Rainbow |
| 500 | Falha interna |

Não há envelope no request. O corpo é o modelo da rota. 204 não é usado.
