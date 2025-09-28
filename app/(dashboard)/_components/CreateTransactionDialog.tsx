"use client";

import React, { ReactNode, useCallback, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/lib/types";

import { CreateTransactionSchema } from "@/schema/transaction";
import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "@/app/(dashboard)/_components/CategoryPicker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "@/app/(dashboard)/_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";

// ===== Tipos derivados del schema (usa z.coerce) =====
type Schema = typeof CreateTransactionSchema;
type FormInput = z.input<Schema>; // lo que ENTRA al resolver (puede traer unknown)
type FormOutput = z.output<Schema>; // lo que SALE del resolver (ya convertido)

// ====== Wrappers para evitar error de value: unknown ======
type RHFFieldBase = {
  name: string;
  ref: (instance: HTMLInputElement | null) => void;
  onBlur: () => void;
  value: unknown;
  onChange: (v: unknown) => void;
};

function RHFNumberInput({
  field,
  step = "0.01",
  ...rest
}: { field: RHFFieldBase } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...rest}
      type="number"
      name={field.name}
      ref={field.ref}
      onBlur={field.onBlur}
      step={step}
      value={
        typeof field.value === "number" || typeof field.value === "string"
          ? field.value
          : ""
      }
      // Enviamos string; z.coerce.number() lo convertirá a number
      onChange={(e) => field.onChange(e.target.value)}
    />
  );
}

function RHFTextInput({
  field,
  ...rest
}: { field: RHFFieldBase } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...rest}
      type={rest.type ?? "text"}
      name={field.name}
      ref={field.ref}
      onBlur={field.onBlur}
      value={typeof field.value === "string" ? field.value : ""}
      onChange={(e) => field.onChange(e.target.value)}
    />
  );
}

// =========================================================

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

function CreateTransactionDialog({ trigger, type }: Props) {
  // Tipamos useForm con 3 genéricos: <FormInput, any, FormOutput>
  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      amount: 0,
      date: new Date(),
      category: "",
      description: "",
    } as FormInput, // defaultValues en forma de ENTRADA
  });

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // v5: isPending; v4: isLoading (si usas v4 cambia a isLoading)
  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transaction created successfully 🎉", {
        id: "create-transaction",
      });

      form.reset({
        type,
        amount: 0,
        date: new Date(),
        category: "",
        description: "",
      } as FormInput);

      queryClient.invalidateQueries({ queryKey: ["overview"] });
      setOpen(false);
    },
  });

  const onSubmit = useCallback(
    (values: FormOutput) => {
      toast.loading("Creating transaction...", { id: "create-transaction" });
      mutate({
        ...values,
        date: DateToUTCDate(values.date),
      });
    },
    [mutate]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create a new{" "}
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {type}
            </span>{" "}
            transaction
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RHFTextInput field={field as unknown as RHFFieldBase} />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <RHFNumberInput
                      field={field as unknown as RHFFieldBase}
                      step="0.01"
                    />
                  </FormControl>
                  <FormDescription>
                    Transaction amount (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between gap-2">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CategoryPicker
                        type={type}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onChange={(v) => field.onChange(v)}
                      />
                    </FormControl>
                    <FormDescription>
                      Select a category for this transaction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Transaction date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[200px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value as Date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value as Date | undefined}
                          onSelect={(value) => value && field.onChange(value)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Select a date for this</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    form.reset({
                      type,
                      amount: 0,
                      date: new Date(),
                      category: "",
                      description: "",
                    } as FormInput)
                  }
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" disabled={isPending}>
                {!isPending ? "Create" : <Loader2 className="animate-spin" />}
              </Button>
            </div>
          </form>
        </Form>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;
