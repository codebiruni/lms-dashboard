/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import GETDATA from '@/app/default/functions/GetData';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Phone, Mail, MessageCircle, Download, Filter, Search, 
  CheckSquare, Square, X, Send, Users, FileSpreadsheet,
  Loader2, ChevronLeft, ChevronRight, Eye, EyeOff,
  AlertCircle, CheckCircle, Clock, Trash2, RefreshCw
} from 'lucide-react';

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
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  
  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState('');
  
  // Status states
  const [sendingStatus, setSendingStatus] = useState<{
    type: 'email' | 'whatsapp';
    status: 'idle' | 'sending' | 'success' | 'error';
    message: string;
    progress?: { current: number; total: number };
  }>({ type: 'email', status: 'idle', message: '' });

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 4000);
  };

  useEffect(() => {
    fetchData();
  }, [filterType, searchTerm, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/v1/landing-page-data?limit=50&page=${currentPage}`;
      if (filterType) {
        url += `&type=${filterType}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response: ApiResponse = await GETDATA(url);
      
      if (response.success && response.data) {
        setData(response.data.data);
        setTotalPages(Math.ceil(response.data.meta.total / 50));
        setTotalRecords(response.data.meta.total);
        
        const uniqueTypes = Array.from(new Set(response.data.data.map(item => item.type)));
        setAvailableTypes(uniqueTypes);
      } else {
        showToast('error', 'Failed to fetch data');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('error', 'Error loading data');
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
    const selectedData = selectedItems.length > 0 
      ? data.filter(item => selectedItems.includes(item._id))
      : data;

    if (selectedData.length === 0) {
      showToast('warning', 'No data to export');
      return;
    }

    const exportData = selectedData.map(item => ({
      'Name': item.name,
      'Phone': item.phone,
      'WhatsApp': item.whatsapp,
      'Email': item.email,
      'Address': item.address,
      'Type': item.type.replace(/-/g, ' ').toUpperCase(),
      'Created At': new Date(item.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LandingPageData');
    XLSX.writeFile(wb, `landing_page_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showToast('success', `Exported ${exportData.length} records to Excel`);
  };

  const makePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Send single email
  const sendSingleEmail = async (email: string, name: string) => {
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
          html: message.replace(/\n/g, '<br/>').replace(/\[Name\]/g, name)
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('success', `Email sent successfully to ${name}!`);
        setSendingStatus({ type: 'email', status: 'idle', message: '' });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      showToast('error', `Failed to send email to ${name}`);
      setSendingStatus({ type: 'email', status: 'idle', message: '' });
    }
  };

  // Send single WhatsApp
  const sendSingleWhatsApp = (phoneNumber: string, name: string) => {
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '880' + cleanNumber.substring(1);
    } else if (!cleanNumber.startsWith('880')) {
      cleanNumber = '880' + cleanNumber;
    }
    
    const customMessage = prompt('Enter your WhatsApp message:', 
      `Hello ${name},\n\nThank you for your interest in our services. We would like to connect with you.\n\nBest regards,\nYour Team`
    );
    
    if (!customMessage) return;
    
    const personalizedMessage = customMessage.replace(/\[Name\]/g, name);
    const encodedMessage = encodeURIComponent(personalizedMessage);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Bulk email modal
  const openBulkEmailModal = () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      showToast('error', 'Please select at least one item to send emails');
      return;
    }
    setCustomEmailSubject('Important Information from Our Team');
    setCustomEmailMessage(
      `Dear [Name],\n\nThank you for your interest in our services. We would like to connect with you.\n\nPlease feel free to reply to this email or contact us directly.\n\nBest regards,\nYour Team`
    );
    setShowEmailModal(true);
  };

  // Bulk WhatsApp modal
  const openBulkWhatsAppModal = () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      showToast('error', 'Please select at least one item to send WhatsApp messages');
      return;
    }
    setCustomWhatsAppMessage(
      `Hello [Name],\n\nThank you for your interest in our services. We would like to connect with you.\n\nBest regards,\nYour Team`
    );
    setShowWhatsAppModal(true);
  };

  // Send bulk emails
  const sendBulkEmails = async () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      showToast('error', 'No recipients selected');
      return;
    }

    if (!customEmailSubject.trim()) {
      showToast('error', 'Please enter an email subject');
      return;
    }

    if (!customEmailMessage.trim()) {
      showToast('error', 'Please enter an email message');
      return;
    }

    setShowEmailModal(false);
    setSendingStatus({ 
      type: 'email', 
      status: 'sending', 
      message: `Sending emails to ${selectedData.length} recipients...`,
      progress: { current: 0, total: selectedData.length }
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedData.length; i++) {
      const item = selectedData[i];
      let personalizedMessage = customEmailMessage.replace(/\[Name\]/g, item.name);
      personalizedMessage = personalizedMessage.replace(/\n/g, '<br/>');
      
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: item.email,
            subject: customEmailSubject,
            html: personalizedMessage
          })
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to send to ${item.email}:`, result.error);
        }
      } catch (error) {
        failCount++;
        console.error(`Error sending to ${item.email}:`, error);
      }

      setSendingStatus(prev => ({
        ...prev,
        progress: { current: i + 1, total: selectedData.length },
        message: `Sent ${successCount}/${selectedData.length} emails...`
      }));
    }

    if (failCount === 0) {
      showToast('success', `Successfully sent ${successCount} emails to all recipients!`);
    } else {
      showToast('warning', `Sent ${successCount} emails. Failed: ${failCount}`);
    }
    
    setSendingStatus({ type: 'email', status: 'idle', message: '' });
  };

  // Send bulk WhatsApp
  const sendBulkWhatsApp = () => {
    const selectedData = data.filter(item => selectedItems.includes(item._id));
    if (selectedData.length === 0) {
      showToast('error', 'No recipients selected');
      return;
    }

    if (!customWhatsAppMessage.trim()) {
      showToast('error', 'Please enter a WhatsApp message');
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
      const encodedMessage = encodeURIComponent(personalizedMessage);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
    
    if (selectedData.length > 1) {
      showToast('info', `WhatsApp link opened for ${selectedData[0].name}. Please repeat for other ${selectedData.length - 1} contacts.`);
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'admission': 'bg-purple-100 text-purple-800',
      'consultation': 'bg-blue-100 text-blue-800',
      'support': 'bg-green-100 text-green-800',
      'feedback': 'bg-yellow-100 text-yellow-800',
      'complaint': 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Get status color for sending status
  const getStatusColor = () => {
    switch (sendingStatus.status) {
      case 'sending': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'success': return 'bg-green-50 border-green-200 text-green-700';
      case 'error': return 'bg-red-50 border-red-200 text-red-700';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`rounded-2xl shadow-xl p-4 flex items-center gap-3 min-w-75 ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200' :
            toast.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            {toast.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
            {toast.type === 'info' && <Clock className="h-5 w-5 text-blue-600" />}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="hover:opacity-70">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sending Status Bar */}
      {sendingStatus.status === 'sending' && (
        <div className={`fixed bottom-4 right-4 z-50 rounded-2xl shadow-xl p-4 min-w-[320px] ${getStatusColor()}`}>
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium">{sendingStatus.message}</p>
              {sendingStatus.progress && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${(sendingStatus.progress.current / sendingStatus.progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {sendingStatus.progress.current} / {sendingStatus.progress.total}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Landing Page Data Management
          </h1>
          <p className="text-gray-500 mt-2">Manage and communicate with your leads</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Page</p>
                <p className="text-2xl font-bold text-gray-900">{currentPage} / {totalPages}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Selected Items</p>
                <p className="text-2xl font-bold text-gray-900">{selectedItems.length}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Types</p>
                <p className="text-2xl font-bold text-gray-900">{availableTypes.length}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Filter className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={exportToExcel}
                className="w-full bg-linear-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={fetchData}
                className="w-full bg-gray-600 text-white px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={openBulkEmailModal}
              disabled={selectedItems.length === 0}
              className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Bulk Email ({selectedItems.length})
            </button>
            <button
              onClick={openBulkWhatsAppModal}
              disabled={selectedItems.length === 0}
              className="flex-1 bg-linear-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Bulk WhatsApp ({selectedItems.length})
            </button>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl bg-linear-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Send Custom Email</h2>
                    <p className="text-sm text-gray-500 mt-1">Send personalized emails to selected recipients</p>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 border border-gray-200">
                    {selectedItems.length} contact(s) selected
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customEmailSubject}
                    onChange={(e) => setCustomEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                    <span className="font-medium">💡 Tip:</span> Use [Name] to personalize with recipient`s name
                  </p>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={10}
                    value={customEmailMessage}
                    onChange={(e) => setCustomEmailMessage(e.target.value)}
                    placeholder="Enter your email message here..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={sendBulkEmails}
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Emails
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200"
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
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl bg-linear-to-r from-green-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Send WhatsApp Message</h2>
                    <p className="text-sm text-gray-500 mt-1">Send personalized WhatsApp messages to selected recipients</p>
                  </div>
                  <button
                    onClick={() => setShowWhatsAppModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 border border-gray-200">
                    {selectedItems.length} contact(s) selected
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <p className="text-xs text-green-600 mb-2 flex items-center gap-1">
                    <span className="font-medium">💡 Tip:</span> Use [Name] to personalize with recipient`s name
                  </p>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    rows={8}
                    value={customWhatsAppMessage}
                    onChange={(e) => setCustomWhatsAppMessage(e.target.value)}
                    placeholder="Enter your WhatsApp message here..."
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-800 border border-blue-200">
                  <p className="font-medium mb-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    ℹ️ Important Note:
                  </p>
                  <p>WhatsApp messages will open in a new tab for the first contact. You`ll need to click send manually in WhatsApp Web/App. After sending, come back and the next contact will open automatically.</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={sendBulkWhatsApp}
                    className="flex-1 bg-linear-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Continue to WhatsApp
                  </button>
                  <button
                    onClick={() => setShowWhatsAppModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200"
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
          <div className="bg-white rounded-2xl shadow-sm p-12">
            <div className="text-center">
              <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left w-12">
                        <button
                          onClick={handleSelectAll}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {selectAll ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">WhatsApp</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {data.map((item, index) => (
                      <tr key={item._id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleSelectItem(item._id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {selectedItems.includes(item._id) ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.address?.substring(0, 30)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{item.phone}</td>
                        <td className="px-6 py-4 text-gray-700">{item.whatsapp}</td>
                        <td className="px-6 py-4 text-gray-700 max-w-50 truncate">{item.email}</td>
                        <td className="px-6 py-4">
  <a
    href={`https://www.quranic-verse.com/pages/${item.type.toLowerCase()}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${getTypeBadgeColor(
        item.type
      )}`}
    >
      {item.type.replace(/-/g, ' ').toUpperCase()}
    </span>
  </a>
</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => makePhoneCall(item.phone)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Call"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => sendSingleEmail(item.email, item.name)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => sendSingleWhatsApp(item.whatsapp, item.name)}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No data found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="mt-4 p-4 bg-linear-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-600">
                  Showing {data.length} of {totalRecords} entries
                </div>
                <div className="font-medium text-gray-900">
                  Selected: {selectedItems.length} items
                </div>
                <div className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}