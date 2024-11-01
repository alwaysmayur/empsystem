"use client";
import { z } from "zod";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

import { useRouter } from "next/navigation";

// Ensure LoginSchema is defined properly
export const LoginSchema = z.object({
  email: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const LoginForm = () => {
  const router = useRouter();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "", // Use 'username' instead of 'email'
      password: "",
    },
  });

  const onSubmit = async (value: z.infer<typeof LoginSchema>) => {
    // Reset error and success states
    setError("");
    setSuccess("");

    // Use startTransition for optimizing the state update during the fetch
    startTransition(async () => {
      try {
        const response = await fetch("/api/login", {
          method: "POST", // Specify the method
          headers: {
            "Content-Type": "application/json", // Indicate JSON data
          },
          body: JSON.stringify(value), // Convert the value to JSON
        });

        const data = await response.json(); // Parse the JSON response

        // Call signIn from NextAuth to authenticate
        const result = await signIn("credentials", {
          redirect: false,
          email: value.email, // or username, depending on your setup
          password: value.password,
          role: data.result.role,
        });

        if (data.status == 201) {
          // Handle success
          setSuccess(data.success || "Login successful!");
          router.push("/dashboard");
        } else {
          // Handle errors from the server
          setError(data.error || "An error occurred.");
        }
      } catch (error) {
        // Handle network errors
        setError("Network error, please try again.");
      }
    });

    console.log(value); // Optional: log the submitted values
  };

  return (
    <CardWrapper
      headerLabel="Welcome Back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/emp/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email" // Change 'email' to 'username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="text"
                      {...field}
                      placeholder="Enter your username"
                    />
                  </FormControl>
                  <FormMessage className="font-normal" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="password"
                      {...field}
                      placeholder="********"
                    />
                  </FormControl>
                  <FormMessage className="font-normal" />
                </FormItem>
              )}
            />
          </div>
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button disabled={isPending} type="submit" className="w-full">
            Login
          </Button>
        </form>
        {/* Add other form fields as necessary */}
      </Form>
    </CardWrapper>
  );
};
