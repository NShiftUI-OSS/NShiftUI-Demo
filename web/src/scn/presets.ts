export const scnPresets = [
  {
    "id": "neutral",
    "title": "Neutral"
  },
  {
    "id": "stone",
    "title": "Stone"
  },
  {
    "id": "zinc",
    "title": "Zinc"
  },
  {
    "id": "mauve",
    "title": "Mauve"
  },
  {
    "id": "olive",
    "title": "Olive"
  },
  {
    "id": "mist",
    "title": "Mist"
  },
  {
    "id": "taupe",
    "title": "Taupe"
  },
  {
    "id": "amber",
    "title": "Amber"
  },
  {
    "id": "blue",
    "title": "Blue"
  },
  {
    "id": "cyan",
    "title": "Cyan"
  },
  {
    "id": "emerald",
    "title": "Emerald"
  },
  {
    "id": "fuchsia",
    "title": "Fuchsia"
  },
  {
    "id": "green",
    "title": "Green"
  },
  {
    "id": "indigo",
    "title": "Indigo"
  },
  {
    "id": "lime",
    "title": "Lime"
  },
  {
    "id": "orange",
    "title": "Orange"
  },
  {
    "id": "pink",
    "title": "Pink"
  },
  {
    "id": "purple",
    "title": "Purple"
  },
  {
    "id": "red",
    "title": "Red"
  },
  {
    "id": "rose",
    "title": "Rose"
  },
  {
    "id": "sky",
    "title": "Sky"
  },
  {
    "id": "teal",
    "title": "Teal"
  },
  {
    "id": "violet",
    "title": "Violet"
  },
  {
    "id": "yellow",
    "title": "Yellow"
  }
] as const

export type ScnPresetId = (typeof scnPresets)[number]['id']
