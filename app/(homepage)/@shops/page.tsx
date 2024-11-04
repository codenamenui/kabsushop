"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

type Shop = {
    id: number;
    acronym: string;
    logo_url: string;
};

const Shops = () => {
    const [shops, setShops] = useState<Shop[]>([]);

    useEffect(() => {
        const getShops = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase
                .from("shops")
                .select("id, acronym, logo_url");
            setShops(data);
        };
        getShops();
    }, []);

    return (
        <div>
            <div>Shops</div>
            <div>
                {shops &&
                    shops.map((shop) => {
                        return (
                            <Link key={shop.id} href={`/shop/${shop.acronym}`}>
                                <h2>{shop.acronym}</h2>
                                <Image
                                    width={50}
                                    height={50}
                                    src={shop.logo_url}
                                    alt={`${shop.acronym} logo`}
                                    priority
                                />
                            </Link>
                        );
                    })}
            </div>
        </div>
    );
};

export default Shops;
