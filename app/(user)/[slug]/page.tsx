"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ConfirmationModal from "@/components/ConfirmationModal";

type Merch = {
    id: number;
    name: string;
    description: string;
    receiving_information: string;
    online_payment: boolean;
    physical_payment: boolean;
    merchandise_pictures: {
        id: number;
        picture_url: string;
    }[];
    variants: {
        id: number;
        name: string;
        picture_url: string;
        original_price: number;
        membership_price: number;
        sizes: {
            id: number;
            variant_id: number;
            name: string;
            original_price: number;
            membership_price: number;
        }[];
    }[];
    shops: {
        id: number;
        name: string;
        logo_url: string;
    };
    merchandise_categories: {
        id: number;
        cat_id: number;
    }[];
};

const Product = () => {
    const params = useParams();
    const merchId = params.slug;
    const supabase = createClientComponentClient();
    const [merch, setMerch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [paymentOption, setPaymentOption] = useState(null);
    const [paymentReceipt, setPaymentReceipt] = useState<File>(null);
    const [cartConfirmation, setCartConfirmation] = useState(false);

    const fetchMerchandise = async () => {
        let { data, error } = await supabase
            .from("merchandises")
            .select(
                `
            id, 
            name, 
            description,
            receiving_information,
            online_payment,
            physical_payment,
            merchandise_pictures(id, picture_url), 
            variants(id, name, picture_url, original_price, membership_price, sizes(id, variant_id, name, original_price, membership_price)), 
            shops!inner(id, name, logo_url),
            merchandise_categories(id, cat_id)
            `
            )
            .eq("id", merchId)
            .single();

        setMerch(data);

        if (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMerchandise();
    }, []);

    useEffect(() => {
        if (merch != null) {
            setLoading(false);
            setSelectedVariant(merch.variants[0].id);
            if (merch.physical_payment) {
                setPaymentOption("irl");
            } else {
                setPaymentOption("online");
            }
        }
    }, [merch]);

    const handleQuantityChange = (event) => {
        const newQuantity = Math.max(1, Number(event.target.value));
        setQuantity(newQuantity);
    };

    function getVariant() {
        return merch.variants.find((variant) => variant.id == selectedVariant);
    }

    function getSize() {
        return merch.variants
            .find((variant) => variant.id == selectedVariant)
            .sizes.find((size) => size.id == selectedSize);
    }

    function handleOrderSubmit() {
        const insert = async () => {
            if (paymentOption == "online") {
                if (paymentReceipt == null) {
                    return;
                }
            }

            const supabase = createClientComponentClient();
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                console.error(userError);
                return;
            }

            const {
                data: { id: status_id },
                error: statusError,
            } = await supabase
                .from("order_statuses")
                .insert([{}])
                .select()
                .single();

            if (statusError) {
                console.error(statusError);
                return;
            }

            const { data, error } = await supabase
                .from("orders")
                .insert([
                    {
                        user_id: user.id,
                        quantity: quantity,
                        online_payment: paymentOption == "online",
                        physical_payment: paymentOption == "irl",
                        variant_id: selectedVariant,
                        shop_id: merch.shops.id,
                        size_id: selectedSize,
                        status_id: status_id,
                    },
                ])
                .select()
                .single();

            if (error) {
                console.error(error);
                return;
            }

            if (paymentOption == "online") {
                const url = `payment_${data.id}_${Date.now()}`;
                const { error: storageError } = await supabase.storage
                    .from("payment-picture")
                    .upload(url, paymentReceipt);

                if (storageError) {
                    console.log(storageError);
                }

                const {
                    data: { publicUrl },
                } = supabase.storage.from("payment-picture").getPublicUrl(url);

                const { data: payment, error: paymentError } = await supabase
                    .from("payments")
                    .insert([{ picture_url: publicUrl, order_id: data.id }]);

                if (paymentError) {
                    console.error(paymentError);
                    return;
                }
            }

            setOpenConfirmation(!openConfirmation);
        };
        insert();
    }

    function handleCartUpload() {
        console.log("Ds");
        const cartUpload = async () => {
            const supabase = createClientComponentClient();
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                console.error(userError);
                return;
            }

            const { data, error } = await supabase
                .from("cart_orders")
                .insert([
                    {
                        user_id: user.id,
                        quantity: quantity,
                        variant_id: selectedVariant,
                        shop_id: merch.shops.id,
                        size_id: selectedSize,
                    },
                ])
                .select()
                .single();

            if (error) {
                console.error(error);
                return;
            }

            setCartConfirmation(!cartConfirmation);
        };
        cartUpload();
    }

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <div>
                        <div>
                            {merch.merchandise_pictures.map((pic) => {
                                return (
                                    <Image
                                        width={50}
                                        height={50}
                                        src={pic.picture_url}
                                        alt={""}
                                        key={pic.id}
                                        priority
                                    />
                                );
                            })}
                        </div>
                        <div>
                            <div>{merch.name}</div>
                            <div>
                                {selectedSize ? (
                                    <div>
                                        P{getSize().original_price}/ P
                                        {getSize().membership_price}
                                    </div>
                                ) : (
                                    <div>
                                        P{getVariant().original_price}/ P
                                        {getVariant().membership_price}
                                    </div>
                                )}
                            </div>
                            <form
                                onSubmit={(e: React.FormEvent) => {
                                    e.preventDefault();
                                }}
                            >
                                <select
                                    id="variant"
                                    value={selectedVariant}
                                    onChange={(event) => {
                                        setSelectedVariant(event.target.value);
                                        setSelectedSize(null);
                                    }}
                                    required
                                >
                                    {merch.variants.map((variant) => (
                                        <option
                                            key={variant.id}
                                            value={variant.id}
                                        >
                                            {variant.name}
                                        </option>
                                    ))}
                                    {selectedVariant.sizes && (
                                        <select
                                            id="size"
                                            value={selectedSize}
                                            onChange={(event) => {
                                                setSelectedSize(
                                                    event.target.value
                                                );
                                            }}
                                            required
                                        >
                                            {selectedVariant.sizes.map(
                                                (size) => {
                                                    <option
                                                        key={size.id}
                                                        value={size.id}
                                                    >
                                                        {size.name}
                                                    </option>;
                                                }
                                            )}
                                        </select>
                                    )}
                                </select>
                                {getVariant().sizes != null && (
                                    <select
                                        id="sizes"
                                        value={selectedSize || ""}
                                        onChange={(event) => {
                                            setSelectedSize(event.target.value);
                                        }}
                                        required
                                    >
                                        <option value={null}></option>
                                        {getVariant().sizes.map((size) => (
                                            <option
                                                key={size.id}
                                                value={size.id}
                                            >
                                                {size.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <label htmlFor="quantity">Quantity:</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    required
                                />
                                <button onClick={handleCartUpload}>
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedSize != null) {
                                            setOpenConfirmation(
                                                !openConfirmation
                                            );
                                        }
                                    }}
                                >
                                    Buy Now
                                </button>
                            </form>
                            <div className="flex">
                                <Image
                                    src={merch.shops.logo_url}
                                    width={50}
                                    height={50}
                                    alt={""}
                                />
                                <div>{merch.shops.name}</div>
                            </div>
                        </div>
                    </div>
                    <div>{merch.description}</div>
                    {openConfirmation && (
                        <ConfirmationModal
                            isOpen={openConfirmation}
                            handleClose={() =>
                                setOpenConfirmation(!openConfirmation)
                            }
                        >
                            <div className="flex gap-5">
                                <Image
                                    src={getVariant().picture_url}
                                    alt={""}
                                    width={50}
                                    height={50}
                                />
                                <div>{merch.name}</div>
                                <div>Variant: {getVariant().name}</div>
                                <div>Quantity: {quantity}</div>
                                <div>
                                    Price: P
                                    {selectedSize
                                        ? getSize().original_price * quantity
                                        : getVariant().original_price *
                                          quantity}
                                </div>
                            </div>
                            <div>{merch.receiving_information}</div>
                            <form action="">
                                {merch.physical_payment && (
                                    <label className="block">
                                        <input
                                            type="radio"
                                            value={"irl"}
                                            checked={paymentOption === "irl"}
                                            onChange={() =>
                                                setPaymentOption("irl")
                                            }
                                        />
                                        {"In-Person Payment"}
                                    </label>
                                )}
                                {merch.online_payment && (
                                    <label className="block">
                                        <input
                                            type="radio"
                                            value={"online"}
                                            checked={paymentOption === "online"}
                                            onChange={() =>
                                                setPaymentOption("online")
                                            }
                                        />
                                        {"Online Payment"}
                                    </label>
                                )}
                                {paymentOption == "online" && (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setPaymentReceipt(
                                                    e.target.files?.[0] || null
                                                )
                                            }
                                            required
                                        />
                                        {paymentReceipt && (
                                            <div>
                                                <h4>Image Preview:</h4>
                                                <Image
                                                    src={URL.createObjectURL(
                                                        paymentReceipt
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
                            <button onClick={handleOrderSubmit}>Confirm</button>
                        </ConfirmationModal>
                    )}
                    {cartConfirmation && (
                        <ConfirmationModal
                            isOpen={cartConfirmation}
                            handleClose={() =>
                                setCartConfirmation(!cartConfirmation)
                            }
                        >
                            <div>Added to cart successfully!</div>
                        </ConfirmationModal>
                    )}
                </div>
            )}
        </div>
    );
};

export default Product;
