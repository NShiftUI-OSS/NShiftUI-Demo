import Foundation
import NShiftUI
import SwiftUI

@NShiftMetadata
struct CalendarMetadata: NShiftMetadata, Decodable {
    let selection: Double
}

@NShiftPlugin(
    name: "Calendar",
    version: "1.0.0",
    metadata: CalendarMetadata.self
)
struct CalendarPlugin: NShiftPlugin {
    var body: some View {
        SCNCalendar(
            selection: nshiftBinding(
                .onSelect,
                engine: engine,
                renderID: renderID,
                value: Date(timeIntervalSince1970: metadata.selection / 1000),
                write: { date in
                    CalendarMetadata(
                        selection: date.timeIntervalSince1970 * 1000
                    )
                }
            )
        )
    }
}
