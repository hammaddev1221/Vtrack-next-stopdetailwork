import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';
const NotificationDropdown = ({ notifications, loading, toggleNotifications }) => {
  const  router = useRouter()

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  // Helper function to get colors based on event type
  const getEventStyle = (event) => {
    switch (event) {
      case 'ignitionOn':
        return {
          background: '#D1FAE5', // light green
          border: '#34D399', // dark green
          color: '#4CAF50', // green (text color for ignition on)
        };
      case 'ignitionOff':
        return {
          background: '#E0E7FF', // light blue-gray
          border: '#A5B4FC', // blue-gray border
          color: '#3B82F6', // blue (text color for ignition off)
        };
      case 'targetEnteredZone':
        return {
          background: '#E0F2FF', // light blue
          border: '#93C5FD', // blue
          color: '#2196F3', // blue (text color for entered zone)
        };
      case 'targetLeftZone':
        return {
          background: '#FFFBEB', // very light yellow
          border: '#FDE68A', // soft yellow
          color: '#D97706', // dark yellow-orange (text color for left zone)
        };
      case 'harshBreak':
        return {
          background: '#FFEBEE', // light pink
          border: '#FFCDD2', // pink
          color: '#FF5722', // orange-red (text color for harsh break)
        };
      case 'harshAcceleration':
        return {
          background: '#FFF7ED', // light orange
          border: '#FFCC80', // orange
          color: '#FF9800', // orange (text color for harsh acceleration)
        };
      case 'harshCornering':
        return {
          background: '#EDE7F6', // light purple
          border: '#D1C4E9', // purple
          color: '#673AB7', // deep purple (text color for harsh cornering)
        };
      case 'overSpeeding':
        return {
          background: '#FFEBEE', // light pink
          border: '#EF9A9A', // red
          color: '#F44336', // red (text color for overspeeding)
        };
      default:
        return {
          background: '#F9FAFB', // light gray (default)
          border: '#E5E7EB', // gray (default)
          color: '#6B7280', // gray (text color for default)
        };
    }
  };
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter((notification) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.event.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, notifications]);
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const getBorderColor = () => {
    if (searchQuery === '') {
      return '#3B82F6'; // Blue (Default color)
    }
    return filteredNotifications.length > 0 ? '#34D399' : '#FF0000';
  };
  useEffect(() => {
    const scrollContainer = document.querySelector('.notification-scroll-container');
    if (scrollContainer) {
      scrollContainer.style.scrollBehavior = 'smooth';
    }
  }, []);

  const handleTripHistoryClick = (notification) => {

    const dateObj = new Date(notification.dateTime);

    // Format the date as YYYY-MM-DD
    const formattedDate = dateObj.toISOString().slice(0, 10);
    const formattedDate2 = notification.dateTime.slice(12);

    router.push(`/Reports?vehicleReg=${notification.vehicleReg}&event=${notification.event}&dateTime=${formattedDate}&Time=${formattedDate2}`); // Navigate to Notifications page
    /*  router.push({
      pathname: '/Reports',
      query: { vehicleReg: notification.vehicleReg, event: notification.event,  dateTime: notification.dateTime },
    }); */

  };
  const handleNotificationClick = () => {
    router.push('/NotificationTab');  // Navigate to Notifications page
  };


  return (
    <div className="mt-4 absolute right-0 w-72 bg-white shadow-lg rounded-md px-2 py-2 z-10">
      <div className="flex justify-between items-center p-1 border-b">
        <span className="font-semibold text-[#1F2937] text-center">Notifications</span>
        <span className="text-xs text-[#1F2937] font-semibold bg-[#FFFFFF] px-2 py-2 rounded-full absolute top-2 right-2">
          Total ({filteredNotifications.length})
        </span>
      </div>
      <div className="py-2">
        <input
          type="text"
          placeholder="Search Notifications..."
          className="text-sm p-[0.3rem] border-[2.8px] rounded-md w-full focus:outline-none"
          style={{
            borderColor: getBorderColor(),
          }}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="notification-scroll-container overflow-y-auto max-h-72 scroll-smooth">
        <div className="space-y-2">
          {loading ? (
            <div
              className="py-2 mt-2 text-center text-gray-500 animate-pulse"
              style={{
                backgroundColor: '#F0F0F0',
                borderColor: '#D1D5DB',
              }}
            >
              <p className="text-xl">Loading...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div
              className="py-2 mt-2 text-center text-gray-500 animate-pulse"
              style={{
                backgroundColor: '#F0F0F0',
                borderColor: '#D1D5DB',
              }}
            >
              <p className="text-xl">No Data Found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { background, border, color } = getEventStyle(notification.event);
              return (
                <div
                  className="p-2 border-l-4 rounded-lg w-[255px] cursor-pointer"
                  style={{
                    backgroundColor: background,
                    borderColor: border,
                    color: color,
                  }}
                  key={notification.clientId || notification.event}
                  onClick={() => {
                    toggleNotifications();
                    /* router.push("NotificationTab") */
                  }}
                >
                  <div className="flex flex-col">
                    {/* First Row: Title and Icons */}
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold flex-1">{notification.title}</h3>

                      {/* First Icon - Trip History */}
                      <div className="relative group">
                        <button
                          className="bg-white text-black p-1 rounded-full"
                          onClick={() => handleTripHistoryClick(notification)}
                        >
                         <svg
    version="1.0"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 535 567"
    className="w-6 h-6"
  >
<g>
	<g>
		<path d="M38,460.2c1.2,0,2.3,0,3.4,0c48.8,0,97.6,0,146.4-0.1c2.3,0,3.2,0.7,4.1,2.8c3.6,8.4,7.4,16.7,11.2,25
			c0.3,0.6,0.5,1.1,0.9,1.9c-65.4,0-130.6,0-195.9,0c0-138.7,0-277.4,0-416.2c31.7,0,63.4,0,95.4,0c0,0.9,0.1,1.8,0.1,2.7
			c0,9.2,0,18.5,0,27.7c0,1.4-0.4,2.9-0.9,4.1c-4.7,10.7-1.7,22.8,7.7,30c9,6.9,21.4,6.8,30.6-0.5c8.8-6.9,11.7-19.2,7.1-29.6
			c-0.6-1.3-0.9-2.7-0.9-4.1c-0.1-9.1,0-18.3,0-27.4c0-0.9,0-1.9,0-3c51.1,0,101.9,0,153.1,0c0,0.8,0,1.5,0,2.3c0,9.6,0,19.1,0,28.7
			c0,1.1-0.3,2.2-0.7,3.2c-4.2,9.4-2.6,20.1,4.1,27.4c6.9,7.5,17.5,10.1,26.9,6.6c9.6-3.5,16.1-12.3,16.2-22.6
			c0-3.7-1.4-7.5-2.2-11.2c-0.3-1.3-0.8-2.6-0.8-3.9c-0.1-9.2,0-18.5,0-27.7c0-0.9,0-1.7,0-2.8c32,0,63.7,0,95.6,0
			c0,51.8,0,103.5,0,155.6c-0.8-0.3-1.5-0.5-2.2-0.7c-8.4-2.8-16.8-5.7-25.3-8.4c-1.6-0.5-2.3-1.1-2.3-2.9c0.1-8.8,0-17.7,0.1-26.5
			c0-2.4-0.7-2.9-3-2.9c-52.1,0.1-104.2,0-156.3,0c-69.7,0-139.3,0-209,0c-1.1,0-2.2,0-3.5,0C38,278.7,38,369.3,38,460.2z"/>
		<path d="M365.1,238.6c-87.2,0.4-158.8,70.6-160,158.5c-1.3,90.3,71.4,163.1,160.6,163.2c90.3,0.1,161.8-73.6,161.2-162
			C526.3,310.7,454.8,238.2,365.1,238.6z M483.3,455.5c-4.2,8.9-9.4,17.1-15.5,24.8c-6.1,7.7-13,14.6-20.7,20.7
			c-7.7,6.1-15.9,11.3-24.8,15.6c-8.9,4.3-18.2,7.5-27.9,9.7c-9.6,2.2-19.3,3.2-29.1,3.2c-71.3-0.1-129.4-58.8-129.3-130.6
			c0.2-71.4,58.6-129.5,130.2-129.4c68.3,0,129,54.2,129.7,129.5c0.1,9.6-0.5,19.1-2.9,28.6C490.5,437.2,487.6,446.6,483.3,455.5z"
			/>
		<path d="M338.9,71.4c0,14.9,0,29.8,0,44.8c0,9.6-7.2,17.1-16.5,17.1c-9.7,0.1-17.1-7.2-17.2-16.9c-0.1-30-0.1-60,0-90
			c0-9.4,7.7-16.8,17-16.7c9.4,0.1,16.7,7.5,16.7,17C338.9,41.6,338.9,56.5,338.9,71.4z"/>
		<path d="M108.7,71.4c0-14.9-0.1-29.8,0-44.8c0.1-11.8,10.9-19.7,22-16.2c6.7,2.1,11.5,8.4,11.5,15.6c0.1,30.2,0.1,60.5,0,90.7
			c0,9.4-7.5,16.5-16.8,16.5c-9.3,0-16.6-7.2-16.7-16.6C108.6,101.6,108.7,86.5,108.7,71.4z"/>
		<path d="M127.6,277.9c0.1,0.9,0.2,1.5,0.2,2.1c0,11.9,0,23.8,0,35.6c0,1.5-0.1,2.4-2,2.4c-12.1-0.1-24.2,0-36.4,0
			c-0.5,0-1.1-0.2-1.7-0.2c0-0.8-0.1-1.5-0.1-2.2c0-11.7,0-23.4,0-35.2c0-1.9,0.4-2.6,2.5-2.6c11.8,0.1,23.6,0,35.4,0
			C126.1,277.8,126.8,277.9,127.6,277.9z"/>
		<path d="M87.8,265.4c0-13.3,0-26.5,0-39.8c0.8-0.1,1.5-0.2,2.2-0.2c11.8,0,23.6,0,35.4-0.1c2,0,2.6,0.6,2.6,2.6
			c-0.1,11.8,0,23.6,0,35.4c0,1.2,0.2,2.4-1.8,2.4c-12.3-0.1-24.7,0-37-0.1C88.7,265.6,88.3,265.4,87.8,265.4z"/>
		<path d="M205,265.5c-13.3,0-26.4,0-39.7,0c0-13.3,0-26.5,0-39.9c13.2,0,26.3,0,39.7,0C205,238.8,205,252,205,265.5z"/>
		<path d="M127.7,330.4c0,0.8,0.1,1.6,0.1,2.4c0,11.7,0,23.4,0,35.1c0,1.5-0.1,2.5-2.1,2.5c-12.1-0.1-24.2,0-36.3-0.1
			c-0.5,0-0.9-0.1-1.6-0.2c0-13.2,0-26.4,0-39.8C101.1,330.4,114.3,330.4,127.7,330.4z"/>
		<path d="M87.8,382.8c13.3,0,26.5,0,39.8,0c0.1,0.7,0.2,1.3,0.2,1.9c0,12,0,23.9,0,35.9c0,1.5-0.3,2.3-2.1,2.3
			c-12.2-0.1-24.4,0-36.6,0c-0.4,0-0.8-0.1-1.4-0.2C87.8,409.4,87.8,396.2,87.8,382.8z"/>
		<path d="M165.1,278c13.4,0,26.6,0,40,0c0,1,0,1.9,0,2.7c0,7.9,0.1,15.9-0.1,23.8c0,1.8-0.8,3.7-1.4,5.4c-0.3,1-1.2,1.8-1.4,2.8
			c-1.3,4.6-4.4,5.7-9,5.4c-8.4-0.4-16.8-0.1-25.2-0.1c-0.9,0-1.9,0-2.9,0C165.1,304.5,165.1,291.4,165.1,278z"/>
		<path d="M165.2,370.4c0-13.5,0-26.7,0-40c9.6,0,19,0,28.7,0c-0.8,2.3-1.6,4.4-2.4,6.6c-3.7,10.2-6.4,20.7-8.2,31.4
			c-0.3,1.6-0.9,2.1-2.5,2.1C175.7,370.3,170.5,370.4,165.2,370.4z"/>
		<path d="M242.6,260.9c0-11.7,0-23.4,0-35.3c13.3,0,26.5,0,40,0c0,2.6,0.1,5-0.1,7.5c0,0.5-0.6,1.3-1.2,1.6
			c-13.9,7.2-26.6,16-38.4,26.3C242.9,260.9,242.8,260.9,242.6,260.9z"/>
		<path d="M165.2,382.8c5.5,0,10.7,0,16.1,0c0,13.3,0,26.5,0,39.8c-5,0-10.5,0-16.1,0C165.2,409.4,165.2,396.2,165.2,382.8z"/>
		<path d="M454.2,380.3v0.9C454.2,380.9,454.1,380.6,454.2,380.3L454.2,380.3z"/>
	</g>
	<path d="M417.8,404.7c0.1,0.1,0.2,0.1,0.2,0.2C418,404.8,418,404.8,417.8,404.7z M437.3,379.8L437.3,379.8
		C437.3,379.8,437.4,379.8,437.3,379.8C437.3,379.8,437.3,379.8,437.3,379.8z M437.3,379.8L437.3,379.8
		C437.3,379.8,437.4,379.8,437.3,379.8C437.3,379.8,437.3,379.8,437.3,379.8z"/>
	<path d="M456.6,429.6c0-1.9-0.1-4.1-2.2-5.3c-0.3-0.2-0.3-0.9-0.3-1.3c0-3.4,0.2-6.9,0.2-10.3c0-3.5,0-7,0-10.5c0-0.1,0-0.1,0-0.2
		c0.1-3.5,0.3-14.7-0.2-20.6c0-0.3,0-0.6-0.1-0.9c-0.1-1.3-0.3-2.3-0.5-2.6c-1.2-3.3-3.3-6.1-6.1-8.1c-2.9-2.1-6.1-3.9-8.9-5.8
		c3.7-0.4,7.6-0.5,11.3-1.3c2.1-0.4,4.1-1.8,5.7-3.3c2.1-2,1.7-4-0.9-5.4c-4.4-2.4-9.2-3.2-14.2-3.2c-1.6,0-2.4,0.8-2.3,2.4
		c0.1,1.3,0.3,2.6,0.3,3.8c0,0.5-0.3,1.2-0.7,1.3c-0.4,0.2-1.2-0.1-1.5-0.4c-0.5-0.5-0.8-1.2-1-1.8c-1.3-3.3-2.3-6.7-3.8-9.9
		c-3.6-7.4-7.2-14.8-11.1-22.1c-1.9-3.5-5.1-5.2-9.1-5.2c-1.3,0-2.5-0.3-3.8-0.4c-27.6-2.4-55.1-2.2-82.7-0.2
		c-7.6,0.6-12.8,3.4-15.8,10.2c-0.1,0.1-0.2,0.3-0.2,0.4c-3.7,8.4-7.4,16.9-11.1,25.3c-0.5,1.1-0.8,2.3-1.4,3.3
		c-0.3,0.5-1.2,0.6-1.8,0.8c-0.2-0.6-0.6-1.1-0.7-1.6c0-1,0.2-1.9,0.3-2.9c0.2-2.3-0.6-3.5-2.7-3.1c-4.4,0.7-8.9,1.4-13.1,2.9
		c-3.6,1.2-3.9,4.7-0.6,6.7c2.3,1.4,5.1,2.2,7.8,2.7c2.8,0.5,5.8,0.4,8.8,0.6c-3.3,2-6.4,3.8-9.3,5.9c-4.9,3.7-7.4,8.5-7.2,14.9
		c0.3,12.6,0.2,25.2,0.3,37.8c0,0.8-0.2,1.7-0.5,2.5c-0.6,1.5-1.7,3-1.8,4.5c-0.3,4.1-0.3,8.2-0.1,12.2c0,1.4,0.8,2.7,1.3,4.1
		c0.3,0.9,0.8,1.7,0.8,2.6c0,5.5,0,10.9,0,16.4c0,4.2,1.2,5.4,5.2,5.4c5.9,0,11.9,0,17.8,0c3.4,0,5.3-1.9,5.4-5.4
		c0.1-3.8,0-7.5,0-11.3c0-0.7,0.1-1.4,0.2-2h119.9c0.1,0.5,0.2,0.9,0.2,1.3c0,3.9,0,7.9,0,11.8c0,3.7,1.9,5.6,5.6,5.6
		c5.6,0,11.2,0,16.9,0c5,0,5.8-1.2,6-6.1c0.3-7.1-1.1-14.3,1.7-21.4C457.7,438.5,456.7,433.8,456.6,429.6z M305.9,356
		c2.2-6.1,4.6-12.2,6.9-18.2c0.9-2.2,1.9-4.4,2.8-6.6c1.8-4.3,5-6.6,9.6-6.8c11.3-0.5,22.6-1,33.9-1.4c1.5-0.1,3,0,4.5,0l0,0.4
		c-1.6,0.2-3.1,0.3-4.7,0.5c-1.8,0.3-2.9,1.4-2.6,3.4c0.3,1.9,1.5,2.2,3.1,2.2c4.3,0,8.7,0,13,0c1.6,0,2.9-0.3,3-2.3
		c0.2-1.8-0.6-2.9-2.4-3.3c-1.6-0.3-3.1-0.4-4.7-1c1.3,0,2.7,0,4,0c11.5,0.5,22.9,0.9,34.4,1.5c4.5,0.2,7.8,2.4,9.5,6.6
		c3.4,8.6,6.8,17.3,10.1,26c1,2.7,0.1,3.6-3.1,3.6c-17.8,0-35.6-0.1-53.5-0.1c-19.7,0-39.5,0-59.2,0.1h-1.4
		C305.2,360.6,304.5,359.7,305.9,356z M350.7,414.5c-0.1-1.2-0.2-2.2-0.2-3.3C350.6,412.4,350.7,414,350.7,414.5
		c0,0,35-0.4,49.8-0.4c3.7,0,4.5,3.5,4.6,4c-0.8,0.1-67.2,0.7-77.8,0.7h-2.4c1.5-4,2.1-4.5,5.9-4.5
		C336.5,414.4,349.8,414.5,350.7,414.5z M331.5,409.3c1.1-3.1,3-4.4,6-4.4c14.4,0,41.6,0.1,56,0.1c3,0,3.2-0.2,5.9,4.3
		c0.3,0.4-47.8-0.6-49.1,0H331.5z M297.4,423.5c-3.8-0.1-7-3.4-7-7.2c0-3.8,3.3-7,7-7.1c3.9,0,7.2,3.2,7.2,7.2
		C304.6,420.3,301.3,423.6,297.4,423.5z M308.8,404.8l-0.1,0.6c-6.9-1.5-13.8-2.9-20.6-4.4c-3-0.7-4.4-2.7-4.3-5.7
		c0.1-3.2,0.1-6.4,0.4-9.6c0.4-3.6,2.8-6.1,5.8-7.8c0.8-0.4,2.7-0.2,3.1,0.4c3.4,4.7,8.5,5.9,13.7,7.4c4.1,1.2,8.1,2.9,12.1,4.5
		c2.1,0.9,2.8,2.7,2.3,5C320.2,399.6,313.4,404.9,308.8,404.8z M407,427.9c-19.2,0.1-38.3,0.1-57.5,0.2c-8.2,0-16.4,0.1-24.5,0.2
		c-0.8,0-4.4,0-4.4,0c-0.1-1.8,1.6-4.4,2.7-4.4c14.1,0,28.2,0,42.3,0c0,0.1,27.9,0.4,41.9,0.5c2,0.4,2.9,3.2,2.9,3.5
		C410.4,427.8,408.9,427.9,407,427.9z M417.8,404.7c0.2,0.1,0.2,0.1,0.2,0.2C418,404.8,417.9,404.8,417.8,404.7z M440.9,419.1
		c-1.7,3.4-5.2,5-8.6,3.8c-3.3-1.1-5.6-4.9-4.7-8.5c0.3-1.2,2.9-5,7.5-4.7C441.8,410.3,441.2,418.5,440.9,419.1z M444.3,400.7
		c-5.8,1.3-11.5,2.8-17.4,3.5c-8.6,1-13-2.5-16.2-10.8c-0.2-0.4-0.3-0.8-0.4-1.2c0,0,0,0,0-0.1c0.3,0.1,0.4-0.6,2-1.1
		c15.9-4.5,23.7-10.3,24.9-11.3c0,0,0.1,0,0.1-0.1c0.1,0,0.1-0.1,0.1-0.1c2.8-2.7,4.8-2.9,7.4,0.1c1.2,1.4,2.4,3.3,2.6,5
		c0.5,3.7,0.4,7.5,0.5,11.2C448.1,398.6,446.7,400.2,444.3,400.7z"/>
	<path d="M418,404.9c-0.1-0.1-0.2-0.1-0.2-0.2C418,404.8,418,404.8,418,404.9z"/>
</g>
</svg>

                        </button>
                        <span className="absolute w-[120px] right-[-60px] transform -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-black text-xs rounded px-2 py-1 border-b-2">
                          View Event History
                        </span>
                      </div>

                      {/* Second Icon - Notifications */}
                      <div className="relative group">
                        <button
                          className="bg-white text-black p-1 rounded-full"

                          onClick={handleNotificationClick}
                        >
                          <svg
                    className={`w-6 h-6 text-white-10 dark:text-white`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color:"black",
                   
                    }}
                  >

                    <path
                      d="M12 22C13.1046 22 14 21.1046 14 20C14 19.4477 13.5523 19 13 19H11C10.4477 19 10 19.4477 10 20C10 21.1046 10.8954 22 12 22ZM18 16V11C18 7.13401 15.866 4 12 4C8.13401 4 6 7.13401 6 11V16L4 18V19H20V18L18 16Z"
                    />

                  </svg>
                        </button>
                        <span className="absolute w-[90px] right-[-40px] transform -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-black text-xs rounded px-2 py-1 border-b-2">
                          Notifications
                        </span>
                      </div>
                    </div>

                    {/* Second Row: Description */}
                    <div className="mt-2">
                      <p className="text-xs">{notification.description}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


    </div>
  );
};
export default NotificationDropdown;