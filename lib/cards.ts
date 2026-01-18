export type CardType =
  | "Faction"
  | "Group"
  | "Plot"
  | "Resource"
  | "New World Order"
  | "Personality"
  | "Place"
  | "Organization"
  | "Special"
  | "Goal"
  | "Artifact"
  | "Disaster"

export interface BaseCard {
  id: string
  name: string
  type: CardType
  imageUrl: string
  description: string
  isUnique?: boolean
}

export interface FactionCard extends BaseCard {
  type: "Faction"
  rarity: string
  power: string // e.g., "7/7"
  specialGoal: string
  abilities: string[] // Array of abilities/rules text
}

export interface GroupLikeCard extends BaseCard {
  type: "Group" | "Resource" | "Place" | "Personality" | "Organization" | "Artifact"
  power: number
  resistance: number
  income: number
  alignments: string[] // e.g., ["Government", "Violent"]
}

export interface EventLikeCard extends BaseCard {
  type: "Plot" | "Special" | "Goal" | "Disaster" | "New World Order"
  // These typically don't have power/resistance/income
}

// Centralized card data
const alignmentSets = [
  ["Secret", "Government"],
  ["Weird", "Fanatic"],
  ["Corporate", "Straight"],
  ["Peaceful", "Liberal"],
  ["Violent", "Criminal"],
] as const

const createGroupCards = (count: number, imageStart: number): GroupLikeCard[] =>
  Array.from({ length: count }).map((_, index) => {
    const idNumber = index + 1
    const alignment = alignmentSets[index % alignmentSets.length]
    return {
      id: `prebuilt-group-${idNumber}`,
      name: `Shadow Asset ${idNumber}`,
      type: "Group",
      power: 3 + (index % 4),
      resistance: 2 + ((index + 1) % 4),
      income: 1 + (index % 3),
      alignments: [...alignment],
      imageUrl: `/cards/table-cards/${imageStart + index}_transparent.png`,
      description: "A curated operative sourced from the physical archives.",
    }
  })

const createPlotCards = (count: number, imageStart: number): EventLikeCard[] =>
  Array.from({ length: count }).map((_, index) => {
    const idNumber = index + 1
    return {
      id: `prebuilt-plot-${idNumber}`,
      name: `Conspiracy Plot ${idNumber}`,
      type: "Plot",
      imageUrl: `/cards/table-cards/${imageStart + index}_transparent.png`,
      description: "An infamous scheme documented in the tabletop library.",
    }
  })

const generatedGroupCards = createGroupCards(60, 120)
const generatedPlotCards = createPlotCards(45, 400)

