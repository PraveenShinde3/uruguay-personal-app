export const ACTIVITIES = [
  { id: "coffee", title: "Coffee & a Walk", emoji: "☕", desc: "Grab coffee, talk, and enjoy a relaxed walk together.", line: "Coffee, a good walk, and you. Easy yes." },
  { id: "dinner", title: "Dinner Date", emoji: "🍝", desc: "Find somewhere nice to eat and spend some quality time together.", line: "I'll find us somewhere nice. Come hungry 🍝" },
  { id: "sunset", title: "Sunset by the Rambla", emoji: "🌅", desc: "Watch the sunset by Montevideo's Rambla and enjoy the view together.", line: "Sunset on the Rambla. I'll bring the good mood 🌅" },
  { id: "gaming", title: "Gaming Date", emoji: "🎮", desc: "Play games together, have some friendly competition, and see who wins.", line: "Time to find out who's actually better at gaming 🎮😉" },
  { id: "sweet", title: "Something Sweet", emoji: "🍦", desc: "Get ice cream or dessert and wander around together.", line: "Ice cream first, decisions later 🍦" },
  { id: "surprise", title: "Surprise Me", emoji: "😉", desc: "Let me plan something special for us.", line: "You picked surprise… so I'm not saying a word. Start guessing 😉" },
] as const;
export type ActivityId = (typeof ACTIVITIES)[number]["id"];

export const SLOT_GROUPS = [
  { label: "Afternoon", slots: ["3:00 PM", "4:30 PM"] },
  { label: "Evening", slots: ["6:00 PM", "7:30 PM", "9:00 PM"] },
] as const;
export const ALL_SLOTS: string[] = SLOT_GROUPS.flatMap((g) => [...g.slots]);
export const TZ = "America/Montevideo";
