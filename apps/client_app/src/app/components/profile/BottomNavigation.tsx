"use client";

import { Home, Search, PlusSquare, ShoppingBag, Heart } from "lucide-react";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around py-2">
      <Home />
      <Search />
      <PlusSquare />
      <ShoppingBag />
      <Heart />
    </div>
  );
}
