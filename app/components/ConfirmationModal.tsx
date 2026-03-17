interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}: ConfirmationModalProps) => {
    if (!isOpen || !title || !message || !onClose || !onConfirm) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative bg-white rounded-lg p-6 w-3/4  md:w-1/2">
                <h2 className="text-lg font-medium">{title}</h2>
                <p className="text-gray-500">{message}</p>
                <div className="flex justify-end gap-5 sm:gap-10 mt-4">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
                    <button onClick={onConfirm} className="text-[var(--primary-orange-main)] hover:text-red-600 cursor-pointer">Confirm</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal