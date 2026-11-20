import NShiftUI

func dispatch(
    _ trigger: NShiftTrigger,
    events: [AnyNShiftPluginEvent],
    handler: any NShiftEventHandler,
    viewModel: (any NShiftPluginViewModel)?
) async {
    await handler.handle(
        trigger,
        events: events,
        viewModel: viewModel
    )
}

func isOutcomeTrigger(_ trigger: NShiftTrigger) -> Bool {
    let raw = trigger.rawValue
    return raw == "onComplete" || raw == "onFailure" || raw.hasPrefix("onStatusCode")
}

@MainActor
func findEvent(
    id: String,
    in node: NShiftPluginNode
) -> NShiftEventModel? {
    if let found = findEvent(
        id: id,
        in: node.model.events.compactMap(\.event)
    ) {
        return found
    }
    for child in node.children {
        if let found = findEvent(
            id: id,
            in: child
        ) {
            return found
        }
    }
    for children in node.slotChildren.values {
        for child in children {
            if let found = findEvent(
                id: id,
                in: child
            ) {
                return found
            }
        }
    }
    return nil
}

private func findEvent(
    id: String,
    in events: [NShiftEventModel]
) -> NShiftEventModel? {
    for event in events {
        if event.id == id {
            return event
        }
        if let nested = findEvent(
            id: id,
            in: event.events
        ) {
            return nested
        }
    }
    return nil
}
