import type { Board, Card, ChecklistItem, List } from "@/types";

export function buildDemoBoardData(): { boards: Board[]; lists: List[]; cards: Card[]; checklist: ChecklistItem[] } {
  const now = new Date().toISOString();

  const boards: Board[] = [
    { id: "demo-board-1", name: "Content Calendar", created_by: null, created_at: now, updated_at: now },
    { id: "demo-board-2", name: "Client Leads", created_by: null, created_at: now, updated_at: now },
  ];

  const lists: List[] = [
    { id: "demo-list-1", board_id: "demo-board-1", name: "To-Do", position: 1000, created_at: now, updated_at: now },
    {
      id: "demo-list-2",
      board_id: "demo-board-1",
      name: "In Progress",
      position: 2000,
      created_at: now,
      updated_at: now,
    },
    { id: "demo-list-3", board_id: "demo-board-1", name: "Done", position: 3000, created_at: now, updated_at: now },
    {
      id: "demo-list-4",
      board_id: "demo-board-2",
      name: "Potential Clients",
      position: 1000,
      created_at: now,
      updated_at: now,
    },
    { id: "demo-list-5", board_id: "demo-board-2", name: "Follow-Up", position: 2000, created_at: now, updated_at: now },
    { id: "demo-list-6", board_id: "demo-board-2", name: "In The Bag", position: 3000, created_at: now, updated_at: now },
  ];

  const cards: Card[] = [
    {
      id: "demo-card-1",
      list_id: "demo-list-1",
      title: "Instagram Reel — behind the scenes",
      description: "Studio shoot recap, 30-45s, upbeat audio.",
      colour: "pink",
      position: 1000,
      is_done: false,
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-card-2",
      list_id: "demo-list-1",
      title: "Draft newsletter copy",
      description: null,
      colour: "yellow",
      position: 2000,
      is_done: false,
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-card-3",
      list_id: "demo-list-2",
      title: "TikTok product teaser",
      description: "Quick cuts of the new product line, trending audio.",
      colour: "mint",
      position: 1000,
      is_done: false,
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-card-4",
      list_id: "demo-list-3",
      title: "Facebook summer sale campaign",
      description: "Launched across all channels.",
      colour: "blue",
      position: 1000,
      is_done: true,
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-card-5",
      list_id: "demo-list-3",
      title: "LinkedIn product launch post",
      description: null,
      colour: "lavender",
      position: 2000,
      is_done: true,
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-card-6",
      list_id: "demo-list-4",
      title: "Bloom & Co.",
      description: "Interested in a quarterly retainer.",
      colour: "purple",
      position: 1000,
      is_done: false,
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-card-7",
      list_id: "demo-list-5",
      title: "Northside Studio",
      description: "Sent proposal, awaiting reply.",
      colour: "peach",
      position: 1000,
      is_done: false,
      created_by: null,
      created_at: now,
      updated_at: now,
    },
  ];

  const checklist: ChecklistItem[] = [
    { id: "demo-item-1", card_id: "demo-card-1", text: "Storyboard shots", is_checked: true, position: 1000, created_at: now, updated_at: now },
    { id: "demo-item-2", card_id: "demo-card-1", text: "Film b-roll", is_checked: true, position: 2000, created_at: now, updated_at: now },
    { id: "demo-item-3", card_id: "demo-card-1", text: "Edit + captions", is_checked: false, position: 3000, created_at: now, updated_at: now },
    { id: "demo-item-4", card_id: "demo-card-3", text: "Pick trending audio", is_checked: false, position: 1000, created_at: now, updated_at: now },
    { id: "demo-item-5", card_id: "demo-card-3", text: "Rough cut", is_checked: false, position: 2000, created_at: now, updated_at: now },
  ];

  return { boards, lists, cards, checklist };
}

let demoIdCounter = 0;
export function demoId(prefix: string): string {
  demoIdCounter += 1;
  return `demo-${prefix}-${Date.now()}-${demoIdCounter}`;
}
