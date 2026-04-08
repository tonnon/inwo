import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TABLE_CARDS_DIR = path.join(__dirname, "..", "public", "cards", "table-cards");
const OUTPUT_FILE = path.join(__dirname, "..", "lib", "table-cards-data.json");

async function generateCards() {
  try {
    const files = await fs.readdir(TABLE_CARDS_DIR);
    const cards = files
      .filter((file) => file.toLowerCase().endsWith(".png"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((file, index) => {
        const rawId = path.parse(file).name;
        const sanitizedId = rawId.replace(/_transparent$/i, "");
        const label =
          sanitizedId && /^\d+$/.test(sanitizedId)
            ? `#${sanitizedId}`
            : sanitizedId.replace(/_/g, " ") || rawId;
        const power = 2 + (index % 5);
        const resistance = 3 + ((index + 2) % 5);
        const powerCost = Math.max(1, Math.min(8, Math.ceil((power + resistance) / 3)));
        
        return {
          id: rawId,
          name: `Table Card ${label}`,
          type: "Group",
          imageUrl: `/cards/table-cards/${file}`,
          description: "Digitized from the physical tabletop collection.",
          powerCost,
          power,
          resistance,
          alignments: ["Table"],
        };
      });

    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(cards, null, 2), "utf-8");
    console.log(`Successfully generated ${cards.length} cards in ${OUTPUT_FILE}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Cards directory not found. Skipping generation.');
      // Create empty array to prevent build errors if the folder isn't there
      await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
      await fs.writeFile(OUTPUT_FILE, JSON.stringify([], null, 2), "utf-8");
    } else {
      console.error("Failed to generate table cards data:", error);
      process.exit(1);
    }
  }
}

generateCards();
