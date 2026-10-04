import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-xl font-bold text-primary">FlyUp</Link>
        <Link to="/calculadora" className="text-sm font-medium text-primary hover:underline">Calculadora</Link>
      </div>
    </header>
  );
}
