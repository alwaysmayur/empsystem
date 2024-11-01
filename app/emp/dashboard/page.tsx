
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react"; // Icons
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard - StaffTrack",
  description: 'This is the dashboard',
}
const Page = async() => {

  return (
    <div className="flex">
      {/* Content Area */}
      <main className="flex-1">
        <div className="flex justify-between items-center p-4">
          <Button variant="ghost">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl">Main Content Area</h1>
        </div>
        {/* Main content goes here */}
        <div className="p-4">
          <p>This is where the main content of the dashboard will appear.</p>
        </div>
      </main>
    </div>
  );
};

export default Page;
