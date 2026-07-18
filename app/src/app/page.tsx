import { QueryProvider } from "@/components/QueryProvider";
import { DashboardShell } from "@/components/DashboardShell";

export default function Home() {
  return (
    <QueryProvider>
      <DashboardShell />
    </QueryProvider>
  );
}
