import CoreText
import Foundation
import UIKit

@MainActor
enum SCNDesignSystem {
    private static var didRegisterFonts = false

    static func install() {
        registerFonts()
        SCNSwizzle.install()
    }

    private static func registerFonts() {
        guard !didRegisterFonts else { return }
        guard let root = Bundle.main.url(
            forResource: "Fonts",
            withExtension: nil
        ) else {
            didRegisterFonts = true
            return
        }
        guard let enumerator = FileManager.default.enumerator(
            at: root,
            includingPropertiesForKeys: [.isRegularFileKey]
        ) else {
            didRegisterFonts = true
            return
        }

        let urls = enumerator.compactMap { item -> URL? in
            guard let url = item as? URL else { return nil }
            switch url.pathExtension.lowercased() {
            case "ttf", "otf", "ttc":
                return url
            default:
                return nil
            }
        }
        guard !urls.isEmpty else {
            didRegisterFonts = true
            return
        }

        for url in urls {
            CTFontManagerRegisterFontsForURL(
                url as CFURL,
                .process,
                nil
            )
        }
        didRegisterFonts = true
    }
}
