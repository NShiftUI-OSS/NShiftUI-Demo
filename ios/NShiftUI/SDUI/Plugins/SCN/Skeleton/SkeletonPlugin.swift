import NShiftUI
import SwiftUI

@NShiftMetadata
struct SkeletonMetadata: NShiftMetadata, Decodable {
    let height: Double?
}

@NShiftPlugin(
    name: "Skeleton",
    version: "1.0.0",
    metadata: SkeletonMetadata.self
)
struct SkeletonPlugin: NShiftPlugin {
    var body: some View {
        SCNSkeleton(height: metadata.height.map { CGFloat($0) })
    }
}
