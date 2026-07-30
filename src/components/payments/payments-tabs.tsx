"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard, History, Layers, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/labels";

type Option = { id: string; name: string; schoolCycleId?: string };
type StudentOption = { id: string; name: string };
type ReEnrollmentRow = {
  id: string;
  studentName: string;
  schoolCycle: string;
  academicPeriod: string;
  program: string;
  groupId: string;
  group: string;
  status: string;
  dueDate: string;
  amount: number;
  balance: number;
};

type PaymentsTabsProps = {
  rows: ReEnrollmentRow[];
  students: StudentOption[];
  schoolCycles: Option[];
  academicPeriods: Option[];
  academicLevels: Option[];
  modalities: Option[];
  groups: Option[];
};

const tabs = [
  { id: "tuition", label: "Colegiaturas", icon: CreditCard },
  { id: "reenrollments", label: "Reinscripciones", icon: ReceiptText },
  { id: "other", label: "Otros conceptos", icon: Layers },
  { id: "history", label: "Historial", icon: History }
];

function statusTone(status: string): "green" | "yellow" | "red" | "blue" | "gray" {
  if (status === "PAID" || status === "WAIVED") return "green";
  if (status === "PARTIAL" || status === "PENDING" || status === "DRAFT") return "yellow";
  if (status === "OVERDUE" || status === "CANCELLED") return "red";
  return "gray";
}

