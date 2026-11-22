import NShiftUI
import SwiftUI

extension NShiftTrigger {
    static let onTap: NShiftTrigger = "onTap"
    static let onChange: NShiftTrigger = "onChange"
    static let onSelect: NShiftTrigger = "onSelect"
    static let onDismiss: NShiftTrigger = "onDismiss"
    static let onComplete: NShiftTrigger = "onComplete"
    static let onPresent: NShiftTrigger = "onPresent"
    static let onFailure: NShiftTrigger = "onFailure"
    static let onScrollEndReached: NShiftTrigger = "onScrollEndReached"

    static func onStatusCode(_ statusCode: Int) -> NShiftTrigger? {
        try? NShiftTrigger(validating: "onStatusCode\(statusCode)")
    }
}

func fire(
    _ trigger: NShiftTrigger,
    engine: (any NShiftEngine)?,
    renderID: NShiftRenderID
) {
    guard let engine else { return }
    let pluginID = renderID.rawValue
    Task { @MainActor in
        await engine.handle(
            trigger,
            onPluginID: pluginID
        )
    }
}

func storeThenFire<Metadata: NShiftMetadata>(
    _ trigger: NShiftTrigger,
    engine: (any NShiftEngine)?,
    renderID: NShiftRenderID,
    metadata: Metadata
) {
    let pluginID = renderID.rawValue
    let stored = AnyNShiftMetadata(metadata)
    Task { @MainActor in
        engine?.replaceMetadata(
            pluginID: pluginID,
            with: stored
        )
        await engine?.handle(
            trigger,
            onPluginID: pluginID
        )
    }
}

@MainActor
func nshiftBinding<Metadata: NShiftMetadata, Value: Sendable>(
    _ trigger: NShiftTrigger,
    engine: (any NShiftEngine)?,
    renderID: NShiftRenderID,
    value: Value,
    write: @escaping @Sendable (Value) -> Metadata
) -> Binding<Value> {
    let screen = engine.flatMap {
        $0.optionalPluginViewModel(as: ScreenViewModel.self)
    }
    screen?.registerInput(
        engine: engine,
        renderID: renderID,
        value: value
    )
    return Binding(
        get: { value },
        set: { newValue in
            screen?.registerInput(
                engine: engine,
                renderID: renderID,
                value: newValue
            )
            storeThenFire(
                trigger,
                engine: engine,
                renderID: renderID,
                metadata: write(newValue)
            )
        }
    )
}
