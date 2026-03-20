"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";

import { Bill } from "@/types/billType";
import { EPaymentMethod } from "@/types/enum";

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
                name: `Table ${bill.table.name}`,
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
            table_name: bill.table.name,
            payment_method: EPaymentMethod.PROMPTPAY,
          },
        },
        metadata: {
          bill_id: bill.id,
          table_name: bill.table.name,
          payment_method: EPaymentMethod.PROMPTPAY,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success?bill_id=${bill.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/cancel`,
      });
      return redirect(session.url as string);
    }
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    throw error;
  }
}
