"use client";

import { useParams } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

type Variant = {
    picture_url: File;
    name: string;
    original_price?: any;
    membership_price?: any;
    merch_id: number;
    sizes?: {
        name: string;
        original_price?: any;
        membership_price?: any;
    };
};

const Merch = () => {
    const { id, slug: shopId } = useParams();
    const [name, setName] = useState<string>("");
    const [desc, setDesc] = useState<string>("");
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [merchPics, setMerchPics] = useState<File[]>([]);
    const [categories, setCategories] = useState([]);
    const [discount, setDiscount] = useState(false);

    const handleAddCategory = (e) => {
        const newCategoryId = e.target.value;
        if (newCategoryId && !selectedCategories.includes(newCategoryId)) {
            console.log(newCategoryId);
            setSelectedCategories((prev) => [...prev, newCategoryId]);
        }
        // Reset the select field after selection
        e.target.value = "";
    };

    const handleRemoveCategory = (id) => {
        setSelectedCategories((prev) => prev.filter((catId) => catId !== id));
    };

    // Function to add a variant with an empty name, picture, and price
    const addVariant = () => {
        setVariants([
            ...variants,
            {
                name: "",
                picture_url: null,
                original_price: 1,
                membership_price: 1,
                merch_id: null,
            },
        ]);
    };

    // Function to remove variant by index
    const removeVariant = (index: number) => {
        setVariants((prev) => prev.filter((_, i) => i != index));
    };

    // Function to remove merchandise picture by index
    const removeMerchPic = (index: number) => {
        setMerchPics((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="text-red-700">
                <h1>Add Merchandise</h1>
                <form action="" className="flex flex-col gap-4">
                    <label>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="form-input"
                        />
                    </label>

                    <label>
                        Description:
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            required
                            className="textarea"
                        />
                    </label>

                    <label htmlFor="" className="flex flex-col gap-1">
                        Categories
                        <div className="flex gap-2 card">
                            {selectedCategories.map((categoryId) => {
                                const category = categories.find(
                                    (cat) => cat.id == categoryId
                                );
                                return (
                                    <div
                                        key={categoryId}
                                        className="flex items-center card"
                                    >
                                        <span>{category?.name}</span>
                                        <button
                                            onClick={() =>
                                                handleRemoveCategory(categoryId)
                                            }
                                            className="ml-2 text-red-500 button-outline"
                                        >
                                            -
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <select
                            name="categories"
                            onChange={handleAddCategory}
                            className="dropdown"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => {
                                return (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                );
                            })}
                        </select>
                    </label>

                    <label>
                        Merch Pictures:
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                if (
                                    e.target.files &&
                                    e.target.files.length > 0
                                ) {
                                    setMerchPics((prev) => [
                                        ...prev,
                                        ...Array.from(e.target.files),
                                    ]);
                                    setTimeout(() => {
                                        e.target.value = "";
                                    }, 0);
                                }
                            }}
                            className="form-input"
                        />
                    </label>

                    {merchPics.length > 0 && (
                        <div className="file-list">
                            <h3 className="text-lg font-medium">
                                Selected Merch Pictures:
                            </h3>
                            <ul className="flex flex-wrap flex-col gap-2">
                                {merchPics.map((file, index) => (
                                    <li key={index} className="file-item card">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            width={100}
                                            height={100}
                                            className="object-contain"
                                        />
                                        <p>{file.name}</p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeMerchPic(index)
                                            }
                                            className="remove-button"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <h3 className="text-lg font-medium">Variants</h3>
                    {variants &&
                        variants.map((variant, index) => (
                            <div key={index} className="flex flex-col">
                                <label>
                                    Variant Name:
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) =>
                                            setVariants((prev) =>
                                                prev.map((v, i) =>
                                                    i == index
                                                        ? {
                                                              ...v,
                                                              name: e.target
                                                                  .value,
                                                          }
                                                        : v
                                                )
                                            )
                                        }
                                        className="form-input"
                                    />
                                </label>

                                <label>
                                    Original Price:
                                    <input
                                        type="number"
                                        value={variant.original_price}
                                        min="1"
                                        onChange={(e) =>
                                            setVariants((prev) =>
                                                prev.map((v, i) =>
                                                    i == index
                                                        ? {
                                                              ...v,
                                                              original_price:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : v
                                                )
                                            )
                                        }
                                        className="form-input"
                                    />
                                </label>

                                <label>
                                    Membership:
                                    <input
                                        type="checkbox"
                                        onChange={() => {
                                            setDiscount(!discount);
                                        }}
                                    />
                                </label>

                                {discount && (
                                    <label>
                                        Membership Price:
                                        <input
                                            type="number"
                                            value={variant.membership_price}
                                            min="1"
                                            onChange={(e) =>
                                                setVariants((prev) =>
                                                    prev.map((v, i) =>
                                                        i == index
                                                            ? {
                                                                  ...v,
                                                                  membership_price:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : v
                                                    )
                                                )
                                            }
                                            className="form-input"
                                        />
                                    </label>
                                )}

                                <label>
                                    Variant Picture:
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setVariants((prev) =>
                                                prev.map((v, i) =>
                                                    i == index
                                                        ? {
                                                              ...v,
                                                              variantPicture:
                                                                  e.target
                                                                      .files?.[0] ||
                                                                  null,
                                                          }
                                                        : v
                                                )
                                            )
                                        }
                                        className="form-input"
                                    />
                                </label>

                                {variant.picture_url && (
                                    <Image
                                        src={URL.createObjectURL(
                                            variant.picture_url
                                        )}
                                        alt={variant.name}
                                        width={100}
                                        height={100}
                                        className="object-cover my-2"
                                    />
                                )}

                                {index != 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="remove-button mt-2"
                                    >
                                        Remove Variant
                                    </button>
                                )}
                            </div>
                        ))}

                    <button
                        type="button"
                        onClick={addVariant}
                        className="button"
                    >
                        Add Variant
                    </button>

                    <button type="submit" className="button mt-4">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Merch;
