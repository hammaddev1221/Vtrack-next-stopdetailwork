'use client';

import { getBooking, GetDriverDataByClientId, updateBooking } from "@/utils/API_CALLS";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Table, Button, Tooltip, Image, Tag, Input, Pagination  } from 'antd';
import Select from "react-select";
import { SearchOutlined } from "@ant-design/icons";
import "./index.css";

interface ModalProps {
  title: string;
  color: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

const Modal: React.FC<ModalProps> = ({ title, color, onClose, children, footer, width = "w-[400px]" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center !z-[9999]">
    <div className={`bg-white rounded-lg shadow-xl ${width}`}>
      <div className={`flex items-center justify-between ${color} px-4 py-2 rounded-t-lg`}>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="text-white hover:text-gray-200">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="p-6">{children}</div>
      {footer && <div className="flex justify-center my-4">{footer}</div>}
    </div>
  </div>
);

export default function Dispatch() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [driverOptions, setDriverOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const pageSize = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = selectedBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    getBookings();
  }, []);

  const getdriverData = async () => {
    const response = await GetDriverDataByClientId({
      token: session?.accessToken,
      clientId: session?.clientId,
    });
    let drivers = response
      .filter((item: any) => item.isDeleted === false)
      .sort((a: any, b: any) =>
        a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1
      );

    setDriverOptions(
      drivers.map((i) => ({
        label: `${i.driverfirstName || ""} ${i.driverMiddleName || ""} ${i.driverLastName || ""}`.trim(),
        value: i._id,
      }))
    );
  };

  useEffect(() => {
    getdriverData();
  }, []);

  function getBookings() {
    const today = moment()
      .tz(session?.timezone)
      .clone()
      .startOf("day")
      .format("YYYY-MM-DD");
    
    getBooking({
      token: session?.accessToken,
      query: { clientId: session?.clientId },
    }).then((resp: any) => {
      if (resp?.success) {
        setRawBookings(resp.data);
        const pendingBookings = resp.data.filter((i: any) => {
          return i.status.toString() === "Pending" && i.driverId == null && i.driverId == undefined;
        });
        setBookings(pendingBookings);
        setFilteredBookings(pendingBookings);
      }
    });
  }

