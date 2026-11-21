import { useState } from 'react'
import { Trash2Icon } from 'lucide-react'

import { IconSelect } from '@/components/screens/icon-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNShift } from '@/di/nshift-provider'
import {
  fieldsFor,
  initialFieldValues,
  initialStyleValues,
  metadataFromFieldList,
  pluginStyleFields,
  type PluginMetadataValue,
  type PluginField,
} from '@/scn/plugin-fields'
import {
  pluginStyleFromFields,
  type NShiftPluginStyle,
} from '@/domain/plugins/style/nshift-plugin-style'
import type { PreviewPluginId } from '@/di/registrations'
import type { NShiftEventModel } from '@/domain/events/nshift-event-model'
import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'

export type DomainRecordKind = 'plugin' | 'event'

export type DomainRecordValues = {
  name: string
  version: string
  trigger: string
}

type DomainRecordDialogProps = {
  kind: DomainRecordKind
  open: boolean
  title: string
  description: string
  initial: DomainRecordValues
  previewId?: PreviewPluginId
  initialMetadata?: Record<string, string>
  fields?: PluginField[]
  recordId?: string | null
  showDelete?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (result: {
    values: DomainRecordValues
    plugin?: NShiftPluginModel
    event?: NShiftEventModel
    metadata?: Record<string, PluginMetadataValue>
    style?: NShiftPluginStyle
  }) => void
  onDelete?: () => void
}

export function DomainRecordDialog({
  kind,
  open,
  title,
  description,
  initial,
  previewId,
  initialMetadata,
  fields,
  recordId,
  showDelete = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: DomainRecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DomainRecordForm
          key={`${previewId ?? kind}:${initial.name}:${initial.version}:${JSON.stringify(initialMetadata ?? {})}:${recordId ?? 'new'}`}
          kind={kind}
          title={title}
          description={description}
          initial={initial}
          previewId={previewId}
          initialMetadata={initialMetadata}
          fields={fields}
          recordId={recordId}
          showDelete={showDelete}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Dialog>
  )
}

