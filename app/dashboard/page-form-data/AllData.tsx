/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import GETDATA from '@/app/default/functions/GetData';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface LandingData {
  _id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
    };
    data: LandingData[];
  };
}

export default function AllData() {
  const [data, setData] = useState<LandingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  
  // Custom message states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState('');
  
  const [sendingStatus, setSendingStatus] = useState<{
    type: 'email' | 'whatsapp' | 'call';
    status: 'idle' | 'sending' | 'success' | 'error';
    message: string;
  }>({ type: 'email', status: 'idle', message: '' });

  useEffect(() => {
    fetchData();
  }, [filterType, searchTerm, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/v1/landing-page-data?limit=2000&page=${currentPage}`;
      if (filterType) {
        url += `&type=${filterType}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response: ApiResponse = await GETDATA(url);
      
      if (response.success && response.data) {
        setData(response.data.data);
        setTotalPages(Math.ceil(response.data.meta.total / 2000));
        
        const uniqueTypes = Array.from(new Set(response.data.data.map(item => item.type)));
        setAvailableTypes(uniqueTypes);
      } else {
        console.error('Failed to fetch data');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(item => item._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const exportToExcel = () => {
    const exportData = data.map(item => ({
      'Name': item.name,
      'Phone': item.phone,
      'WhatsApp': item.whatsapp,
      'Email': item.email,
      'Address': item.address,
      'Type': item.type,
      'Created At': new Date(item.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LandingPageData');
    XLSX.writeFile(wb, `landing_page_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const makePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Send single email with custom message
  const sendEmail = async (email: string, name: string) => {
    const subject = prompt('Enter email subject:', 'Important Information from Our Team');
    if (!subject) return;
    
    const message = prompt('Enter your message:', 
      `Hello ${name},\n\nThank you for your interest in our services. We would like to connect with you.\n\nPlease feel free to reply to this email or contact us directly.\n\nBest regards,\nYour Team`
    );
    if (!message) return;
    
    setSendingStatus({ type: 'email', status: 'sending', message: `Sending email to ${name}...` });
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: subject,
          html: message.replace(/\n/g, '<br/>')
        })
      });

      if (response.ok) {
        setSendingStatus({ type: 'email', status: 'success', message: `Email sent successfully to ${name}!` });
        setTimeout(() => setSendingStatus({ type: 'email', status: 'idle', message: '' }), 3000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      setSendingStatus({ type: 'email', status: 'error', message: `Failed to send email to ${name}` });
      setTimeout(() => setSendingStatus({ type: 'email', status: 'idle', message: '' }), 3000);
    }
  };

  // Send single WhatsApp message with custom message
  const sendWhatsApp = (phoneNumber: string, name: string) => {
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '880' + cleanNumber.substring(1);
    } else if (!cleanNumber.startsWith('880')) {
      cleanNumber = '880' + cleanNumber;
    }
    
    const customMessage = prompt('Enter your WhatsApp message:', 
      `Hello ${name},\n\nThank you for your interest in our services. We would like to connect with you.\n\nPlease click here to start chatting with us or reply to this message.\n\nBest regards,\nYour Team`
    );
    
    if (!customMessage) return;
    
    const message = encodeURIComponent(customMessage);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Open email modal for bulk send
  const openBulkEmailModal = () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      alert('Please select at least one item to send emails');
      return;
    }
    setCustomEmailSubject('Important Information from Our Team');
    setCustomEmailMessage(
      `Dear [Name],\n\nThank you for your interest in our services. We would like to connect with you.\n\nPlease feel free to reply to this email or contact us directly.\n\nBest regards,\nYour Team`
    );
    setShowEmailModal(true);
  };

  // Open WhatsApp modal for bulk send
  const openBulkWhatsAppModal = () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      alert('Please select at least one item to send WhatsApp messages');
      return;
    }
    setCustomWhatsAppMessage(
      `Hello [Name],\n\nThank you for your interest in our services. We would like to connect with you.\n\nBest regards,\nYour Team`
    );
    setShowWhatsAppModal(true);
  };

  // Send bulk emails with custom message
  const sendBulkEmails = async () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      alert('Please select at least one item to send emails');
      return;
    }

    if (!customEmailSubject.trim()) {
      alert('Please enter an email subject');
      return;
    }

    if (!customEmailMessage.trim()) {
      alert('Please enter an email message');
      return;
    }

    setShowEmailModal(false);
    setSendingStatus({ type: 'email', status: 'sending', message: `Sending emails to ${selectedData.length} recipients...` });

    try {
      const promises = selectedData.map(item => {
        // Replace [Name] placeholder with actual name
        let personalizedMessage = customEmailMessage.replace(/\[Name\]/g, item.name);
        personalizedMessage = personalizedMessage.replace(/\n/g, '<br/>');
        
        return fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: item.email,
            subject: customEmailSubject,
            html: personalizedMessage
          })
        });
      });

      const results = await Promise.all(promises);
      const failedCount = results.filter(r => !r.ok).length;
      
      if (failedCount === 0) {
        setSendingStatus({ type: 'email', status: 'success', message: `Successfully sent emails to ${selectedData.length} recipients!` });
      } else {
        setSendingStatus({ type: 'email', status: 'error', message: `Sent to ${selectedData.length - failedCount} recipients. Failed: ${failedCount}` });
      }
      setTimeout(() => setSendingStatus({ type: 'email', status: 'idle', message: '' }), 3000);
    } catch (error) {
      setSendingStatus({ type: 'email', status: 'error', message: 'Failed to send some emails' });
      setTimeout(() => setSendingStatus({ type: 'email', status: 'idle', message: '' }), 3000);
    }
  };

  // Send bulk WhatsApp messages with custom message
  const sendBulkWhatsApp = () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      alert('Please select at least one item to send WhatsApp messages');
      return;
    }

    if (!customWhatsAppMessage.trim()) {
      alert('Please enter a WhatsApp message');
      return;
    }

    setShowWhatsAppModal(false);
    
    // Open first WhatsApp chat
    if (selectedData[0]) {
      let cleanNumber = selectedData[0].whatsapp.replace(/\D/g, '');
      
      if (cleanNumber.startsWith('0')) {
        cleanNumber = '880' + cleanNumber.substring(1);
      } else if (!cleanNumber.startsWith('880')) {
        cleanNumber = '880' + cleanNumber;
      }
      
      const personalizedMessage = customWhatsAppMessage.replace(/\[Name\]/g, selectedData[0].name);
      const message = encodeURIComponent(personalizedMessage);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
    
    if (selectedData.length > 1) {
      alert(`WhatsApp link opened for ${selectedData[0].name}.\n\nPlease repeat for other ${selectedData.length - 1} contacts.\n\nTip: Keep your message copied for quick sending!`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Landing Page Data Management</h1>

      {/* Status Message */}
      {sendingStatus.status !== 'idle' && (
        <div className={`mb-4 p-4 rounded-2xl ${
          sendingStatus.status === 'sending' ? 'bg-blue-100 text-blue-700' :
          sendingStatus.status === 'success' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {sendingStatus.message}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Type</label>
          <select
            className="w-full border rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type.replace(/-/g, ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input
            type="text"
            className="w-full border rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name, phone, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">&nbsp;</label>
          <button
            onClick={exportToExcel}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-2xl hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg"
          >
            📊 Export to Excel
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">&nbsp;</label>
          <div className="flex gap-2">
            <button
              onClick={openBulkEmailModal}
              disabled={selectedItems.length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              📧 Bulk Email ({selectedItems.length})
            </button>
            <button
              onClick={openBulkWhatsAppModal}
              disabled={selectedItems.length === 0}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-2xl hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              💬 Bulk WhatsApp ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Send Custom Email</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipients</label>
                <div className="bg-gray-50 p-3 rounded-2xl text-sm">
                  {selectedItems.length} contact(s) selected
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  className="w-full border rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <p className="text-xs text-gray-500 mb-2">Use [Name] to personalize with recipient`s name</p>
                <textarea
                  className="w-full border rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={10}
                  value={customEmailMessage}
                  onChange={(e) => setCustomEmailMessage(e.target.value)}
                  placeholder="Enter your email message here..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={sendBulkEmails}
                  className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-2xl hover:bg-blue-700 transition duration-200"
                >
                  Send Emails
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-2xl hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Send Custom WhatsApp Message</h2>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipients</label>
                <div className="bg-gray-50 p-3 rounded-2xl text-sm">
                  {selectedItems.length} contact(s) selected
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <p className="text-xs text-gray-500 mb-2">Use [Name] to personalize with recipient`s name</p>
                <textarea
                  className="w-full border rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={8}
                  value={customWhatsAppMessage}
                  onChange={(e) => setCustomWhatsAppMessage(e.target.value)}
                  placeholder="Enter your WhatsApp message here..."
                />
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-2xl text-sm text-yellow-800">
                <p className="font-medium mb-1">ℹ️ Note:</p>
                <p>WhatsApp messages will open in a new tab for each contact. You`ll need to click send manually in WhatsApp Web.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={sendBulkWhatsApp}
                  className="flex-1 bg-green-600 text-white px-6 py-2 rounded-2xl hover:bg-green-700 transition duration-200"
                >
                  Continue to WhatsApp
                </button>
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-2xl hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left rounded-tl-2xl">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left rounded-tr-2xl text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{item.whatsapp}</td>
                    <td className="px-6 py-4 text-gray-600">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                        {item.type.replace(/-/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => makePhoneCall(item.phone)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-xl text-sm hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg"
                          title="Call"
                        >
                          📞
                        </button>
                        <button
                          onClick={() => sendEmail(item.email, item.name)}
                          className="bg-red-600 text-white px-3 py-1 rounded-xl text-sm hover:bg-red-700 transition duration-200 shadow-md hover:shadow-lg"
                          title="Email"
                        >
                          ✉️
                        </button>
                        <button
                          onClick={() => sendWhatsApp(item.whatsapp, item.name)}
                          className="bg-green-600 text-white px-3 py-1 rounded-xl text-sm hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg"
                          title="WhatsApp"
                        >
                          💬
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-2xl disabled:opacity-50 hover:bg-gray-100 transition duration-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-2xl disabled:opacity-50 hover:bg-gray-100 transition duration-200"
              >
                Next
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Showing {data.length} of {data.length} entries
              </div>
              <div className="font-medium">
                Total selected: {selectedItems.length}
              </div>
              <div>
                Total records: {totalPages * 2000}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}