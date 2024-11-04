import React, { useEffect } from "react";

interface BuyConfirmationModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    handleClose: () => void;
    // name: string;
    // quantity: number;
    // variant: {
    //     id: number;
    //     name: string;
    //     picture_url: string;
    //     original_price: number;
    //     membership_price: number;
    //     sizes: {
    //         id: number;
    //         variant_id: number;
    //         name: string;
    //         original_price: number;
    //         membership_price: number;
    //     }[];
    // };
    // size: number | null;
}

const ConfirmationModal = ({
    children,
    isOpen,
    handleClose,
}: BuyConfirmationModalProps) => {
    useEffect(() => {
        const closeOnEscapeKey = (e: KeyboardEvent) =>
            e.key === "Escape" ? handleClose() : null;
        document.body.addEventListener("keydown", closeOnEscapeKey);
        return () => {
            document.body.removeEventListener("keydown", closeOnEscapeKey);
        };
    }, [handleClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return (): void => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div>
            <div className="flex justify-center items-center">
                <div className="absolute bg-black opacity-50 top-0 left-0 z-40 w-screen h-screen"></div>
                <div className="z-50 absolute inset-0 flex justify-center items-center">
                    <div className="bg-black p-8 rounded-lg shadow-lg">
                        <button onClick={handleClose}>Close</button>
                        <div>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
