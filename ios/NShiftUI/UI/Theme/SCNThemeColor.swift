import SwiftUI

struct SCNThemeColor {
    var l: Double
    var c: Double
    var h: Double
    var alpha: Double
    var red: Double? = nil
    var green: Double? = nil
    var blue: Double? = nil

    var color: Color {
        let (
            red,
            green,
            blue
        ) = components
        return Color(
            .sRGB,
            red: red,
            green: green,
            blue: blue,
            opacity: alpha
        )
    }

    var uiColor: UIColor {
        let (
            red,
            green,
            blue
        ) = components
        return UIColor(
            red: red,
            green: green,
            blue: blue,
            alpha: alpha
        )
    }

    static func hsl(
        h: Double,
        s: Double,
        l: Double,
        alpha: Double = 1
    ) -> SCNThemeColor {
        let (
            red,
            green,
            blue
        ) = rgb(
            h: h,
            s: s,
            l: l
        )
        return SCNThemeColor(
            l: 0,
            c: 0,
            h: 0,
            alpha: alpha,
            red: red,
            green: green,
            blue: blue
        )
    }

    private var components: (
        Double,
        Double,
        Double
    ) {
        if let red, let green, let blue {
            return (
                red,
                green,
                blue
            )
        }
        return Self.srgb(
            l: l,
            c: c,
            h: h
        )
    }

    private static func rgb(
        h: Double,
        s: Double,
        l: Double
    ) -> (
        Double,
        Double,
        Double
    ) {
        let hue = h / 360
        let saturation = s / 100
        let lightness = l / 100
        if saturation == 0 {
            return (
                lightness,
                lightness,
                lightness
            )
        }
        let q = lightness < 0.5
            ? lightness * (1 + saturation)
            : lightness + saturation - lightness * saturation
        let p = 2 * lightness - q
        return (
            channel(
                p: p,
                q: q,
                t: hue + 1 / 3
            ),
            channel(
                p: p,
                q: q,
                t: hue
            ),
            channel(
                p: p,
                q: q,
                t: hue - 1 / 3
            )
        )
    }

    private static func channel(
        p: Double,
        q: Double,
        t: Double
    ) -> Double {
        var value = t
        if value < 0 {
            value += 1
        }
        if value > 1 {
            value -= 1
        }
        if value < 1 / 6 {
            return p + (q - p) * 6 * value
        }
        if value < 1 / 2 {
            return q
        }
        if value < 2 / 3 {
            return p + (q - p) * (2 / 3 - value) * 6
        }
        return p
    }

    private static func srgb(
        l: Double,
        c: Double,
        h: Double
    ) -> (
        Double,
        Double,
        Double
    ) {
        let hue = h * .pi / 180
        let a = c * cos(hue)
        let b = c * sin(hue)
        let lmsL = cube(l + 0.3963377774 * a + 0.2158037573 * b)
        let lmsM = cube(l - 0.1055613458 * a - 0.0638541728 * b)
        let lmsS = cube(l - 0.0894841775 * a - 1.2914855480 * b)
        let red = 4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS
        let green = -1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS
        let blue = -0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.7076147010 * lmsS
        return (
            encode(red),
            encode(green),
            encode(blue)
        )
    }

    private static func cube(_ value: Double) -> Double {
        value * value * value
    }

    private static func encode(_ channel: Double) -> Double {
        let clamped = min(
            max(
                channel,
                0
            ),
            1
        )
        if clamped <= 0.0031308 {
            return 12.92 * clamped
        }
        return 1.055 * pow(
            clamped,
            1 / 2.4
        ) - 0.055
    }
}
