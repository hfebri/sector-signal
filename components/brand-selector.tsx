"use client";

import { Check, ChevronsUpDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBrand } from "@/lib/brand-context";

export function BrandSelector() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentBrand, brands, setCurrentBrand, setBrands } = useBrand();

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      if (data.success && data.brands) {
        setBrands(data.brands);
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentBrand ? currentBrand.brandName : "Select brand..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search brands..." />
          <CommandEmpty>No brand found.</CommandEmpty>
          <CommandGroup>
            {brands.map((brand) => (
              <CommandItem
                key={brand.id}
                onSelect={() => {
                  setCurrentBrand(brand);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentBrand?.id === brand.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {brand.brandName}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandItem
            onSelect={() => {
              setOpen(false);
              loadBrands();
            }}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            {loading ? "Loading..." : "Refresh brands"}
          </CommandItem>
        </Command>
      </PopoverContent>
    </Popover>
  );
}