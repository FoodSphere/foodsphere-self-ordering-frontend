"use client";

import PaymentFailedRender from "@/app/features/main/payment/failed/Index";

export default function PaymentInvalidSessionPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <PaymentFailedRender
        title="Invalid Session"
        description="The payment session is invalid. Please try again."
        buttonText="Try Payment Again"
        buttonLink="/payment"
      />
    </div>
  );
}
