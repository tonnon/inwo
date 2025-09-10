export type FactionInfo = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
};

const factions: FactionInfo[] = [
  {
    id: "adepts-of-hermes",
    name: "Adepts of Hermes",
    imageUrl: "/factions/adepts-of-hermes.png",
    description: "Masters of ancient wisdom and occult knowledge, seeking to guide humanity through esoteric enlightenment.",
  },
  {
    id: "bavarian-illuminati",
    name: "Bavarian Illuminati",
    imageUrl: "/factions/bavarian-illuminati.png",
    description: "The classic conspiracy masterminds, pulling strings from the shadows to reshape the world order.",
  },
  {
    id: "bermuda-triangle",
    name: "Bermuda Triangle",
    imageUrl: "/factions/bermuda-triangle.png",
    description: "Mysterious forces from the depths, wielding otherworldly powers and unexplained phenomena.",
  },
  {
    id: "discordian-society",
    name: "Discordian Society",
    imageUrl: "/factions/discordian-society.png",
    description: "Agents of chaos and confusion, spreading discord to disrupt established power structures.",
  },
  {
    id: "gnomes-of-zurich",
    name: "Gnomes of Zürich",
    imageUrl: "/factions/gnomes-of-zurich.png",
    description: "Financial puppet masters controlling global economics through banking and monetary manipulation.",
  },
  {
    id: "the-network",
    name: "The Network",
    imageUrl: "/factions/the-network.png",
    description: "Information brokers and media manipulators, controlling the flow of knowledge and public opinion.",
  },
  {
    id: "servants-of-cthulhu",
    name: "Servants of Cthulhu",
    imageUrl: "/factions/servants-of-cthulhu.png",
    description: "Cultists serving ancient cosmic horrors, seeking to bring about the end of human civilization.",
  },
  {
    id: "shangri-la",
    name: "Shangri-La",
    imageUrl: "/factions/shangri-la.png",
    description: "Peaceful isolationists from hidden mountain sanctuaries, promoting harmony and spiritual balance.",
  },
  {
    id: "ufos",
    name: "UFOs",
    imageUrl: "/factions/ufos.png",
    description: "Extraterrestrial visitors with advanced technology and mysterious agendas for Earth.",
  },
  {
    id: "society-of-assassins",
    name: "Society of Assassins",
    imageUrl: "/factions/society-of-assassins.png",
    description: "Elite killers and shadow operatives, eliminating obstacles through precision and stealth.",
  },
  {
    id: "church-of-the-subgenius",
    name: "Church of the SubGenius",
    imageUrl: "/factions/church-of-the-subgenius.png",
    description: "Satirical pseudo-religious movement promoting slack and absurdist philosophy.",
  },
];

export function getFactions(): FactionInfo[] {
  return factions;
}

export function getFactionById(id: string): FactionInfo | undefined {
  return factions.find(faction => faction.id === id);
}
