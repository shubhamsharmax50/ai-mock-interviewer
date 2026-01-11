"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from "next/image"
import Link from "next/link"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import TextField from "@/components/TextField" // Import your TextField component
import { useRouter } from "next/navigation"


const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "signup" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  })
}

type FormType = "signin" | "signup"

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter(); 
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "signup") {
  toast.success("Account created successfully!");

  setTimeout(() => {
    router.push("/sign-in");
  }, 1000);
}

       else {
        toast.success("Signed in successfully!");
          router.push('/');
      }
    }
    catch (error) {
      console.log("error", error);
      toast.error(`there was an error: ${error}`)
    }
  }

  const isSignIn = type === "signin";
  
  return (
    <div className="card-border lg:min-w-[566]">
      <div className="flex flex-col gap-6 card py-14 px-10 text-white">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">prepWise</h2>
        </div>
        <h3 className="text-primary-100">practice job interviews powered by AI</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <TextField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter your name"
              />
            )}
            
            <TextField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
            />
            
            <TextField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn w-full" type="submit">
              {isSignIn ? "Sign In" : "Create an account"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-gray-400">
          {isSignIn ? "no account yet? " : "already have an account? "}
          <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-bold text-user-primary ml-1">
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthForm