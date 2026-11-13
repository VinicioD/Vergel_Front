import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
	Building2,
	CalendarDays,
	Eye,
	Loader2,
	Mail,
	MapPin,
	Phone,
	Search,
	Store,
	X,
} from "lucide-react";
import Table from "../../../../components/Table";
import type { Column } from "../../../../components/Table";
import { getSupplierById, getSuppliers } from "../../../../services/supplierService";
import type {
	SupplierQueryParams,
	SupplierRecord,
} from "../../../../types/supplier";

interface SupplierRow {
	id: number | string;
	name: string;
	tradeName: string;
	contact: string;
	phone: string;
	email: string;
	taxId: string;
	nrc: string;
	economicActivity: string;
	address: string;
	status: string;
	createdAt: string;
}

const PAGE_SIZE = 15;
const INPUT_CLASS =
	"w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#5b642a] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
const DETAIL_ITEM_CLASS =
	"flex min-w-0 flex-col gap-1 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/50";

const field = (...values: (string | null | undefined)[]) =>
	values.find((value) => typeof value === "string" && value.trim())?.trim() || "";

const mapSupplier = (supplier: SupplierRecord): SupplierRow => ({
	id: supplier.id,
	name: field(supplier.name, supplier.legal_name, supplier.legalName, supplier.trade_name, supplier.tradeName) || "Proveedor sin nombre",
	tradeName: field(supplier.trade_name, supplier.tradeName),
	contact: field(supplier.contact_name, supplier.contactName, supplier.contact_person, supplier.contactPerson),
	phone: field(supplier.phone),
	email: field(supplier.email),
	taxId: field(supplier.tax_id, supplier.taxId),
	nrc: field(supplier.nrc),
	economicActivity: field(supplier.economic_activity, supplier.economicActivity),
	address: field(supplier.address),
	status: field(supplier.status) || "unknown",
	createdAt: field(supplier.created_at, supplier.createdAt),
});

const formatDate = (date: string) => {
	if (!date) return "—";
	const parsed = new Date(date);
	return Number.isNaN(parsed.getTime())
		? date
		: parsed.toLocaleDateString("es-SV", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			});
};

const statusLabel = (status: string) => {
	if (status.toLowerCase() === "active") return "Activo";
	if (status.toLowerCase() === "inactive") return "Inactivo";
	return status;
};

const statusClass = (status: string) =>
	status.toLowerCase() === "active"
		? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
		: status.toLowerCase() === "inactive"
			? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
			: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

const getErrorMessage = (error: unknown) => {
	if (isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message || "No se pudo completar la consulta de proveedores.";
	}
	return "No se pudo completar la consulta de proveedores.";
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
	<div className={DETAIL_ITEM_CLASS}>
		<span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
			{label}
		</span>
		<span className="break-words font-semibold text-gray-800 dark:text-gray-200">
			{value || "—"}
		</span>
	</div>
);

