const publishedRainbow = `use Screen@1.0.0
use VerticalStack@1.0.0
use Text@1.0.0

Screen(
  navigationBar: (title: "Home"),
  scroll: (enabled: false, fastRefresh: true)
) {
  VerticalStack {
    Text(
      text: "Home",
      style: "xl",
      weight: "semibold",
      color: "foreground"
    )
  }
}`

const successBody = `{
  "data": {
    "name": "home",
    "revision": 6,
    "version": "1.0.6",
    "isRoot": true,
    "rainbow": "<o Rainbow publicado>"
  }
}`

const errorBody = `{
  "error": {
    "status": 404,
    "code": "screen_not_found",
    "message": "Tela home não existe"
  }
}`

const swiftDecode = `struct RuntimeScreen: Decodable {
    let rainbow: String
}

struct RuntimeScreenResponse: Decodable {
    let data: RuntimeScreen
}

let runtime = try JSONDecoder().decode(
    RuntimeScreenResponse.self,
    from: Data(response.body.utf8)
)
let model = try NShiftRainbowCompiler().compile(
    source: runtime.data.rainbow
)
guard model.name.rawValue == "Screen" else {
    throw FetchScreenError.unavailable
}`

const kotlinDecode = `@Serializable
data class RuntimeScreen(val rainbow: String)

@Serializable
data class RuntimeScreenResponse(val data: RuntimeScreen)

val runtime = Json { ignoreUnknownKeys = true }
    .decodeFromString<RuntimeScreenResponse>(response.body)
val model = NShiftRainbowCompiler().compile(runtime.data.rainbow)
check(model.name.rawValue == "Screen")`

