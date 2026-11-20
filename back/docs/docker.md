# Docker

Node, Postgres e `npm install` acontecem dentro dos containers. Não instale o runtime do backend na máquina.

```bash
docker compose up --build
```

- `api` publica `http://localhost:3000`. O Swagger fica em `http://localhost:3000/docs`.
- `db` é Postgres 16, sem porta publicada. O volume `pgdata` guarda as telas.
- `DATABASE_URL` dentro do `api` usa o host `db`.

O CMS web continua no Vite e chama essa porta. O CORS aceita a origem local e os métodos GET, POST, PUT e DELETE.
