"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import React from "react";

const Home = () => {
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
            <div>Your One-Stop Shop for Student Organization Merchandise</div>
            <div>
                A digital marketplace exclusive for all student organization
                merchandise in Cavite State University
            </div>
            <div>
                <form onSubmit={logInGoogle}>
                    <button type="submit">Sign In</button>
                </form>
                <Link href={"/search"}>Shop Now</Link>
            </div>
        </div>
    );
};

export default Home;
