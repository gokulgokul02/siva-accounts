import { useState } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [rangeStartDate, setRangeStartDate] = useState(new Date().toISOString().split('T')[0])
  const [rangeEndDate, setRangeEndDate] = useState(new Date().toISOString().split('T')[0])
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    let startDate, endDate

    if (reportType === 'daily') {
      startDate = selectedDate
      endDate = selectedDate
    } else if (reportType === 'monthly') {
      startDate = `${selectedMonth}-01`
      const lastDay = new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0).getDate()
      endDate = `${selectedMonth}-${lastDay.toString().padStart(2, '0')}`
    } else if (reportType === 'yearly') {
      startDate = `${selectedYear}-01-01`
      endDate = `${selectedYear}-12-31`
    } else if (reportType === 'range') {
      if (!rangeStartDate || !rangeEndDate) {
        alert('Please select both start and end dates for the range')
        setLoading(false)
        return
      }
      if (new Date(rangeStartDate) > new Date(rangeEndDate)) {
        alert('Start date must be before or equal to end date')
        setLoading(false)
        return
      }
      startDate = rangeStartDate
      endDate = rangeEndDate
    }

    try {
      // Fetch trips
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date')

      if (tripsError) throw tripsError

      // Fetch diesel expenses
      const { data: dieselExpenses, error: dieselError } = await supabase
        .from('diesel_expenses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)

      if (dieselError) throw dieselError

      // Calculate totals
      const totalAmount = trips?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
      const totalPaid = trips
        ?.filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
      const totalPending = trips
        ?.filter(t => t.status === 'unpaid')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
      const totalDiesel = dieselExpenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0
      const netAmount = totalAmount - totalDiesel

      setReportData({
        startDate,
        endDate,
        trips: trips || [],
        dieselExpenses: dieselExpenses || [],
        totalAmount,
        totalPaid,
        totalPending,
        totalDiesel,
        netAmount
      })
    } catch (error) {
      alert('Error generating report: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    const headers = ['Date', 'Customer Name', 'Place', 'Amount', 'Status']
    const rows = reportData.trips.map(trip => [
      trip.date,
      trip.customer_name,
      trip.place,
      trip.amount,
      trip.status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    const fileName = reportType === 'range' 
      ? `siva-cabs-report-${rangeStartDate}-to-${rangeEndDate}.csv`
      : `siva-cabs-report-${reportType}-${selectedDate || selectedMonth || selectedYear}.csv`
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    if (!reportData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // Title
    doc.setFontSize(18)
    doc.text('Siva Cabs - Trip Report', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    // Report period
    doc.setFontSize(12)
    let periodText
    if (reportType === 'daily') {
      periodText = `Date: ${new Date(reportData.startDate).toLocaleDateString()}`
    } else if (reportType === 'monthly') {
      periodText = `Month: ${new Date(reportData.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    } else if (reportType === 'yearly') {
      periodText = `Year: ${reportData.startDate.split('-')[0]}`
    } else if (reportType === 'range') {
      periodText = `Period: ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}`
    }
    doc.text(periodText, pageWidth / 2, yPos, { align: 'center' })
    yPos += 15

    // Summary boxes
    doc.setFontSize(10)
    const summaryData = [
      ['Total Amount', `₹${reportData.totalAmount.toFixed(2)}`],
      ['Total Paid', `₹${reportData.totalPaid.toFixed(2)}`],
      ['Total Pending', `₹${reportData.totalPending.toFixed(2)}`],
      ['Diesel Expenses', `₹${reportData.totalDiesel.toFixed(2)}`],
      ['Net Amount', `₹${reportData.netAmount.toFixed(2)}`]
    ]

    summaryData.forEach(([label, value], index) => {
      if (yPos > pageHeight - 30) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(10)
      doc.text(label + ':', 20, yPos)
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text(value, 80, yPos)
      doc.setFont(undefined, 'normal')
      yPos += 8
    })

    yPos += 10

    // Trips table
    if (reportData.trips.length > 0) {
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text(`Trips (${reportData.trips.length})`, 20, yPos)
      yPos += 8

      // Table headers
      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      const headers = ['Date', 'Customer', 'Place', 'Amount', 'Status']
      const colWidths = [30, 50, 50, 30, 30]
      let xPos = 20

      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos)
        xPos += colWidths[i]
      })
      yPos += 6

      // Draw line under headers
      doc.setLineWidth(0.5)
      doc.line(20, yPos, pageWidth - 20, yPos)
      yPos += 5

      // Table rows
      doc.setFont(undefined, 'normal')
      reportData.trips.forEach((trip, index) => {
        if (yPos > pageHeight - 20) {
          doc.addPage()
          yPos = 20
          // Redraw headers
          doc.setFont(undefined, 'bold')
          xPos = 20
          headers.forEach((header, i) => {
            doc.text(header, xPos, yPos)
            xPos += colWidths[i]
          })
          yPos += 6
          doc.line(20, yPos, pageWidth - 20, yPos)
          yPos += 5
          doc.setFont(undefined, 'normal')
        }

        xPos = 20
        const rowData = [
          new Date(trip.date).toLocaleDateString('en-GB'),
          trip.customer_name.substring(0, 20),
          trip.place.substring(0, 20),
          `₹${parseFloat(trip.amount).toFixed(2)}`,
          trip.status
        ]

        rowData.forEach((cell, i) => {
          doc.text(cell, xPos, yPos)
          xPos += colWidths[i]
        })
        yPos += 7
      })
    }

    // Diesel expenses
    if (reportData.dieselExpenses.length > 0) {
      yPos += 10
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text(`Diesel Expenses (${reportData.dieselExpenses.length})`, 20, yPos)
      yPos += 8

      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      doc.text('Date', 20, yPos)
      doc.text('Amount', 100, yPos)
      yPos += 6
      doc.line(20, yPos, pageWidth - 20, yPos)
      yPos += 5

      doc.setFont(undefined, 'normal')
      reportData.dieselExpenses.forEach((expense) => {
        if (yPos > pageHeight - 20) {
          doc.addPage()
          yPos = 20
        }
        doc.text(new Date(expense.date).toLocaleDateString('en-GB'), 20, yPos)
        doc.text(`₹${parseFloat(expense.amount).toFixed(2)}`, 100, yPos)
        yPos += 7
      })
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Save PDF
    const fileName = reportType === 'range'
      ? `siva-cabs-report-${rangeStartDate}-to-${rangeEndDate}.pdf`
      : `siva-cabs-report-${reportType}-${selectedDate || selectedMonth || selectedYear}.pdf`
    doc.save(fileName)
  }


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Generate Report</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="range">Date Range</option>
            </select>
          </div>

          {reportType === 'daily' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
            </div>
          )}

          {reportType === 'yearly' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Year</label>
              <input
                type="number"
                min="2020"
                max="2099"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
            </div>
          )}

          {reportType === 'range' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={rangeStartDate}
                  onChange={(e) => setRangeStartDate(e.target.value)}
                  max={rangeEndDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={rangeEndDate}
                  onChange={(e) => setRangeEndDate(e.target.value)}
                  min={rangeStartDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          <button
            onClick={generateReport}
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Report Results</h2>
              {reportType === 'range' && (
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(reportData.startDate).toLocaleDateString()} to {new Date(reportData.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportToCSV}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
              >
                Download CSV
              </button>
              <button
                onClick={exportToPDF}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-1">Total Amount</h3>
              <p className="text-2xl font-bold text-green-700">₹{reportData.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-1">Total Paid</h3>
              <p className="text-2xl font-bold text-green-700">₹{reportData.totalPaid.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-1">Total Pending</h3>
              <p className="text-2xl font-bold text-red-700">₹{reportData.totalPending.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Total Diesel Expenses</h3>
              <p className="text-2xl font-bold text-yellow-700">₹{reportData.totalDiesel.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-800 mb-1">Net Amount</h3>
              <p className="text-2xl font-bold text-purple-700">₹{reportData.netAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Trips ({reportData.trips.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Place</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.trips.map((trip) => (
                    <tr
                      key={trip.id}
                      className={trip.status === 'unpaid' ? 'bg-red-50' : ''}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(trip.date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{trip.customer_name}</td>
                      <td className="border border-gray-300 px-4 py-2">{trip.place}</td>
                      <td className="border border-gray-300 px-4 py-2">₹{trip.amount}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          trip.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trip.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {reportData.dieselExpenses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Diesel Expenses ({reportData.dieselExpenses.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.dieselExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">₹{expense.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

