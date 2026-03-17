"use client";

import PaymentFailedRender from "@/app/features/main/payment/failed/Index";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <PaymentFailedRender
        title="Payment Cancelled"
        description="The payment process was cancelled. No charges were made to your account."
        buttonText="Try Payment Again"
        buttonLink="/payment"
      />
    </div>
  );
}
