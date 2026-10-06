import * as Dialog from '@radix-ui/react-dialog'
import * as Switch from '@radix-ui/react-switch'
import { Settings2, X } from 'lucide-react'
import { useState } from 'react'
import { ConfigUpdate } from '../config/locationHash'

export interface SettingsValues extends ConfigUpdate {
  size: number
  bumperCount: number
  baseBumperViewTimeMs: number
  perBumperViewTimeMs: number
  ballSpeed: number
  practiceMode: boolean
  seed: string
  pauseAfterSuccess: boolean
  pauseAfterFailure: boolean
}

interface SettingsDialogProps {
  config: SettingsValues
  onApply: (values: SettingsValues) => void
  showSetupTrigger: boolean
}

type NumberField = { key: keyof SettingsValues; label: string; min: number; suffix?: string }
type DurationField = { key: 'duration' }

let numberFields: (NumberField | DurationField)[] = [
  { key: 'size', label: 'Grid size', min: 3 },
  { key: 'bumperCount', label: 'Bumpers', min: 2 },
  { key: 'baseBumperViewTimeMs', label: 'Base view time', min: 0, suffix: 'ms' },
  { key: 'perBumperViewTimeMs', label: 'Per-bumper time', min: 0, suffix: 'ms' },
  { key: 'duration' },
  { key: 'ballSpeed', label: 'Ball speed', min: 1, suffix: '%' },
]

const booleanOptions: [string, string, keyof SettingsValues][] = [
  ['Practice mode', 'Keep the selected difficulty fixed', 'practiceMode'],
  ['Pause after success', 'Wait for a click before the next round', 'pauseAfterSuccess'],
  ['Pause after failure', 'Wait for a click before the next round', 'pauseAfterFailure'],
]

export function SettingsDialog({ config, onApply, showSetupTrigger }: SettingsDialogProps) {
  let [draft, setDraft] = useState<SettingsValues>(config)
  let [open, setOpen] = useState(false)
  let resetDraft = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(config)
    }
    setOpen(nextOpen)
  }
  let maxBumpers = draft.size ** 2
  let bumperViewDuration =
    draft.baseBumperViewTimeMs + draft.perBumperViewTimeMs * draft.bumperCount

  return (
    <Dialog.Root open={open} onOpenChange={resetDraft}>
      <Dialog.Trigger asChild>
        {showSetupTrigger ? (
          <button className="mt-4 rounded-full border border-gray-200 bg-background px-4 py-2 text-sm font-semibold text-muted shadow-lg transition hover:bg-board focus:outline-none focus:ring-2 focus:ring-brass">
            Game settings
          </button>
        ) : (
          <button
            className="fixed right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-3xl border border-gray-200 bg-background text-muted shadow-lg transition hover:bg-board focus:outline-none focus:ring-2 focus:ring-brass"
            aria-label="Open game settings"
          >
            <Settings2 size={20} />
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/70" />
        <Dialog.Content className="fixed inset-x-3 top-1/2 z-40 mx-auto max-h-[90vh] w-full max-w-xl -translate-y-1/2 overflow-y-auto rounded-3xl border border-gray-200 bg-surface p-5 text-muted shadow-2xl sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-xl font-semibold text-foreground">
                Game settings
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted/80">
                Apply starts a fresh session.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="rounded p-2 hover:bg-gray-50" aria-label="Close settings">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {numberFields.map((field) => {
              if (field.key === 'duration') {
                return (
                  <output
                    key={field.key}
                    className="rounded-3xl border border-transparent bg-background px-4 py-3 text-sm text-muted sm:col-span-2"
                  >
                    <span className="block text-xs uppercase text-muted/70">
                      Bumper view duration
                    </span>
                    <span className="mt-1 block text-foreground">
                      Base view time + Per-bumper time * Bumper count = {bumperViewDuration} ms
                    </span>
                  </output>
                )
              }

              return (
                <label key={field.key} className="grid gap-1 text-sm">
                  <span>{field.label}</span>
                  <div className="flex items-center rounded-full border border-gray-200 bg-background focus-within:border-brass">
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-foreground outline-none"
                      type="number"
                      min={field.min}
                      max={field.key === 'bumperCount' ? maxBumpers : undefined}
                      value={draft[field.key] as number}
                      onChange={(event) => {
                        let value = Math.max(field.min, Number(event.target.value) || field.min)
                        if (field.key === 'bumperCount') {
                          value = Math.min(value, maxBumpers)
                        }
                        setDraft({ ...draft, [field.key]: value })
                      }}
                    />
                    {field.suffix && (
                      <span className="pr-3 text-xs text-muted/70">{field.suffix}</span>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
          <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 text-sm">
            {booleanOptions.map(([label, description, key]) => (
              <label key={key} className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-foreground">{label}</span>
                  <span className="text-xs text-muted/70">{description}</span>
                </span>
                <Switch.Root
                  className="relative h-6 w-11 rounded-full bg-slate-300 outline-none data-[state=checked]:bg-primary"
                  checked={draft[key as keyof SettingsValues] as boolean}
                  onCheckedChange={(checked) => setDraft({ ...draft, [key]: checked })}
                >
                  <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-[#f7ead2] transition-transform data-[state=checked]:translate-x-5" />
                </Switch.Root>
              </label>
            ))}
          </div>
          <div className="mt-7 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
            </Dialog.Close>
            <button
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              onClick={() => {
                onApply(draft)
                setOpen(false)
              }}
            >
              Apply and restart
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
