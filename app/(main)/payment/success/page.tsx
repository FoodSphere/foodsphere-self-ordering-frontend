import PaymentSuccessRender from "@/app/features/main/payment/success/Index";

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  return <div className="min-h-screen flex justify-center items-center">
    <PaymentSuccessRender searchParams={searchParams} />;
  </div>
}
