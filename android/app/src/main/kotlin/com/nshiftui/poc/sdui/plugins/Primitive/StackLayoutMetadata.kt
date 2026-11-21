package com.nshiftui.poc.sdui.plugins.primitive

import androidx.compose.ui.Alignment
import com.nshiftui.NShiftMetadata
import kotlinx.serialization.Serializable

@Serializable
data class StackLayoutMetadata(
    val alignment: String = "",
    val spacing: Double = 0.0,
) : NShiftMetadata {
    fun horizontalAlignment(): Alignment.Horizontal =
        when (resolved("leading")) {
            "trailing", "topTrailing", "bottomTrailing" -> Alignment.End
            "center", "top", "bottom" -> Alignment.CenterHorizontally
            else -> Alignment.Start
        }

    fun verticalAlignment(): Alignment.Vertical =
        when (resolved("top")) {
            "bottom", "bottomLeading", "bottomTrailing" -> Alignment.Bottom
            "center", "leading", "trailing" -> Alignment.CenterVertically
            else -> Alignment.Top
        }

    fun layerAlignment(): Alignment =
        when (resolved("topLeading")) {
            "top" -> Alignment.TopCenter
            "topTrailing" -> Alignment.TopEnd
            "leading" -> Alignment.CenterStart
            "center" -> Alignment.Center
            "trailing" -> Alignment.CenterEnd
            "bottomLeading" -> Alignment.BottomStart
            "bottom" -> Alignment.BottomCenter
            "bottomTrailing" -> Alignment.BottomEnd
            else -> Alignment.TopStart
        }

    private fun resolved(default: String): String = alignment.removePrefix(".").ifEmpty { default }
}
