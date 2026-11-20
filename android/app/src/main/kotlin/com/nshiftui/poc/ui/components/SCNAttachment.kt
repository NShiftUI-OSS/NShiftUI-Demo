package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon

enum class SCNAttachmentState { Idle, Uploading, Processing, Error, Done }

enum class SCNAttachmentSize { Xs, Sm, Default }

enum class SCNAttachmentOrientation { Horizontal, Vertical }

@Composable
fun SCNAttachment(
    title: String,
    detail: String? = null,
    state: SCNAttachmentState = SCNAttachmentState.Done,
    size: SCNAttachmentSize = SCNAttachmentSize.Default,
    orientation: SCNAttachmentOrientation = SCNAttachmentOrientation.Horizontal,
) {
    val media = when (size) {
        SCNAttachmentSize.Xs -> SCNSpace.s6
        SCNAttachmentSize.Sm -> SCNSpace.s8
        SCNAttachmentSize.Default -> SCNSpace.s10
    }
    val mediaPadding = when (size) {
        SCNAttachmentSize.Xs -> SCNSpace.s1
        SCNAttachmentSize.Sm -> SCNSpace.s1_5
        SCNAttachmentSize.Default -> SCNSpace.s2
    }
    val contentHorizontal = when (size) {
        SCNAttachmentSize.Xs -> SCNSpace.s1_5
        SCNAttachmentSize.Sm -> SCNSpace.s2
        SCNAttachmentSize.Default -> SCNSpace.s2_5
    }
    val contentVertical = when (size) {
        SCNAttachmentSize.Xs -> SCNSpace.s1
        SCNAttachmentSize.Sm -> SCNSpace.s1_5
        SCNAttachmentSize.Default -> SCNSpace.s2
    }
    val titleStyle = if (size == SCNAttachmentSize.Default) SCNTextStyle.Sm else SCNTextStyle.Xs
    val borderColor = if (state == SCNAttachmentState.Error) {
        colors.destructive.copy(alpha = SCNOpacity.subtle)
    } else {
        colors.border
    }
    val shape = RoundedCornerShape(SCNRadius.xl)
    val content: @Composable () -> Unit = {
        AttachmentMedia(state, media, mediaPadding)
        AttachmentLabels(title, detail, state, titleStyle, contentHorizontal, contentVertical)
    }
    if (orientation == SCNAttachmentOrientation.Vertical) {
        Column(
            modifier = Modifier
                .clip(shape)
                .background(colors.card)
                .border(1.dp, borderColor, shape),
            verticalArrangement = Arrangement.spacedBy(SCNSpace.s2),
        ) {
            content()
        }
    } else {
        Row(
            modifier = Modifier
                .clip(shape)
                .background(colors.card)
                .border(1.dp, borderColor, shape),
            horizontalArrangement = Arrangement.spacedBy(SCNSpace.s2),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            content()
        }
    }
}

@Composable
private fun AttachmentMedia(
    state: SCNAttachmentState,
    side: Dp,
    padding: Dp,
) {
    val busy = state == SCNAttachmentState.Uploading || state == SCNAttachmentState.Processing
    val fill = if (state == SCNAttachmentState.Error) {
        colors.destructive.copy(alpha = SCNOpacity.subtle)
    } else {
        colors.muted
    }
    val ink = if (state == SCNAttachmentState.Error) colors.destructive else colors.foreground
    val shape = RoundedCornerShape(SCNRadius.lg)
    Box(
        modifier = Modifier
            .padding(padding)
            .size(side)
            .clip(shape)
            .background(fill),
        contentAlignment = Alignment.Center,
    ) {
        if (busy) {
            SCNSpinner()
        } else {
            SCNIcon(
                name = if (state == SCNAttachmentState.Error) "triangle-alert" else "file",
                size = if (side == SCNSpace.s6) SCNSpace.s3_5 else SCNSpace.s4,
                tint = ink,
            )
        }
    }
}

@Composable
private fun AttachmentLabels(
    title: String,
    detail: String?,
    state: SCNAttachmentState,
    titleStyle: SCNTextStyle,
    horizontal: Dp,
    vertical: Dp,
) {
    Column(
        modifier = Modifier.padding(horizontal = horizontal, vertical = vertical),
        verticalArrangement = Arrangement.spacedBy(SCNSpace.s0_5),
    ) {
        SCNText(
            title,
            style = titleStyle,
            weight = FontWeight.Medium,
        )
        if (detail != null) {
            SCNText(
                detail,
                style = SCNTextStyle.Xs,
                color = if (state == SCNAttachmentState.Error) SCNTextColor.Destructive else SCNTextColor.Muted,
                modifier = Modifier.alpha(
                    if (state == SCNAttachmentState.Error) SCNOpacity.pressed else SCNOpacity.opaque,
                ),
            )
        }
    }
}
