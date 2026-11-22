package com.nshiftui.poc.ui.components

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.asImageBitmap
import com.nshiftui.poc.theme.SCNSpace
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.URL

enum class SCNAvatarSize { Sm, Default, Lg, Xl }

@Composable
fun SCNAvatar(
    initials: String,
    size: SCNAvatarSize = SCNAvatarSize.Default,
    imageURL: String = "",
) {
    val side = when (size) {
        SCNAvatarSize.Sm -> SCNSpace.s6
        SCNAvatarSize.Default -> SCNSpace.s8
        SCNAvatarSize.Lg -> SCNSpace.s10
        SCNAvatarSize.Xl -> SCNSpace.s16 * 2
    }
    var bitmap by remember(imageURL) { mutableStateOf<Bitmap?>(null) }
    LaunchedEffect(imageURL) {
        bitmap = if (imageURL.isBlank()) {
            null
        } else {
            withContext(Dispatchers.IO) {
                runCatching {
                    URL(imageURL).openConnection().apply {
                        connectTimeout = 5_000
                        readTimeout = 5_000
                    }.getInputStream().use(BitmapFactory::decodeStream)
                }.getOrNull()
            }
        }
    }

    Box(Modifier.size(side).clip(CircleShape).background(colors.muted), contentAlignment = Alignment.Center) {
        if (bitmap != null) {
            Image(
                bitmap = bitmap!!.asImageBitmap(),
                contentDescription = initials,
                contentScale = ContentScale.Crop,
                modifier = Modifier.matchParentSize(),
            )
        } else {
            SCNText(
                initials,
                style = if (size == SCNAvatarSize.Lg || size == SCNAvatarSize.Xl) {
                    SCNTextStyle.Sm
                } else {
                    SCNTextStyle.Xs
                },
                weight = FontWeight.Medium,
                color = SCNTextColor.Muted,
            )
        }
    }
}
