import { PingButton } from "@/components/PingButton";

export default function PingPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="border hover:border-slate-900 rounded">
        <PingButton />
      </div>
    </main>
  );
}