function DomainRecordForm({
  kind,
  title,
  description,
  initial,
  previewId,
  initialMetadata,
  fields,
  recordId,
  showDelete = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: Omit<DomainRecordDialogProps, 'open'>) {
  const container = useNShift()
  const [values, setValues] = useState(initial)
  const metadataFields = fields ?? fieldsFor(previewId)
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>(() => ({
    ...initialFieldValues(previewId),
    ...Object.fromEntries(metadataFields.map((field) => [field.name, field.defaultValue])),
    ...(kind === 'plugin' ? initialStyleValues() : {}),
    ...styleFallback(initialMetadata),
    ...initialMetadata,
  }))
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const missingRequired = metadataFields.some(
    (field) => field.required && !(metadataValues[field.name] ?? '').trim(),
  )

  function update(field: keyof DomainRecordValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  function submit() {
    try {
      if (kind === 'plugin') {
        const style = pluginStyleFromFields(metadataValues)
        const metadata = metadataFromFieldList(metadataFields, metadataValues)
        onSubmit({
          values,
          metadata,
          style,
          plugin: previewId
            ? container.plugins.createPreview({
                previewId,
                name: values.name,
                version: values.version,
                id: recordId,
                metadata,
                style,
              })
            : container.plugins.create({
                name: values.name,
                version: values.version,
                id: recordId,
              }),
        })
        return
      }

      onSubmit({
        values,
        event: container.events.create({
          name: values.name,
          version: values.version,
          trigger: values.trigger,
          id: recordId ?? undefined,
        }),
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Dados inválidos.')
    }
  }

  return (
    <DialogContent className="p-6 sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid max-h-[70vh] grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto px-1 py-1">
        <Field
          id="domain-name"
          label="Nome"
          required
          value={values.name}
          placeholder={kind === 'plugin' ? 'HeroBanner' : 'OpenScreen'}
          onChange={(value) => update('name', value)}
        />
        <Field
          id="domain-version"
          label="Versão"
          required
          value={values.version}
          placeholder="1.0.0"
          onChange={(value) => update('version', value)}
        />
        {kind === 'event' && (
          <Field
            id="domain-trigger"
            label="Trigger"
            required
            value={values.trigger}
            placeholder="onTap"
            onChange={(value) => update('trigger', value)}
          />
        )}
        {metadataFields.map((field) => (
          <MetadataField
            key={field.name}
            field={field}
            value={metadataValues[field.name] ?? field.defaultValue}
            onChange={(next) =>
              setMetadataValues((current) => ({ ...current, [field.name]: next }))
            }
          />
        ))}
        {kind === 'plugin' && (
          <>
            <div className="col-span-2 mt-2 flex items-center gap-3">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Estilo
              </span>
              <span className="bg-border h-px flex-1" />
            </div>
            {pluginStyleFields.map((field) => (
              <MetadataField
                key={field.name}
                field={field}
                value={metadataValues[field.name] ?? field.defaultValue}
                onChange={(next) =>
                  setMetadataValues((current) => ({ ...current, [field.name]: next }))
                }
              />
            ))}
          </>
        )}
        {error && <p className="text-destructive col-span-2 text-sm">{error}</p>}
      </div>
      <DialogFooter className="gap-3 sm:justify-between">
        {showDelete && (
          <div className="flex flex-1 items-center gap-2">
            {confirmDelete ? (
              <>
                <p className="text-destructive text-xs">
                  Essa ação não pode ser desfeita.
                </p>
                <Button size="sm" variant="destructive" onClick={onDelete}>
                  Excluir definitivamente
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2Icon />
                Excluir
              </Button>
            )}
          </div>
        )}
        {!confirmDelete && (
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                !values.name.trim() ||
                !values.version.trim() ||
                (kind === 'event' && !values.trigger.trim()) ||
                missingRequired
              }
              onClick={submit}
            >
              Salvar
            </Button>
          </div>
        )}
      </DialogFooter>
    </DialogContent>
  )
}

function styleFallback(fields: Record<string, string> | undefined) {
  if (!fields) return {}
  const picked: Record<string, string> = {}
  const copy = (target: string, ...sources: string[]) => {
    const value = sources.map((source) => fields[source]).find(Boolean)
    if (value) picked[target] = value
  }
  copy('style.background.color', 'style.background.color')
  copy('style.ignoreSafeArea', 'style.ignoreSafeArea')
  copy('style.offset.x', 'style.offset.x')
  copy('style.offset.y', 'style.offset.y')
  copy('style.width', 'style.width', 'width')
  copy('style.height', 'style.height', 'height')
  copy('style.minWidth', 'style.minWidth', 'minWidth')
  copy('style.maxWidth', 'style.maxWidth', 'maxWidth')
  copy('style.minHeight', 'style.minHeight', 'minHeight')
  copy('style.maxHeight', 'style.maxHeight', 'maxHeight')
  return picked
}

function FieldLabel({
  htmlFor,
  label,
  required = false,
}: {
  htmlFor: string
  label: string
  required?: boolean
}) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className={required ? 'text-destructive text-xs' : 'text-muted-foreground text-xs'}>
        {required ? 'obrigatório' : 'opcional'}
      </span>
    </Label>
  )
}

function Field({
  id,
  label,
  required = false,
  value,
  placeholder,
  onChange,
}: {
  id: string
  label: string
  required?: boolean
  value: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={id} label={label} required={required} />
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function MetadataField({
  field,
  value,
  onChange,
}: {
  field: PluginField
  value: string
  onChange: (value: string) => void
}) {
  const id = `meta-${field.name}`
  return (
    <div className="grid min-w-0 gap-2">
      <FieldLabel htmlFor={id} label={field.label} required={field.required} />
      {field.kind === 'select' ? (
        <select
          id={id}
          className="border-input bg-background h-8 w-full rounded-lg border px-2 text-sm"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options?.map((option, index) => (
            <option key={option} value={option}>
              {field.optionLabels?.[index] ?? option}
            </option>
          ))}
        </select>
      ) : field.kind === 'icon' ? (
        <IconSelect id={id} value={value} onChange={onChange} />
      ) : field.kind === 'boolean' ? (
        <select
          id={id}
          className="border-input bg-background h-8 w-full rounded-lg border px-2 text-sm"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="true">sim</option>
          <option value="false">não</option>
        </select>
      ) : (
        <Input
          id={id}
          type={field.kind === 'number' ? 'number' : 'text'}
          value={value}
          placeholder={field.kind === 'list' ? 'Um, Dois, Três' : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  )
}
