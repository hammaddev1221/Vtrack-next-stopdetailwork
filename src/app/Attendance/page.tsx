'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
// import { jsPDF } from 'jspdf';
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";

// import 'jspdf-autotable';

// Mock data - replace with actual API calls
const mockEmployees = [
  {
    id: 1,
    employeeNo: 'EMP001',
    employeeCode: 'E001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    contact: '+1-555-0101'
  },
  {
    id: 2,
    employeeNo: 'EMP002',
    employeeCode: 'E002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    contact: '+1-555-0102'
  },
  {
    id: 3,
    employeeNo: 'EMP003',
    employeeCode: 'E003',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    contact: '+1-555-0103'
  }
];

// Mock attendance data
const mockAttendanceData = [
  { id: 1, employeeId: 1, date: '2025-09-15', status: 'Present', checkIn: '09:00', checkOut: '17:00' },
  { id: 2, employeeId: 2, date: '2025-09-15', status: 'Present', checkIn: '08:55', checkOut: '17:05' },
  { id: 3, employeeId: 3, date: '2025-09-15', status: 'Absent', checkIn: '-', checkOut: '-' },
  { id: 4, employeeId: 1, date: '2025-09-16', status: 'Present', checkIn: '09:10', checkOut: '17:15' },
  { id: 5, employeeId: 2, date: '2025-09-16', status: 'Late', checkIn: '10:30', checkOut: '18:00' },
  { id: 6, employeeId: 3, date: '2025-09-16', status: 'Present', checkIn: '08:45', checkOut: '16:55' },
  { id: 7, employeeId: 1, date: '2025-09-17', status: 'Present', checkIn: '09:05', checkOut: '17:10' },
  { id: 8, employeeId: 2, date: '2025-09-17', status: 'Half Day', checkIn: '09:00', checkOut: '13:00' },
  { id: 9, employeeId: 3, date: '2025-09-17', status: 'Present', checkIn: '08:50', checkOut: '17:05' },
];

export default function EmployeesPage() {

  const { data: session } = useSession();
	const router = useRouter()
	 if (!session?.featureAttendance) {
	    router.push("/liveTracking");
	}
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeNo: '',
    employeeCode: '',
    name: '',
    email: '',
    contact: ''
  });

  useEffect(() => {
    // In real application, fetch from API
    setEmployees(mockEmployees);
    setAttendanceData(mockAttendanceData);
    setFilteredAttendance(mockAttendanceData);
  }, []);

  useEffect(() => {
    filterAttendanceData();
  }, [filter, selectedEmployee, selectedDate, startDate, endDate, attendanceData]);

  const filterAttendanceData = () => {
    let filtered = [...attendanceData];

    if (filter === 'employee' && selectedEmployee) {
      filtered = filtered.filter(record => record.employeeId === parseInt(selectedEmployee));
    } else if (filter === 'date' && selectedDate) {
      filtered = filtered.filter(record => record.date === selectedDate);
    } else if (filter === 'range' && startDate && endDate) {
      filtered = filtered.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    }

    setFilteredAttendance(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEmployee = {
      id: employees.length + 1,
      ...formData
    };
    setEmployees(prev => [...prev, newEmployee]);
    setShowAddForm(false);
    setFormData({
      employeeNo: '',
      employeeCode: '',
      name: '',
      email: '',
      contact: ''
    });
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const getEmployeeCode = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.employeeCode : 'Unknown';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Attendance Report', 14, 22);
    
    // Filter information
    doc.setFontSize(10);
    let filterInfo = 'Filter: All Employees';
    if (filter === 'employee' && selectedEmployee) {
      const employee = employees.find(emp => emp.id === parseInt(selectedEmployee));
      filterInfo = `Filter: Employee - ${employee ? employee.name : selectedEmployee}`;
    } else if (filter === 'date' && selectedDate) {
      filterInfo = `Filter: Date - ${selectedDate}`;
    } else if (filter === 'range' && startDate && endDate) {
      filterInfo = `Filter: Date Range - ${startDate} to ${endDate}`;
    }
    doc.text(filterInfo, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

    // Table data
    const tableColumn = ["Date", "Employee Code", "Name", "Status", "Check In", "Check Out"];
    const tableRows = filteredAttendance.map(record => [
      record.date,
      getEmployeeCode(record.employeeId),
      getEmployeeName(record.employeeId),
      record.status,
      record.checkIn,
      record.checkOut
    ]);

    // Add table
    autoTable(doc,{
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 135, 245] }
    });

    // Summary
    const summaryY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Summary', 14, summaryY);
    
    const presentCount = filteredAttendance.filter(r => r.status === 'Present').length;
    const absentCount = filteredAttendance.filter(r => r.status === 'Absent').length;
    const lateCount = filteredAttendance.filter(r => r.status === 'Late').length;
    const halfDayCount = filteredAttendance.filter(r => r.status === 'Half Day').length;

    doc.setFontSize(10);
    doc.text(`Total Records: ${filteredAttendance.length}`, 14, summaryY + 8);
    doc.text(`Present: ${presentCount}`, 14, summaryY + 16);
    doc.text(`Absent: ${absentCount}`, 60, summaryY + 16);
    doc.text(`Late: ${lateCount}`, 14, summaryY + 24);
    doc.text(`Half Day: ${halfDayCount}`, 60, summaryY + 24);

    // Save the PDF
    doc.save(`attendance-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const resetFilters = () => {
    setFilter('all');
    setSelectedEmployee('');
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Employees Management</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employees Management</h1>
          <p className="text-gray-600 mt-2">Manage your team members and their attendance</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green text-white px-6 py-2 rounded-lg hover:bg-green transition-colors"
            >
              Add Employee
            </button>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Employee Attendance Sheet
            </button>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employeeNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.employeeCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.contact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Report Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Attendance Report</h2>
            <p className="text-gray-600 text-sm">Filtered attendance data preview</p>
          </div>
          
          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter By</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Employees</option>
                  <option value="employee">Employee Name</option>
                  <option value="date">Specific Date</option>
                  <option value="range">Date Range</option>
                </select>
              </div>

              {filter === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select an employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {filter === 'date' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              {filter === 'range' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2 text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-green text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEmployeeCode(record.employeeId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEmployeeName(record.employeeId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                        record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOut}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>Present: {filteredAttendance.filter(r => r.status === 'Present').length}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span>Absent: {filteredAttendance.filter(r => r.status === 'Absent').length}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span>Late: {filteredAttendance.filter(r => r.status === 'Late').length}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span>Half Day: {filteredAttendance.filter(r => r.status === 'Half Day').length}</span>
              </div>
              <div className="flex items-center ml-auto">
                <span className="font-semibold">Total Records: {filteredAttendance.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Employee Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee No
                    </label>
                    <input
                      type="text"
                      name="employeeNo"
                      value={formData.employeeNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Code
                    </label>
                    <input
                      type="text"
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact
                    </label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green text-white rounded-md hover:bg-green"
                  >
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}