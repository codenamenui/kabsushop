import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Define the types for officers and shops
interface Shop {
    id: string;
    name: string;
    logo_url: string;
}

interface Officer {
    shops: Shop;
}

const ManagedShops = async () => {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { user },
    } = await supabase.auth.getUser();
    const { data: managedShops, error } = await supabase
        .from("officers")
        .select("shops(id, name, acronym, logo_url)")
        .eq("user_id", user.id);

    return (
        <div className="flex flex-col w-screen">
            {managedShops &&
                managedShops.map((s) => {
                    const shop = s.shops;
                    return (
                        <div key={shop.id} className="bg-black flex">
                            <Image
                                src={shop.logo_url}
                                alt={""}
                                width={50}
                                height={50}
                            />
                            <div className="flex flex-col">
                                <div>{shop.name}</div>
                                <div>{shop.acronym}</div>
                                <Link
                                    href={`/manage/shop/${shop.id}`}
                                    className="bg-green text-white rounded-lg "
                                >
                                    Manage
                                </Link>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default ManagedShops;
