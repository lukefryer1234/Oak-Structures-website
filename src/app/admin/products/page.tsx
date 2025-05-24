"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Ruler, Sparkles } from "lucide-react";
import { ImageIcon as ImageIconLucide } from "lucide-react";
import { Button } from "@/components/ui/button";

// Product management category definition
interface ProductCategory {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

// Define all product management categories
const productCategories: ProductCategory[] = [
  {
    title: "Configurable Prices",
    description:
      "Manage pricing for configurable products like garages and gazebos.",
    icon: DollarSign,
    href: "/admin/products/configurable-prices",
  },
  {
    title: "Unit Prices",
    description:
      "Set prices for oak beams, flooring, and other unit-based products.",
    icon: Ruler,
    href: "/admin/products/unit-prices",
  },
  {
    title: "Special Deals",
    description: "Create and manage promotional offers and special deals.",
    icon: Sparkles,
    href: "/admin/products/special-deals",
  },
  {
    title: "Product Photos",
    description: "Upload and organize product images and gallery photos.",
    icon: ImageIconLucide,
    href: "/admin/products/photos",
  },
];

export default function ProductsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Product Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your product catalog, pricing, and media assets.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {productCategories.map((category) => (
          <Card key={category.href} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="min-h-[2.5rem]">
                {category.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={category.href}>Manage {category.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
