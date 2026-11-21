import SwiftUI

struct NShiftLaunchScreen: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            palette.background
            if let icon = Self.presentation {
                mark(icon)
            }
        }
        .frame(
            maxWidth: .infinity,
            maxHeight: .infinity
        )
        .ignoresSafeArea()
        .navigationBarHidden(true)
    }

    private var palette: SCNThemePalette {
        let neutral = SCNThemePreset.named(.neutral)
        if colorScheme == .dark {
            return neutral.dark
        }
        return neutral.light
    }

    private var containerSide: CGFloat {
        let spacing = SCNSpacingTokens.standard
        return spacing.s16 * 2 + spacing.s8
    }

    private var markPadding: CGFloat {
        SCNSpacingTokens.standard.s5
    }

    private func mark(_ icon: LaunchIcon) -> some View {
        let radius = SCNRadiusTokens.standard
        let border = SCNBorderTokens.standard
        let side = containerSide
        let inner = side - markPadding * 2
        let drawn = inner / icon.contentFraction
        return Image(uiImage: icon.image)
            .renderingMode(.original)
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(
                width: drawn,
                height: drawn
            )
            .offset(icon.opticalOffset(drawn: drawn))
            .frame(
                width: side,
                height: side
            )
            .background(palette.card)
            .clipShape(
                RoundedRectangle(
                    cornerRadius: radius.xl,
                    style: .continuous
                )
            )
            .overlay(
                RoundedRectangle(
                    cornerRadius: radius.xl,
                    style: .continuous
                )
                .strokeBorder(
                    palette.border,
                    lineWidth: border.hairline
                )
            )
    }

    private static let presentation: LaunchIcon? = LaunchIcon.load()
}

private struct LaunchIcon {
    let image: UIImage
    let contentFraction: CGFloat
    let biasX: CGFloat
    let biasY: CGFloat

    func opticalOffset(drawn: CGFloat) -> CGSize {
        CGSize(
            width: -biasX * drawn,
            height: -biasY * drawn
        )
    }

    static func load() -> LaunchIcon? {
        guard let image = sourceImage() else {
            return nil
        }
        let metrics = contentMetrics(of: image)
        return LaunchIcon(
            image: image,
            contentFraction: metrics.fraction,
            biasX: metrics.biasX,
            biasY: metrics.biasY
        )
    }

    private static func sourceImage() -> UIImage? {
        var best: UIImage?
        for name in ["AppIcon"] + iconNames + ["AppIcon60x60"] {
            guard
                let image = UIImage(named: name),
                image.size.width > 0,
                image.size.height > 0
            else {
                continue
            }
            if best == nil || image.size.width > best!.size.width {
                best = image
            }
        }
        return best
    }

    private static var iconNames: [String] {
        let keys = [
            "CFBundleIcons",
            "CFBundleIcons~ipad",
        ]
        var names: [String] = []
        for key in keys {
            guard
                let icons = Bundle.main.infoDictionary?[key] as? [String: Any],
                let primary = icons["CFBundlePrimaryIcon"] as? [String: Any],
                let files = primary["CFBundleIconFiles"] as? [String]
            else {
                continue
            }
            for file in files where names.contains(file) == false {
                names.append(file)
            }
        }
        return names
    }

    private static func contentMetrics(
        of image: UIImage
    ) -> (
        fraction: CGFloat,
        biasX: CGFloat,
        biasY: CGFloat
    ) {
        let full = (
            fraction: CGFloat(1),
            biasX: CGFloat(0),
            biasY: CGFloat(0)
        )
        guard
            let cgImage = image.cgImage,
            cgImage.width > 0,
            cgImage.height > 0
        else {
            return full
        }
        let width = cgImage.width
        let height = cgImage.height
        let bytesPerRow = width * 4
        var pixels = [UInt8](
            repeating: 0,
            count: height * bytesPerRow
        )
        guard let context = CGContext(
            data: &pixels,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: bytesPerRow,
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            return full
        }
        context.draw(
            cgImage,
            in: CGRect(
                x: 0,
                y: 0,
                width: width,
                height: height
            )
        )
        let step = max(1, width / 256)
        var minX = width
        var minY = height
        var maxX = 0
        var maxY = 0
        for y in stride(from: 0, to: height, by: step) {
            for x in stride(from: 0, to: width, by: step) {
                let alpha = pixels[(y * bytesPerRow) + (x * 4) + 3]
                guard alpha > 12 else {
                    continue
                }
                minX = min(minX, x)
                minY = min(minY, y)
                maxX = max(maxX, x)
                maxY = max(maxY, y)
            }
        }
        guard maxX >= minX, maxY >= minY else {
            return full
        }
        let contentWidth = CGFloat(maxX - minX + step)
        let contentHeight = CGFloat(maxY - minY + step)
        let fraction = min(
            max(
                max(contentWidth / CGFloat(width), contentHeight / CGFloat(height)),
                0.2
            ),
            1
        )
        let centerX = CGFloat(minX + maxX) / 2
        let centerY = CGFloat(minY + maxY) / 2
        return (
            fraction: fraction,
            biasX: (centerX - CGFloat(width) / 2) / CGFloat(width),
            biasY: (centerY - CGFloat(height) / 2) / CGFloat(height)
        )
    }
}
