import Foundation
import NShiftUI
import Swinject

final class SwinjectNShiftContainer: @unchecked Sendable, NShiftDependencyContainer {
    private let swinject: Container
    /// Swinject containers are not thread-safe; events are created from
    /// concurrent tasks (one per trigger), so every access is serialized.
    /// Recursive because factories resolve their own dependencies.
    private let lock = NSRecursiveLock()

    init(swinject: Container = Container()) {
        self.swinject = swinject
    }

    func register<Service>(
        _ serviceType: Service.Type,
        name: String?,
        scope: NShiftDependencyScope,
        argumentTypes: [Any.Type],
        factory: @escaping @Sendable ([Any]) -> Service?
    ) {
        lock.lock()
        defer { lock.unlock() }
        let key = Self.registrationKey(
            service: serviceType,
            name: name,
            argumentTypes: argumentTypes
        )
        if scope == .singleton {
            swinject.register(
                SwinjectNShiftSingleton.self,
                name: key
            ) { _ in
                SwinjectNShiftSingleton()
            }
            .inObjectScope(.container)
        }

        swinject.register(
            SwinjectNShiftBox.self,
            name: key
        ) { [weak self] resolver in
            let arguments = self?.currentArguments() ?? []
            let value: Any?
            if scope == .singleton {
                let gate = resolver.resolve(
                    SwinjectNShiftSingleton.self,
                    name: key
                )
                value = gate?.value {
                    factory(arguments)
                }
            } else {
                value = factory(arguments)
            }
            return SwinjectNShiftBox(value)
        }
        .inObjectScope(.transient)
    }

    func resolve<Service>(
        _ serviceType: Service.Type,
        name: String?,
        argumentTypes: [Any.Type],
        arguments: [Any]
    ) -> Service? {
        lock.lock()
        defer { lock.unlock() }
        if serviceType == NShiftEngine.self,
           let current = NShiftRenderingEngine.current as? Service {
            return current
        }
        let key = Self.registrationKey(
            service: serviceType,
            name: name,
            argumentTypes: argumentTypes
        )
        let stack = argumentStack()
        stack.frames.append(arguments)
        defer { stack.frames.removeLast() }
        guard let box = swinject.resolve(
            SwinjectNShiftBox.self,
            name: key
        ) else {
            return nil
        }
        return box.value as? Service
    }

    private func currentArguments() -> [Any] {
        argumentStack().frames.last ?? []
    }

    private func argumentStack() -> SwinjectNShiftArgumentStack {
        let key = "nshift.swinject.\(ObjectIdentifier(self))"
        let dictionary = Thread.current.threadDictionary
        if let stack = dictionary[key] as? SwinjectNShiftArgumentStack {
            return stack
        }
        let stack = SwinjectNShiftArgumentStack()
        dictionary[key] = stack
        return stack
    }

    private static func registrationKey(
        service: Any.Type,
        name: String?,
        argumentTypes: [Any.Type]
    ) -> String {
        let arguments = argumentTypes
            .map { String(reflecting: $0) }
            .joined(separator: ",")
        return "\(String(reflecting: service))|\(name ?? "")|\(arguments)"
    }
}

private final class SwinjectNShiftBox {
    let value: Any?

    init(_ value: Any?) {
        self.value = value
    }
}

private final class SwinjectNShiftSingleton {
    private let lock = NSLock()
    private var stored: Any?
    private var ready = false

    func value(_ make: () -> Any?) -> Any? {
        lock.lock()
        defer { lock.unlock() }
        if ready {
            return stored
        }
        let made = make()
        if let made {
            stored = made
            ready = true
        }
        return made
    }
}

private final class SwinjectNShiftArgumentStack {
    var frames: [[Any]] = []
}
