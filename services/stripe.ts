"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";

import { Bill } from "@/types/billType";
import { EPaymentMethod, EPaymentStatus } from "@/types/enum";

// Lock customer email
const customerEmail = "guest-foodsphere@gmail.com";

const getConnectedAccountId = async () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "";
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const res = await fetch(`${API_BASE_URL}/restaurant`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        },
    cache: "no-store",
  });

  const restaurant = await res.json();
  console.log(restaurant);

  if (!restaurant) {
    throw new Error("No restaurant found");
  }
  return restaurant.stripe_account_id;
};

export async function checkout(totalPrice: number, bill: Bill) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not defined in the server environment");
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    typescript: true,
  });

  try {
    const connectedAccountId = await getConnectedAccountId();
    if (bill && connectedAccountId) {
      const session = await stripe.checkout.sessions.create({
        customer_email: customerEmail,
        mode: "payment",
        payment_method_types: [EPaymentMethod.PROMPTPAY],
        line_items: [
          {
            price_data: {
              currency: "thb",
              product_data: {
                name: `Table ${bill.table_name}`,
              },
              unit_amount: Math.round((totalPrice as number) * 100),
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          transfer_data: {
            destination: connectedAccountId,
          },
          metadata: {
            bill_id: bill.id,
            table_name: bill.table_name,
            payment_method: EPaymentMethod.PROMPTPAY,
          },
        },
        metadata: {
          bill_id: bill.id,
          table_name: bill.table_name,
          payment_method: EPaymentMethod.PROMPTPAY,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_method=promptpay`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/cancel`,
      });
      return redirect(session.url as string);
    }
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    throw error;
  }
}

export interface StripeVerificationResult {
  success: boolean;
  status: string;
  customer_email: string;
  amount_total: number;
  bill_id: string | null;
  error: string | null;
}

export async function verifyCheckoutSession(
  sessionId: string,
  billId: string
): Promise<StripeVerificationResult> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    typescript: true,
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

    if (
      session &&
      billId &&
      session.metadata?.bill_id === billId &&
      paymentIntent
    ) {
      return {
        success: session.payment_status === EPaymentStatus.PAID,
        status: session.payment_status,
        customer_email: session.customer_details?.email || "N/A",
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
        bill_id: (session.metadata?.bill_id as string) || null,
        error:
          session.payment_status !== EPaymentStatus.PAID
            ? "Payment not completed"
            : null,
      };
    }
    return {
      success: false,
      status: "error",
      customer_email: "N/A",
      amount_total: 0,
      bill_id: null,
      error: "Invalid session",
    };
  } catch (error) {
    console.error("Error retrieving Stripe session:", error);
    return {
      success: false,
      status: "error",
      customer_email: "N/A",
      amount_total: 0,
      bill_id: null,
      error: "Invalid session",
    };
  }
}
