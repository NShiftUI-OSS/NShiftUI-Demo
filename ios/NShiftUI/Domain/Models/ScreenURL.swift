import Foundation

struct ScreenURL: Equatable, Sendable {
    let path: String
    let query: [String: String]

    init?(_ text: String) {
        let pieces = text.split(
            separator: "?",
            maxSplits: 1,
            omittingEmptySubsequences: false
        )
        let path = String(pieces[0])
        guard path.isEmpty == false else {
            return nil
        }
        self.path = path
        guard pieces.count == 2 else {
            self.query = [:]
            return
        }
        var query: [String: String] = [:]
        for pair in pieces[1].split(separator: "&") where pair.isEmpty == false {
            let parts = pair.split(
                separator: "=",
                maxSplits: 1,
                omittingEmptySubsequences: false
            )
            let name = String(parts[0]).removingPercentEncoding ?? String(parts[0])
            guard name.isEmpty == false, query[name] == nil else {
                continue
            }
            let value = parts.count > 1
                ? (String(parts[1]).removingPercentEncoding ?? String(parts[1]))
                : ""
            query[name] = value
        }
        self.query = query
    }
}
