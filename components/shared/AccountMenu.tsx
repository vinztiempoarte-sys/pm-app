"use client";

import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { createClient } from "@/lib/supabase/client";

export function AccountMenu() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Menu.Root>
      <Menu.Trigger className="flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-accent text-[10px] font-bold text-white">
          PM
        </span>
        <span className="text-sm font-semibold">PM App</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} className="isolate z-50">
          <Menu.Popup className="min-w-40 origin-(--transform-origin) rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Menu.LinkItem
              href="/ajustes"
              className="flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
            >
              Ajustes
            </Menu.LinkItem>
            <Menu.Item
              onClick={handleSignOut}
              className="flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-sm text-destructive outline-hidden select-none focus:bg-accent"
            >
              Cerrar sesión
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
