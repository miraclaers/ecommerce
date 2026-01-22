export default function Navbar() {
return (
    <nav className="w-full h-16 border-b">
    <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

        {/* Logo */}
        <div className="text-xl font-bold">
        MiniShop
        </div>

        {/* Links */}
        <ul className="flex gap-6 text-sm font-medium">
            <li className="cursor-pointer">Inicio</li>
            <li className="cursor-pointer">Productos</li>
            <li className="cursor-pointer">Contacto</li>
        </ul>

    </div>
    </nav>
);
}
