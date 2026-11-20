import SwiftUI

struct SCNCalendar: View {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var selection: Date
    @State private var visibleMonth: Date
    private let calendar: Foundation.Calendar

    private var monthTitle: String {
        let formatter = DateFormatter()
        formatter.locale = calendar.locale ?? .current
        formatter.calendar = calendar
        formatter.setLocalizedDateFormatFromTemplate("MMMM y")
        return formatter.string(from: visibleMonth)
    }

    private var weekdaySymbols: [String] {
        let symbols = calendar.shortStandaloneWeekdaySymbols
        let start = calendar.firstWeekday - 1
        return Array(symbols[start...]) + Array(symbols[..<start])
    }

    private var columns: [GridItem] {
        Array(
            repeating: GridItem(
                .flexible(),
                spacing: theme.spacing.s0
            ),
            count: weekdaySymbols.count
        )
    }

    private var monthDates: [Date] {
        guard let interval = calendar.dateInterval(
            of: .month,
            for: visibleMonth
        ) else {
            return []
        }
        let weekdayCount = weekdaySymbols.count
        let firstWeekday = calendar.component(
            .weekday,
            from: interval.start
        )
        let leading = (firstWeekday - calendar.firstWeekday + weekdayCount) % weekdayCount
        guard let gridStart = calendar.date(
            byAdding: .day,
            value: -leading,
            to: interval.start
        ) else {
            return []
        }
        let dayCount = calendar.range(
            of: .day,
            in: .month,
            for: visibleMonth
        )?.count ?? leading
        let total = leading + dayCount
        let remainder = total % weekdayCount
        let trailing = remainder == 0 ? leading - leading : weekdayCount - remainder
        guard let gridEnd = calendar.date(
            byAdding: .day,
            value: total + trailing,
            to: gridStart
        ) else {
            return []
        }
        var dates: [Date] = []
        var day = gridStart
        while day < gridEnd {
            dates.append(day)
            guard let next = calendar.date(
                byAdding: .day,
                value: 1,
                to: day
            ) else {
                break
            }
            day = next
        }
        return dates
    }

    init(
        selection: Binding<Date>,
        calendar: Foundation.Calendar = .current
    ) {
        self._selection = selection
        self._visibleMonth = State(initialValue: selection.wrappedValue)
        self.calendar = calendar
    }

    var body: some View {
        VStack(spacing: theme.spacing.s4) {
            HStack {
                SCNButton(
                    icon: .chevronLeft,
                    variant: .ghost,
                    size: .icon,
                    action: showPreviousMonth
                )
                Spacer(minLength: theme.spacing.s0)
                SCNText(
                    monthTitle,
                    weight: .medium
                )
                Spacer(minLength: theme.spacing.s0)
                SCNButton(
                    icon: .chevronRight,
                    variant: .ghost,
                    size: .icon,
                    action: showNextMonth
                )
            }
            LazyVGrid(
                columns: columns,
                spacing: theme.spacing.s1
            ) {
                ForEach(
                    weekdaySymbols,
                    id: \.self
                ) { symbol in
                    SCNText(
                        symbol,
                        style: .xs,
                        color: .mutedForeground
                    )
                        .frame(
                            width: theme.spacing.s8,
                            height: theme.spacing.s8
                        )
                }
                ForEach(
                    monthDates,
                    id: \.self
                ) { date in
                    dayCell(date)
                }
            }
        }
        .padding(theme.spacing.s3)
        .background(theme.palette.background)
    }

    private func showPreviousMonth() {
        shift(months: -1)
    }

    private func showNextMonth() {
        shift(months: 1)
    }

    private func shift(months: Int) {
        guard let next = calendar.date(
            byAdding: .month,
            value: months,
            to: visibleMonth
        ) else {
            return
        }
        visibleMonth = next
    }
}

extension SCNCalendar {
    private func dayCell(_ date: Date) -> some View {
        let isSelected = calendar.isDate(
            date,
            inSameDayAs: selection
        )
        let isOutside = !calendar.isDate(
            date,
            equalTo: visibleMonth,
            toGranularity: .month
        )
        let isToday = calendar.isDateInToday(date)
        let dayColor: SCNText.Color = {
            if isSelected {
                return .primaryForeground
            }
            if isOutside {
                return .mutedForeground
            }
            return .foreground
        }()
        return Button {
            selection = date
        } label: {
            SCNText(
                dayNumber(date),
                color: dayColor
            )
                .frame(
                    width: theme.spacing.s8,
                    height: theme.spacing.s8
                )
                .background(isSelected ? theme.palette.primary : Color.clear)
                .overlay(
                    RoundedRectangle(
                        cornerRadius: theme.radius.md,
                        style: .continuous
                    )
                        .stroke(
                            isToday && !isSelected ? theme.palette.ring : Color.clear,
                            lineWidth: theme.border.hairline
                        )
                )
                .clipShape(
                    RoundedRectangle(
                        cornerRadius: theme.radius.md,
                        style: .continuous
                    )
                )
                .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
    }
}

extension SCNCalendar {
    private func dayNumber(_ date: Date) -> String {
        String(
            calendar.component(
                .day,
                from: date
            )
        )
    }
}

struct SCNCalendarPreview: View {
    @State private var selection: Date

    init() {
        _selection = State(initialValue: Date())
    }

    var body: some View {
        SCNComponentPreview {
            SCNCalendar(selection: $selection)
        }
    }
}

#Preview {
    SCNCalendarPreview()
}
