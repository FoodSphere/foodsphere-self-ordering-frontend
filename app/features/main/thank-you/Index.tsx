"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Heart } from "lucide-react";

import { clearCookie } from "@/libs/cookie";

const ThankYouRender = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    clearCookie("accessToken");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-6">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {/* Animated Success Icons */}
        <div className="mb-8 relative">
          <div
            className={`transition-all duration-700 ${
              showAnimation ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <CheckCircle className="w-24 h-24 text-[var(--primary-green-main)]" />
          </div>

          {/* Floating hearts animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`absolute w-6 h-6 text-[var(--primary-orange-main)] animate-pulse`}
                style={{
                  animation: `float-up 3s ease-out ${i * 0.3}s infinite`,
                  left: `${30 + i * 20}%`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center mb-2 text-[32px] font-bold leading-[39px] text-[var(--foreground)]">
          Thank You!
        </h1>

        {/* Subtitle */}
        <p className="text-center mb-8 text-xl font-medium leading-[30px] text-[var(--primary-orange-main)]">
          Your bill has been completed
        </p>

        {/* Description */}
        <p className="text-center mb-8 text-lg font-normal leading-[27px] text-[var(--textcolor-gray-01)]">
          We hope you enjoyed your meal.
          <br />
          Please visit us again soon.
        </p>

        {/* Footer Message */}
        <p className="text-center mt-10 text-sm text-gray-400">
          Have a great day! 🎉
        </p>
      </div>
    </div>
  );
};

export default ThankYouRender;