export function RuntimeDoc() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-8">
      <header className="flex flex-col gap-3">
        <p className="text-primary text-sm font-medium">Documentação</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Integrar o runtime no app hospedeiro
        </h1>
        <p className="text-muted-foreground text-base leading-7">
          O CMS guarda a tela. O aplicativo pede essa tela pelo nome, separa o
          Rainbow do envelope e entrega só esse texto ao compilador. Plugins e
          eventos já estão registrados no app. O backend não envia catálogo.
        </p>
      </header>

      <nav className="bg-card grid gap-2 rounded-xl border p-4 text-sm">
        <a className="hover:underline" href="#publicar">
          1. Publicar a tela
        </a>
        <a className="hover:underline" href="#pedido">
          2. Pedir a tela
        </a>
        <a className="hover:underline" href="#compilar">
          3. Compilar no iOS e no Android
        </a>
        <a className="hover:underline" href="#catalogo">
          4. Catálogo e valores marcados
        </a>
        <a className="hover:underline" href="#erros">
          5. Erros e revisão
        </a>
      </nav>

      <section className="flex flex-col gap-3" id="publicar">
        <h2 className="text-xl font-semibold">1. Publicar a tela</h2>
        <p className="text-muted-foreground leading-7">
          No editor, Publicar grava o Rainbow e aumenta o patch do SemVer. O app só
          enxerga o que foi publicado. A raiz da tela é o plugin{' '}
          <code className="text-foreground">Screen</code>. A screen marcada
          como root aparece com o badge Root e é a porta do aplicativo de
          exemplo.
        </p>
        <CodeBlock>{publishedRainbow}</CodeBlock>
      </section>

      <section className="flex flex-col gap-3" id="pedido">
        <h2 className="text-xl font-semibold">2. Pedir a tela</h2>
        <p className="text-muted-foreground leading-7">
          O <code className="text-foreground">ScreenService</code> aponta para
          a origem da API. Na POC local isso é{' '}
          <code className="text-foreground">https://127.0.0.1:3000</code>. O
          contrato do aplicativo é um GET. O nome na URL é o nome da screen.
        </p>
        <CodeBlock>{`GET /runtime/screens/home`}</CodeBlock>
        <p className="text-muted-foreground leading-7">
          Sucesso devolve <code className="text-foreground">data</code>. O
          compilador recebe só{' '}
          <code className="text-foreground">data.rainbow</code>.{' '}
          <code className="text-foreground">name</code>,{' '}
          <code className="text-foreground">revision</code>,{' '}
          <code className="text-foreground">version</code> e{' '}
          <code className="text-foreground">isRoot</code> vêm no mesmo objeto.
          O patch de <code className="text-foreground">version</code> sobe a
          cada publicação que muda a tela. O nome na URL continua o que foi
          gravado. O texto já é Rainbow concreto: o
          app não expande <code className="text-foreground">{'#{Name}'}</code>.
        </p>
        <CodeBlock>{successBody}</CodeBlock>
        <p className="text-muted-foreground leading-7">
          <code className="text-foreground">GET /screens</code> é a API do
          editor. O app hospedeiro não usa essa rota. O Swagger fica em{' '}
          <code className="text-foreground">/docs</code> na origem da API, não
          nesta aba do CMS.
        </p>
      </section>

      <section className="flex flex-col gap-3" id="compilar">
        <h2 className="text-xl font-semibold">3. Compilar no iOS e no Android</h2>
        <p className="text-muted-foreground leading-7">
          O <code className="text-foreground">FetchScreenUseCase</code> faz
          quatro passos: lê a URL, busca a screen, decodifica o envelope e
          compila o Rainbow. A raiz compilada precisa se chamar{' '}
          <code className="text-foreground">Screen</code>. Não há lista manual
          de decoders nem de slots nesse use case.
        </p>
        <h3 className="text-sm font-medium">iOS</h3>
        <CodeBlock>{swiftDecode}</CodeBlock>
        <p className="text-muted-foreground leading-7">
          O modelo entra na navegação do app. O container registra{' '}
          <code className="text-foreground">FetchScreenUseCaseProtocol</code> e{' '}
          <code className="text-foreground">ScreenServiceProtocol</code> dentro
          do callback de cada registro. O{' '}
          <code className="text-foreground">NShiftConfig.startup</code> recebe
          esse assembly junto com o catálogo.
        </p>
        <h3 className="text-sm font-medium">Android</h3>
        <CodeBlock>{kotlinDecode}</CodeBlock>
        <p className="text-muted-foreground leading-7">
          O fluxo é o mesmo. O container resolve{' '}
          <code className="text-foreground">FetchScreenUseCaseProtocol</code>{' '}
          com <code className="text-foreground">resolveOrThrow</code>.
        </p>
      </section>

      <section className="flex flex-col gap-3" id="catalogo">
        <h2 className="text-xl font-semibold">4. Catálogo e valores marcados</h2>
        <p className="text-muted-foreground leading-7">
          Registrar um plugin ou um evento preenche o catálogo que o compilador
          consulta. O metadata decodificável e os slots declarados entram nesse
          registro. Não cadastre decoder por nome dentro do fetch.
        </p>
        <p className="text-muted-foreground leading-7">
          Um valor <code className="text-foreground">@JSON</code>,{' '}
          <code className="text-foreground">@YAML</code>,{' '}
          <code className="text-foreground">@XML</code>,{' '}
          <code className="text-foreground">@HTML</code> ou{' '}
          <code className="text-foreground">@MARKDOWN</code> chega ao metadata
          como texto. A exceção é o corpo do{' '}
          <code className="text-foreground">SendHTTPRequestEvent</code>: esse
          parâmetro precisa ser <code className="text-foreground">@JSON</code>.
          Outra linguagem nesse campo falha na compilação.
        </p>
      </section>

      <section className="flex flex-col gap-3" id="erros">
        <h2 className="text-xl font-semibold">5. Erros e revisão</h2>
        <p className="text-muted-foreground leading-7">
          Nome desconhecido responde 404. Qualquer status fora de 2xx, um
          envelope ilegível, uma falha de compilação ou uma raiz que não é{' '}
          <code className="text-foreground">Screen</code> vira{' '}
          <code className="text-foreground">FetchScreenError</code> e a POC
          mostra a tela de erro. Não há autenticação nesse contrato.
        </p>
        <CodeBlock>{errorBody}</CodeBlock>
      </section>
    </article>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted overflow-x-auto rounded-lg border p-4 text-xs leading-6">
      <code>{children}</code>
    </pre>
  )
}
