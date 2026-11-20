package com.nshiftui.poc.sdui.events.scn.eventdispatch

import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEngineTree
import com.nshiftui.NShiftEvent
import com.nshiftui.NShiftEventHandler
import com.nshiftui.NShiftEventModel
import com.nshiftui.NShiftPluginNode
import com.nshiftui.NShiftTrigger
import com.nshiftui.resolveOrThrow

suspend fun dispatch(event: NShiftEvent, trigger: NShiftTrigger) {
    val handler = event.resolver.resolveOrThrow<NShiftEventHandler>()
    handler.handle(trigger, event.model.events, event.viewModel)
}

fun isOutcomeTrigger(trigger: NShiftTrigger): Boolean {
    val raw = trigger.rawValue
    return raw == "onComplete" || raw == "onFailure" || raw.startsWith("onStatusCode")
}

fun findEvent(id: String, node: NShiftPluginNode): NShiftEventModel? {
    findEvent(id, node.model.events)?.let { return it }
    for (child in node.children) {
        findEvent(id, child)?.let { return it }
    }
    for (children in node.slotChildren.values) {
        for (child in children) {
            findEvent(id, child)?.let { return it }
        }
    }
    return null
}

fun findEvent(id: String, events: List<NShiftEventModel>): NShiftEventModel? {
    for (event in events) {
        if (event.id == id) {
            return event
        }
        findEvent(id, event.events)?.let { return it }
    }
    return null
}

fun NShiftEvent.tree(): NShiftEngineTree {
    val engine = resolver.resolveOrThrow<NShiftEngine>()
    return engine as? NShiftEngineTree
        ?: error("Unwrapped resolve failed for NShiftEngineTree")
}
