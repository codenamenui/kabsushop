"use client";

import Image from "next/image";
import useClientGetData from "./useClientGetData";
import { useEffect, useRef, useState } from "react";
import { deleteCartOrder, handleOrderSubmit, updateCart } from "./functions";
import ConfirmationModal from "@/components/ConfirmationModal";

const Cart = () => {
    const [cartOrders, setCartOrders] = useClientGetData(
        "cart_orders",
        `
        id,
        user_id,
        quantity,
        variant_id,
        variants(sizes(id, name, original_price, membership_price)),
        merchandises(id, name, online_payment, physical_payment, receiving_information, variants(id, name, picture_url, original_price, membership_price)),
        shops!inner(id, acronym),
        size_id`,
        { con: { key: "user_id" } }
    );
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [paymentOptions, setPaymentOptions] = useState<{
        [key: string]: string;
    }>({});
    const [paymentReceipts, setPaymentReceipts] = useState<{
        [key: string]: File;
    }>({});

    const handleVariantChange = (orderId, variantId) => {
        setCartOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id == orderId
                    ? {
                          ...order,
                          variant_id: variantId,
                      }
                    : order
            )
        );
    };

    const handleSizeChange = (id, value: number) => {
        setCartOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id == id ? { ...order, size_id: value } : order
            )
        );
    };

    const handleQuantityChange = (id, value: number) => {
        setCartOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id == id ? { ...order, quantity: value } : order
            )
        );
    };

    const deleteOrder = (id: any) => {
        setCartOrders((prevOrders) =>
            prevOrders.filter((order) => order.id != id)
        );
    };

    function getVariant(order, id) {
        return order.merchandises.variants.find((variant) => variant.id == id);
    }

    function getSize(order, variant_id, size_id) {
        return order.variants.sizes.find((size) => size.id == size_id);
    }

    function deleteO(id) {
        deleteCartOrder(id);
        deleteOrder(id);
    }

    // Handle checkbox changes
    const handleCheckboxChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const orderId = event.target.value;
        setSelectedOrders((prev) => {
            if (event.target.checked) {
                return [...prev, orderId];
            } else {
                return prev.filter((id) => id != orderId);
            }
        });
    };

    // Get all form values
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!formRef.current) return;

        // Get selected orders
        const formData = new FormData(formRef.current);
        const selectedOrderIds = formData.getAll("orders");
        const selectedOrdersDetails = cartOrders.filter((order) =>
            selectedOrderIds.includes(order.id.toString())
        );

        setSelectedOrders(selectedOrdersDetails);
        setOpenConfirmation(!openConfirmation);
        console.log("Selected Orders:", selectedOrdersDetails);
    };

    const handlePaymentOptionChange = (orderId: string, option: string) => {
        setPaymentOptions((prev) => ({
            ...prev,
            [orderId]: option,
        }));
    };

    const handlePaymentReceiptChange = (orderId: string, file: File) => {
        setPaymentReceipts((prev) => ({
            ...prev,
            [orderId]: file,
        }));
    };

    return (
        <div>
            <div>My Shopping Cart</div>
            <form
                id="myForm"
                ref={formRef}
                className="flex flex-col gap-2"
                onSubmit={handleSubmit}
            >
                {cartOrders ? (
                    cartOrders.map((order) => (
                        <label
                            className="bg-gray-200 rounded-lg text-black"
                            key={order.id}
                        >
                            <input
                                type="checkbox"
                                name="orders"
                                value={order.id}
                                onChange={handleCheckboxChange}
                                checked={selectedOrders.includes(
                                    order.id.toString()
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    deleteO(order.id);
                                }}
                                className="rounded-lg bg-slate-400"
                            >
                                Delete
                            </button>
                            <div className="flex">
                                <Image
                                    src={
                                        getVariant(order, order.variant_id)
                                            .picture_url
                                    }
                                    alt={""}
                                    width={50}
                                    height={50}
                                />
                                <div>
                                    <div>{order.merchandises.name}</div>
                                    <div>
                                        {order.size_id != null
                                            ? getSize(
                                                  order,
                                                  order.variant_id,
                                                  order.size_id
                                              )?.original_price * order.quantity
                                            : getVariant(
                                                  order,
                                                  order.variant_id
                                              ).original_price * order.quantity}
                                    </div>
                                    <div>{order.shops.acronym}</div>
                                    <div className="flex gap-5">
                                        <div className="flex flex-col">
                                            <div>Variant:</div>
                                            <select
                                                id="variant"
                                                onChange={(e) => {
                                                    handleVariantChange(
                                                        order.id,
                                                        parseInt(e.target.value)
                                                    );
                                                    updateCart(order);
                                                }}
                                                value={order.variant_id}
                                            >
                                                {order.merchandises.variants.map(
                                                    (variant) => (
                                                        <option
                                                            value={variant.id}
                                                            key={variant.id}
                                                        >
                                                            {variant.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                        {order.size_id && (
                                            <div>
                                                <div>Sizes: </div>
                                                <select
                                                    id="sizes"
                                                    onChange={(e) => {
                                                        handleSizeChange(
                                                            order.id,
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        );
                                                        updateCart(order);
                                                    }}
                                                    value={order.size_id}
                                                >
                                                    {order.variants.sizes?.map(
                                                        (size) => (
                                                            <option
                                                                key={size.id}
                                                                value={size.id}
                                                            >
                                                                {size.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        )}
                                        <label
                                            htmlFor="quantity"
                                            className="flex flex-col"
                                        >
                                            <div>Quantity:</div>
                                            <input
                                                id="quantity"
                                                type="number"
                                                min="1"
                                                onChange={(e) => {
                                                    handleQuantityChange(
                                                        order.id,
                                                        parseInt(e.target.value)
                                                    );
                                                    updateCart(order);
                                                }}
                                                value={order.quantity}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))
                ) : (
                    <div>No Cart orders yet. Get to ordering pus!</div>
                )}

                {/* Add submit button if you want to process all selected orders */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
                    disabled={selectedOrders.length == 0}
                >
                    Process Selected Orders
                </button>
            </form>

            {openConfirmation && (
                <ConfirmationModal
                    isOpen={openConfirmation}
                    handleClose={() => setOpenConfirmation(!openConfirmation)}
                >
                    <div className="flex flex-col gap-5">
                        {selectedOrders &&
                            selectedOrders.map((order) => (
                                <div key={order.id} className="flex gap-5">
                                    <Image
                                        src={
                                            getVariant(order, order.variant_id)
                                                .picture_url
                                        }
                                        alt={""}
                                        width={50}
                                        height={50}
                                    />
                                    <div>{order.merchandises.name}</div>
                                    <div>
                                        Variant:{" "}
                                        {
                                            getVariant(order, order.variant_id)
                                                .name
                                        }
                                    </div>
                                    <div>Quantity: {order.quantity}</div>
                                    <div>
                                        Price: P
                                        {order.size_id != null
                                            ? getSize(
                                                  order,
                                                  order.variant_id,
                                                  order.size_id
                                              )?.original_price * order.quantity
                                            : getVariant(
                                                  order,
                                                  order.variant_id
                                              ).original_price * order.quantity}
                                    </div>
                                    <div>
                                        {
                                            order.merchandises
                                                .receiving_information
                                        }
                                    </div>
                                    <form className="space-y-2">
                                        {order.merchandises
                                            .physical_payment && (
                                            <label className="block">
                                                <input
                                                    type="radio"
                                                    name={`payment-${order.id}`}
                                                    value="irl"
                                                    checked={
                                                        paymentOptions[
                                                            order.id
                                                        ] == "irl"
                                                    }
                                                    onChange={() =>
                                                        handlePaymentOptionChange(
                                                            order.id,
                                                            "irl"
                                                        )
                                                    }
                                                />
                                                <span className="ml-2">
                                                    In-Person Payment
                                                </span>
                                            </label>
                                        )}
                                        {order.merchandises.online_payment && (
                                            <label className="block">
                                                <input
                                                    type="radio"
                                                    name={`payment-${order.id}`}
                                                    value="online"
                                                    checked={
                                                        paymentOptions[
                                                            order.id
                                                        ] == "online"
                                                    }
                                                    onChange={() =>
                                                        handlePaymentOptionChange(
                                                            order.id,
                                                            "online"
                                                        )
                                                    }
                                                />
                                                <span className="ml-2">
                                                    Online Payment
                                                </span>
                                            </label>
                                        )}
                                        {paymentOptions[order.id] ==
                                            "online" && (
                                            <div className="mt-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file =
                                                            e.target.files?.[0];
                                                        if (file) {
                                                            handlePaymentReceiptChange(
                                                                order.id,
                                                                file
                                                            );
                                                        }
                                                    }}
                                                    required
                                                />
                                                {paymentReceipts[order.id] && (
                                                    <div className="mt-2">
                                                        <h4>Image Preview:</h4>
                                                        <Image
                                                            src={URL.createObjectURL(
                                                                paymentReceipts[
                                                                    order.id
                                                                ]
                                                            )}
                                                            alt="Selected"
                                                            width={50}
                                                            height={50}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            ))}
                    </div>
                    <button
                        onClick={() =>
                            selectedOrders.map((order) => {
                                handleOrderSubmit(
                                    order,
                                    paymentOptions[order.id],
                                    setOpenConfirmation,
                                    paymentReceipts[order.id]
                                        ? paymentReceipts[order.id]
                                        : null
                                );
                                deleteO(order.id);
                            })
                        }
                    >
                        Submit
                    </button>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default Cart;
