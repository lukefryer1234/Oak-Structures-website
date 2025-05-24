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
import { GalleryHorizontal, FileText, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

// Content management category definition
interface ContentCategory {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

// Define all content management categories
const contentCategories: ContentCategory[] = [
  {
    title: "Gallery",
    description: "Manage image galleries displayed throughout the website.",
    icon: GalleryHorizontal,
    href: "/admin/content/gallery",
  },
  {
    title: "Custom Order Text",
    description: "Edit text and information shown on the custom order form.",
    icon: FileText,
    href: "/admin/content/custom-order-text",
  },
  {
    title: "SEO Settings",
    description: "Configure meta tags, page titles, and SEO-related content.",
    icon: ScanSearch,
    href: "/admin/content/seo",
  },
];

export default function ContentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Content Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage website content, galleries, and SEO settings.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contentCategories.map((category) => (
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
