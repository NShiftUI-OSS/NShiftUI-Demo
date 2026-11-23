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

    func add(_ item: [String: String], to listID: String) {
        var entry = item
        entry["listEntryID"] = UUID().uuidString
        lists[listID, default: []].append(entry)
        publish(listID)
    }

    func remove(entryID: String, from listID: String) -> Bool {
        guard let index = lists[listID]?.firstIndex(where: {
            ($0 as? [String: String])?["listEntryID"] == entryID
        }) else { return false }
        lists[listID]?.remove(at: index)
        publish(listID)
        return true
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
