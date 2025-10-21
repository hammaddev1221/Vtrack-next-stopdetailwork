"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  GetUsersByClientId,
  createUser,
  updateUser,
  deleteUser,
  assignVehiclesToUser,
  getUserVehicles,
  vehicleListByClientId,
  Gettag
} from "@/utils/API_CALLS";
import Select from "react-select";
import { useRouter } from "next/navigation";
/* import { 
  FiEdit2, 
  FiTrash2, 
  FiUserPlus, 
  FiSearch, 
  FiX,
  FiSave,
  FiTruck,
  FiUser,
  FiMail,
  FiPhone,
  FiLock
} from "react-icons/fi"; */
import { HiOutlineUserGroup } from "react-icons/hi";
import { Toaster, toast } from "react-hot-toast";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";

interface User {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  contactNo?: string;
  userName: string;
  password: any;
  AssignedNoOfVehicles?: number;
}

interface VehicleRow {
  id?: string;
  vehicleReg: string;
  vehicleMake?: string;
  vehicleModel?: string;
  tags?: string[];
}

export default function UserManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allVehicles, setAllVehicles] = useState<VehicleRow[]>([]);
  const [allVehiclesData, setAllVehiclesData] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignVehiclesOpen, setAssignVehiclesOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [vehicleSearchInput, setVehicleSearchInput] = useState("");
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredVehicleList, setFilteredVehicleList] = useState<VehicleRow[]>([]);
  const [newUser, setNewUser] = useState<User>({
    firstName: "",
    lastName: "",
    emailAddress: "",
    contactNo: "",
    userName: "",
    password: "",
    AssignedNoOfVehicles: 0,
  });

  const loadUsers = async () => {
    if (!session) return;
    try {
      const response: any = await GetUsersByClientId({
        clientId: session.clientId as string,
      });
      const validData = response.filter((i: any) => !i.IsDeleted && i.userRole!="Admin");
      setAllUsers(validData);
    } catch (error) {
      console.error("Error loading users", error);
    }
  };

  const loadVehicles = async () => {
    if (!session) return;
    const res: any = await vehicleListByClientId({
      token: session!.accessToken as string,
      clientId: session!.clientId as string,
    });

    const rows = (res?.data || res || []).map((v: any) => ({
      id: v.id || v._id || v.vehicleId,
      vehicleReg: v.Label1,
      vehicleMake: v.vehicleMake,
      vehicleModel: v.vehicleModel,
      tags: v.tags || [],
    })) as VehicleRow[];
    setAllVehicles(rows);
    setAllVehiclesData(res?.data)
  };

  const getTags = async () => {
    if (!session) return;
    try {
      const tagres: any = await Gettag({ token: session!.accessToken as string });
      setBulkTags(tagres.data.map((i: any) => i.tag));
    } catch (error) {
      console.error("Error loading tags", error);
    }
  };

  const toSentenceCase = (s: string) => {
    if (!s) return s;
    const lower = s.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  useEffect(() => {
    loadUsers();
    loadVehicles();
    getTags();
  }, [session]);

  const filtered = useMemo(() => {
    if (!query) return allUsers;
    const q = query.toLowerCase();
    return allUsers.filter((u) =>
      [u.firstName, u.lastName, u.emailAddress, u.contactNo]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [allUsers, query]);

  const handleAddUser = async () => {
    if (!session || !newUser.firstName || !newUser.lastName || !newUser.emailAddress || !newUser.userName || !newUser.password) {
      // alert("Please fill all required fields");
      handleErrorPopup("Please fill all required fields")

      return;
    }

    try {
      await createUser({
        token: session.accessToken as string,
        payload: {
          ...newUser,

          userRole: "Controller",
          id: "",
          userLanguage: "english",
          portalType: "Portal",

          defaultView: true,
          clientId: session.clientId,
        },
      });

      setNewUser({
        firstName: "",
        lastName: "",
        emailAddress: "",
        contactNo: "",
        userName: "",
        password: "",
        AssignedNoOfVehicles: 0,
      });
      setAddUserOpen(false);
      handleSuccessPopup("User Saved Successfully")
      loadUsers();
    } catch (error) {
      console.error("Error adding user", error);
      handleErrorPopup("Failed to add user")
      //alert("Failed to add user");
    }
  };

  const handleUpdateUser = async () => {
    if (!session || !selectedUser?.id && !selectedUser?._id) return;

    try {
      await updateUser({
        token: session.accessToken as string,
        payload: {
          ...selectedUser,
          id: selectedUser.id || selectedUser._id,
        },
      });

      setEditUserOpen(false);
      setSelectedUser(null);
      handleSuccessPopup("User Update Successfully")
      loadUsers();
    } catch (error) {
      console.error("Error updating user", error);
      handleErrorPopup("Failed to add user")
      // alert("Failed to update user");
    }
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!session || !userToDelete) return;

    try {
      await deleteUser({
        token: session.accessToken as string,

        //id: userToDelete.id || userToDelete._id || "",
        payload: {
          ...selectedUser,
          id: userToDelete.id || userToDelete._id || "",
        },
      });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user", error);
      alert("Failed to delete user");
    }
  };

  const openAssignVehicles = async (user: User) => {
    setSelectedUser(user);
    // console.log("user",user);
    // console.log("allVehicles",allVehiclesData);
    // setSelectedVehicles(user.AssignedNoOfVehicles || 0);
    setAssignVehiclesOpen(true);
    setSelectedTags([]);
    setVehicleSearchInput("");

    const matchedVehicleIds = allVehiclesData
      .filter(vehicle =>
        vehicle.userId?.some(
          (u: any) =>
            u.id === user._id || u._id === user._id || u.id === user.id
        )
      )
      .map(vehicle => vehicle.id);

    // console.log("matchedVehicleIds", matchedVehicleIds);
    setSelectedVehicles(matchedVehicleIds);
  };

  const handleAssignVehicles = async () => {
    if (!session || !selectedUser) return;

    const remainingVehicleIds = allVehicles
      .filter(vehicle => vehicle.id)
      .map(vehicle => vehicle.id!)
      .filter(id => !selectedVehicles.includes(id));



    try {
      await assignVehiclesToUser({
        token: session.accessToken as string,
        payload: {
          userId: selectedUser.id || selectedUser._id,
          // vehicleIds: selectedVehicles,
          assignedVehicle: selectedVehicles,
          unassignedVehicle: remainingVehicleIds
          // clientId: session.clientId,
        },
      });

      setAssignVehiclesOpen(false);
      setSelectedUser(null);
      setSelectedVehicles([]);
      loadUsers();
    } catch (error) {
      console.error("Error assigning vehicles", error);
      alert("Failed to assign vehicles");
    }
  };




  // Initialize filteredVehicleList with all vehicles when modal opens
  useEffect(() => {
    if (assignVehiclesOpen) {
      setFilteredVehicleList(allVehicles);
    }
  }, [assignVehiclesOpen, allVehicles]);

  // Handle filtering when tags or search changes
  useEffect(() => {
    if (!assignVehiclesOpen) return;

    let filtered: VehicleRow[] = allVehicles;

    // Filter by selected tags (cumulative - vehicles must have ALL selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((v) =>
        selectedTags.every((selectedTag) =>
          (v.tags || []).some((tag: string) => tag.toLowerCase() === selectedTag)
        )
      );
    }

    // Apply search filter
    if (vehicleSearchInput.trim()) {
      const search = vehicleSearchInput.toLowerCase();
      filtered = filtered.filter((v) => {
        return (
          v.vehicleReg.toLowerCase().includes(search) ||
          (v.vehicleMake || "").toLowerCase().includes(search) ||
          (v.vehicleModel || "").toLowerCase().includes(search)
        );
      });
    }

    setFilteredVehicleList(filtered);
  }, [selectedTags, vehicleSearchInput, allVehicles, assignVehiclesOpen]);

  const toggleVehicleSelection = (vehicleId: string | undefined) => {
    if (!vehicleId) return;
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const toggleSelectAll = () => {
    const allFilteredIds = filteredVehicleList.map((v) => v.id).filter((id): id is string => Boolean(id));
    const allSelected = allFilteredIds.every((id) => selectedVehicles.includes(id));

    if (allSelected) {
      // Deselect all filtered vehicles
      setSelectedVehicles((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered vehicles
      const newSelected = [...new Set([...selectedVehicles, ...allFilteredIds])];
      setSelectedVehicles(newSelected);
    }
  };



  const handleSuccessPopup = (msg: string) => {
    toast.success(msg, {
      position: "top-center",
      duration: 2000,
    });
  };
  const handleErrorPopup = (msg: string) => {
    toast.error(msg, {
      position: "top-center",
      duration: 2000,
    });
  };
  // console.log("as", selectedVehicles);
  // console.log("asas",allVehicles);

  return (
    <>
      <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
        Access Management
      </p>
      <div className="p-6 bg-gray-50 ">{/* h-screen overflow-hidden flex flex-col */}
        <div className="flex-shrink-0">
          {/* Header Section */}
          {/*  <div className="mb-6 mx-6">
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineUserGroup className="text-3xl text-[#00B56C]" />
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          </div>
          <p className="text-gray-600">Manage users and assign vehicles</p>
        </div> */}

          {/* Search and Action Bar */}
          <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
            <div className="flex items-center justify-between gap-4">

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



              <span className="mx-4 font-popins font-bold xl:text-xl text-green">Total Users: {allUsers.length} </span>
              <button
                onClick={() => setAddUserOpen(true)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px" fill="none" stroke="#ffffff" strokeWidth="2" className="w-5 h-5 inline-block mr-2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add New User
              </button>

            </div>

          </div>
        </div>

        {/* Users Table with Scroll */}
        <div className=" bg-white rounded-lg shadow-sm  h-[75vh]   flex flex-col  ">{/* flex-1 */}
          <div className=" overflow-y-auto">{/*overflow-auto flex-1 */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-popins text-left text-sm font-semibold text-gray-700  tracking-wider">
                    <div className="flex  items-center gap-2">

                      Name
                    </div>
                  </th>
                  <th className="px-6 py-4 font-popins text-left text-sm font-semibold text-gray-700  tracking-wider">
                    <div className="flex items-center gap-2">

                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 font-popins text-left text-sm font-semibold text-gray-700  tracking-wider">
                    <div className="flex items-center gap-2">

                      Phone
                    </div>
                  </th>
                  <th className="px-6 py-4 font-popins text-left text-sm font-semibold text-gray-700  tracking-wider">
                    <div className="flex items-center gap-2">

                      Vehicles
                    </div>
                  </th>
                  <th className="px-6 py-4 font-popins text-center text-sm font-semibold text-gray-700  tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((user, i) => (
                  <tr key={user.id || user._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">

                        <div className="ml-4">
                          <div className="text-sm font-popins  text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-popins text-gray-900">{user.emailAddress}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-popins text-gray-900">{user.contactNo || "-"}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#00B56C] bg-opacity-10 text-[#00B56C] text-lg font-bold">
                          {user.AssignedNoOfVehicles || 0}
                        </span>
                        <span className="text-sm font-popins text-gray-900">vehicle(s)</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-lg font-medium">
                      <div className="flex justify-center gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00B56C] bg-opacity-10 text-[#00B56C] hover:bg-opacity-20 transition-all font-medium"
                          onClick={() => openAssignVehicles(user)}
                          title="Assign Vehicles"
                        >

                          <span className="text-xs font-popins">Assign</span>
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00B56C] bg-opacity-10 text-[#00B56C] hover:bg-opacity-20 transition-all font-medium"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditUserOpen(true);
                          }}
                          title="Edit User"
                        >

                          <span className="text-xs font-popins">Edit</span>
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00B56C] bg-opacity-10 text-[#00B56C] hover:bg-opacity-20 transition-all font-medium"
                          onClick={() => openDeleteConfirm(user)}
                          title="Delete User"
                        >

                          <span className="text-xs font-popins">Delete</span>
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
              <HiOutlineUserGroup className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {addUserOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-green px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">

                    <div>
                      <h2 className="text-xl font-bold text-white">Add New User</h2>

                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAddUserOpen(false);
                      setNewUser({
                        firstName: "",
                        lastName: "",
                        emailAddress: "",
                        contactNo: "",
                        userName: "",
                        password: "",
                        AssignedNoOfVehicles: 0,
                      });
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      First Name
                    </span>
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
                      value={newUser.firstName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, firstName: e.target.value })
                      }
                      placeholder="Enter first name"
                    />
                  </label>
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Last Name
                    </span>
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
                      value={newUser.lastName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, lastName: e.target.value })
                      }
                      placeholder="Enter last name"
                    />
                  </label>
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Email
                    </span>
                    <input
                      type="email"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
                      value={newUser.emailAddress}
                      onChange={(e) =>
                        setNewUser({ ...newUser, emailAddress: e.target.value })
                      }
                      placeholder="user@example.com"
                    />
                  </label>
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Phone
                    </span>
                    <input
                      type="tel"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
                      value={newUser.contactNo}
                      onChange={(e) =>
                        setNewUser({ ...newUser, contactNo: e.target.value })
                      }
                      placeholder="+1234567890"
                    />
                  </label>

                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      UserName
                    </span>
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
                      value={newUser.userName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, userName: e.target.value })
                      }
                      placeholder="Enter UserName"
                    />
                  </label>
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Password
                    </span>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Enter User Password"
                    />
                  </label>


                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">

                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00B56C] text-white hover:bg-[#009956] transition-all font-medium font-popins shadow-sm"
                  onClick={handleAddUser}
                >

                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editUserOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-green px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">

                    <div>
                      <h2 className="text-xl font-bold text-white">Edit User</h2>

                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditUserOpen(false);
                      setSelectedUser(null);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      First Name
                    </span>
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedUser.firstName}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, firstName: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Last Name
                    </span>
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedUser.lastName}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, lastName: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm col-span-1">

                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Email
                    </span>
                    <input
                      type="email"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedUser.emailAddress}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, emailAddress: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Phone
                    </span>
                    <input
                      type="tel"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedUser.contactNo || ""}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, contactNo: e.target.value })
                      }
                    />
                  </label>

                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      UserName
                    </span>
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedUser.userName}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, userName: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm col-span-1">
                    <span className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                      <span className="text-black">*</span>
                      Password
                    </span>
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedUser.password}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, password: e.target.value })
                      }
                    />
                  </label>


                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">

                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green text-white hover:bg-green transition-all font-medium shadow-sm"
                  onClick={handleUpdateUser}
                >

                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Vehicles Modal */}
        {assignVehiclesOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-green px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">

                    <div>
                      <h2 className="text-xl font-bold text-white">Assign Vehicles</h2>
                      <p className="text-sm text-white text-opacity-90 mt-1">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAssignVehiclesOpen(false);
                      setSelectedUser(null);
                      setSelectedVehicles([]);
                      setSelectedTags([]);
                      setVehicleSearchInput("");
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4">
                  {/* Tag Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Filter by Tags
                    </label>
                    <Select
                      isMulti
                      value={(selectedTags || []).map((t) => ({
                        value: t,
                        label: toSentenceCase(String(t)),
                      }))}
                      onChange={(opts) => {
                        setSelectedTags(opts.map((o: any) => o.value));
                      }}
                      options={Array.from(new Set(bulkTags)).map((t) => ({
                        value: t.toLowerCase(),
                        label: toSentenceCase(t),
                      }))}
                      classNamePrefix="react-select"
                      placeholder="Select tags to filter vehicles..."
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          border: "#00B56C 2px solid",
                          borderRadius: "0.5rem",
                          boxShadow: "none",
                          "&:hover": {
                            border: "#00B56C 2px solid",
                          },
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
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
                      }}
                    />
                  </div>

                  {/* Search Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Search Vehicles
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by registration, make, or model..."
                        value={vehicleSearchInput}
                        onChange={(e) => setVehicleSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-[#00B56C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B56C] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Select All Checkbox */}
                  {filteredVehicleList.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filteredVehicleList.every((v) => v.id && selectedVehicles.includes(v.id))}
                          onChange={toggleSelectAll}
                          className="w-5 h-5 text-[#00B56C] border-gray-300 rounded focus:ring-[#00B56C] cursor-pointer"
                        />
                        <span className="font-medium text-gray-700">
                          Select All ({filteredVehicleList.length} vehicle{filteredVehicleList.length !== 1 ? 's' : ''})
                        </span>
                      </label>
                      <span className="text-sm text-gray-500">
                        {selectedVehicles.length} selected
                      </span>
                    </div>
                  )}
                </div>

                {/* Vehicle List */}
                <div className="overflow-y-auto px-6 pb-4 max-h-[280px]">
                  {filteredVehicleList.length > 0 ? (
                    <div className="space-y-2">
                      {filteredVehicleList.filter(v => v.id).map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${vehicle.id && selectedVehicles.includes(vehicle.id)
                              ? 'border-[#00B56C] bg-[#00B56C] bg-opacity-5'
                              : 'border-gray-200 hover:border-[#00B56C] hover:bg-gray-50'
                            }`}
                          onClick={() => toggleVehicleSelection(vehicle.id)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={vehicle.id ? selectedVehicles.includes(vehicle.id) : false}
                              onChange={() => toggleVehicleSelection(vehicle.id)}
                              className="w-5 h-5 mt-0.5 text-[#00B56C] border-gray-300 rounded focus:ring-[#00B56C] cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-gray-900">
                                  {vehicle.vehicleReg}
                                </span>
                                {vehicle.tags && vehicle.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {vehicle.tags.map((tag: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-[#00B56C] bg-opacity-10 text-[#00B56C] border border-[#00B56C] border-opacity-20"
                                      >
                                        {toSentenceCase(tag)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {(vehicle.vehicleMake || vehicle.vehicleModel) && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {[vehicle.vehicleMake, vehicle.vehicleModel].filter(Boolean).join(' ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">No vehicles found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Try adjusting your search or tag filters
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Selected Vehicles</p>
                    <p className="text-2xl font-bold text-[#00B56C]">
                      {selectedVehicles.length}
                    </p>
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00B56C] text-white hover:bg-[#009956] transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAssignVehicles}
                >
                  Assign Vehicle{selectedVehicles.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-green px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">

                    <div>
                      <h2 className="text-xl font-bold text-white">Delete User</h2>

                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 text-base">
                  Are you sure you want to delete user{" "}
                  <strong className="text-gray-900">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </strong>
                  ?
                </p>

              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">

                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green text-white hover:bg-green transition-all font-medium shadow-sm"
                  onClick={handleDeleteUser}
                >

                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}


