import React, { useState } from 'react';
import type { Enquiry } from '@/hooks/useEnquiries';
import { useUpdateEnquiryStatusMutation } from '@/hooks/useEnquiries';

interface EnquiryDetailsModalProps {
  enquiry: Enquiry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryDetailsModal: React.FC<EnquiryDetailsModalProps> = ({
  enquiry,
  isOpen,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const updateStatusMutation = useUpdateEnquiryStatusMutation();

  if (!isOpen || !enquiry) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === enquiry.status) return;
    updateStatusMutation.mutate({ id: enquiry._id, status: newStatus });
  };

  const fullName = `${enquiry.firstName || ''} ${enquiry.lastName || ''}`.trim() || 'N/A';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? dateString : d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatDOB = (dobString?: string) => {
    if (!dobString) return '-';
    try {
      const d = new Date(dobString);
      return isNaN(d.getTime()) ? dobString : d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dobString;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'new') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s === 'in-progress' || s === 'in progress') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s === 'resolved' || s === 'completed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 'archived') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-pink-100 text-pink-800 border-pink-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#1C1819] border border-[#3A3530] text-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2E2829] bg-[#221D1E] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E1017D]/10 flex items-center justify-center text-[#E1017D]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h2 className="font-poppins font-bold text-lg text-white">
                Enquiry Details
              </h2>
              <p className="text-xs font-montserrat text-gray-400">
                ID: {enquiry._id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2A2425] hover:bg-[#383133] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Status & Type Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#262122] p-4 rounded-xl border border-[#3A3530]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-montserrat text-gray-400">Enquiry Type:</span>
              <span className="px-3 py-1 bg-[#E1017D]/20 text-[#E1017D] border border-[#E1017D]/30 rounded-full text-xs font-semibold font-poppins">
                {enquiry.enquiryType || 'General'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-montserrat text-gray-400">Status:</span>
              <select
                value={enquiry.status || 'new'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updateStatusMutation.isPending}
                className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer outline-none transition-all ${getStatusColor(
                  enquiry.status
                )}`}
              >
                <option value="new" className="bg-white text-black">New</option>
                <option value="in-progress" className="bg-white text-black">In Progress</option>
                <option value="resolved" className="bg-white text-black">Resolved</option>
                <option value="archived" className="bg-white text-black">Archived</option>
              </select>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="bg-[#241F20] rounded-xl p-5 border border-[#332D2E]">
            <h3 className="text-sm font-semibold font-poppins text-[#A3EBFF] mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-montserrat">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Full Name</span>
                <span className="font-semibold text-white">{fullName}</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-1">Location / Venue</span>
                <span className="font-semibold text-white">{enquiry.location || 'Not specified'}</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-1">Email Address</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${enquiry.email}?subject=Regarding your enquiry at TeamUp`}
                    className="font-medium text-[#A3EBFF] hover:underline truncate max-w-[220px]"
                    title={enquiry.email}
                  >
                    {enquiry.email || '-'}
                  </a>
                  {enquiry.email && (
                    <button
                      onClick={() => handleCopy(enquiry.email, 'email')}
                      className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-[#332D2E]"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-1">Phone Number</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="font-medium text-white hover:text-[#A3EBFF]"
                  >
                    {enquiry.phone || '-'}
                  </a>
                  {enquiry.phone && (
                    <button
                      onClick={() => handleCopy(enquiry.phone, 'phone')}
                      className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-[#332D2E]"
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-1">Date of Birth</span>
                <span className="font-medium text-gray-200">{formatDOB(enquiry.dateOfBirth)}</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-1">Source</span>
                <span className="font-medium text-gray-200">{enquiry.source || 'Website Contact Form'}</span>
              </div>
            </div>
          </div>

          {/* Message Card */}
          <div className="bg-[#241F20] rounded-xl p-5 border border-[#332D2E]">
            <h3 className="text-sm font-semibold font-poppins text-[#A3EBFF] mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Enquiry Message
            </h3>

            <div className="bg-[#181415] rounded-lg p-4 border border-[#332D2E] text-gray-200 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {enquiry.message || 'No message provided.'}
            </div>
          </div>

          {/* Timeline & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-montserrat text-gray-400">
            <div className="bg-[#241F20] p-3 rounded-lg border border-[#332D2E] flex justify-between">
              <span>Submitted On:</span>
              <span className="text-gray-200 font-medium">{formatDate(enquiry.createdAt)}</span>
            </div>
            <div className="bg-[#241F20] p-3 rounded-lg border border-[#332D2E] flex justify-between">
              <span>Last Updated:</span>
              <span className="text-gray-200 font-medium">{formatDate(enquiry.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2E2829] bg-[#221D1E] sticky bottom-0">
          <div className="text-xs text-gray-400">
            {updateStatusMutation.isPending && <span>Updating status...</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#443D3F] text-gray-300 hover:text-white hover:bg-[#332D2E] font-poppins text-sm transition"
            >
              Close
            </button>
            {/* <a
              href={`mailto:${enquiry.email}?subject=Regarding your enquiry at TeamUp`}
              className="px-5 py-2 rounded-lg bg-[#E1017D] hover:bg-[#c9016f] text-white font-poppins font-semibold text-sm transition flex items-center gap-2"
            >
              Reply via Email
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetailsModal;
