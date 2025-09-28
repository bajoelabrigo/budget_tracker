"use client";

import CreateCategoryDialog from "@/app/(dashboard)/_components/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@/lib/generated/prisma";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

interface Props {
  type: TransactionType;
  value: string; // ← controlado por el padre/RHF
  onChange: (value: string) => void; // ← notifica al padre/RHF
  placeholder?: string;
  disabled?: boolean;
}

function CategoryPicker({
  type,
  value,
  onChange,
  placeholder = "Select category",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<Category[]>({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });

  const categories = data ?? [];

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === value),
    [categories, value]
  );

  const successCallback = useCallback(
    (category: Category) => {
      onChange(category.name); // actualiza el valor en RHF
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={disabled}
        >
          {isLoading ? (
            "Loading..."
          ) : isError ? (
            "Error"
          ) : selectedCategory ? (
            <CategoryRow category={selectedCategory} />
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="Search category..." />
          <CreateCategoryDialog type={type} successCallback={successCallback} />

          <CommandEmpty>
            <p>Category not found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Create a new category
            </p>
          </CommandEmpty>

          <CommandGroup>
            <CommandList>
              {categories.map((category) => (
                <CommandItem
                  key={category.name}
                  onSelect={() => {
                    onChange(category.name); // ← notificamos al padre
                    setOpen(false);
                  }}
                >
                  <CategoryRow category={category} />
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 opacity-0",
                      value === category.name && "opacity-100"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CategoryPicker;

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2">
      <span role="img" aria-label="icon">
        {category.icon}
      </span>
      <span>{category.name}</span>
    </div>
  );
}
