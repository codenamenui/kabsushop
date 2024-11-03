"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { signOut } from "./actions";
import placeholder from "@/assets/placeholder.webp";

const Footer = () => {
    const handleSignOut = async () => {
        const error = await signOut();
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

    return (
        <div>
            <div>
                <Image src={placeholder} width={50} height={50} alt={"logo"} />
            </div>
            <div>
                <div>The Kabsu Shop</div>
                <Link href={"/about"}>About us</Link>
                <Link href={"/contact"}>Contact us</Link>
            </div>
            <div>
                <Link href={"/help"}>Help Center</Link>
                <Link href={"/privacy"}>Privacy Policy</Link>
                <Link href={"/terms"}>Terms of Service</Link>
            </div>
            <div>
                <form onSubmit={logInGoogle}>
                    <button type="submit">Sign In</button>
                </form>
                <form action={handleSignOut}>
                    <button className="button">Sign Out</button>
                </form>
                <Link href={"/profile"}>My Account</Link>
            </div>
        </div>
    );
};

export default Footer;
