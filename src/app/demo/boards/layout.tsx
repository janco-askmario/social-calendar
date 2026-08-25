import { DemoBoardsProvider } from "@/components/boards/DemoBoardsProvider";

export default function DemoBoardsLayout({ children }: { children: React.ReactNode }) {
  return <DemoBoardsProvider>{children}</DemoBoardsProvider>;
}
