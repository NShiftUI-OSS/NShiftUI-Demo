package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import java.util.Calendar

@Composable
fun SCNCalendar(selection: Long, onSelect: (Long) -> Unit) {
    val calendar = remember(selection) {
        Calendar.getInstance().apply { timeInMillis = selection }
    }
    var month by remember { mutableStateOf(calendar.get(Calendar.MONTH)) }
    var year by remember { mutableStateOf(calendar.get(Calendar.YEAR)) }
    val grid = remember(month, year) {
        val cal = Calendar.getInstance()
        cal.set(year, month, 1)
        val lead = cal.get(Calendar.DAY_OF_WEEK) - cal.firstDayOfWeek
        val days = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
        List(lead.coerceAtLeast(0)) { 0 } + (1..days).toList()
    }
    Column(verticalArrangement = Arrangement.spacedBy(SCNSpace.s2)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            SCNButton(icon = "chevron-left", size = SCNButtonSize.Sm, variant = SCNButtonVariant.Ghost) {
                if (month == 0) { month = 11; year -= 1 } else month -= 1
            }
            SCNText("${monthName(month)} $year", weight = FontWeight.SemiBold)
            SCNButton(icon = "chevron-right", size = SCNButtonSize.Sm, variant = SCNButtonVariant.Ghost) {
                if (month == 11) { month = 0; year += 1 } else month += 1
            }
        }
        grid.chunked(7).forEach { week ->
            Row(Modifier.fillMaxWidth()) {
                week.forEach { day ->
                    val selected = day != 0 && day == Calendar.getInstance().apply { timeInMillis = selection }.get(Calendar.DAY_OF_MONTH) &&
                        month == Calendar.getInstance().apply { timeInMillis = selection }.get(Calendar.MONTH) &&
                        year == Calendar.getInstance().apply { timeInMillis = selection }.get(Calendar.YEAR)
                    Box(
                        Modifier
                            .weight(1f)
                            .height(SCNSpace.s8)
                            .clip(RoundedCornerShape(SCNRadius.md))
                            .background(if (selected) colors.primary else Color.Transparent)
                            .clickable(enabled = day != 0) {
                                val next = Calendar.getInstance()
                                next.set(year, month, day, 0, 0, 0)
                                onSelect(next.timeInMillis)
                            },
                        contentAlignment = Alignment.Center,
                    ) {
                        if (day != 0) {
                            SCNText(
                                day.toString(),
                                color = if (selected) SCNTextColor.PrimaryForeground else SCNTextColor.Foreground,
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun monthName(month: Int): String = listOf(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)[month]
