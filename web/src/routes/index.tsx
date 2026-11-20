import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  BlocksIcon,
  BookOpenIcon,
  Code2Icon,
  Layers3Icon,
  SmartphoneIcon,
  WorkflowIcon,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Iphone } from '@/components/ui/iphone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ScnBadge,
  ScnButton,
  ScnCard,
  ScnText,
} from '@/scn/widgets'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="bg-background min-h-svh">
      <AppHeader />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
          <div>
            <Badge variant="outline">CMS de telas nativas</Badge>
            <h1 className="mt-6 max-w-3xl text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              A tela que você publica é a tela que o app abre.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
              O NShiftUI guarda cada screen como Rainbow. O editor desenha o
              preview no telefone. iOS e Android leem o mesmo texto e montam a
              interface nativa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contents">
                  Abrir as screens
                  <ArrowRightIcon />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/docs">
                  Ver o contrato do app
                  <BookOpenIcon />
                </Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t pt-8">
              <Fact value="1 texto" label="Rainbow por tela, no Postgres" />
              <Fact value="2 apps" label="iOS e Android no mesmo contrato" />
              <Fact value="Runtime" label="GET da screen já publicada" />
            </dl>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="bg-muted/50 absolute inset-8 -z-10 rounded-[3rem]" />
              <Iphone className="h-[min(72svh,640px)] w-auto">
                <LandingPhone />
              </Iphone>
            </div>
          </div>
        </section>

        <section className="border-y">
          <div className="mx-auto grid max-w-7xl gap-px bg-border sm:grid-cols-3">
            <Step
              icon={Layers3Icon}
              index="01"
              title="Monte a screen"
              body="Arraste plugins para o telefone. Stacks, textos, botões e eventos ficam no desenho da tela, não num catálogo solto do banco."
            />
            <Step
              icon={Code2Icon}
              index="02"
              title="Publique o Rainbow"
              body="Publicar formata o texto, sobe o patch do SemVer e grava a versão que o aplicativo passa a receber."
            />
            <Step
              icon={SmartphoneIcon}
              index="03"
              title="O app resolve"
              body="O cliente pede a screen pelo nome. O parser devolve o documento e o NShiftUI encaixa plugins, slots e eventos."
            />
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <p className="text-primary text-sm font-medium">Editor</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              O preview do CMS é o contrato visual.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md leading-7">
              iPhone e Android ficam lado a lado, com a mesma altura e o mesmo
              conteúdo. A barra, o tema e os plugins seguem o Rainbow aberto.
              O Storyboard liga uma tela na outra pelos eventos de navegação.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <BlocksIcon className="text-primary mb-2 size-5" />
                <CardTitle>Plugins e eventos</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-7">
                O que aparece na sidebar nasce no editor. Um evento pode
                navegar, trocar um plugin ou disparar um pedido HTTP com o
                corpo em @JSON.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <WorkflowIcon className="text-primary mb-2 size-5" />
                <CardTitle>Uma versão por publicação</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-7">
                Enquanto a tela não é publicada, a edição fica local. O patch
                do SemVer só muda quando a alteração entra no backend.
              </CardContent>
            </Card>
            <Card className="sm:col-span-2">
              <CardHeader>
                <BookOpenIcon className="text-primary mb-2 size-5" />
                <CardTitle>O aplicativo não interpreta o CMS</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-7">
                O app chama o runtime, recebe o Rainbow concreto e compila a
                árvore. Não há payload JSON paralelo para desenhar a tela. O
                único JSON do fluxo é o valor marcado dentro do próprio
                Rainbow.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center lg:px-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Comece pela screen raiz.
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg">
                A Home marcada como root é a porta do aplicativo. As outras
                telas entram pelo Storyboard.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/contents">
                Ver as screens
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="text-muted-foreground border-t px-6 py-6 text-sm lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="bg-foreground size-1.5 rounded-full" />
            NShiftUI
          </span>
          <span>Rainbow no backend. Preview no CMS. UI nativa no app.</span>
        </div>
      </footer>
    </div>
  )
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold">{value}</dt>
      <dd className="text-muted-foreground mt-1 text-xs leading-5">{label}</dd>
    </div>
  )
}

function Step({
  icon: Icon,
  index,
  title,
  body,
}: {
  icon: typeof Layers3Icon
  index: string
  title: string
  body: string
}) {
  return (
    <div className="bg-background px-6 py-8 lg:px-8">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <Icon className="text-primary size-5" />
        <span>{index}</span>
      </div>
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
    </div>
  )
}

function LandingPhone() {
  return (
    <div className="flex w-full flex-col gap-4 px-4 pt-3 pb-4 [&_.scn-button]:w-full">
      <div className="flex items-center justify-between">
        <ScnText style="xs" color="muted" weight="medium">
          NShiftUI
        </ScnText>
        <ScnBadge variant="secondary">Root</ScnBadge>
      </div>
      <div className="flex flex-col gap-1">
        <ScnText style="xl2" weight="semibold">
          Home
        </ScnText>
        <ScnText color="muted">Conteúdo publicado no CMS e lido pelo app.</ScnText>
      </div>
      <ScnCard>
        <ScnText weight="medium">Próximo passo</ScnText>
        <ScnText color="muted">Abra Details a partir desta tela.</ScnText>
      </ScnCard>
      <ScnButton size="lg">Navigate</ScnButton>
      <ScnButton size="lg" variant="outline">
        AsyncNavigate
      </ScnButton>
    </div>
  )
}
