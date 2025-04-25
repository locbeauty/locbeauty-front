import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dispatch, SetStateAction, useEffect } from "react"

export function DashboardHeader({setSidebarOpen}: {setSidebarOpen: Dispatch<SetStateAction<boolean>>}) {
      const pathname = usePathname()
    
       useEffect(() => {
        setSidebarOpen(false)
      }, [pathname, setSidebarOpen])
      
      return(
          <header className="sticky top-0 z-40 border-b bg-background">
              <div className="flex h-16 items-center px-4">
                <Button variant="destructive" size="icon" className="md:hidden mr-2 text-red-500" onClick={() => setSidebarOpen(prev => !prev)}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
                <div className="ml-auto flex items-center space-x-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/login">
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">Logout</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </header>
    )
}