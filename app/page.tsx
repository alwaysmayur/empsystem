import { Poppins } from "next/font/google"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LoginButton  } from "@/components/auth/login-button"

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})
export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center content-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 items-center justify-center content-center ">
        <h1 className={cn("text-6xl text-white  font-semibold drop-shadow-md ", font.className)}>EMP Management System</h1>
        <p className="text-lg text-white">A simple authentication system.</p>
        <div>
        <LoginButton mode="redirect">
          <Button variant="secondary" size="lg">
            Sign In
          </Button>
          </LoginButton>
        </div>
      </div>

    </main>
  );
}
