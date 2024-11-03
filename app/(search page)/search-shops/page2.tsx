"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";

const SearchShops = () => {
    const supabase = createClientComponentClient();
    const [shops, setShops] = useState<any[]>([]); // Update state type to accept shops array
    const [searchQuery, setSearchQuery] = useState<string>(""); // State for the search query
    const [filteredShops, setFilteredShops] = useState<any[]>([]); // State for filtered shops

    // Fetch the shops data
    useEffect(() => {
        const getShops = async () => {
            const { data, error } = await supabase
                .from("shops")
                .select(`id, name, merchandises(id)`, { count: "exact" });

            if (error) {
                console.error("Error fetching shops:", error);
            } else {
                setShops(data);
                setFilteredShops(data); // Initially show all shops
            }
        };
        getShops();
    }, [supabase]);

    // Handle the search query input
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter shops based on the query (search by name)
        const filtered = shops.filter((shop) =>
            shop.name.toLowerCase().includes(query)
        );
        setFilteredShops(filtered);
        console.log(filtered);
    };

    return (
        <div className="search-shops">
            <h1>Search Shops</h1>

            {/* Search input */}
            <input
                type="text"
                placeholder="Search for shops..."
                value={searchQuery}
                onChange={handleSearch}
                className="border p-2 mb-4"
            />

            {/* Display the filtered shops */}
            <ul className="shop-list">
                {filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                        <li key={shop.id} className="shop-item border p-4 mb-2">
                            <h2>{shop.name}</h2>
                            <p>Product Count: {shop.merchandises.length}</p>
                        </li>
                    ))
                ) : (
                    <p>No shops found.</p>
                )}
            </ul>
        </div>
    );
};

export default SearchShops;
