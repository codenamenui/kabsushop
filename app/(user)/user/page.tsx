"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewProfile from "@/components/new-profile";
import Membership from "@/components/membership";
import ManagedShops from "@/components/managed-shops";

type Shop = {
  id: number;
  name: string;
};

const UserPage = () => {
  return (
    <div className="flex justify-center p-3">
      <Tabs defaultValue="profile" className="w-1/2">
        <div className="mb-2 flex justify-center">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="membership">Membership Request</TabsTrigger>
            <TabsTrigger value="shops">Manage Shops</TabsTrigger>
          </TabsList>
        </div>
        <Card className="">
          <CardContent className="p-4">
            <TabsContent value="profile">
              <NewProfile />
            </TabsContent>
            <TabsContent value="membership">
              <Membership />
            </TabsContent>
            <TabsContent value="shops">
              <ManagedShops />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default UserPage;
