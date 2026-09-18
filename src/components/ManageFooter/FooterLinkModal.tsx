import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { CloseIcon } from '@/assets/icons';

interface FooterLinkModalProps {
  initialLabel: string;
  initialUrl?: string;
  initialContent?: string;
  isAdding: boolean;
  onSave: (label: string, url: string, content: string) => Promise<void>;
  onClose: () => void;
}

const FooterLinkModal: React.FC<FooterLinkModalProps> = ({ 
  initialLabel, 
  initialUrl = '', 
  initialContent = '', 
  isAdding, 
  onSave, 
  onClose 
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [url] = useState(initialUrl);
  const [content, setContent] = useState(initialContent);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const handleSave = async () => {
    if (!label.trim()) {
      setErrorMsg('Link label is required');
      return;
    }

    const computedSlug = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const resolvedUrl = url.trim() || `/${computedSlug}`;

    setErrorMsg(null);
    setIsSaving(true);
    try {
      await onSave(label, resolvedUrl, content);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || 'Failed to save. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#3A3530] shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-[#3A3530]">
          <h2 className="text-xl font-bold text-white">
            {isAdding ? 'Add Footer Link' : `Edit Content: ${initialLabel}`}
          </h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Link Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isSaving}
              className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white disabled:opacity-50"
              placeholder="e.g. ABOUT US"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Page Content</label>
            <div className="bg-white rounded-lg overflow-hidden border border-[#3A3530]">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                readOnly={isSaving}
                className="text-black h-[300px]"
                style={{ height: '300px', paddingBottom: '42px' }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#3A3530] flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 bg-[#1C1C1C] rounded-b-2xl">
          {errorMsg ? (
            <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
              {errorMsg}
            </div>
          ) : (
            <div />
          )}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                'Save Content'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterLinkModal;
