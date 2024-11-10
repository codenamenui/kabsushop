import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteMerch } from "./actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { FaFacebook } from "react-icons/fa";
import { MdDelete, MdEmail } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface PostProps {
  params: {
    slug: string;
  };
}

type Shop = {
  id: number;
  name: string;
  email: string;
  socmed_url: string;
  logo_url: string;
  colleges: {
    id: string;
    name: string;
  }[];
  acronym: string;
};

type Merch = {
  id: number;
  name: string;
  created_at: string;
  merchandise_pictures: {
    picture_url: string;
  }[];
  variants: {
    sizes: {
      original_price: number;
      membership_price: number;
    }[];
    original_price: number;
    membership_price: number;
  };
  shops: {
    id: number;
    acronym: string;
  };
};

const ShopManagement = async ({ params }: PostProps) => {
  const supabase = createServerComponentClient({ cookies });
  const { data: shop } = await supabase
    .from("shops")
    .select(
      "id, name, email, socmed_url, logo_url, colleges(id, name), acronym",
    )
    .eq("id", params.slug)
    .single();

  const { data: merchs } = await supabase
    .from("merchandises")
    .select(
      `
            id, 
            name, 
            created_at,
            merchandise_pictures(picture_url), 
            variants(original_price, membership_price, sizes(original_price, membership_price)), 
            shops!inner(id, name, acronym)
        `,
    )
    .eq("shop_id", shop.id);

  return (
    <div className="flex justify-center p-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex">
            <Card className="flex w-full items-center gap-3 p-3">
              <Image
                src={shop.logo_url}
                width={80}
                height={80}
                alt={""}
                className="rounded-full"
              />
              <div className="text-xs">
                <p className="text-lg font-semibold">{shop.name}</p>
                <p>{shop.colleges.name}</p>
                <a href={shop.socmed_url} target="_blank" rel="noopener">
                  <span className="flex gap-1">
                    <FaFacebook size={20} />
                    <p>{shop.socmed_url}</p>
                  </span>
                </a>
                <span className="flex gap-1">
                  <MdEmail size={20} />
                  <p>{shop.email}</p>
                </span>
              </div>
            </Card>
          </div>
        </div>
        <div className="space-x-2">
          <Button>
            <Link href={`/manage/shop/${params.slug}/merch/new`}>
              Add Merchandise
            </Link>
          </Button>
          <Button>
            <Link href={"/manage/shop/${params.slug}/dashboard"}>Manage</Link>
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {merchs &&
            merchs.map((merch) => {
              return (
                <Card className="h-full w-52" key={merch.id}>
                  <CardContent className="p-5">
                    {merch.merchandise_pictures &&
                    merch.merchandise_pictures.length > 0 ? (
                      <Image
                        alt={merch.name}
                        width={192}
                        height={192}
                        src={merch.merchandise_pictures[0].picture_url}
                        className="h-48 w-48"
                      />
                    ) : (
                      <p>No image available</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex flex-col">
                      <div className="text-sm">
                        <p className="font-bold">{merch.name}</p>
                        <p>{merch.shops.acronym}</p>
                        <p className="text-base font-semibold text-emerald-800">
                          ${merch.variants[0].original_price}{" "}
                        </p>
                        <p>
                          Member:{" "}
                          <span className="font-semibold text-emerald-800">
                            ${merch.variants[0].membership_price}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="icon">
                          <Link
                            href={`/manage/shop/${params.slug}/merch/${merch.id}`}
                          >
                            <Edit />
                          </Link>
                        </Button>
                        <form action={deleteMerch}>
                          <Button
                            name="id"
                            value={merch.id}
                            variant="destructive"
                            size="icon"
                          >
                            <MdDelete />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ShopManagement;
