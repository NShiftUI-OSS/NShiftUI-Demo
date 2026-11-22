import ImageIO
import SwiftUI

struct SCNAvatar: View {
    @EnvironmentObject private var theme: SCNTheme

    enum Size {
        case sm
        case `default`
        case lg
        case xl
    }

    private let initials: String
    private let size: Size
    private let imageURL: String

    private var side: CGFloat {
        switch size {
        case .sm: return theme.spacing.s6
        case .default: return theme.spacing.s8
        case .lg: return theme.spacing.s10
        case .xl: return theme.spacing.s16 * 2
        }
    }

    private var textStyle: SCNText.Style {
        size == .lg ? .sm : .xs
    }

    init(
        initials: String,
        size: Size = .default,
        imageURL: String = ""
    ) {
        self.initials = initials
        self.size = size
        self.imageURL = imageURL
    }

    var body: some View {
        Group {
            if let url = URL(string: imageURL), url.scheme != nil {
                RemoteAvatarImage(url: url, side: side) {
                    initialsView
                }
            } else {
                initialsView
            }
        }
            .frame(
                width: side,
                height: side
            )
            .background(theme.palette.muted)
            .clipShape(Circle())
    }

    private var initialsView: some View {
        SCNText(
            initials,
            style: textStyle,
            weight: .medium,
            color: .mutedForeground
        )
    }
}

private struct RemoteAvatarImage<Placeholder: View>: View {
    let url: URL
    let side: CGFloat
    @ViewBuilder let placeholder: () -> Placeholder
    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image = image ?? RemoteAvatarImageCache.shared.image(for: url) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                placeholder()
            }
        }
        .task(id: url) {
            if let cached = RemoteAvatarImageCache.shared.image(for: url) {
                image = cached
                return
            }
            image = nil
            image = await RemoteAvatarImageCache.shared.load(url, side: side)
        }
    }
}

@MainActor
private final class RemoteAvatarImageCache {
    static let shared = RemoteAvatarImageCache()

    private let cache = NSCache<NSURL, UIImage>()
    private var inFlight: [URL: Task<UIImage?, Never>] = [:]

    private init() {
        cache.countLimit = 300
    }

    func image(for url: URL) -> UIImage? {
        cache.object(forKey: url as NSURL)
    }

    func load(_ url: URL, side: CGFloat) async -> UIImage? {
        if let cached = image(for: url) {
            return cached
        }
        if let task = inFlight[url] {
            return await task.value
        }
        let pixels = side * UIScreen.main.scale
        let task = Task.detached(priority: .utility) { () -> UIImage? in
            guard let (data, _) = try? await URLSession.shared.data(from: url) else {
                return nil
            }
            return Self.downsample(data, maxPixels: pixels)
        }
        inFlight[url] = task
        let result = await task.value
        inFlight[url] = nil
        if let result {
            cache.setObject(result, forKey: url as NSURL)
        }
        return result
    }

    nonisolated private static func downsample(_ data: Data, maxPixels: CGFloat) -> UIImage? {
        let sourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
        guard let source = CGImageSourceCreateWithData(data as CFData, sourceOptions) else {
            return nil
        }
        let options = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: max(maxPixels, 1),
        ] as CFDictionary
        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options) else {
            return nil
        }
        return UIImage(cgImage: cgImage)
    }
}

#Preview {
    SCNComponentPreview {
        HStack(spacing: SCNTheme.shared.spacing.s3) {
            SCNAvatar(
                initials: "A",
                size: .sm
            )
            SCNAvatar(initials: "NS")
            SCNAvatar(
                initials: "UI",
                size: .lg
            )
        }
    }
}