  // Search functionality
  const handleSearch = (value: string) => {
    setSearchText(value);
    
    if (!value.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = bookings.filter(booking => 
      // Search across multiple fields
      (booking.pickup?.toLowerCase() || '').includes(searchTerm) ||
      (booking.destination?.toLowerCase() || '').includes(searchTerm) ||
      (booking.vehicleReg?.toLowerCase() || '').includes(searchTerm) ||
      (booking.driver?.toLowerCase() || '').includes(searchTerm) ||
      (booking.name?.toLowerCase() || '').includes(searchTerm) ||
      (booking.contact?.toLowerCase() || '').includes(searchTerm) ||
      (booking.email?.toLowerCase() || '').includes(searchTerm) ||
      (booking.description?.toLowerCase() || '').includes(searchTerm) ||
      (booking.datetime?.toLowerCase() || '').includes(searchTerm) ||
      (booking.status?.toLowerCase() || '').includes(searchTerm)
    );
    
    setFilteredBookings(filtered);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchText('');
    setFilteredBookings(bookings);
  };

  // Handle row selection
  const onSelectChange = (newSelectedRowKeys: any[], selectedRows: any[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedBookings(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if (selected) {
        setSelectedRowKeys(selectedRows.map(row => row._id));
        setSelectedBookings(selectedRows);
      } else {
        setSelectedRowKeys([]);
        setSelectedBookings([]);
      }
    },
  };

  const handleAllocated = async () => {
    if (!selectedDriver || selectedBookings.length === 0) {
      return;
    }

    setLoading(true);
    const dispatchId = Math.floor(100000 + Math.random() * 900000);

    try {
      const updatePromises = selectedBookings.map((booking) => 
        updateBooking({
          token: session?.accessToken,
          payload: { 
            id: booking._id, 
            driverId: selectedDriver.value,
            status: "allocated",
            dispatchIds: dispatchId
          },
        })
      );

      await Promise.all(updatePromises);
      getBookings();
      setSelectedDriver(null);
      setSelectedRowKeys([]);
      setSelectedBookings([]);
    } catch (error) {
      console.error('Error allocating bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!selectedDriver || selectedBookings.length === 0) {
      return;
    }

    setLoading(true);
    const dispatchId = Math.floor(100000 + Math.random() * 900000);

    try {
      const updatePromises = selectedBookings.map((booking) => 
        updateBooking({
          token: session?.accessToken,
          payload: { 
            id: booking._id, 
            driverId: selectedDriver.value,
            status: "pendingStart",
            dispatchIds: dispatchId
          },
        })
      );

      await Promise.all(updatePromises);
      getBookings();
      setSelectedDriver(null);
      setSelectedRowKeys([]);
      setSelectedBookings([]);
    } catch (error) {
      console.error('Error dispatching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Responsive columns configuration
  const columns = [
    {
      title: "Pickup",
      dataIndex: "pickup",
      key: "pickup",
      width: 120,
      ellipsis: true,
      responsive: ['md'],
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
      width: 120,
      ellipsis: true,
      responsive: ['md'],
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleReg",
      key: "vehicleReg",
      width: 80,
      ellipsis: true,
      responsive: ['sm'],
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Driver",
      dataIndex: "driver",
      key: "driver",
      width: 80,
      ellipsis: true,
      responsive: ['sm'],
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 80,
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      width: 100,
      ellipsis: true,
      responsive: ['lg'],
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 120,
      ellipsis: true,
      responsive: ['lg'],
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Notes",
      dataIndex: "description",
      key: "description",
      width: 120,
      ellipsis: true,
      responsive: ['xl'],
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span className="text-sm">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Date Time",
      dataIndex: "datetime",
      key: "datetime",
      width: 120,
      responsive: ['md'],
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: any, record: any) => {
        let color;
        switch (status) {
         
          case "Pending":
            color = "processing";
            break;
          default:
            color = "default";
        }

        if (status === "Complete" && record.image) {
          return (
            <Tooltip
              placement="topLeft"
              title={
                <div className="flex flex-col items-center">
                  <span>{status}</span>
                  <Image
                    src={record.image}
                    alt="status"
                    className="mt-2 rounded-md"
                    width={120}
                  />
                </div>
              }
            >
              <Tag color={color} className="text-xs">{status.toUpperCase()}</Tag>
            </Tooltip>
          );
        }

        return <Tag color={color} className="text-xs">{status.toUpperCase()}</Tag>;
      },
    },
  ];

  // const handleDispatch = () => {
  //   setDispatchModal(true);
  // };

  

  return (
    <div className=" bg-gray-50 ">
      <p className="bg-green px-4 py-1 border-t text-center text-2xl text-white font-bold journey_heading">
        Dispatch Bookings
      </p>

      {/* Main Content */}
      <div className="  px-1 md:px-5 md:py-5 max-w-full">
        {/* Main Table with Search Bar in Border */}
        <div className="bg-white rounded-lg border border-black shadow-lg mb-5 overflow-hidden">
          {/* Search Bar Section - Inside the border */}
          <div className="bg-gray-50 px-4 py-3 border-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Input
                  placeholder="Search bookings..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  className="hover:border-[#00B56C] focus:border-[#00B56C] w-full sm:w-auto min-w-[200px]"
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                  onPressEnter={() => handleSearch(searchText)}
                  size="middle"
                />
                <div className="flex items-center gap-2 text-sm">
                  {searchText ? (
                    <span className="text-gray-600">
                      Showing {filteredBookings.length} of {bookings.length} records
                    </span>
                  ) : (
                    <span className="text-gray-600">
                      Total Bookings: {bookings.length}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <Button
                  onClick={() => {
                    const allKeys = filteredBookings.map(booking => booking._id);
                    setSelectedRowKeys(allKeys);
                    setSelectedBookings(filteredBookings);
                  }}
                  disabled={filteredBookings.length === 0}
                  className="bg-[#00B56C] text-white hover:!border-[#00B56C] text-xs font-medium sm:text-sm"
                  style={{ borderColor: '#00B56C', height: '40px',
                      minWidth: '100px',
                      padding: '0 20px' }}
                  onMouseEnter={(e) => {
                    if (filteredBookings.length > 0) {
                      e.currentTarget.style.color = 'black';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filteredBookings.length > 0) {
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  size="middle"
                >
                  Select All
                </Button>
                <Button 
                    onClick={() => {
                      setSelectedRowKeys([]);
                      setSelectedBookings([]);
                      setSelectedDriver(null);
                    }}
                    className="bg-[#00B56C] text-white hover:!border-[#00B56C] text-xs font-medium sm:text-sm ml-4"
                    style={{ borderColor: '#00B56C', height: '40px',
                      minWidth: '100px',
                      }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'black';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'white';
                    }}
                    size="middle"
                  >
                    Clear Selection
                  </Button>
              </div>
            
            </div>
          </div>

          {/* Table Section */}
          <div className="p-0" style={{ minHeight: '300px' }}>
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={filteredBookings}
              pagination={{ 
                pageSize: 4,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) => 
                  `Showing ${range[0]}-${range[1]} of ${total} items${searchText ? ' (filtered)' : ''}`,
                size: "default",
                responsive: true,
                position: ['bottomCenter'],
                 className: "custom-pagination"
              }}
              rowSelection={rowSelection}
              scroll={{ x: 800 }}
              style={{ 
                border: 'none',
                minHeight: '300px'
                
              }}
              className="custom-table"
              size="middle"
              rowClassName={(_, index) =>
                index % 2 === 1 ? "bg-gray-50" : "bg-white"
              }
              locale={{
                emptyText: searchText ? 'No bookings match your search' : 'No bookings available'
              }}
            />
          </div>
        </div>

        {/* Selected Bookings Table */}
        {selectedBookings.length > 0 && (
          <div className="bg-white rounded-lg border border-black shadow-lg overflow-hidden">
            {/* <div className="bg-gray-50 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-800 m-0">
                Selected Bookings ({selectedBookings.length})
              </h3>
            </div> */}
            
            {/* Action Buttons Section */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Left side: Driver Select and Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <div className="w-full sm:w-64">
                    <Select
                      onChange={(e) => setSelectedDriver(e)}
                      value={selectedDriver}
                      options={driverOptions}
                      placeholder="Select driver"
                      isClearable
                      isSearchable
                      noOptionsMessage={() => "No options available"}
                      className="text-sm"
                      maxMenuHeight={driverOptions.length > 5 ? 200 : undefined}
                      styles={{
                        control: (provided) => ({ 
                          ...provided, 
                          minHeight: "36px",
                          fontSize: "14px"
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#00B56C"
                            : state.isFocused
                              ? "#e1f0e3"
                              : "transparent",
                          color: state.isSelected ? "white" : "black",
                          fontSize: "14px",
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          maxHeight: driverOptions.length > 5 ? '200px' : 'auto',
                          overflowY: driverOptions.length > 5 ? 'auto' : 'visible',
                        }),
                      }}
                    />
                  </div>
                  
                  {/* <Button
                    onClick={handleAllocated}
                    disabled={!selectedDriver || loading}
                    className="bg-[#00B56C] text-white hover:!border-[#00B56C] py-2 text-sm sm:text-sm"
                    style={{ borderColor: '#00B56C' }}
                    onMouseEnter={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'black';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    size="middle"
                  >
                    Allocated
                  </Button>

                  <Button
                    onClick={handleDispatch}
                    disabled={!selectedDriver || loading}
                    className="bg-[#00B56C] text-white hover:!border-[#00B56C] text-xs sm:text-sm"
                    style={{ borderColor: '#00B56C' }}
                    onMouseEnter={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'black';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    size="middle"
                  >
                    Dispatch
                  </Button> */}
                  
   <Button
                    onClick={handleAllocated}
                    disabled={!selectedDriver || loading}
                    className="bg-[#00B56C] text-white hover:!border-[#00B56C] text-sm font-medium"
                    style={{ 
                      borderColor: '#00B56C',
                      height: '40px',
                      minWidth: '100px',
                      padding: '0 20px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'black';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    Allocated
                  </Button>

                  <Button
                    onClick={handleDispatch}
                    disabled={!selectedDriver || loading}
                    className="bg-[#00B56C] text-white hover:!border-[#00B56C] text-sm font-medium"
                    style={{ 
                      borderColor: '#00B56C',
                      height: '40px',
                      minWidth: '100px',
                      padding: '0 20px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'black';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDriver && !loading) {
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    Allocated & Dispatch
                  </Button>
                </div>

                {/* Right side: Clear Selection Button */}
                <div className="bg-gray-50 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-800 m-0">
                Selected Bookings ({selectedBookings.length})
              </h3>
            </div>
               {/*  <div>
                  <Button 
                    onClick={() => {
                      setSelectedRowKeys([]);
                      setSelectedBookings([]);
                      setSelectedDriver(null);
                    }}
                    className="bg-[#00B56C] text-white hover:!border-[#00B56C] text-xs font-medium sm:text-sm"
                    style={{ borderColor: '#00B56C', height: '40px',
                      minWidth: '100px',
                      padding: '0 20px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'black';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'white';
                    }}
                    size="middle"
                  >
                    Clear Selection
                  </Button>

                  
                </div> */}
              </div>
            </div>

             <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "300px",
        height: "100%", // or fixed like '400px'
        justifyContent: "space-between",
        padding: "0",
      }}
    >
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={paginatedData}
        pagination={false} // disable built-in pagination
        scroll={{ x: 800 }}
        style={{
          border: "none",
        }}
        className="custom-table"
        size="middle"
        rowClassName={(_, index) =>
          index % 2 === 1 ? "bg-gray-50" : "bg-white"
        }
      />

      {/* Manual pagination */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px", marginBottom:"16px" }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={selectedBookings.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          showQuickJumper={false}
          showTotal={(total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} items`
          }
        />
      </div>
    </div>
          </div>
        )}
      </div>

    </div>
  );
}
