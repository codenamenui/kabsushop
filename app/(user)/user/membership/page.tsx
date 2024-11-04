"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";

type Shop = {
    id: number;
    name: string;
};

const Membership = () => {
    const supabase = createClientComponentClient();
    const [shops, setShops] = useState<Shop[]>([]);

    useEffect(() => {
        const getShops = async () => {
            const { data, error } = await supabase
                .from("shops")
                .select("id, name");

            if (error) {
                console.error(error);
            }
            setShops(data);
        };
        getShops();
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const shopId = formData.get("shop");

        const insertData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            const { data, error: selectError } = await supabase
                .from("membership_requests")
                .select()
                .eq("user_id", user.id)
                .eq("shop_id", shopId)
                .single();

            if (data == null) {
                const { error: memError } = await supabase
                    .from("membership_requests")
                    .insert([{ user_id: user.id, shop_id: shopId }]);
            }
        };
        insertData();
    }

    return (
        <div>
            <div>Membership Request</div>
            <form onSubmit={handleSubmit}>
                {shops && (
                    <select id="shop" name="shop" className="" required>
                        <option value=""></option>
                        {shops &&
                            shops.map((shop) => (
                                <option key={shop.id} value={shop.id}>
                                    {shop.name}
                                </option>
                            ))}
                    </select>
                )}
                <button>Request</button>
            </form>
        </div>
    );
};

export default Membership;
