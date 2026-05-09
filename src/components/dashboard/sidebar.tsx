"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/precos", label: "Precos", icon: "💰" },
  { href: "/insumos", label: "Insumos", icon: "🧪" },
  { href: "/clima", label: "Clima", icon: "🌦" },
  { href: "/safra", label: "Safra", icon: "🌾" },
  { href: "/recomendacoes", label: "IA Recomendacoes", icon: "🤖" },
  { href: "/alertas", label: "Alertas", icon: "🔔" },
  { href: "/configuracoes", label: "Configuracoes", icon: "⚙" },
];

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-green-900 text-white z-50
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-green-800">
          <h1 className="text-xl font-bold">AgroInsight</h1>
          <p className="text-green-300 text-sm">Consultor com IA</p>
          <button className="lg:hidden absolute top-4 right-4 text-white text-xl" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                ${pathname === link.href ? "bg-green-700 text-white" : "text-green-200 hover:bg-green-800"}
              `}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
