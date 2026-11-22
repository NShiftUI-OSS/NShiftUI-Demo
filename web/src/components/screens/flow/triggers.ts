const pluginTriggers: Record<string, readonly string[]> = {
  Screen: ['OnScrollEndReached'],
  Button: ['OnTap'],
  ButtonGroup: ['OnSelect'],
  Calendar: ['OnSelect'],
  Card: ['OnTap'],
  Checkbox: ['OnChange'],
  Input: ['OnChange'],
  InputOTP: ['OnChange', 'OnComplete'],
  Radio: ['OnChange'],
  Select: ['OnSelect'],
  Sheet: ['OnPresent', 'OnDismiss'],
  Slider: ['OnChange'],
  Switch: ['OnChange'],
  Tabs: ['OnSelect'],
  Textarea: ['OnChange'],
  ToggleGroup: ['OnSelect'],
}

export function triggersForPlugin(name: string) {
  return pluginTriggers[name] ?? []
}
