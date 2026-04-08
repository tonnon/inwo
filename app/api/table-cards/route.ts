"use server"

import { NextResponse } from "next/server"
import cardsData from "@/lib/table-cards-data.json"

export async function GET() {
  try {
    return NextResponse.json({ cards: cardsData })
  } catch (error) {
    console.error("Failed to read table-cards data:", error)
    return NextResponse.json({ cards: [] }, { status: 500 })
  }
}
