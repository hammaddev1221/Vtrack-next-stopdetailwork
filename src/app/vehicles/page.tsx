"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { vehicleListByClientId, Addtag, Gettag, updatevehicle, GetDriverDataByClientId, postDriverDataAssignByClientId, GetDriverDataAssignByClientId, postDriverDeDataAssignByClientId } from "@/utils/API_CALLS";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { 
	/* FiTruck, 
	FiSearch, 
	FiEdit2, 
	FiTag, 
	FiUser, 
	
	FiSave,
	FiPlus  */
	FiTag, 
	FiSearch, 
	FiX,
	FiPlus
} from "react-icons/fi";
import { MdLocalOffer } from "react-icons/md";

interface VehicleRow {
	id?: string;
	vehicleReg: string;

	currentDriverName?: string;
	vehicleMake?: string;
	vehicleModel?: string;
	// vehicleType?: string;
	tags?: string[];
}



export default function VehiclesPage() {
	const { data: session } = useSession();
	const router = useRouter()
	 if (!session?.featureVehicleTab) {
	    router.push("/liveTracking");
	}
	const [allVehicles, setAllVehicles] = useState<VehicleRow[]>([]);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<VehicleRow[]>([]);
	const [assignTagsOpen, setAssignTagsOpen] = useState(false);
	const [assignTags, setAssignTags] = useState<string[]>([]);
	const [editOpen, setEditOpen] = useState(false);
	const [editVehicle, setEditVehicle] = useState<VehicleRow | null>(null);
	const [originalDriverName, setOriginalDriverName] = useState<string>("");
	const [tagInput, setTagInput] = useState("");
	const [bulkTags, setBulkTags] = useState<string[]>([]);
	const [driverOptions, setDriverOptions] = useState<any[]>([]);
	const [assignments, setAssignments] = useState<any[]>([]);
	const [addTagModalOpen, setAddTagModalOpen] = useState(false);



	const getTags = async () => {
		if (!session) return;
		const tagres: any = await Gettag({ token: session!.accessToken as string })
		
		console.log(tagres.data.map((i: any) => i.tag))
		
setBulkTags(tagres.data.map((i: any) => i.tag));
	}

	const toSentenceCase = (s: string) => {
		if (!s) return s;
		const lower = s.toLowerCase();
		return lower.charAt(0).toUpperCase() + lower.slice(1);
	};

	const load = async () => {
		if (!session) return;
		const res: any = await vehicleListByClientId({
			token: session!.accessToken as string,
			clientId: session!.clientId as string,
		});

		const rows = (res?.data || res || []).map((v: any) => ({
			id: v.id || v._id || v.vehicleId,
			vehicleReg: v.Label1,
			currentDriverName: v.currentDriverName,
			vehicleMake: v.vehicleMake,
			vehicleModel: v.vehicleModel,
			// vehicleType: v.vehicleType,
			tags: v.tags || [],
		})) as VehicleRow[];
		setAllVehicles(rows);
	};
	const loadDrivers = async () => {
		if (!session) return;
		const response: any = await GetDriverDataByClientId({
			token: session.accessToken as string,
			clientId: session.clientId as string,
		});
		const available = (response || []).filter((d: any) => d.isAvailable === true && d.isDeleted === false);
		setDriverOptions(
			available.map((d: any) => ({
				value: d,
				label: [d.driverfirstName, d.driverMiddleName, d.driverLastName].filter(Boolean).join(" "),
			}))
		);
	};
	// Load current driver assignments for deassign
	const loadAssignments = async () => {
		if (!session) return;
		const resp: any = await GetDriverDataAssignByClientId({ token: session.accessToken as string, clientId: session.clientId as string });
		setAssignments(resp.data || []);
	};
	useEffect(() => {
		load();


		loadDrivers();

		loadAssignments();
		getTags()
	}, []);

	const filtered = useMemo(() => {
		if (!query) return allVehicles;
		const q = query.toLowerCase();
		return allVehicles.filter((v) =>
			[v.vehicleReg, v.currentDriverName, v.vehicleMake, v.vehicleModel, 
				// v.vehicleType,
				 ...(v.tags || [])]
				.filter(Boolean)
				.some((x) => String(x).toLowerCase().includes(q))
		);
	}, [allVehicles, query]);

	const toggleSelect = (row: VehicleRow) => {
		setSelected((prev) => {
			const exists = prev.find((r) => (r.id || r.vehicleReg) === (row.id || row.vehicleReg));
			return exists ? prev.filter((r) => (r.id || r.vehicleReg) !== (row.id || row.vehicleReg)) : [...prev, row];
		});
	};

	const openEdit = (row: VehicleRow) => {
		setEditVehicle(row);
		setOriginalDriverName(row.currentDriverName || "");
		setEditOpen(true);
	};

	const saveVehicle = async () => {
		if (!session || !editVehicle?.id) {
			setEditOpen(false);
			setEditVehicle(null);
			return;
		}
		await updatevehicle({
			token: session.accessToken as string,
			payload: {
				id: editVehicle.id,
				tags: editVehicle.tags || [],
				Label1: editVehicle.vehicleReg,
				vehicleMake: editVehicle.vehicleMake,
				vehicleModel: editVehicle.vehicleModel,	
			},
		});
		console.log(editVehicle, originalDriverName, assignments)

		// Assign driver if changed (first deassign previous if any)
		if ((editVehicle.currentDriverName || "") !== originalDriverName) {
			const selected = driverOptions.find((o) => o.label === (editVehicle.currentDriverName || ""))?.value;
			// Deassign existing assignment for this vehicle if present
			console.log(selected)
			const currentAssign = assignments.find((a: any) => a?.vehicleDetails?.id === editVehicle.id);

			console.log(currentAssign)

			if (currentAssign) {
				const dePayload: any = {
					DriverDetails: { id: currentAssign?.DriverDetails?.id },
					id: currentAssign?.id,
					timezone: session?.timezone,
					dateDeassign: new Date(),
					vehicleDetails: { id: currentAssign?.vehicleDetails?.id },
				};
				await postDriverDeDataAssignByClientId({ token: session!.accessToken as string, newformdata: { ...dePayload, clientId: session!.clientId } });
			}
			if (selected) {
				const payload: any = {
					DriverDetails: {
						driverfirstName: selected.driverfirstName,
						driverMiddleName: selected.driverMiddleName,
						driverLastName: selected.driverLastName,
						driverContact: selected.driverContact,
						driverIdNo: selected.driverIdNo,
						driverAddress1: selected.driverAddress1,
						driverAddress2: selected.driverAddress2,
						id: selected.id,

					},
					id: "",
					timezone: session?.timezone,
					vehicleDetails: {
						id: editVehicle.id,
						vehicleNo: editVehicle.vehicleReg,
						vehicleMake: editVehicle.vehicleMake,
						vehicleModel: editVehicle.vehicleModel,
						vehicleReg: editVehicle.vehicleReg,
					},
				};
				await postDriverDataAssignByClientId({
					token: session.accessToken as string,
					newformdata: { ...payload, clientId: session.clientId },
				});
			}
			loadAssignments()
			loadDrivers()
		}
		load()
		// setAllVehicles((prev) =>
		// 	prev.map((v) =>
		// 		v.id === editVehicle.id
		// 			? { ...v, tags: [...(editVehicle.tags || [])], currentDriverName: editVehicle.currentDriverName }
		// 			: v
		// 	)
		// );
		setEditOpen(false);
		setEditVehicle(null);
	};

	const addBulkTag = async () => {
		if (!tagInput.trim()) return;
		const normalized = tagInput.trim().toLowerCase();
		await Addtag(session?.accessToken, {
			clientId: session?.clientId, tag: normalized
		})
		getTags()
		// setBulkTags((prev) => Array.from(new Set([...prev, tagInput.trim()])));
		setTagInput("");
	};

	const doAssignTags = async () => {
		if (!session || selected.length === 0 || assignTags.length === 0) return;
		const lowerNew = Array.from(new Set(assignTags.map((t) => String(t).toLowerCase())));
		const ids = selected.map((s) => s.id).filter(Boolean) as string[];

		// Update each selected vehicle on backend and local state
		for (const id of ids) {
			const current = allVehicles.find((v) => v.id === id);
			const merged = Array.from(new Set([...(current?.tags || []).map(String).map((t) => t.toLowerCase()), ...lowerNew]));
			await updatevehicle({ token: session.accessToken as string, payload: { id, tags: merged } });
		}

		// Update local state
		setAllVehicles((prev) => prev.map((v) => {
			const hit = selected.find((s) => s.id === v.id);
			if (!hit) return v;
			const merged = Array.from(new Set([...(v.tags || []).map((t) => String(t).toLowerCase()), ...lowerNew]));
			return { ...v, tags: merged };
		}));

		setAssignTags([]);
		setAssignTagsOpen(false);
		setSelected([]);
	};
{/* Header Section */}
				{/* <div className="mb-6 mx-6">
					<div className="flex items-center gap-3 mb-2">
						<FiTruck className="text-3xl text-[#00B56C]" />
						<h1 className="text-3xl font-bold text-gray-800">Vehicles</h1>
					</div>
					<p className="text-gray-600">Manage vehicles, drivers and tags</p>
				</div> */}
	return (
		<>
		
		 <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
          Vehicle Tagging 
        </p>
		
		<div className="p-6 bg-gray-50  overflow-hidden flex flex-col">
			
			<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
  {/* Top row: Search (left) & Buttons (right) */}
  <div className="flex items-center justify-between gap-4 mb-4">
    {/* Search bar on left */}
    <div className="relative w-[150px] min-w-[250px]">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search "
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
      />
    </div>

    {/* Buttons on right */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => setAddTagModalOpen(true)}
        className="flex items-center gap-1.5 bg-[#00B56C] text-white px-3 py-2 rounded-lg hover:bg-[#009956] transition-colors text-sm font-medium"
      >
        <FiPlus className="text-base" />
        Add New Tag
      </button>
      <button
        disabled={selected.length === 0}
        onClick={() => setAssignTagsOpen(true)}
        className="flex items-center gap-1.5 bg-green disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg hover:bg-[#009956] transition-colors text-sm font-medium"
      >
        <MdLocalOffer className="text-base" />
        Assign Tag
      </button>
    </div>
  </div>

  {/* Below row: Label + Tags with counts and overflow management */}
<div className="flex items-center border-t border-gray-200 pt-3 max-h-28 overflow-y-auto">

  <h3 className="text-[#00B56C] font-semibold font-popins text-sm uppercase tracking-wide select-none mr-3">
    Tags
  </h3>
  <span className="text-gray-400 mr-3 select-none">|</span>
  <div className="flex flex-wrap gap-2 overflow-x-auto">
    {bulkTags.length === 0 ? (
      <p className="text-gray-500 text-sm font-popins">No tags available.</p>
    ) : (
      bulkTags.map((tag) => (
        <div
          key={tag}
          className="flex font-popins items-center gap-2 bg-[#00B56C] bg-opacity-10 text-[#00B56C] rounded-md px-3 py-1 text-sm font-medium border border-[#00B56C] border-opacity-20 whitespace-nowrap"
        >
          <span>{toSentenceCase(tag)}</span>
        </div>
      ))
    )}
  </div>
</div>


</div>


			{/* Vehicles Table with Scroll */}
			<div className=" bg-white rounded-lg shadow-sm h-[60vh]  flex flex-col">
				<div className="overflow-auto ">{/*  flex-1 */}
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
							<tr>
								<th className="px-4 py-4 text-left text-xs font-semibold text-gray-700  tracking-wider w-12">
									<input 
										type="checkbox" 
										className="rounded border-gray-300"
										style={{ accentColor: "#00B56C" }}
										checked={selected.length === filtered.length && filtered.length > 0}
										onChange={(e) => {
											if (e.target.checked) {
												setSelected(filtered);
											} else {
												setSelected([]);
											}
										}}
									/>
								</th>
								<th className="px-8  py-4 text-left text-sm font-semibold text-gray-700  tracking-wider">
									<div className="flex items-center gap-2">
										
										Vehicle
									</div>
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700  tracking-wider">Make</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700  tracking-wider">Model</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700  tracking-wider">
									<div className="flex items-center gap-2">
										
										Driver
									</div>
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700  tracking-wider">
									<div className="flex items-center gap-2">
									
										Tags
									</div>
								</th>
								<th className="px-6 py-4 text-center text-sm font-semibold text-gray-700  tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filtered.map((row, i) => (
								<tr key={row.vehicleReg} className="hover:bg-gray-50 transition-colors">
									<td className="px-4 py-4">
										<input 
											type="checkbox"
											className="rounded border-gray-300"
											style={{ accentColor: "#00B56C" }}
											checked={!!selected.find((s) => (s.id || s.vehicleReg) === (row.id || row.vehicleReg))} 
											onChange={() => toggleSelect(row)} 
										/>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											
											<div className="ml-4">
												<div className="text-sm font-popins text-gray-900">{row.vehicleReg}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-popins text-gray-900">{row.vehicleMake || "-"}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-popins text-gray-900">{row.vehicleModel || "-"}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-popins text-gray-900">{row.currentDriverName || "-"}</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex gap-1 flex-wrap">
											{(row.tags || []).map((t) => (
												<span key={t} className="px-2 py-0.5  bg-[#00B56C] bg-opacity-10 text-[#00B56C] rounded-md text-xs font-popins  border border-[#00B56C] border-opacity-20">
													{toSentenceCase(String(t))}
												</span>
											))}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex justify-center">
											<button 
												className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00B56C] bg-opacity-10 text-[#00B56C] transition-all font-popins"
												onClick={() => openEdit(row)}
												title="Edit Vehicle"
											>
											
												<span className="text-xs font-popins">Edit</span>
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{filtered.length === 0 && (
					<div className="p-12 text-center">
						
						<p className="text-gray-500 text-lg font-medium">No vehicles found</p>
						<p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
					</div>
				)}
			</div>

		{editOpen && editVehicle && (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
				<div className="bg-white  h-[55vh] max-h-[95vh] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
					{/* Modal Header */}
					<div className="bg-[#00B56C] px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								
								<div>
									<h2 className="text-xl font-bold text-white">Edit Vehicle</h2>
							
								</div>
							</div>
							<button 
								onClick={() => { setEditOpen(false); setEditVehicle(null); }} 
								className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
							>
								<FiX className="text-xl" />
							</button>
						</div>
					</div>

					{/* Modal Body */}
					<div className="p-6 h-[72%]">
						<div className="grid grid-cols-2 gap-4  ">
							<label className="text-sm col-span-1">
								<span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
									
									Vehicle Registration
								</span>
								<input 
									className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									value={editVehicle.vehicleReg} 
									onChange={(e) => setEditVehicle({ ...editVehicle, vehicleReg: e.target.value })} 
								/>
							</label>
							<label className="text-sm col-span-1">
								<span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
									
									Driver
								</span>
								<input 
									className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									value={editVehicle.currentDriverName} 
									disabled={true}
								/>
								{/* <Select
									isClearable
									value={editVehicle.currentDriverName ? { value: editVehicle.currentDriverName, label: editVehicle.currentDriverName } : null}
									onChange={(opt: any) => setEditVehicle({ ...editVehicle, currentDriverName: opt ? opt.label : "" })}
									options={driverOptions}
									classNamePrefix="react-select"
									styles={{
										control: (provided, state) => ({
											...provided,
											border: '#00B56C 2px solid',
											borderRadius: '0.5rem',
											padding: '0.125rem',
											boxShadow: 'none',
											'&:hover': {
												border: '#00B56C 2px solid',
											}
										}),
										option: (provided, state) => ({
											...provided,
											backgroundColor: state.isSelected
												? '#00B56C'
												: state.isFocused
												? '#e1f0e3'
												: 'transparent',
											color: state.isSelected
												? 'white'
												: state.isFocused
												? 'black'
												: 'black',
											'&:hover': {
												backgroundColor: '#e1f0e3',
												color: 'black',
											},
										}),
										 
									}}
								/> */}
							</label>
							<label className="text-sm col-span-1">
								<span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
									Make
								</span>
								<input 
									className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									value={editVehicle.vehicleMake || ""} 
									onChange={(e) => setEditVehicle({ ...editVehicle, vehicleMake: e.target.value })} 
								/>
							</label>
							<label className="text-sm col-span-1">
								<span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
									Model
								</span>
								<input 
									className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									value={editVehicle.vehicleModel || ""} 
									onChange={(e) => setEditVehicle({ ...editVehicle, vehicleModel: e.target.value })} 
								/>
							</label>
							{/* <label className="text-sm">
								<span className="block mb-1">Type</span>								
								<Select
									isClearable
									value={editVehicle.vehicleType ? { value: editVehicle.vehicleType, label: editVehicle.vehicleType } : null}
									onChange={(opt: any) => setEditVehicle({ ...editVehicle, vehicleType: opt ? opt.label : "" })}
									options={[
										"Car", "Boat", "Bike"
									].map((opt) => {
										return {
											value: opt,
											label: opt,
										}
									})}
									classNamePrefix="react-select"
									styles={{
										control: (provided, state) => ({
											...provided,
											border: '#00B56C 2px solid',
											boxShadow: state.isFocused ? null : null,
											'&:hover': {
												border: '#00B56C 2px solid',
											}
										}),
										option: (provided, state) => ({
											...provided,

											backgroundColor: state.isSelected
												? '#00B56C'
												: state.isFocused
													? '#e1f0e3'
													: 'transparent',
											color: state.isSelected
												? 'white'
												: state.isFocused
													? 'black'
													: 'black',
											'&:hover': {
												backgroundColor: '#e1f0e3',
												color: 'black',
											},
										}),
									}}								/>

							</label> */}
							<label className="text-sm col-span-2">
								<span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
									<FiTag className="text-gray-400" />
									Tags
								</span>
								<Select
									isMulti
									value={(editVehicle.tags || []).map((t) => ({ value: t, label: toSentenceCase(String(t)) }))}
									onChange={(opts) => setEditVehicle({ ...editVehicle, tags: (opts || []).map((o: any) => o.value) })}
									options={Array.from(new Set(bulkTags)).map((t) => ({ value: t.toLowerCase(), label: toSentenceCase(t) }))}
									classNamePrefix="react-select"
									styles={{
										control: (provided, state) => ({
											...provided,
											border: '#00B56C 2px solid',
											borderRadius: '0.5rem',
											padding: '0.125rem',
											boxShadow: 'none',
											'&:hover': {
												border: '#00B56C 2px solid',
											}
										}),
										option: (provided, state) => ({
											...provided,
											backgroundColor: state.isSelected
												? '#00B56C'
												: state.isFocused
												? '#e1f0e3'
												: 'transparent',
											color: state.isSelected
												? 'white'
												: state.isFocused
												? 'black'
												: 'black',
											'&:hover': {
												backgroundColor: '#e1f0e3',
												color: 'black',
											},
										}),
										multiValue: (provided) => ({
											...provided,
											backgroundColor: "#e1f0e3",
										}),
										multiValueLabel: (provided) => ({
											...provided,
											color: "#00B56C",
											fontWeight: "500",
										}),
										multiValueRemove: (provided) => ({
											...provided,
											color: "#00B56C",
											"&:hover": {
												backgroundColor: "#00B56C",
												color: "white",
											},
										}),
										  menuList: (provided) => ({
            ...provided,
            maxHeight: bulkTags && bulkTags.length > 3 ? '110px' : 'auto',
            overflowY: bulkTags && bulkTags.length > 3 ? 'auto' : 'visible',
        }),
									}}
								/>
							</label>
						</div>
					</div>

					{/* Modal Footer */}
					<div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
						
						<button 
							className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00B56C] text-white hover:bg-[#009956] transition-all font-medium shadow-sm" 
							onClick={() => saveVehicle()}
						>
							
							Save
						</button>
					</div>
					</div>
				</div>
			)}

		{assignTagsOpen && (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
				<div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
					{/* Modal Header */}
					<div className="bg-[#00B56C] px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								
								<div>
									<h2 className="text-xl font-bold text-white">Assign Tags</h2>
									
								</div>
							</div>
							<button 
								onClick={() => { setAssignTagsOpen(false); setAssignTags([]); }} 
								className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
							>
								<FiX className="text-xl" />
							</button>
						</div>
					</div>

					{/* Modal Body */}
					<div className="p-6 h-[25vh]">
						<label className="text-sm">
							<span className="flex items-center gap-2 mb-3 font-medium text-gray-700">
								
								Select Tags
							</span>
							<Select
								isMulti
								value={(assignTags || []).map((t) => ({ value: t, label: toSentenceCase(String(t)) }))}
								onChange={(opts) => setAssignTags((opts || []).map((o: any) => String(o.value).toLowerCase()))}
								options={Array.from(new Set(bulkTags)).map((t) => ({ value: String(t).toLowerCase(), label: toSentenceCase(String(t)) }))}
								classNamePrefix="react-select"
								placeholder="Select tags to assign..."
								styles={{
									control: (provided, state) => ({
										...provided,
										border: "#00B56C 2px solid",
										borderRadius: "0.5rem",
										padding: "0.25rem",
										boxShadow: "none",
										"&:hover": {
											border: "#00B56C 2px solid",
										},
									}),
									option: (provided, state) => ({
										...provided,
										backgroundColor: state.isSelected
											? "#00B56C"
											: state.isFocused
											? "#e1f0e3"
											: "transparent",
										color: state.isSelected
											? "white"
											: state.isFocused
											? "black"
											: "black",
										"&:hover": {
											backgroundColor: "#e1f0e3",
											color: "black",
										},
									}),
									multiValue: (provided) => ({
										...provided,
										backgroundColor: "#e1f0e3",
									}),
									multiValueLabel: (provided) => ({
										...provided,
										color: "#00B56C",
										fontWeight: "500",
									}),
									multiValueRemove: (provided) => ({
										...provided,
										color: "#00B56C",
										"&:hover": {
											backgroundColor: "#00B56C",
											color: "white",
										},
									}),
									  menuList: (provided) => ({
            ...provided,
            maxHeight: bulkTags && bulkTags.length > 3 ? '110px' : 'auto',
            overflowY: bulkTags && bulkTags.length > 3 ? 'auto' : 'visible',
        }),
								}}
							/>
						</label>

						{/* Summary Card */}
						<div className="mt-4 p-4 bg-gradient-to-r to-opacity-5 rounded-lg border-2 border-[#00B56C] border-opacity-20">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									
									<div>
										<p className="text-sm text-gray-600">Tags to Assign</p>
										<p className="text-2xl font-bold text-[#00B56C]">
											{assignTags.length}
										</p>
									</div>
								</div>
								{assignTags.length > 0 && (
									<div className="text-right">
										<p className="text-xs text-gray-500">To {selected.length} vehicle(s)</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Modal Footer */}
					<div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
						
						<button 
							className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00B56C] text-white hover:bg-[#009956] transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
							onClick={doAssignTags} 
							disabled={assignTags.length === 0}
						>
							
							Assign Tags
						</button>
					</div>
				</div>
			</div>
		)}

		{/* Add Tag Modal */}
		{addTagModalOpen && (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
				<div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
					{/* Modal Header */}
					<div className="bg-[#00B56C] px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								
								<div>
									<h2 className="text-xl font-bold text-white">Add New Tag</h2>
								
								</div>
							</div>
							<button 
								onClick={() => { setAddTagModalOpen(false); setTagInput(""); }} 
								className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
							>
								<FiX className="text-xl" />
							</button>
						</div>
					</div>

					{/* Modal Body */}
					<div className="p-6">
						<label className="text-sm">
							<span className="flex items-center gap-2 mb-3 font-medium text-gray-700">
								
								Tag Name
							</span>
							<input
								type="text"
								className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
								placeholder="Enter tag name..."
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter' && tagInput.trim()) {
										addBulkTag();
										setAddTagModalOpen(false);
									}
								}}
							/>
						</label>
					</div>

					{/* Modal Footer */}
					<div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
						
						<button 
							className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00B56C] text-white hover:bg-[#009956] transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
							onClick={() => {
								addBulkTag();
								setAddTagModalOpen(false);
							}} 
							disabled={!tagInput.trim()}
						>
							
							Save Tag
						</button>
					</div>
				</div>
			</div>
		)}
		</div>
		</>
	);
} 