"use client";

import { Button } from "@/components/ui/button"; // Adjust this path according to your UI component structure
import { NavigationMenu, NavigationMenuItem } from "@/components/ui/navigation-menu"; // Ensure these components exist
import { Home, User, Settings, LogOut } from "lucide-react"; // Icons
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react"; // Import signOut from next-auth

const Navbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Call signOut from NextAuth
    signOut({
      callbackUrl: "/emp/login", // Redirect to login page after sign out
    });
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <NavigationMenu className="flex justify-end items-center">
        <div className="flex space-x-4">
          <NavigationMenuItem>
            <Button variant="ghost" onClick={() => router.push("/")}>
              <Home className="mr-2 h-5 w-5" /> Home
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button variant="ghost" onClick={() => router.push("/profile")}>
              <User className="mr-2 h-5 w-5" /> Profile
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button variant="ghost" onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-5 w-5" /> Settings
            </Button>
          </NavigationMenuItem>
        </div>
        <div className="ml-auto"> {/* This div pushes the logout button to the right */}
          <NavigationMenuItem>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" /> {/* Use LogOut icon */}
              Logout
            </Button>
          </NavigationMenuItem>
        </div>
      </NavigationMenu>
    </nav>
  );
};

export default Navbar;
