import Combine
import Foundation

/// App-scoped lists shared by every screen (for example a cart). Items are
/// added with `AddListItemEvent` and removed with `ClearListEvent`; any
/// `ForEach(source:)` bound to the list id renders them, and a
/// `FloatingButton(badgeList:)` shows how many there are. Nothing here knows
/// what the items are.
@MainActor
final class AppLists: ObservableObject {
    static let shared = AppLists()

    @Published private(set) var counts: [String: Int] = [:]
    let changes = PassthroughSubject<String, Never>()
    private var lists: [String: [Any]] = [:]

    func contains(_ listID: String) -> Bool {
        lists[listID] != nil
    }

    func items(_ listID: String) -> [Any] {
        lists[listID] ?? []
    }

    func count(_ listID: String) -> Int {
        counts[listID] ?? 0
    }

    func add(_ item: Any, to listID: String) {
        lists[listID, default: []].append(item)
        publish(listID)
    }

    func clear(_ listID: String) {
        lists[listID] = []
        publish(listID)
    }

    private func publish(_ listID: String) {
        counts[listID] = lists[listID]?.count ?? 0
        changes.send(listID)
    }
}
