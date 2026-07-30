"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarRange,
  FileText,
  GraduationCap,
  Home,
  Landmark,
  Layers3,
  MapPin,
  PlusCircle,
  School,
  Settings,
  UserRound,
  UsersRound
} from "lucide-react";
import { NavigationLink } from "./navigation-link";

const navigation = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/alumnos", label: "Alumnos", icon: UsersRound },
  { href: "/registrar-alumno", label: "Registrar alumno", icon: PlusCircle },
  { href: "/pagos", label: "Pagos", icon: Landmark },
  { href: "/calendario-academico", label: "Calendario academico", icon: CalendarDays },
  { href: "/configuracion-academica/ciclos-escolares", label: "Ciclos escolares", icon: CalendarRange },
  { href: "/configuracion-academica/periodos-academicos", label: "Periodos academicos", icon: CalendarDays },
  { href: "/configuracion-academica/niveles-academicos", label: "Niveles academicos", icon: GraduationCap },
  { href: "/configuracion-academica/modalidades", label: "Modalidades", icon: School },
  { href: "/configuracion-academica/grupos", label: "Grupos", icon: Layers3 },
  { href: "/configuracion-academica/materias", label: "Materias", icon: BookOpen },
  { href: "/configuracion-academica/docentes", label: "Docentes", icon: UserRound },
  { href: "/configuracion-academica/aulas", label: "Aulas", icon: MapPin },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuracion", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 z-20 flex border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
      <Link href="/" className="flex items-center gap-3 lg:mb-8">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-sm font-black text-white">
          CE
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block text-sm font800 font-extrabold text-ink">
            CEACET
          </span>
          <span className="block text-xs text-muted">Control Escolar</span>
        </span>
      </Link>

      <nav className="ml-auto flex items-center gap-1 overflow-x-auto lg:ml-0 lg:flex-col lg:items-stretch lg:gap-1">
        {navigation.map((item) => (
          <NavigationLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
