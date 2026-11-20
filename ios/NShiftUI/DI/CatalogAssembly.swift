import NShiftUI

struct CatalogAssembly: NShiftDependencyAssembly {
    @NShiftPluginAssemble(
    AlertPlugin.self,
    AttachmentPlugin.self,
    AvatarPlugin.self,
    BadgePlugin.self,
    ButtonGroupPlugin.self,
    ButtonPlugin.self,
    CalendarPlugin.self,
    CardPlugin.self,
    CheckboxPlugin.self,
    FieldPlugin.self,
    HorizontalListPlugin.self,
    HorizontalScrollPlugin.self,
    HorizontalStackPlugin.self,
    InputOTPPlugin.self,
    InputPlugin.self,
    ItemPlugin.self,
    LayerStackPlugin.self,
    ScreenPlugin.self,
    ProgressPlugin.self,
    RadioPlugin.self,
    SelectPlugin.self,
    SeparatorPlugin.self,
    SheetPlugin.self,
    SkeletonPlugin.self,
    SliderPlugin.self,
    SpinnerPlugin.self,
    SwitchPlugin.self,
    TabsPlugin.self,
    TextPlugin.self,
    TextareaPlugin.self,
    ToggleGroupPlugin.self,
    VerticalListPlugin.self,
    VerticalScrollPlugin.self,
    VerticalStackPlugin.self
)
    @MainActor
    func assemblePlugins(in container: any NShiftDependencyContainer) {}

    @NShiftEventAssemble(
        ChangePluginMetadataEvent.self,
        ChangeEventMetadataEvent.self,
        ChangePluginEvent.self,
        ChangeEventEvent.self,
        SendHTTPRequestEvent.self,
        OpenBottomSheetEvent.self,
        CloseBottomSheetEvent.self,
        NavigateEvent.self,
        AsyncNavigateEvent.self
    )
    func assembleEvents(in container: any NShiftDependencyContainer) {}
}
