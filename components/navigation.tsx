"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  Home,
  MessageCircle,
  PlusCircle,
  Target,
  TrendingUp,
  Users
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "AI Chatbot", href: "/chatbot", icon: MessageCircle },
  { name: "Create Brand", href: "/brand/create", icon: PlusCircle },
  { name: "Annual Strategy", href: "/strategy", icon: Target },
  { name: "Monthly Planning", href: "/monthly-plan", icon: Calendar },
  { name: "Tactical Campaigns", href: "/campaigns", icon: TrendingUp },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Competitors", href: "/competitors", icon: Users },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Button
            key={item.name}
            variant={isActive ? "secondary" : "ghost"}
            className="justify-start w-full"
            asChild
          >
            <Link href={item.href}>
              <Icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
