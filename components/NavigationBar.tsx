"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { signOut } from "./actions";
import placeholder from "@/assets/placeholder.webp";

type Category = {
    id: number;
    name: string;
    picture: string;
};

type Shop = {
    id: number;
    acronym: string;
};

const NavigationBar = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [user, setUser] = useState(null);
    const [query, setQuery] = useState("");
    const path = usePathname();
    const params = useParams();
    const shopId = params.slug;
    const router = useRouter();

    useEffect(() => {
        const getCategories = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase.from("categories").select();
            setCategories(data);
        };
        getCategories();
    }, []);

    useEffect(() => {
        const getShops = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase
                .from("shops")
                .select("id, acronym");
            setShops(data);
        };
        getShops();
    }, []);

    useEffect(() => {
        const getAuth = async () => {
            const supabase = createClientComponentClient();
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            if (!error) {
                setUser(user);
            }
            console.log(user);
        };
        getAuth();
    }, []);

    const handleSignOut = async () => {
        const error = await signOut();
        if (!error) {
            setUser(null);
        }
    };

    const logInGoogle = async (e: React.FormEvent) => {
        e.preventDefault();

        const supabase = createClientComponentClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("query", query);
        if (path.includes("/shop")) {
            router.push(`/shop/${shopId}?${queryParams.toString()}`);
        } else {
            router.push(`/search?${queryParams.toString()}`);
        }
    };

    return (
        <div className="flex">
            <Image src={placeholder} width={50} height={50} alt={"logo"} />
            <div>
                <div>Categories</div>
                <div>Shops</div>
                <Link href={"/about"}>About</Link>
                <Link href={"/contact"}>Contact</Link>
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a product..."
                />
                <button type="submit">Search</button>
            </form>
            <div>
                <Image
                    src={placeholder}
                    width={50}
                    height={50}
                    alt={"notification"}
                />
                <Image src={placeholder} width={50} height={50} alt={"cart"} />
                <Image src={placeholder} width={50} height={50} alt={"user"} />
                {"Dropdown"}
                {user ? (
                    <div>
                        <Link href={"/profile"}>Go to profile</Link>
                        <form action={handleSignOut}>
                            <button>Logout</button>
                        </form>
                    </div>
                ) : (
                    <form onSubmit={logInGoogle}>
                        <button type="submit">Sign In</button>
                    </form>
                )}
            </div>
        </div>
    );
};
export default NavigationBar;
