package com.nshiftui.poc.theme

import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import com.nshiftui.poc.R

private fun geist(weight: FontWeight) = Font(
    R.font.geist,
    weight = weight,
    variationSettings = FontVariation.Settings(FontVariation.weight(weight.weight)),
)

val SCNFont = FontFamily(
    geist(FontWeight.Normal),
    geist(FontWeight.Medium),
    geist(FontWeight.SemiBold),
    geist(FontWeight.Bold),
)
