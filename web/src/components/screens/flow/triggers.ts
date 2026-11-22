const pluginTriggers: Record<string, readonly string[]> = {
  Screen: ['OnAppear', 'OnScrollEndReached'],
  Button: ['OnTap'],
  ButtonGroup: ['OnSelect'],
  Calendar: ['OnSelect'],
  Card: ['OnTap'],
  Checkbox: ['OnChange'],
  Input: ['OnChange'],
  InputOTP: ['OnChange', 'OnComplete'],
  Radio: ['OnChange'],
  SearchBar: ['OnChange', 'OnSubmit'],
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
