import { MintTabs } from "@/components/MintTabs";
import { MintToken } from "@/components/MintToken";
import { cn } from "@/lib/utils";

function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-center [&>div]:w-full", className)} {...props} />;
}

export default function TransferPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="border hover:border-slate-900 rounded">
        <Container>
          <MintTabs />
        </Container>
      </div>
    </main>
  );
}