const factionCards: FactionCard[] = [
  {
    id: "adepts-of-hermes",
    name: "Adepts of Hermes",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/adepts-of-hermes.webp",
    power: "7/7",
    specialGoal: "Each Magic Resource you control counts as one group toward the Basic Goal.",
    abilities: [
      "If you fail an Attack to Control against a Group from your own hand, you do not lose the group . . . just return the card to your hand.",
      "The Adepts of Hermes have a +6 on any attempt to control or destroy a Magic group.",
    ],
    description:
      "Masters of ancient wisdom and occult knowledge, seeking to guide humanity through esoteric enlightenment.",
  },
  {
    id: "bavarian-illuminati",
    name: "Bavarian Illuminati",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/bavarian-illuminati.webp",
    power: "10/10",
    specialGoal: "Control a total Power of 50 or more, counting Bavaria's own Power.",
    abilities: ["Each turn, you may declare one of your attacks privileged."],
    description: "The classic conspiracy masterminds, pulling strings from the shadows to reshape the world order.",
  },
  {
    id: "bermuda-triangle",
    name: "Bermuda Triangle",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/bermuda-triangle.webp",
    power: "8/8",
    specialGoal:
      "Control a total Power of at least 35, counting Bermuda's own Power, and at least one group of each alignment. A group with more than one alignment counts for all its alignments.",
    abilities: ["You may reorganize your groups freely at the end of your turn."],
    description: "Mysterious forces from the depths, wielding otherworldly powers and unexplained phenomena.",
  },
  {
    id: "discordian-society",
    name: "Discordian Society",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/discordian-society.webp",
    power: "7/7",
    specialGoal:
      "Any Weird group with a Power of 3 or more counts double toward your total number of groups controlled.",
    abilities: [
      "You have a +4 on any attempt to control Weird groups.",
      "Your power structure is immune to attacks from Government or Straight groups, and to all special abilities of these groups.",
    ],
    description: "Agents of chaos and confusion, spreading discord to disrupt established power structures.",
  },
  {
    id: "gnomes-of-zurich",
    name: "Gnomes of Zürich",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/gnomes-of-zurich.webp",
    power: "9/9",
    specialGoal:
      "Any Corporate group or Bank with a Power of 4 or more counts double toward your total number of groups controlled.",
    abilities: [
      "You may hold 6 Plot cards in your hand, rather than the usual 5.",
      "You have a +4 on any attempt to control any Bank.",
    ],
    description: "Financial puppet masters controlling global economics through banking and monetary manipulation.",
  },
  {
    id: "the-network",
    name: "The Network",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/the-network.webp",
    power: "8/8",
    specialGoal:
      "Any Computer group with a Power of 3 or more counts double toward your total number of groups controlled.",
    abilities: ["You start your turn by drawing two Plot cards, rather than one."],
    description: "Information brokers and media manipulators, controlling the flow of knowledge and public opinion.",
  },
  {
    id: "servants-of-cthulhu",
    name: "Servants of Cthulhu",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/servants-of-cthulhu.webp",
    power: "9/9",
    specialGoal:
      "For every group you destroy, reduce by 1 the number of groups you need to control in order to win. You may also count rival Illuminati which you destroy by removing their last group. If you destroy 8 groups, you win, regardless of how many you control!",
    abilities: [
      "You have a +4 on any attempt to destroy, even with Disasters and Assassinations.",
      "Draw a Plot card whenever you destroy a group!",
    ],
    description: "Cultists serving ancient cosmic horrors, seeking to bring about the end of human civilization.",
  },
  {
    id: "shangri-la",
    name: "Shangri-La",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/shangri-la.webp",
    power: "7/7",
    specialGoal:
      "Have Peaceful groups with a total Power of 30 in play, regardless of who controls them! If this happens, all Shangri-La players share the victory.",
    abilities: [
      "Any group in your Power Structure has an extra +5 to defend against any attack, even Instants.",
      "You cannot destroy any groups except Violent ones and rival Illuminati.",
    ],
    description: "Peaceful isolationists from hidden mountain sanctuaries, promoting harmony and spiritual balance.",
  },
  {
    id: "ufos",
    name: "UFOs",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/ufos.webp",
    power: "6/6",
    specialGoal: "The UFOs can have up to 3 different Goal cards in play, and win with any of them.",
    abilities: [
      "The UFOs have two actions per turn — they get two tokens!",
      "These may not be used in the same attack.",
    ],
    description: "Extraterrestrial visitors with advanced technology and mysterious agendas for Earth.",
  },
  {
    id: "society-of-assassins",
    name: "Society of Assassins",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/society-of-assassins.webp",
    power: "7/7",
    specialGoal:
      "Any Secret group counts double for you as long as none of your rivals control a Secret group with more power.",
    abilities: [
      "When one of your Fanatic groups attacks or defends, you may treat its Fanatic alignment as the same as that of any other Fanatic group.",
      "Your Fanatic groups also have Global Power equal to their Power.",
    ],
    description: "Elite killers and shadow operatives, eliminating obstacles through precision and stealth.",
  },
  {
    id: "church-of-the-subgenius",
    name: "Church of the SubGenius",
    type: "Faction",
    rarity: "I",
    imageUrl: "/cards/factions/church-of-the-subgenius.webp",
    power: "7/7",
    specialGoal:
      "Up to three Slack (Illuminati) tokens on the Church of the SubGenius may count as groups toward your Basic Goal. This Goal cannot be combined with any other Goal.",
    abilities: [
      "The Church of the SubGenius may accumulate its Action tokens ('Slack') each turn, though it can spend only one per action.",
      "It, and any SubGenius groups in its Power Structure, has +2 for direct control of any SubGenius group.",
    ],
    description: "Satirical pseudo-religious movement promoting slack and absurdist philosophy.",
  },
]

export const cards: (FactionCard | GroupLikeCard | EventLikeCard)[] = [
  ...generatedGroupCards,
  ...generatedPlotCards,
  ...factionCards,
]

const takeSequence = <T,>(source: T[], start: number, count: number): T[] => {
  const selections: T[] = []
  for (let index = 0; index < count; index++) {
    selections.push(source[(start + index) % source.length])
  }
  return selections
}

const buildDeck = (groupStart: number, plotStart: number) => [
  ...takeSequence(generatedGroupCards, groupStart, 30).map((card) => card.id),
  ...takeSequence(generatedPlotCards, plotStart, 15).map((card) => card.id),
]

export const prebuiltDecks: Record<string, string[]> = {
  "adepts-of-hermes": buildDeck(0, 0),
  "bavarian-illuminati": buildDeck(5, 3),
  "bermuda-triangle": buildDeck(10, 6),
  "discordian-society": buildDeck(15, 9),
  "gnomes-of-zurich": buildDeck(20, 12),
  "the-network": buildDeck(25, 15),
  "servants-of-cthulhu": buildDeck(30, 18),
  "shangri-la": buildDeck(35, 21),
  ufos: buildDeck(40, 24),
  "society-of-assassins": buildDeck(45, 27),
  "church-of-the-subgenius": buildDeck(50, 30),
}

// Update helper functions to use new interfaces
export function getCardById(id: string): FactionCard | GroupLikeCard | EventLikeCard | undefined {
  return cards.find((card) => card.id === id)
}

export function getFactionCards(): FactionCard[] {
  return cards.filter((card) => card.type === "Faction") as FactionCard[]
}

export function getGroupLikeCards(): GroupLikeCard[] {
  return cards.filter(
    (card) =>
      card.type === "Group" ||
      card.type === "Organization" ||
      card.type === "Personality" ||
      card.type === "Place" ||
      card.type === "Resource" ||
      card.type === "Artifact",
  ) as GroupLikeCard[]
}

export function getEventLikeCards(): EventLikeCard[] {
  return cards.filter(
    (card) =>
      card.type === "Plot" ||
      card.type === "Special" ||
      card.type === "Goal" ||
      card.type === "Disaster" ||
      card.type === "New World Order",
  ) as EventLikeCard[]
}
