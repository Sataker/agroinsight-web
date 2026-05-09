"use client";

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-gray-600 text-xl" onClick={onMenuToggle}>
          ☰
        </button>
        <h2 className="text-lg font-semibold text-gray-800">AgroInsight</h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">Produtor</span>
        <button
          onClick={() => {
            localStorage.removeItem("agroinsight_token");
            window.location.href = "/login";
          }}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
