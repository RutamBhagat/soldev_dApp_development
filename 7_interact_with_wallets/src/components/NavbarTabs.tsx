"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

const examples = [
  {
    name: "Transfer",
    href: "/",
  },
  {
    name: "Ping",
    href: "/ping",
  },
  {
    name: "Mint",
    href: "/mint",
  },
];

interface ExamplesNavProps extends React.HTMLAttributes<HTMLDivElement> {}
const WalletMultiButtonDynamic = dynamic(async () => WalletMultiButton, { ssr: false });

export function NavbarTabs({ className, ...props }: ExamplesNavProps) {
  const pathname = usePathname();
  const wallet = useWallet();
  return (
    <div className="relative">
      <div className={cn("flex items-center gap-x-4", className)} {...props}>
        {examples.map((example, index) => (
          <Link
            href={example.href}
            key={example.href}
            className={cn(
              "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors",
              pathname === example.href ? "bg-muted font-medium text-primary" : "text-muted-foreground"
            )}
          >
            {example.name}
          </Link>
        ))}
        <div className="ml-8">
          <WalletMultiButtonDynamic>
            {wallet.publicKey ? `${wallet.publicKey.toBase58().substring(0, 7)}...` : "Connect Wallet"}
          </WalletMultiButtonDynamic>
        </div>
      </div>
    </div>
  );
}
