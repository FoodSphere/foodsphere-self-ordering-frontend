"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, QrCode, Banknote, ChevronRight } from "lucide-react";

type PaymentMethod = "QR" | "CASH";

const completedItems = [
  {
    id: 1,
    title: "Spaghetti",
    price: 10,
    quantity: 2,
    note: "No garlic",
  },
];

const PaymentRender = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QR");

  // Calculate totals for food (only completed items)
  const foodTotalItems = completedItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const foodTotalPrice = completedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Apply coupon discount
  const couponDiscount = 10;

  // Calculate payment total price
  const paymentTotalPrice = foodTotalPrice - couponDiscount;

  const handleCallWaiter = () => {
    // UI Mockup
    alert("Waiter has been called!");
  };

  const handlePay = () => {
    if (completedItems.length === 0) return;
    alert(
      `Processing payment via ${paymentMethod === "QR" ? "Thai QR" : "Cash"}...`
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col pb-20 overflow-y-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-2">
        <Link
          href="/menu"
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">Table 10</h1>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col px-4 pt-4">
        {completedItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
            <p className="text-lg font-medium">No completed orders</p>
            <Link
              href="/menu"
              className="text-[var(--primary-orange-main)] font-semibold hover:underline"
            >
              Go to Menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-4">
            {/* My Basket Section */}
            <section className="bg-white mt-2 px-4 py-4">
              <h2 className="text-lg font-bold mb-4 text-black">My Order</h2>

              <div className="space-y-6">
                {completedItems.map((item, idx) => (
                  // Using nested index/id for key since multiple orders might have same item IDs if we reused logic
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex justify-between items-start border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex gap-3">
                      {/* Quantity Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full border border-[var(--primary-orange-main)] text-[var(--primary-orange-main)] flex items-center justify-center text-xs font-semibold">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex flex-col">
                        <span className="text-base text-black font-medium leading-tight">
                          {item.title}
                        </span>
                        {/* Notes */}
                        <span className="text-xs text-gray-400 mt-1">
                          {item.note}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="font-medium text-black">
                      ฿{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-2 bg-white px-4 py-4">
              <div className="flex justify-between items-center text-base font-medium text-gray-500">
                <span>Food</span>
                <span>฿{foodTotalPrice.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-base font-medium text-red-500">
                  <span>Coupon</span>
                  <span>- ฿{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-medium text-[var(--primary-orange-main)]">
                <div className="flex items-center gap-2">
                  <Banknote size={20} />
                  <span>Total</span>
                </div>
                <span>
                  ฿{paymentTotalPrice.toFixed(2)}
                </span>
              </div>
            </section>

            {/* Separator */}
            <div className="h-2 bg-gray-100"></div>

            {/* Payment Details Section */}
            <section className="bg-white px-4 py-4">
              <h2 className="text-lg font-bold mb-4 text-black">
                Payment Details
              </h2>

              {/* Payment Method Selector */}
              <div className="divide-y divide-gray-100">
                {/* PromptPay Option */}
                <div
                  onClick={() => setPaymentMethod("QR")}
                  className={`flex items-center justify-between py-3 cursor-pointer ${
                    paymentMethod !== "QR" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {/* Using QrCode icon as generic placeholder for PromptPay logo */}
                      <QrCode className="text-blue-600" size={24} />
                    </div>
                    <span className="text-base font-medium text-gray-700">
                      QR PromptPay
                    </span>
                  </div>
                  <div className="flex items-center">
                    {paymentMethod === "QR" && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    )}
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>

                {/* Cash Option */}
                <div
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex items-center justify-between py-3 cursor-pointer border-t border-gray-100 ${
                    paymentMethod !== "CASH" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Banknote className="text-green-600" size={24} />
                    </div>
                    <span className="text-base font-medium text-gray-700">
                      Cash
                    </span>
                  </div>
                  <div className="flex items-center">
                    {paymentMethod === "CASH" && (
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    )}
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            </section>

            {/* Discount Code Section */}
            <section className="bg-white px-4 pb-6">
              <h3 className="text-base font-bold mb-2 text-black">Code</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Apply discount code..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary-orange-main)] placeholder-gray-400"
                />
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer Actions - Only show if there are items */}
      {completedItems.length > 0 && (
        <div className="px-4 pb-4 bg-gray-50 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Total {foodTotalItems} items</span>
              <span className="text-2xl font-bold text-[var(--primary-orange-main)]">
                ฿{paymentTotalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={completedItems.length === 0}
                className={`w-full bg-[var(--primary-orange-main)] text-white py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md ${
                  completedItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Pay Now
              </button>

              {/* Call Waiter - Secondary Action */}
              <button
                onClick={handleCallWaiter}
                className="w-full text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Call Waiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRender;
