"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";

type CartOrders = {
    id: any;
    user_id: any;
    quantity: any;
    variants: {
        id: any;
        name: any;
        picture_url: any;
        original_price: any;
        membership_price: any;
        merchandises: {
            online_payment: any;
            physical_payment: any;
            receiving_information: any;
        }[];
        sizes: {
            id: number;
            name: string;
            original_price: number;
            membership_price: number;
        }[];
    }[];
    shops: {
        id: number;
        acronym: string;
        logo_url: string;
    }[];
    sizes: {
        id: number;
        name: string;
        original_price: number;
        membership_price: number;
    }[];
};

const Cart = () => {
    const supabase = createClientComponentClient();
    const [cartOrders, setCartOrders] = useState<CartOrders[]>([]);

    const fetchMerchandise = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("cart_orders")
            .select(
                `
            id, 
            user_id,
            quantity,
            variants(id, name, picture_url, original_price, membership_price, merchandises(online_payment, physical_payment, receiving_information), sizes(id, name, original_price, membership_price)), 
            shops!inner(id, acronym, logo_url),
            sizes(id, name, original_price, membership_price)
            `
            )
            .eq("user_id", user.id);

        if (error) {
            console.error(error);
            return;
        }

        setCartOrders(data);
        console.log(data);
    };

    useEffect(() => {
        fetchMerchandise();
    }, []);

    return <div>Cart</div>;
};

export default Cart;
