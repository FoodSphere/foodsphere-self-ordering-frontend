import PaymentSuccessRender from "@/app/features/main/payment/success/Index";

export const dynamic = "force-dynamic";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <PaymentSuccessRender />
    </div>
  );
}
