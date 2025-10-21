'use client'
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';
import { useSession } from "next-auth/react";
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { useRouter } from 'next/navigation';


export default function Reporting() {
    const router = useRouter()
    const { data: session } = useSession();
    
    if (!session?.featureReportApp) {
        router.push("/liveTracking");
    }
    const [incomeData, setIncomeData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [incomeSources, setIncomeSources] = useState({});
    const [expenseSources, setExpenseSources] = useState({});
    const [loading, setLoading] = useState(false);

    // Configuration for different file types
    const fileConfig = {
        income: {
            patterns: {
                careem: /careem/i,
                uber: /uber/i,
            },
            parsers: {
                careem: (data) => ({
                    type: 'Careem',
                    driver: data['Captain Name'],
                    earnings: parseFloat(data['Total Earnings']) || 0,
                    trips: parseInt(data['Total Trips']) || 1,
                    vehicle: data['Vehicle Type'],
                    details: {
                        captainId: data['Captain Id'],
                        phone: data['Phone Number'],
                        hours: data['Available Hours'],
                        acceptanceRate: data['Acceptance Rate'],
                        cashBalance: data['Cash Balance']
                    }
                }),
                uber: (data) => ({
                    type: 'Uber',
                    driver: `${data['Driver first name'] || ''} ${data['Driver surname'] || ''}`.trim(),
                    earnings: parseFloat(data['Paid to you : Your earnings']) || 0,
                    trips: 1,
                    vehicle: 'Uber Vehicle',
                    details: {
                        tripId: data['Trip UUID'],
                        fare: parseFloat(data['Paid to you:Your earnings:Fare:Fare']) || 0,
                        waitTime: parseFloat(data['Paid to you:Your earnings:Fare:Wait Time at Pick-up']) || 0,
                        serviceFee: parseFloat(data['Paid to you:Your earnings:Service fee']) || 0,
                        tip: parseFloat(data['Paid to you:Your earnings:Tip']) || 0,
                        toll: parseFloat(data['Paid to you:Trip balance:Refunds:Toll']) || 0
                    }
                })
            }
        },
        expense: {
            patterns: {
                chr: /chr/i,
                regeny: /regeny/i,
                salik: /salik/i,
                 dewa: /dewa/i,
                zynetic: /zynetic/i
            },
            parsers: {
                chr: (data) => ({
                    type: 'CHR',
                    amount: parseFloat(data['Total Amount']) || 0,
                    description: 'EV Charging',
                    details: {
                        transactionId: data['Transaction ID'],
                        sessionId: data['Session ID'],
                        date: data['Transaction Date'],
                        station: data['Station'],
                        city: data['City'],
                        chargePoint: data['Charge Point'],
                        connectorType: data['Connector Type'],
                        unitsConsumed: parseFloat(data['Units Consumed(kWh)']) || 0,
                        startSoC: data['Start SoC (%)'],
                        endSoC: data['End SoC (%)'],
                        tariffRate: data['Tariff Rate'],
                        serviceFee: parseFloat(data['Service Fee']) || 0,
                        energyCost: parseFloat(data['Sale Of Energy']) || 0,
                        taxAmount: parseFloat(data['Tax Amount']) || 0,
                        vrn: data['VRN'],
                        vehicleMake: data['Make'],
                        vehicleModel: data['Model']
                    }
                }),
                regeny: (data) => ({
                    type: 'Regeny',
                    amount: parseFloat(data['SPENT']) || 0,
                    description: 'EV Charging',
                    details: {
                        date: data['DATE'],
                        sessionId: data['SESSION ID'],
                        siteName: data['SITE NAME'],
                        stationName: data['STATION NAME'],
                        connectorType: data['CONNECTOR TYPE'],
                        portId: data['PORT ID'],
                        customerName: data['CUSTOMER NAME'],
                        paymentMethod: data['PAYMENT METHOD'],
                        connectedDuration: data['CONNECTED DURATION'],
                        chargingDuration: data['CHARGING DURATION'],
                        kWhUsed: parseFloat(data['kWh USED']) || 0,
                        vendingPrice: parseFloat(data['VENDING PRICE']) || 0,
                        chargingCost: parseFloat(data['CHARGING COST']) || 0,
                        inactivityCost: parseFloat(data['INACTIVITY COST']) || 0,
                        idleCost: parseFloat(data['IDLE COST']) || 0,
                        transactionFee: parseFloat(data['TRANSACTION FEE']) || 0,
                        municipalityFee: parseFloat(data['MUNICIPALITY FEE']) || 0,
                        vatFee: parseFloat(data['VAT FEE']) || 0,
                        creditCardFee: parseFloat(data['CREDIT CARD FEE']) || 0
                    }
                }),
                salik: (data) => ({
                    type: 'Salik',
                    amount: parseFloat(data['0']) || 0,
                    description: 'Toll Charges',
                    details: {
                        transactionId: data['Transaction ID'],
                        tripDate: data['Trip Date'],
                        tripTime: data['Trip Time'],
                        postDate: data['Transaction Post Date'],
                        tollGate: data['Toll Gate'],
                        direction: data['Direction'],
                        tagNumber: data['Tag Number'],
                        plate: data['Plate']
                    }
                }),
                dewa: (data) => ({
                    type: 'DEWA',
                    driver: data['Card Number'],
                    amount: parseFloat(data['Total (AED)']) || 0,
                    trips: 1,
                    vehicle: 'EV Charging',
                    details: {
                        transactionNo: data['Transaction no.'],
                        dateTime: data['Date & Time'],
                        location: data['Location'],
                        energy: parseFloat(data['Energy (kWh)']) || 0,
                        duration: data['Duration'],
                        rate: parseFloat(data['Rate (AED/kWh)']) || 0
                    }
                }),
                zynetic: (data) => ({
                    type: 'Zynetic',
                    driver: data['Driver details'],
                    amount: parseFloat(data['Total amount']) || 0,
                    trips: 1,
                    vehicle: 'EV Charging',
                    details: {
                        txnId: data['Txn ID'],
                        connectorId: data['Connector ID'],
                        phone: data['Driver phone'],
                        idTag: data['ID tag'],
                        deviceId: data['Device ID'],
                        deviceName: data['Device name'],
                        startTime: data['Start time m'],
                        endTime: data['End time m'],
                        duration: data['Duration'],
                        energyUsage: parseFloat(data['Energy usage kwh']) || 0,
                        energyCost: parseFloat(data['Energy Cost']) || 0,
                        vat: parseFloat(data['VAT 5%']) || 0
                    }
                })
            }
        }
    };

    // Process uploaded files
    const onDropIncome = useCallback(async (acceptedFiles) => {
        setLoading(true);
        try {
            const newIncomeData = [];
            const sources = {};

            for (const file of acceptedFiles) {
                const fileType = file.name.split('.').pop().toLowerCase();
                const fileContent = await file.text();

                // Determine the source type
                let sourceType = 'unknown';
                for (const [type, pattern] of Object.entries(fileConfig.income.patterns)) {
                    if (pattern.test(file.name)) {
                        sourceType = type;
                        break;
                    }
                }

                if (fileType === 'csv') {
                    parse(fileContent, {
                        header: true,
                        complete: (results) => {
                            const parsedData = results.data.map(item => ({
                                ...fileConfig.income.parsers[sourceType](item),
                                source: sourceType
                            }));
                            newIncomeData.push(...parsedData);

                            // Track sources
                            if (!sources[sourceType]) {
                                sources[sourceType] = {
                                    count: parsedData.length,
                                    total: parsedData.reduce((sum, item) => sum + item.earnings, 0)
                                };
                            } else {
                                sources[sourceType].count += parsedData.length;
                                sources[sourceType].total += parsedData.reduce((sum, item) => sum + item.earnings, 0);
                            }
                        }
                    });
                } else if (fileType === 'xls' || fileType === 'xlsx') {
                    const workbook = XLSX.read(await file.arrayBuffer());
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    const parsedData = jsonData.map(item => ({
                        ...fileConfig.income.parsers[sourceType](item),
                        source: sourceType
                    }));
                    newIncomeData.push(...parsedData);

                    // Track sources
                    if (!sources[sourceType]) {
                        sources[sourceType] = {
                            count: parsedData.length,
                            total: parsedData.reduce((sum, item) => sum + item.earnings, 0)
                        };
                    } else {
                        sources[sourceType].count += parsedData.length;
                        sources[sourceType].total += parsedData.reduce((sum, item) => sum + item.earnings, 0);
                    }
                }
            }

            setIncomeData(prev => [...prev, ...newIncomeData]);
            setIncomeSources(prev => ({
                ...prev,
                ...sources
            }));
        } catch (error) {
            console.error("Error processing income files:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const onDropExpense = useCallback(async (acceptedFiles) => {
        setLoading(true);
        try {
            const newExpenseData = [];
            const sources = {};
            console.log(acceptedFiles.length)
            for (const file of acceptedFiles) {
                const fileType = file.name.split('.').pop().toLowerCase();
                console.log(fileType)
                // Determine the source type
                let sourceType = 'unknown';
                for (const [type, pattern] of Object.entries(fileConfig.expense.patterns)) {
                    if (pattern.test(file.name)) {
                        sourceType = type;
                        break;
                    }
                }

                if (fileType === 'csv') {
                    const fileContent = await file.text();
                    parse(fileContent, {
                        header: true,
                        complete: (results) => {
                            console.log(results.data)
                            const parsedData = results.data.map(item => ({
                                ...fileConfig.expense.parsers[sourceType](item),
                                source: sourceType
                            }));
                            newExpenseData.push(...parsedData);

                            // Track sources
                            if (!sources[sourceType]) {
                                sources[sourceType] = {
                                    count: parsedData.length,
                                    total: parsedData.reduce((sum, item) => sum + item.amount, 0)
                                };
                            } else {
                                sources[sourceType].count += parsedData.length;
                                sources[sourceType].total += parsedData.reduce((sum, item) => sum + item.amount, 0);
                            }
                        }
                    });
                } else if (fileType === 'xls' || fileType === 'xlsx') {
                    const workbook = XLSX.read(await file.arrayBuffer());
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = sourceType === 'salik' ?
                        XLSX.utils.sheet_to_json(sheet, { range: 15, raw: true }).filter(item => item['0']).slice(-1) :
                        XLSX.utils.sheet_to_json(sheet);
                    console.log(jsonData, sourceType)
                    const parsedData = jsonData.map(item => ({
                        ...fileConfig.expense.parsers[sourceType](item),
                        source: sourceType
                    }));
                    console.log(parsedData)
                    newExpenseData.push(...parsedData);

                    // Track sources
                    if (!sources[sourceType]) {
                        sources[sourceType] = {
                            count: parsedData.length,
                            total: parsedData.reduce((sum, item) => sum + item.amount, 0)
                        };
                    } else {
                        sources[sourceType].count += parsedData.length;
                        sources[sourceType].total += parsedData.reduce((sum, item) => sum + item.amount, 0);
                    }
                }
            }

            setExpenseData(prev => [...prev, ...newExpenseData]);
            setExpenseSources(prev => ({
                ...prev,
                ...sources
            }));
        } catch (error) {
            console.error("Error processing expense files:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const { getRootProps: getIncomeRootProps, getInputProps: getIncomeInputProps } = useDropzone({
        onDrop: onDropIncome,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls', '.xlsx']
        },
        multiple: true
    });

    const { getRootProps: getExpenseRootProps, getInputProps: getExpenseInputProps } = useDropzone({
        onDrop: onDropExpense,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls', '.xlsx']
        },
        multiple: true
    });

    // Calculate metrics
    const totalIncome = incomeData.reduce((sum, row) => sum + row.earnings, 0);
    const totalExpenses = expenseData.reduce((sum, row) => sum + row.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Calculate service fees (approximate)
    // const serviceFees = incomeData.reduce((sum, row) => {
    //     if (row.source === 'uber') {
    //         // This is a simplified calculation - adjust based on your actual data structure
    //         return sum + (row.earnings * 0.25); // Assuming ~25% service fee for Uber
    //     }
    //     return sum;
    // }, 0);

    // Top drivers
    const driverEarnings = {};
    incomeData.forEach(row => {
        if (row.driver) {
            driverEarnings[row.driver] = (driverEarnings[row.driver] || 0) + row.earnings;
        }
    });

    const topDrivers = Object.entries(driverEarnings)
        .sort((a, b) => b[1] - a[1]);

    // Export to Excel
    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();

        // Prepare consolidated data
        const consolidatedData = incomeData.map(item => ({
            Type: item.type,
            Source: item.source,
            Driver: item.driver,
            Earnings: item.earnings,
            Trips: item.trips,
            Vehicle: item.vehicle
        }));

        // Add summary sheet
        const summaryData = [
            ['Metric', 'Value'],
            ['Total Income', totalIncome.toFixed(2)],
            ['Total Expenses', totalExpenses.toFixed(2)],
            ['Net Profit', netProfit.toFixed(2)],
            ['Profit Margin', `${profitMargin.toFixed(2)}%`],
            ...Object.entries(incomeSources).map(([source, data]) => [
                `${source.charAt(0).toUpperCase() + source.slice(1)} Trips`,
                data.count
            ]),
            ...Object.entries(expenseSources).map(([source, data]) => [
                `${source.charAt(0).toUpperCase() + source.slice(1)} Transactions`,
                data.count
            ])
        ];

        // Add sheets to workbook
        XLSX.utils.book_append_sheet(workbook,
            XLSX.utils.json_to_sheet(consolidatedData),
            'Income Data');

        if (expenseData.length > 0) {
            XLSX.utils.book_append_sheet(workbook,
                XLSX.utils.json_to_sheet(expenseData.map(item => ({
                    Type: item.type,
                    Source: item.source,
                    Amount: item.amount,
                    Description: item.description
                }))),
                'Expense Data');
        }

        XLSX.utils.book_append_sheet(workbook,
            XLSX.utils.aoa_to_sheet(summaryData),
            'Summary');

        // Generate and download
        XLSX.writeFile(workbook, `${session?.clientName}_report.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add title and date
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("Vtrack Report Service", 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

        // Add summary table
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text("Financial Summary", 14, 45);

        const summaryData = [
            ['Metric', 'Value'],
            ['Total Income', totalIncome.toFixed(2) + ` AED`],
            ['Total Expenses', totalExpenses.toFixed(2) + ` AED`],
            ['Net Profit', netProfit.toFixed(2) + ` AED`],
            ['Profit Margin', `${profitMargin.toFixed(2)}%`],
            ...Object.entries(incomeSources).map(([source, data]) => [
                `${source.charAt(0).toUpperCase() + source.slice(1)} Trips`,
                data.count
            ]),
            ...Object.entries(expenseSources).map(([source, data]) => [
                `${source.charAt(0).toUpperCase() + source.slice(1)} Transactions`,
                data.count
            ])
        ];

        autoTable(doc, {
            head: [summaryData[0]],
            body: summaryData.slice(1),
            startY: 50,
            theme: 'grid',
            headStyles: {
                fillColor: "#00B56C",
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'right' }
            },
            styles: {
                fontSize: 10,
                cellPadding: 5,
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        // Add income data table
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text("Income Details", 14, doc.lastAutoTable.finalY + 20);

        autoTable(doc, {
            head: [['Type', 'Driver', 'Earnings (AED)', 'Trips', 'Vehicle']],
            body: incomeData.map(item => [
                item.type,
                item.driver,
                item.earnings.toFixed(2),
                item.trips,
                item.vehicle
            ]),
            startY: doc.lastAutoTable.finalY + 25,
            theme: 'grid',
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                2: { halign: 'right' },
                3: { halign: 'center' }
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                overflow: 'linebreak'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        // Add expense data table if exists
        if (expenseData.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text("Expense Details", 14, doc.lastAutoTable.finalY + 20);

            autoTable(doc, {
                head: [['Type', 'Amount (AED)', 'Description']],
                body: expenseData.map(item => [
                    item.type,
                    item.amount.toFixed(2),
                    item.description
                ]),
                startY: doc.lastAutoTable.finalY + 25,
                theme: 'grid',
                headStyles: {
                    fillColor: [231, 76, 60],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    1: { halign: 'right' }
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: 'linebreak'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }
            });
        }

        // Footer on each page
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width - 15,
            doc.internal.pageSize.height - 10
        );

        // Save the PDF
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`${session?.clientName}_report_${dateStr}.pdf`);
    };

    return (
        <>
            <p className="bg-green px-4 py-1 border-t-2  text-center text-2xl text-white font-bold zone_heading">
                Reporting
            </p>
            <div className="bg-gray-50">
                <div className="px-8 mx-auto mt-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                        {/* Income File Upload */}
                        <div
                            {...getIncomeRootProps()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 transition w-full md:w-auto flex-grow"
                        >
                            <input {...getIncomeInputProps()} />
                            <div className="flex flex-row items-center justify-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-gray-600 text-sm whitespace-nowrap">Drag & drop or click to select {" "}
                                        <span className='font-bold'>Income</span>{" "}files</p>
                                    <p className="text-xs text-gray-500">Supports CSV, Excel</p>
                                </div>
                            </div>
                        </div>

                        {/* Expense File Upload */}
                        <div
                            {...getExpenseRootProps()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 transition w-full md:w-auto flex-grow"
                        >
                            <input {...getExpenseInputProps()} />
                            <div className="flex flex-row items-center justify-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-gray-600 text-sm whitespace-nowrap">Drag & drop or click to select {" "}
                                        <span className='font-bold'>Expense</span>{" "}files</p>
                                    <p className="text-xs text-gray-500">Supports CSV, Excel</p>
                                </div>
                            </div>
                        </div>

                        {/* Export Buttons */}
                        <div className="flex flex-row space-x-2 w-full md:w-auto">
                            <button
                                onClick={exportToExcel}
                                className="flex bg-green py-2 px-4 rounded-md shadow-md hover:shadow-gray transition duration-500 text-white items-center justify-center w-full md:w-auto"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Excel
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="flex bg-green py-2 px-4 rounded-md shadow-md hover:shadow-gray transition duration-500 text-white items-center justify-center w-full md:w-auto"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-4">
                            <p className="text-blue-600">Processing files...</p>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SummaryCard
                            title="Total Income"
                            value={`AED ${totalIncome.toFixed(2)}`}
                            description={Object.entries(incomeSources).map(([source, data]) =>
                                `${source}: ${data.total.toFixed(2)}`
                            ).join(', ')}
                            color="green"
                        />
                        <SummaryCard
                            title="Total Expenses"
                            value={`AED ${totalExpenses.toFixed(2)}`}
                            description={Object.entries(expenseSources).map(([source, data]) =>
                                `${source}: ${data.total.toFixed(2)}`
                            ).join(', ')}
                            color="red"
                        />
                        <SummaryCard
                            title="Net Profit"
                            value={`AED ${netProfit.toFixed(2)}`}
                            description={profitMargin.toFixed(1) + '% margin'}
                            color={netProfit >= 0 ? 'green' : 'red'}
                        />
                        <SummaryCard
                            title="Total Trips"
                            value={Object.values(incomeSources).reduce((sum, source) => sum + source.count, 0)}
                            description={Object.entries(incomeSources).map(([source, data]) =>
                                `${source}: ${data.count}`
                            ).join(', ')}
                            color="blue"
                        />
                    </div>

                    {/* Detailed Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Top Drivers */}
    <div className="bg-white p-6 rounded-lg shadow flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Drivers</h2>
        <div className="space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide">
            {topDrivers.map(([name, earnings], index) => (
                <div key={name} className="flex justify-between items-center pr-2">
                    <div className="flex items-center">
                        <span className="font-medium text-gray-700">{index + 1}. {name}</span>
                    </div>
                    <span className="font-medium">AED {earnings.toFixed(2)}</span>
                </div>
            ))}
        </div>
    </div>

    {/* Expense Breakdown */}
    <div className="bg-white p-6 rounded-lg shadow flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
        <div className="space-y-3 overflow-y-auto max-h-[300px] scrollbar-hide">
            {Object.entries(expenseSources).map(([source, data]) => (
                <div key={source} className="flex justify-between pr-2">
                    <span className="text-gray-600 capitalize">{source}</span>
                    <span className="font-medium">AED {data.total.toFixed(2)}</span>
                </div>
            ))}
            {/* {serviceFees > 0 && (
                <div className="flex justify-between pr-2">
                    <span className="text-gray-600">Service Fees</span>
                    <span className="font-medium">AED {serviceFees.toFixed(2)}</span>
                </div>
            )} */}
        </div>
    </div>

    {/* Recent Transactions */}
    <div className="bg-white p-6 rounded-lg shadow flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-3 overflow-y-auto max-h-[300px] scrollbar-hide">
            {[...incomeData.slice(0, 5)].map((row, i) => (
                <div key={i} className="border-b pb-2 pr-2">
                    <p className="font-medium">
                        {row.driver || 'Unknown'} -
                        AED {row.earnings.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                        {row.vehicle || row.type}
                    </p>
                </div>
            ))}
        </div>
    </div>
</div>
                </div>
            </div>
        </>
    );
}

function SummaryCard({ title, value, description, color }) {
    const colorClasses = {
        green: 'bg-green-50 text-green-700',
        red: 'bg-red-50 text-red-700',
        blue: 'bg-blue-50 text-blue-700',
    };

    return (
        <div className={`${colorClasses[color]} p-6 rounded-lg shadow-sm`}>
            <h3 className="text-lg font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold mb-2">{value}</p>
            <p className="text-sm opacity-75">{description}</p>
        </div>
    );
}