export default function SuppliersPage() {
	const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [economicActivity, setEconomicActivity] = useState("");
	const [phone, setPhone] = useState("");
	const [desde, setDesde] = useState("");
	const [hasta, setHasta] = useState("");
	const [sortBy, setSortBy] = useState<SupplierQueryParams["sort_by"]>("id");
	const [sortDirection, setSortDirection] =
		useState<SupplierQueryParams["sort_direction"]>("desc");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [lastPage, setLastPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [selectedSupplier, setSelectedSupplier] =
		useState<SupplierRow | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			const loadSuppliers = async () => {
				setLoading(true);
				setErrorMessage("");
				const params: SupplierQueryParams = {
					search: search.trim() || undefined,
					status: status ? (status as "active" | "inactive") : undefined,
					economic_activity: economicActivity.trim() || undefined,
					phone: phone.trim() || undefined,
					desde: desde || undefined,
					hasta: hasta || undefined,
					sort_by: sortBy,
					sort_direction: sortDirection,
					limit: PAGE_SIZE,
					page,
				};

				try {
					const response = await getSuppliers(params);
					setSuppliers(response.data.map(mapSupplier));
					setTotal(response.meta?.total ?? response.data.length);
					setLastPage(response.meta?.last_page ?? 1);
					if (response.meta?.current_page && response.meta.current_page !== page) {
						setPage(response.meta.current_page);
					}
				} catch (error) {
					setSuppliers([]);
					setTotal(0);
					setLastPage(1);
					setErrorMessage(getErrorMessage(error));
				} finally {
					setLoading(false);
				}
			};

			void loadSuppliers();
		}, 300);

		return () => window.clearTimeout(timer);
	}, [search, status, economicActivity, phone, desde, hasta, sortBy, sortDirection, page]);

	const resetFilters = () => {
		setSearch("");
		setStatus("");
		setEconomicActivity("");
		setPhone("");
		setDesde("");
		setHasta("");
		setSortBy("id");
		setSortDirection("desc");
		setPage(1);
	};

	const openDetails = async (supplier: SupplierRow) => {
		setLoadingDetail(true);
		try {
			const response = await getSupplierById(supplier.id);
			setSelectedSupplier(mapSupplier(response.data));
		} catch (error) {
			setErrorMessage(getErrorMessage(error));
		} finally {
			setLoadingDetail(false);
		}
	};

	const columns: Column<SupplierRow>[] = [
		{
			header: "Proveedor",
			render: (supplier) => (
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5b642a]/20 bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]">
						<Store size={17} />
					</div>
					<div className="min-w-0">
						<p className="font-bold text-gray-900 dark:text-gray-100">{supplier.name}</p>
						<p className="text-xs text-gray-400">{supplier.tradeName || `ID #${supplier.id}`}</p>
					</div>
				</div>
			),
		},
		{
			header: "Contacto",
			render: (supplier) => (
				<div className="flex min-w-[150px] flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
					{supplier.contact && <span>{supplier.contact}</span>}
					<span className="flex items-center gap-1.5"><Phone size={13} />{supplier.phone || "Sin teléfono"}</span>
					{supplier.email && <span className="flex items-center gap-1.5 text-gray-400"><Mail size={13} />{supplier.email}</span>}
				</div>
			),
		},
		{
			header: "Actividad económica",
			render: (supplier) => <span>{supplier.economicActivity || "—"}</span>,
		},
		{
			header: "Identificación",
			render: (supplier) => (
				<div className="text-xs text-gray-600 dark:text-gray-300">
					<p>NIT/DUI: {supplier.taxId || "—"}</p>
					<p className="mt-1 text-gray-400">NRC: {supplier.nrc || "—"}</p>
				</div>
			),
		},
		{
			header: "Estado",
			render: (supplier) => (
				<span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass(supplier.status)}`}>
					{statusLabel(supplier.status)}
				</span>
			),
		},
		{
			header: "Acciones",
			className: "text-center",
			render: (supplier) => (
				<button
					type="button"
					title="Ver detalles"
					onClick={() => void openDetails(supplier)}
					disabled={loadingDetail}
					className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#5b642a] disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-[#a3b355]"
				>
					<Eye size={17} />
				</button>
			),
		},
	];

	const changePage = (nextPage: number) => {
		setPage(Math.max(1, Math.min(nextPage, lastPage)));
	};

	return (
		<div className="flex h-[calc(100dvh-5rem)] flex-col gap-5 overflow-hidden p-4 font-sans sm:p-6 md:h-[calc(100dvh-3rem)]">
			<header className="shrink-0">
				<h1 className="text-2xl font-bold text-[#2A3319] dark:text-gray-100 sm:text-3xl">
					Gestión de Proveedores
				</h1>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Consulta y filtra los proveedores registrados en El Vergel.
				</p>
			</header>

			<section className="shrink-0 rounded-3xl border border-gray-200/60 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
					<label className="relative sm:col-span-2 xl:col-span-2">
						<span className="sr-only">Buscar proveedor</span>
						<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input className={`${INPUT_CLASS} pl-10`} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nombre, correo, teléfono, NIT, NRC o contacto..." />
					</label>
					<label>
						<span className="sr-only">Estado</span>
						<select className={INPUT_CLASS} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
							<option value="">Todos los estados</option>
							<option value="active">Activo</option>
							<option value="inactive">Inactivo</option>
						</select>
					</label>
					<label>
						<span className="sr-only">Actividad económica</span>
						<input className={INPUT_CLASS} value={economicActivity} onChange={(event) => { setEconomicActivity(event.target.value); setPage(1); }} placeholder="Actividad económica" />
					</label>
					<label>
						<span className="sr-only">Teléfono</span>
						<input className={INPUT_CLASS} value={phone} onChange={(event) => { setPhone(event.target.value); setPage(1); }} placeholder="Teléfono" />
					</label>
					<label className="relative">
						<span className="sr-only">Desde</span>
						<CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input aria-label="Fecha desde" className={`${INPUT_CLASS} pl-9`} type="date" value={desde} max={hasta || undefined} onChange={(event) => { setDesde(event.target.value); setPage(1); }} />
					</label>
					<label className="relative">
						<span className="sr-only">Hasta</span>
						<CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input aria-label="Fecha hasta" className={`${INPUT_CLASS} pl-9`} type="date" value={hasta} min={desde || undefined} onChange={(event) => { setHasta(event.target.value); setPage(1); }} />
					</label>
					<label>
						<span className="sr-only">Ordenar por</span>
						<select className={INPUT_CLASS} value={sortBy} onChange={(event) => { setSortBy(event.target.value as SupplierQueryParams["sort_by"]); setPage(1); }}>
							<option value="id">Ordenar: ID</option>
							<option value="name">Ordenar: nombre</option>
							<option value="trade_name">Ordenar: nombre comercial</option>
							<option value="status">Ordenar: estado</option>
							<option value="created_at">Ordenar: fecha de registro</option>
						</select>
					</label>
					<div className="flex gap-2">
						<button type="button" onClick={() => { setSortDirection((direction) => direction === "asc" ? "desc" : "asc"); setPage(1); }} className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
							{sortDirection === "asc" ? "Ascendente" : "Descendente"}
						</button>
						<button type="button" onClick={resetFilters} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
							Limpiar
						</button>
					</div>
				</div>
			</section>

			{errorMessage && (
				<div role="alert" className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
					<span>{errorMessage}</span>
					<button type="button" aria-label="Cerrar mensaje" onClick={() => setErrorMessage("")}><X size={17} /></button>
				</div>
			)}

			<section className="min-h-0 flex-1 overflow-auto">
				{loading ? (
					<div className="flex h-48 items-center justify-center gap-2 rounded-3xl border border-gray-200/60 bg-white text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
						<Loader2 className="animate-spin text-[#5b642a]" size={20} />
						Cargando proveedores...
					</div>
				) : (
					<Table
						data={suppliers}
						columns={columns}
						currentPage={page}
						onPageChange={changePage}
						itemsPerPage={PAGE_SIZE}
						totalItems={total}
						entityName="proveedores"
					/>
				)}
			</section>

			{selectedSupplier && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSupplier(null); }}>
					<section role="dialog" aria-modal="true" aria-labelledby="supplier-detail-title" className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
						<header className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 dark:border-gray-700 sm:p-6">
							<div className="flex min-w-0 items-center gap-3">
								<div className="rounded-2xl bg-[#5b642a]/10 p-2.5 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]"><Building2 size={22} /></div>
								<div className="min-w-0">
									<h2 id="supplier-detail-title" className="truncate text-lg font-bold text-gray-900 dark:text-gray-100">{selectedSupplier.name}</h2>
									<p className="text-xs text-gray-500 dark:text-gray-400">Proveedor #{selectedSupplier.id}</p>
								</div>
							</div>
							<button type="button" aria-label="Cerrar detalle" onClick={() => setSelectedSupplier(null)} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"><X size={20} /></button>
						</header>
						<div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6">
							<DetailItem label="Nombre / razón social" value={selectedSupplier.name} />
							<DetailItem label="Nombre comercial" value={selectedSupplier.tradeName} />
							<DetailItem label="Estado" value={statusLabel(selectedSupplier.status)} />
							<DetailItem label="Actividad económica" value={selectedSupplier.economicActivity} />
							<DetailItem label="Persona de contacto" value={selectedSupplier.contact} />
							<DetailItem label="Teléfono" value={selectedSupplier.phone} />
							<DetailItem label="Correo electrónico" value={selectedSupplier.email} />
							<DetailItem label="NIT / DUI" value={selectedSupplier.taxId} />
							<DetailItem label="NRC" value={selectedSupplier.nrc} />
							<DetailItem label="Fecha de registro" value={formatDate(selectedSupplier.createdAt)} />
							<div className={`${DETAIL_ITEM_CLASS} sm:col-span-2`}>
								<span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Dirección</span>
								<span className="flex items-center gap-2 break-words font-semibold text-gray-800 dark:text-gray-200"><MapPin size={15} className="shrink-0 text-gray-400" />{selectedSupplier.address || "—"}</span>
							</div>
						</div>
						<footer className="border-t border-gray-100 p-4 dark:border-gray-700 sm:p-5">
							<button type="button" onClick={() => setSelectedSupplier(null)} className="w-full rounded-2xl bg-gray-100 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cerrar</button>
						</footer>
					</section>
				</div>
			)}
		</div>
	);
}
