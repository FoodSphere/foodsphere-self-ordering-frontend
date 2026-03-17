import { Bell, Check, Loader2 } from "lucide-react";

import { EServiceRequestStatus } from "@/types/enum";

interface WaitingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onClose: () => void;
  requestStatus: EServiceRequestStatus;
}

export default function WaitingModal({
  isOpen,
  onCancel,
  onClose,
  requestStatus,
}: WaitingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white mx-6 w-full max-w-sm rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center animate-[scaleIn_0.3s_ease-out]">
        {requestStatus === EServiceRequestStatus.PENDING ? (
          <>
            {/* Loading State */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
                <Loader2
                  size={40}
                  className="text-[var(--primary-orange-main)] animate-spin"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Calling Waiter
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Please wait a moment.
              <br />
              Our staff will be with you shortly.
            </p>
            <button
              onClick={onCancel}
              className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl font-semibold text-base shadow-md cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* Success State (Acknowledged, Done, or Cancelled) */}
            <div className="relative mb-5">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-white border-2 animate-pulse ${
                  requestStatus === EServiceRequestStatus.CANCELLED
                    ? "bg-red-50"
                    : "bg-gradient-to-br from-[var(--primary-orange-main)] to-orange-400"
                }`}
              >
                {requestStatus === EServiceRequestStatus.CANCELLED ? (
                  <Bell size={36} className="text-red-500" />
                ) : (
                  <Bell size={36} className="text-white" />
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white shadow-md ${
                  requestStatus === EServiceRequestStatus.CANCELLED
                    ? "bg-red-500"
                    : "bg-emerald-500"
                }`}
              >
                {requestStatus === EServiceRequestStatus.CANCELLED ? (
                  <Loader2 size={16} className="text-white" strokeWidth={3} />
                ) : (
                  <Check size={16} className="text-white" strokeWidth={3} />
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {requestStatus === EServiceRequestStatus.CANCELLED
                ? "Request Cancelled"
                : requestStatus === EServiceRequestStatus.DONE
                  ? "Service Complete"
                  : "Waiter Coming"}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {requestStatus === EServiceRequestStatus.CANCELLED ? (
                <>
                  Your request has been cancelled.
                  <br />
                  Please try again if needed.
                </>
              ) : requestStatus === EServiceRequestStatus.DONE ? (
                <>
                  Thank you for your request.
                  <br />
                  Your waiter has served you.
                </>
              ) : (
                <>
                  Please wait a moment.
                  <br />A waiter is coming.
                </>
              )}
            </p>
            {requestStatus === EServiceRequestStatus.DONE && (
              <button
                onClick={onClose}
                className={`mt-6 w-full py-3 rounded-xl font-semibold text-base shadow-md cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all text-white bg-gray-500`}
              >
                Got it
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
