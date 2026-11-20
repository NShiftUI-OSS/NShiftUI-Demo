import Foundation

enum SCNSheetDetent: Hashable {
    case medium
    case large
    case fraction(CGFloat)
    case height(CGFloat)
    case content

    var identifier: String {
        switch self {
        case .medium:
            return "medium"
        case .large:
            return "large"
        case .content:
            return "content"
        case .fraction(let value):
            return String(format: "fraction-%.4f", value)
        case .height(let value):
            return String(format: "height-%.2f", value)
        }
    }
}
