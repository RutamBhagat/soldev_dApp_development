import { DemoPaymentMethod } from "./PaymentMethod";
import React from "react";
import { cn } from "@/lib/utils";

function DemoContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-center [&>div]:w-full", className)} {...props} />;
}

function Transfer() {
  return (
    <div>
      <DemoContainer>
        <DemoPaymentMethod />
      </DemoContainer>
    </div>
  );
}

export default Transfer;
