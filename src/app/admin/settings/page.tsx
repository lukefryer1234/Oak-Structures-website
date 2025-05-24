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
import {
  Building2,
  DollarSign,
  Truck,
  CreditCard,
  BarChart3,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Settings category definition
interface SettingsCategory {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

// Define all settings categories
const settingsCategories: SettingsCategory[] = [
  {
    title: "Company Information",
    description:
      "Manage your company details, address, and contact information.",
    icon: Building2,
    href: "/admin/settings/company",
  },
  {
    title: "Financial Settings",
    description: "Configure currency, tax rates, and financial preferences.",
    icon: DollarSign,
    href: "/admin/settings/financial",
  },
  {
    title: "Delivery Options",
    description:
      "Set up delivery rates, free delivery thresholds, and shipping rules.",
    icon: Truck,
    href: "/admin/settings/delivery",
  },
  {
    title: "Payment Gateways",
    description: "Configure Stripe, PayPal, and other payment methods.",
    icon: CreditCard,
    href: "/admin/settings/payments",
  },
  {
    title: "Analytics",
    description: "Set up Google Analytics and other tracking services.",
    icon: BarChart3,
    href: "/admin/settings/analytics",
  },
  {
    title: "Notifications",
    description:
      "Configure email notifications for orders and customer inquiries.",
    icon: Mail,
    href: "/admin/settings/notifications",
  },
];

export default function SettingsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your site's configuration and preferences.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => (
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
                <Link href={category.href}>
                  Manage {category.title.split(" ")[0]}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
