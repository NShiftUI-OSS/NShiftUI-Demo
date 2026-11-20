# Plugins nativos

Este repositório não desenha plugin e não guarda catálogo. Plugin, evento e trigger nascem no editor e entram no Rainbow da screen.

## O que entra no Postgres

- `screens`: `name`, `description`, `rainbow_source`, `revision`, `version`, `is_root`.
- `screen_versions`: `screen_id`, `version`, `rainbow_source`, `created_at`. Uma linha por SemVer gravado.

`revision` é o token do PUT. `version` é o SemVer. O banco não tem tabela de plugin, evento ou trigger.

## O que não entra

O Rainbow da tela é livre. `use Text@1.0.0` é gravado no texto da screen. Não existe linha de plugin no banco.

A lista de plugins e eventos que o app registra está no harness do CMS-WEB (`docs/Harness/Plugins.md`), copiada de `NShiftUI-iOS-POC/NShiftUI/DI/CatalogAssembly.swift`. O editor já desenha esses plugins, menos `Sheet` e `Screen`. Aqui a lista continua só como direção de nome:

Accordion, Alert, Attachment, Avatar, Badge, Bubble, Button, ButtonGroup, Calendar, Card, Carousel, Checkbox, Empty, Field, Form, Input, InputGroup, InputOTP, Item, Marker, Screen, Progress, Questionnaire, RadioGroup, Select, Separator, Sheet, Skeleton, Slider, Sonner, Spinner, Switch, Tabs, Text, Textarea, Toast, Toggle, ToggleGroup, WheelSelect.

Eventos: ChangePluginMetadata, ChangeEventMetadata, ChangePlugin, ChangeEvent, SendHTTPRequest, OpenBottomSheet, CloseBottomSheet, Navigate.

O editor também desenha blocos de layout que não estão nesse assembly: Image, List, Container, VerticalStack, HorizontalStack, LayerStack, Scroll. Eles podem aparecer no Rainbow sem uma linha de catálogo.

Triggers que o app já nomeia: `onTap`, `onChange`, `onSelect`, `onDismiss`, `onComplete`, `onPresent`, `onFailure`.