export function PaymentsTabs({
  rows,
  students,
  schoolCycles,
  academicPeriods,
  academicLevels,
  modalities,
  groups
}: PaymentsTabsProps) {
  const [activeTab, setActiveTab] = useState("reenrollments");
  const [newReEnrollmentCycleId, setNewReEnrollmentCycleId] = useState("");
  const [newReEnrollmentPeriodId, setNewReEnrollmentPeriodId] = useState("");
  const [filters, setFilters] = useState({
    cycle: "Todos",
    program: "Todos",
    group: "Todos",
    status: "Todos",
    dueDate: "",
    student: ""
  });
  const [message, setMessage] = useState("");

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStudent =
          !filters.student ||
          row.studentName.toLowerCase().includes(filters.student.toLowerCase());
        return (
          matchesStudent &&
          (filters.cycle === "Todos" || row.schoolCycle === filters.cycle) &&
          (filters.program === "Todos" || row.program === filters.program) &&
          (filters.group === "Todos" || row.groupId === filters.group) &&
          (filters.status === "Todos" || row.status === filters.status) &&
          (!filters.dueDate || row.dueDate <= filters.dueDate)
        );
      }),
    [filters, rows]
  );

  const groupFilterOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const seen = new Set<string>();

    for (const row of rows) {
      if (!row.groupId || seen.has(row.groupId)) continue;
      seen.add(row.groupId);
      options.push({ value: row.groupId, label: row.group });
    }

    return options;
  }, [rows]);

  const filteredAcademicPeriods = useMemo(
    () =>
      newReEnrollmentCycleId
        ? academicPeriods.filter((period) => period.schoolCycleId === newReEnrollmentCycleId)
        : [],
    [academicPeriods, newReEnrollmentCycleId]
  );

  async function createReEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    const formData = new FormData(form);
    const response = await fetch("/api/reenrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setMessage(payload?.message ?? "No fue posible crear la reinscripcion.");
      return;
    }

    setMessage("Reinscripcion creada. Actualiza la pagina para verla en el listado.");
    setNewReEnrollmentCycleId("");
    setNewReEnrollmentPeriodId("");
    form.reset();
  }

  async function registerPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    const formData = new FormData(form);
    const response = await fetch("/api/reenrollments/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setMessage(payload?.message ?? "No fue posible registrar el pago.");
      return;
    }

    setMessage("Pago registrado. Actualiza la pagina para ver el saldo recalculado.");
    form.reset();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`focus-ring flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab !== "reenrollments" ? (
        <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-ink">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h3>
          <p className="mt-2 text-sm text-muted">
            Vista preparada para conectarse con cargos, pagos y recibos en una
            etapa posterior.
          </p>
        </section>
      ) : (
        <div className="space-y-5">
          {message ? (
            <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">
              {message}
            </div>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <form
              onSubmit={createReEnrollment}
              className="rounded-lg border border-line bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-bold text-ink">Nueva reinscripcion</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <select name="studentId" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
                  <option value="">Alumno activo</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
                <select
                  name="schoolCycleId"
                  required
                  value={newReEnrollmentCycleId}
                  onChange={(event) => {
                    const nextCycleId = event.target.value;
                    setNewReEnrollmentCycleId(nextCycleId);
                    const selectedPeriod = academicPeriods.find(
                      (period) => period.id === newReEnrollmentPeriodId
                    );
                    if (!selectedPeriod || selectedPeriod.schoolCycleId !== nextCycleId) {
                      setNewReEnrollmentPeriodId("");
                    }
                  }}
                  className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
                >
                  <option value="">Ciclo escolar</option>
                  {schoolCycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                  ))}
                </select>
                <select
                  name="academicPeriodId"
                  value={newReEnrollmentPeriodId}
                  onChange={(event) => setNewReEnrollmentPeriodId(event.target.value)}
                  className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
                >
                  <option value="">Periodo academico</option>
                  {filteredAcademicPeriods.map((period) => (
                    <option key={period.id} value={period.id}>{period.name}</option>
                  ))}
                </select>
                <select name="academicLevelId" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
                  <option value="">Nivel</option>
                  {academicLevels.map((level) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
                <select name="modalityId" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
                  <option value="">Programa</option>
                  {modalities.map((modality) => (
                    <option key={modality.id} value={modality.id}>{modality.name}</option>
                  ))}
                </select>
                <select name="groupId" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
                  <option value="">Grupo opcional</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                <input name="amount" type="number" min="1" placeholder="Importe" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
                <input name="dueDate" type="date" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
                <input name="lateFeePercentage" type="number" min="0" defaultValue="10" placeholder="Recargo %" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
              </div>
              <button className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white">
                Generar cargo de reinscripcion
              </button>
            </form>

            <form
              onSubmit={registerPayment}
              className="rounded-lg border border-line bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-bold text-ink">Registrar pago</h3>
              <div className="mt-4 grid gap-3">
                <select name="reEnrollmentId" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
                  <option value="">Reinscripcion</option>
                  {rows
                    .filter((row) => row.balance > 0)
                    .map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.studentName} - {formatMoney(row.balance)}
                      </option>
                    ))}
                </select>
                <input name="amount" type="number" min="1" placeholder="Importe pagado" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
                <select name="paymentMethod" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
                  <option value="CASH">Efectivo</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="OTHER">Otro</option>
                </select>
                <input name="reference" placeholder="Referencia" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
              </div>
              <button className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white">
                Aplicar pago
              </button>
            </form>
          </section>

          <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6">
            <input
              value={filters.student}
              onChange={(event) => setFilters({ ...filters, student: event.target.value })}
              placeholder="Alumno"
              className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
            />
            {[
              ["cycle", "Ciclo", Array.from(new Set(rows.map((row) => row.schoolCycle)))],
              ["program", "Programa", Array.from(new Set(rows.map((row) => row.program)))]
            ].map(([key, , options]) => (
              <select
                key={String(key)}
                value={filters[key as keyof typeof filters]}
                onChange={(event) => setFilters({ ...filters, [key as string]: event.target.value })}
                className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
              >
                <option>{key === "program" ? "Todos" : key === "status" ? "Todos" : "Todos"}</option>
                {(options as string[]).map((option) => (
                  <option key={`${String(key)}-${option}`}>{option}</option>
                ))}
              </select>
            ))}
            <select
              value={filters.group}
              onChange={(event) => setFilters({ ...filters, group: event.target.value })}
              className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
            >
              <option value="Todos">Todos</option>
              {groupFilterOptions.map((option) => (
                <option key={`group-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
            >
              <option value="Todos">Todos</option>
              {["DRAFT", "PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED", "CANCELLED"].map((status) => (
                <option key={`status-${status}`} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              value={filters.dueDate}
              onChange={(event) => setFilters({ ...filters, dueDate: event.target.value })}
              type="date"
              className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
            />
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line">
                <thead className="bg-surface">
                  <tr>
                    {["Alumno", "Ciclo", "Programa", "Grupo", "Vence", "Estado", "Saldo"].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-muted">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4 text-sm font-bold text-ink">{row.studentName}</td>
                      <td className="px-4 py-4 text-sm text-muted">{row.schoolCycle}</td>
                      <td className="px-4 py-4 text-sm text-muted">{row.program}</td>
                      <td className="px-4 py-4 text-sm text-muted">{row.group}</td>
                      <td className="px-4 py-4 text-sm text-muted">{row.dueDate}</td>
                      <td className="px-4 py-4"><Badge tone={statusTone(row.status)}>{row.status}</Badge></td>
                      <td className="px-4 py-4 text-sm font-bold text-ink">{formatMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRows.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">
                No hay reinscripciones con los filtros seleccionados.
              </div>
            ) : null}
          </section>
        </div>
      )}

      <div className="text-sm text-muted">
        <Link href="/calendario-academico" className="font-bold text-brand-600">
          Ver calendario academico
        </Link>
      </div>
    </div>
  );
}
