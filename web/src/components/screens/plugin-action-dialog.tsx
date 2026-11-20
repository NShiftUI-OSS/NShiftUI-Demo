import { useState, type ComponentType } from 'react'
import {
  GitBranchIcon,
  PencilIcon,
  SquareStackIcon,
  Trash2Icon,
} from 'lucide-react'

import {
  slotsForPlugin,
  type PluginSlot,
} from '@/components/screens/plugin-slots'
import { useScreenLayout } from '@/components/screens/screen-layout-context'
import { getScreenComponent } from '@/components/screens/preview'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function PluginActionDialog({
  action,
  onOpenChange,
  onFlow,
  onEdit,
  onRemove,
}: {
  action: { nodeId: string; componentId: string } | null
  onOpenChange: (open: boolean) => void
  onFlow: (nodeId: string) => void
  onEdit: (action: { nodeId: string; componentId: string }) => void
  onRemove: (action: { nodeId: string; componentId: string }) => void
}) {
  return (
    <Dialog open={Boolean(action)} onOpenChange={onOpenChange}>
      {action ? (
        <PluginActionForm
          key={`${action.componentId}:${action.nodeId}`}
          action={action}
          onOpenChange={onOpenChange}
          onFlow={onFlow}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ) : null}
    </Dialog>
  )
}

function PluginActionForm({
  action,
  onOpenChange,
  onFlow,
  onEdit,
  onRemove,
}: {
  action: { nodeId: string; componentId: string }
  onOpenChange: (open: boolean) => void
  onFlow: (nodeId: string) => void
  onEdit: (action: { nodeId: string; componentId: string }) => void
  onRemove: (action: { nodeId: string; componentId: string }) => void
}) {
  const [step, setStep] = useState<'choose' | 'slots'>('choose')
  const slots = slotsForPlugin(action.componentId)
  const name =
    action.componentId === 'nshift-screen'
      ? 'Screen'
      : (getScreenComponent(action.componentId)?.name ?? 'Plugin')

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {step === 'choose' ? name : `Slots de ${name}`}
        </DialogTitle>
        <DialogDescription>
          {step === 'choose'
            ? 'Escolha o que fazer com este plugin.'
            : 'Estes são os slots que este plugin declara.'}
        </DialogDescription>
      </DialogHeader>
      {step === 'choose' ? (
        <div className="grid gap-2">
          <ActionChoice
            icon={PencilIcon}
            title="Editar parâmetros"
            description="Abrir os campos e alterar os valores."
            onClick={() => onEdit(action)}
          />
          {slots.length > 0 && (
            <ActionChoice
              icon={SquareStackIcon}
              title="Slots"
              description="Adicionar, editar ou remover a bottom sheet."
              onClick={() => setStep('slots')}
            />
          )}
          <ActionChoice
            icon={GitBranchIcon}
            title="Tree inspector"
            description="Inspecionar a árvore Rainbow deste plugin."
            onClick={() => {
              onOpenChange(false)
              onFlow(action.nodeId)
            }}
          />
        </div>
      ) : (
        <SlotList slots={slots} onBack={() => setStep('choose')} />
      )}
      {step === 'choose' && action.componentId !== 'nshift-screen' ? (
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={() => {
              onOpenChange(false)
              onRemove(action)
            }}
          >
            <Trash2Icon />
            Remover da tela
          </Button>
        </DialogFooter>
      ) : null}
    </DialogContent>
  )
}

function ActionChoice({
  icon: Icon,
  title,
  description,
  onClick,
  tone = 'default',
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      className={cn(
        'hover:bg-muted flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
        tone === 'danger' && 'hover:bg-destructive/10',
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md border',
          tone === 'danger'
            ? 'border-destructive/30 text-destructive'
            : 'bg-muted text-foreground',
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block text-sm font-medium',
            tone === 'danger' && 'text-destructive',
          )}
        >
          {title}
        </span>
        <span className="text-muted-foreground block text-xs">
          {description}
        </span>
      </span>
    </button>
  )
}

function SlotList({
  slots,
  onBack,
}: {
  slots: PluginSlot[]
  onBack: () => void
}) {
  const {
    sheet,
    addBottomSheet,
    openSheetEditor,
    removeBottomSheet,
    closePluginAction,
  } = useScreenLayout()

  function openSheet() {
    closePluginAction()
    if (sheet) openSheetEditor()
    else addBottomSheet()
  }

  return (
    <>
      {slots.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Este plugin não declara slots.
        </p>
      ) : (
        <ul className="grid gap-2">
          {slots.map((slot) => (
            <li key={slot.id} className="rounded-lg border px-3 py-3">
              <p className="text-sm font-medium">{slot.name}</p>
              <p className="text-muted-foreground text-xs">
                {slot.description}
              </p>
              <div className="mt-3 flex gap-2">
                <Button type="button" size="sm" onClick={openSheet}>
                  {sheet ? 'Editar' : 'Adicionar'}
                </Button>
                {sheet ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      removeBottomSheet()
                      closePluginAction()
                    }}
                  >
                    Remover
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </DialogFooter>
    </>
  )
}
