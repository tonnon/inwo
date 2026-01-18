"use server"

import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

const TABLE_CARDS_DIR = path.join(process.cwd(), "public", "cards", "table-cards")

export async function GET() {
  try {
    const files = await fs.readdir(TABLE_CARDS_DIR)
    const cards = files
      .filter((file) => file.toLowerCase().endsWith(".png"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((file, index) => {
        const rawId = path.parse(file).name
        const sanitizedId = rawId.replace(/_transparent$/i, "")
        const label =
          sanitizedId && /^\d+$/.test(sanitizedId)
            ? `#${sanitizedId}`
            : sanitizedId.replace(/_/g, " ") || rawId
        return {
          id: rawId,
          name: `Table Card ${label}`,
          type: "Group",
          imageUrl: `/cards/table-cards/${file}`,
          description: "Digitized from the physical tabletop collection.",
          power: 2 + (index % 5),
          resistance: 3 + ((index + 2) % 5),
          income: 1 + (index % 3),
          alignments: ["Table"],
        }
      })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Failed to read table-cards directory:", error)
    return NextResponse.json({ cards: [] }, { status: 500 })
  }
}
