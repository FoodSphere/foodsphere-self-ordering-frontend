"use client";

import PaymentFailedRender from "@/app/features/main/payment/failed/Index";

export default function PaymentVerificationFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <PaymentFailedRender
        title="Verification Failed"
        description="The payment verification process failed. Please try again."
        buttonText="Try Payment Again"
        buttonLink="/payment"
      />
    </div>
  );
}
