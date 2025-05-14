"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/utils/routes"
import Link from "next/link"
import { DarkModeSwitcher } from "@/components/shared/DarkModeSwitcher"

export function UserDropdown() {
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    initials: "JD",
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 h-auto rounded-lg ml-auto hover:text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
        >
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-none">{user.name}</span>
            <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 mt-1">
        {/* <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground font-bold">{user.email}</p>
        </div> */}
        {/* <DropdownMenuSeparator /> */}

        <DarkModeSwitcher />

        <DropdownMenuSeparator />

        {/* Logout Option */}
        <DropdownMenuItem asChild>
          <Link href={ROUTES.LOGIN} className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
