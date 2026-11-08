// Static data for the dashboard. Each export will later be replaced by a Prisma query.

export const nearestTrip = {
  id: "rome",
  title: "Rome",
  country: "Italy",
  start: "2026-12-12",
  end: "2026-12-19",
  daysPlanned: 5,
  totalDays: 8,
  companions: ["MA", "JR"],
};

export const notes = [
  {
    id: "n1",
    title: "Rome trip",
    tag: "Dec 12 to 19",
    lines: [
      "Arrive FCO 10:40, take the Leonardo Express to Termini.",
      "Dinner at Roscioli on Friday, ask for a window table.",
      "Reserve a Colosseum time slot before leaving.",
    ],
  },
  {
    id: "n2",
    title: "Italy trip",
    tag: "Italy",
    lines: [
      "Rome, Florence and Venice by train.",
      "Check ZTL zones if renting a car.",
      "Buy regional train tickets at the station.",
    ],
  },
  {
    id: "n3",
    title: "Japan Adventure",
    tag: "Mar 5 to 12",
    lines: [
      "Get an IC card for trains.",
      "Cash is still common at small restaurants.",
      "Visit shrines early in the morning.",
    ],
  },
  {
    id: "n4",
    title: "Packing list",
    tag: "General",
    lines: ["Passport copies.", "Power bank.", "Rain jacket and walking shoes."],
  },
];

export const trips = [
  { id: "rome", title: "Rome", start: "2026-12-12", end: "2026-12-19", row: 0, tone: "teal" },
  { id: "cebu", title: "Cebu weekend", start: "2027-01-22", end: "2027-01-24", row: 1, tone: "orange" },
  { id: "japan", title: "Japan Adventure", start: "2027-03-05", end: "2027-03-12", row: 0, tone: "teal" },
] as const;

export const mapStats = { travelDays: 58, countriesVisited: 4, tripsPlanned: 3 };

export const savedPlaces = [
  { id: "1", name: "Fushimi Inari Shrine", detail: "Kyoto, Attraction" },
  { id: "2", name: "Nishiki Market", detail: "Kyoto, Food" },
  { id: "3", name: "Roscioli Salumeria", detail: "Rome, Restaurant" },
  { id: "4", name: "Sant’Eustachio Il Caffè", detail: "Rome, Cafe" },
];

export const notifications = [
  { id: "a", initials: "MA", who: "Maria", text: "accepted your invitation to Rome.", time: "2 min ago", unread: true },
  { id: "b", initials: "JR", who: "Jun", text: "added Colosseum to Day 2 of Rome.", time: "1 hour ago", unread: true },
  { id: "c", initials: "MA", who: "Maria", text: "commented on Trevi Fountain.", time: "Yesterday", unread: false },
  { id: "d", initials: "KT", who: "Kai", text: "made you an editor of Japan Adventure.", time: "2 days ago", unread: false },
];