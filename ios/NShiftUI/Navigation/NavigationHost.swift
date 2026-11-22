import SwiftUI

struct NavigationHost: View {
    @EnvironmentObject private var navigator: AppNavigator

    var body: some View {
        NavigationView {
            NavigationRoute<RouteMarker>(index: 0)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .fullScreenCover(item: $navigator.modal) { entry in
            ModalRoute(entry: entry)
                .environmentObject(navigator)
                .environment(\.modalDismiss, { navigator.dismissModal() })
        }
    }
}

/// A screen presented with `presentation: "modal"`: full screen, in its own
/// navigation bar, closed from the right.
private struct ModalRoute: View {
    let entry: NavigationEntry

    var body: some View {
        NavigationView {
            ScreenPage(entry: entry, isRoot: false)
                .id(entry.id)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .themeSync()
    }
}

private struct RouteMarker {}

private struct WrappedRoute<Marker> {}

private struct NavigationRoute<Marker>: View {
    @EnvironmentObject private var navigator: AppNavigator
    let index: Int

    var body: some View {
        page
            .background(link)
    }

    @ViewBuilder
    private var page: some View {
        if navigator.entries.indices.contains(index) {
            let entry = navigator.entries[index]
            ScreenPage(entry: entry, isRoot: index == 0)
                .id(entry.id)
        }
    }

    private var link: some View {
        NavigationLink(
            isActive: Binding(
                get: { navigator.entries.count > index + 1 },
                set: { active in
                    guard active == false else { return }
                    navigator.popToCount(index + 1)
                }
            ),
            destination: {
                NavigationRoute<WrappedRoute<Marker>>(index: index + 1)
                    .id(destinationID)
            },
            label: { EmptyView() }
        )
    }

    private var destinationID: UUID {
        if navigator.entries.indices.contains(index + 1) {
            return navigator.entries[index + 1].id
        }
        return UUID(uuidString: "00000000-0000-0000-0000-000000000000") ?? UUID()
    }
}

private struct ScreenPage: View {
    let entry: NavigationEntry
    let isRoot: Bool

    var body: some View {
        let builder = Screen()
            .url(entry.screenURL)
            .routeParameters(entry.parameters)
            .title(entry.screenName)
        let resolved = entry.preloadedModel.map { builder.preloaded($0) } ?? builder
        Group {
            if isRoot {
                resolved.startup()
            } else {
                resolved.resolve()
            }
        }
        .environment(\.isStackRoot, isRoot)
    }
}
