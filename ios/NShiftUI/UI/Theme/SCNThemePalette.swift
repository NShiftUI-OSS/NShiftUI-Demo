import SwiftUI

struct SCNThemePalette {
    let background: Color
    let backgroundUIColor: UIColor
    let foreground: Color
    let foregroundUIColor: UIColor
    let card: Color
    let cardForeground: Color
    let popover: Color
    let popoverForeground: Color
    let primary: Color
    let primaryForeground: Color
    let secondary: Color
    let secondaryForeground: Color
    let muted: Color
    let mutedForeground: Color
    let mutedForegroundUIColor: UIColor
    let accent: Color
    let accentForeground: Color
    let destructive: Color
    let border: Color
    let input: Color
    let ring: Color
    let chart1: Color
    let chart2: Color
    let chart3: Color
    let chart4: Color
    let chart5: Color
    let sidebar: Color
    let sidebarForeground: Color
    let sidebarPrimary: Color
    let sidebarPrimaryForeground: Color
    let sidebarAccent: Color
    let sidebarAccentForeground: Color
    let sidebarBorder: Color
    let sidebarRing: Color

    init(
        background: SCNThemeColor,
        foreground: SCNThemeColor,
        card: SCNThemeColor,
        cardForeground: SCNThemeColor,
        popover: SCNThemeColor,
        popoverForeground: SCNThemeColor,
        primary: SCNThemeColor,
        primaryForeground: SCNThemeColor,
        secondary: SCNThemeColor,
        secondaryForeground: SCNThemeColor,
        muted: SCNThemeColor,
        mutedForeground: SCNThemeColor,
        accent: SCNThemeColor,
        accentForeground: SCNThemeColor,
        destructive: SCNThemeColor,
        border: SCNThemeColor,
        input: SCNThemeColor,
        ring: SCNThemeColor,
        chart1: SCNThemeColor,
        chart2: SCNThemeColor,
        chart3: SCNThemeColor,
        chart4: SCNThemeColor,
        chart5: SCNThemeColor,
        sidebar: SCNThemeColor,
        sidebarForeground: SCNThemeColor,
        sidebarPrimary: SCNThemeColor,
        sidebarPrimaryForeground: SCNThemeColor,
        sidebarAccent: SCNThemeColor,
        sidebarAccentForeground: SCNThemeColor,
        sidebarBorder: SCNThemeColor,
        sidebarRing: SCNThemeColor
    ) {
        self.background = background.color
        self.backgroundUIColor = background.uiColor
        self.foreground = foreground.color
        self.foregroundUIColor = foreground.uiColor
        self.card = card.color
        self.cardForeground = cardForeground.color
        self.popover = popover.color
        self.popoverForeground = popoverForeground.color
        self.primary = primary.color
        self.primaryForeground = primaryForeground.color
        self.secondary = secondary.color
        self.secondaryForeground = secondaryForeground.color
        self.muted = muted.color
        self.mutedForeground = mutedForeground.color
        self.mutedForegroundUIColor = mutedForeground.uiColor
        self.accent = accent.color
        self.accentForeground = accentForeground.color
        self.destructive = destructive.color
        self.border = border.color
        self.input = input.color
        self.ring = ring.color
        self.chart1 = chart1.color
        self.chart2 = chart2.color
        self.chart3 = chart3.color
        self.chart4 = chart4.color
        self.chart5 = chart5.color
        self.sidebar = sidebar.color
        self.sidebarForeground = sidebarForeground.color
        self.sidebarPrimary = sidebarPrimary.color
        self.sidebarPrimaryForeground = sidebarPrimaryForeground.color
        self.sidebarAccent = sidebarAccent.color
        self.sidebarAccentForeground = sidebarAccentForeground.color
        self.sidebarBorder = sidebarBorder.color
        self.sidebarRing = sidebarRing.color
    }
}

