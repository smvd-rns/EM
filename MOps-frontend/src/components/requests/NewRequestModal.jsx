import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { requestService } from '../../services/requestService';

const NewRequestModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { addRequest } = useRequests();
    const [step, setStep] = useState(1);
    const [selectedDept, setSelectedDept] = useState(null);
    const [isUrgent, setIsUrgent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdToken, setCreatedToken] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    // Form State for backend DTO
    const [formData, setFormData] = useState({
        mobileNumber: user?.mobileNumber || '',
        itemDescription: '',
        urgencyReason: ''
    });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const departments = [
        {
            id: 'PLUMBING', label: 'Plumbing', desc: 'Leaks, pipe repairs, drainage issues',
            color: '#1a73e8', bg: '#e8f0fe',
            icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>
        },
        {
            id: 'CARPENTRY', label: 'Carpentry', desc: 'Furniture, cupboards, wooden fixtures',
            color: '#f9ab00', bg: '#fff8e1',
            icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
        },
        {
            id: 'ELECTRICAL', label: 'Electrical', desc: 'Wiring, switches, lighting, panels',
            color: '#c5221f', bg: '#fce8e6',
            icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>
        },
        {
            id: 'EM', label: 'EM', desc: 'General facility, civil, infrastructure',
            color: '#137333', bg: '#e6f4ea',
            icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2zm3 10h-2v-2h2v2zm0-4h-2V6h2v2z" /></svg>
        }
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
        else if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Valid 10-digit number required';
        if (!formData.itemDescription.trim()) newErrors.itemDescription = 'Description is required';
        if (isUrgent && !formData.urgencyReason.trim()) newErrors.urgencyReason = 'Justification is required for urgent requests';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const remaining = 4 - selectedFiles.length;
        if (remaining <= 0) {
            setErrors(prev => ({ ...prev, images: 'Maximum 4 photos allowed' }));
            return;
        }

        const validFiles = [];
        for (const file of files.slice(0, remaining)) {
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setErrors(prev => ({ ...prev, images: 'Only JPG and PNG files are allowed' }));
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, images: 'Each file must be under 5MB' }));
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            const newFiles = [...selectedFiles, ...validFiles];
            setSelectedFiles(newFiles);
            setErrors(prev => { const { images, ...rest } = prev; return rest; });

            // Generate previews
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }

        // Reset input so the same file can be selected again
        e.target.value = '';
    };

    const removeFile = (index) => {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const payload = {
                mobileNumber: formData.mobileNumber,
                itemDescription: formData.itemDescription,
                serviceDepartmentName: selectedDept.label,
                urgencyRequested: isUrgent,
                urgencyReason: isUrgent ? formData.urgencyReason : ''
            };

            const createdRequest = await requestService.createRequest(payload, selectedFiles);

            // Add the real request returned from backend to context
            addRequest(createdRequest);

            setCreatedToken(createdRequest.requestNumber);
            setIsSubmitting(false);
            setIsSuccess(true);
        } catch (error) {
            console.error('Failed to create request:', error);
            // General error or fallback
            setErrors({ submit: error.message || 'Failed to submit request. Please try again.' });
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedDept(null);
        setIsUrgent(false);
        setIsSuccess(false);
        setCreatedToken(null);
        setFormData({ mobileNumber: user?.mobileNumber || '', itemDescription: '', urgencyReason: '' });
        setErrors({});
        // Clean up image previews
        previews.forEach(url => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setPreviews([]);
        onClose();
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-[24px] w-full max-w-[680px] p-10 flex flex-col items-center justify-center text-center shadow-[0_24px_60px_rgba(0,0,0,0.15)] animate-fadeUp">
                    <div className="w-20 h-20 rounded-full bg-[#e6f4ea] flex items-center justify-center mb-6 text-[#137333]">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-[24px] font-['Google_Sans_Display',sans-serif] text-[#202124] mb-2">Request Submitted!</h2>
                    <p className="text-[14px] font-['Roboto',sans-serif] text-[#5f6368] mb-8">
                        Your token number is <strong>{createdToken || '#3802'}</strong>. You'll be notified at each stage.
                    </p>
                    <button
                        onClick={handleClose}
                        className="bg-[#137333] hover:bg-[#0d5023] text-white px-8 py-[12px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium transition-all"
                    >
                        View My Requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4 overflow-y-auto pt-20">
            <div className="bg-white rounded-[24px] w-full max-w-[680px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col relative my-auto animate-fadeUp overflow-hidden max-h-[90vh]">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 z-20 w-9 h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Sticky Header with Stepper */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-8 py-6 border-b border-[#dadce0]">
                    <div className="flex items-center justify-between max-w-[400px] mx-auto relative pt-2">
                        {/* Connector Background */}
                        <div className="absolute left-[60px] right-[60px] top-[18px] h-[2px] bg-[#dadce0] z-0"></div>

                        {/* Connector Progress */}
                        <div
                            className="absolute left-[60px] top-[18px] h-[2px] bg-[#1a73e8] z-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                            style={{ width: step === 2 ? 'calc(100% - 120px)' : '0%' }}
                        ></div>

                        {/* Step 1 Indicator */}
                        <div className="relative z-10 flex flex-col items-center gap-2 shrink-0">
                            {step === 2 ? (
                                <div className="w-8 h-8 rounded-full bg-[#137333] flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-[13px] font-medium transition-colors">
                                    1
                                </div>
                            )}
                            <span className={`text-[13px] font-['Google_Sans',sans-serif] whitespace-nowrap ${step === 2 ? 'text-[#137333]' : 'text-[#1a73e8] font-medium'}`}>Choose Department</span>
                        </div>

                        {/* Step 2 Indicator */}
                        <div className="relative z-10 flex flex-col items-center gap-2 shrink-0">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[13px] font-medium transition-colors ${step === 2
                                ? 'bg-[#1a73e8] border-[#1a73e8] text-white'
                                : 'bg-white border-[#dadce0] text-[#5f6368]'
                                }`}>
                                2
                            </div>
                            <span className={`text-[13px] font-['Google_Sans',sans-serif] whitespace-nowrap ${step === 2 ? 'text-[#1a73e8] font-medium' : 'text-[#5f6368]'}`}>Request Details</span>
                        </div>
                    </div>
                </div>

                {/* Content Area (Scrollable sliding container) */}
                <div className="flex-grow overflow-x-hidden overflow-y-auto custom-scrollbar">
                    <div
                        className="flex w-[200%] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ transform: `translateX(-${(step - 1) * 50}%)` }}
                    >
                        {/* STEP 1: Choose Department */}
                        <div className="w-1/2 flex-shrink-0 px-10 py-6 max-w-[680px] mx-auto flex flex-col">
                            <div className="max-w-[560px] mx-auto w-full flex-grow">
                                <h2 className="text-[28px] font-['Google_Sans_Display',sans-serif] text-[#202124] tracking-[-0.5px] text-center mb-1">Select a Department</h2>
                                <p className="text-[14px] font-['Roboto',sans-serif] text-[#5f6368] text-center mb-6">Choose the department responsible for your request.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {departments.map((dept) => {
                                        const isSelected = selectedDept?.id === dept.id;
                                        return (
                                            <div
                                                key={dept.id}
                                                onClick={() => setSelectedDept(dept)}
                                                className={`cursor-pointer bg-white rounded-[16px] p-6 relative transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSelected
                                                    ? `border-2 border-[#1a73e8] bg-[#e8f0fe] shadow-sm`
                                                    : `border-[1.5px] border-[#dadce0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]`
                                                    }`}
                                                style={{ borderColor: isSelected ? '#1a73e8' : undefined }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) e.currentTarget.style.borderColor = dept.color;
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) e.currentTarget.style.borderColor = '#dadce0';
                                                }}
                                            >
                                                {/* Checkmark Chip */}
                                                {isSelected && (
                                                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#1a73e8] flex items-center justify-center text-white">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}

                                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: dept.bg, color: dept.color }}>
                                                    {dept.icon}
                                                </div>
                                                <h3 className="text-[16px] font-['Google_Sans',sans-serif] font-medium text-[#202124]">{dept.label}</h3>
                                                <p className="text-[13px] font-['Roboto',sans-serif] text-[#5f6368] mt-1">{dept.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: Request Details */}
                        <div className="w-1/2 flex-shrink-0 px-8 py-8 max-w-[680px] mx-auto">
                            {/* Read-only Header */}
                            <div className="flex items-center gap-4 mb-6 bg-[#f8f9fa] p-4 rounded-[16px] border border-[#f1f3f4] shadow-sm">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e8f0fe] text-[#1a73e8]">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-[18px] font-['Google_Sans',sans-serif] font-medium text-[#202124]">
                                        Project & {selectedDept?.label || 'Department'}
                                    </div>
                                    <div className="text-[13px] font-['Roboto',sans-serif] text-[#5f6368]">ISKCON NVCC, Pune</div>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                {/* Row 1 */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-medium font-['Google_Sans',sans-serif] text-[#5f6368] mb-1.5">Department Name</label>
                                        <div className="w-full h-12 flex items-center">
                                            {selectedDept ? (
                                                <span
                                                    className="inline-flex px-4 py-1.5 rounded-[50px] text-[13px] font-medium"
                                                    style={{ backgroundColor: selectedDept.bg, color: selectedDept.color }}
                                                >
                                                    {selectedDept.label}
                                                </span>
                                            ) : (
                                                <span className="text-[#5f6368] italic text-[14px]">Select in Step 1</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-['Google_Sans',sans-serif] font-medium text-[#5f6368] mb-1.5">Contact No.</label>
                                        <input
                                            type="tel"
                                            placeholder="10-digit mobile number"
                                            value={formData.mobileNumber}
                                            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                            className={`w-full h-12 px-3 border-[1.5px] ${errors.mobileNumber ? 'border-[#c5221f]' : 'border-[#dadce0]'} rounded-[8px] text-[15px] font-['Roboto',sans-serif] text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:shadow-[0_0_0_3px_rgba(26,115,232,0.12)] placeholder-[#9aa0a6]`}
                                        />
                                        {errors.mobileNumber && <p className="text-[#c5221f] text-[12px] mt-1">{errors.mobileNumber}</p>}
                                    </div>
                                    <div className="flex items-end text-[12px] text-[#5f6368] pb-4">
                                        <p>Your name and contact details are auto-captured.</p>
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label className="block text-[13px] font-['Google_Sans',sans-serif] font-medium text-[#5f6368] mb-1.5">Job Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe the work needed in detail — e.g., Cupboard to make safe for phones, 8 items"
                                        value={formData.itemDescription}
                                        onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                                        className={`w-full p-3 border-[1.5px] ${errors.itemDescription ? 'border-[#c5221f]' : 'border-[#dadce0]'} rounded-[8px] text-[15px] font-['Roboto',sans-serif] text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:shadow-[0_0_0_3px_rgba(26,115,232,0.12)] placeholder-[#9aa0a6] resize-none`}
                                    />
                                    <div className="flex justify-between mt-1">
                                        {errors.itemDescription ? (
                                            <p className="text-[#c5221f] text-[12px] font-['Roboto',sans-serif]">{errors.itemDescription}</p>
                                        ) : (
                                            <p></p> // Placeholder for flex formatting
                                        )}
                                        <div className="text-[12px] text-[#5f6368] font-['Roboto',sans-serif]">{formData.itemDescription.length}/500</div>
                                    </div>
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-[13px] font-['Google_Sans',sans-serif] font-medium text-[#5f6368] mb-1.5">Upload Photos (optional)</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/jpeg,image/png"
                                        multiple
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => selectedFiles.length < 4 && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-[12px] p-6 flex flex-col items-center justify-center transition-colors group ${
                                            selectedFiles.length >= 4
                                                ? 'border-[#dadce0] bg-[#f8f9fa] cursor-not-allowed opacity-60'
                                                : 'border-[#dadce0] bg-[#fafafa] hover:bg-[#f8f9fa] cursor-pointer hover:border-[#1a73e8]'
                                        }`}
                                    >
                                        <svg className="w-8 h-8 text-[#5f6368] group-hover:text-[#1a73e8] mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        </svg>
                                        <div className="text-[14px] font-['Google_Sans',sans-serif] text-[#202124] mb-1">
                                            {selectedFiles.length >= 4 ? 'Maximum photos reached' : 'Click to browse photos'}
                                        </div>
                                        <div className="text-[12px] font-['Roboto',sans-serif] text-[#5f6368]">JPG, PNG up to 5MB each · {selectedFiles.length}/4 photos</div>
                                    </div>
                                    {errors.images && <p className="text-[#c5221f] text-[12px] mt-1">{errors.images}</p>}

                                    {/* Image Previews */}
                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3 mt-3">
                                            {previews.map((src, idx) => (
                                                <div key={idx} className="relative group/img rounded-[10px] overflow-hidden border border-[#dadce0] aspect-square bg-[#f8f9fa]">
                                                    <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(idx)}
                                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1.5 py-0.5 truncate font-['Roboto',sans-serif]">
                                                        {selectedFiles[idx]?.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Urgent Toggle */}
                                <div className="bg-[#f8f9fa] border border-[#f1f3f4] rounded-[12px] p-4 flex flex-col mt-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-[14px] font-['Google_Sans',sans-serif] font-medium text-[#202124]">Mark as Urgent</div>
                                            <div className="text-[12px] font-['Roboto',sans-serif] text-[#5f6368]">Only use if work cannot wait</div>
                                        </div>
                                        {/* Custom Toggle Switch */}
                                        <button
                                            type="button"
                                            onClick={() => setIsUrgent(!isUrgent)}
                                            className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${isUrgent ? 'bg-[#c5221f]' : 'bg-[#dadce0]'}`}
                                        >
                                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${isUrgent ? 'transform translate-x-5' : ''}`}></div>
                                        </button>
                                    </div>

                                    {/* Urgent Justification (sliding down) */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isUrgent ? 'max-h-32 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <textarea
                                            rows={2}
                                            placeholder="Explain why this is urgent..."
                                            value={formData.urgencyReason}
                                            onChange={(e) => setFormData({ ...formData, urgencyReason: e.target.value })}
                                            className={`w-full p-2 border-[1.5px] ${errors.urgencyReason ? 'border-[#c5221f]' : 'border-[#dadce0] focus:border-[#c5221f]'} rounded-[8px] text-[14px] font-['Roboto',sans-serif] text-[#202124] focus:outline-none focus:shadow-[0_0_0_3px_rgba(197,34,31,0.12)] resize-none`}
                                        />
                                        {errors.urgencyReason && <p className="text-[#c5221f] text-[12px] mt-1">{errors.urgencyReason}</p>}
                                    </div>
                                </div>

                                {/* Official Use Only Section */}
                                <div className="pt-6 relative">
                                    <div className="absolute inset-0 flex items-center top-[-10px]">
                                        <div className="w-full border-t border-[#dadce0]"></div>
                                    </div>
                                    <div className="relative flex justify-center mb-6 top-[-22px]">
                                        <span className="px-3 bg-white text-[12px] font-['Roboto',sans-serif] text-[#bdc1c6] tracking-[1px] uppercase bg-opacity-0">
                                            For Official Use Only
                                        </span>
                                    </div>

                                    <div className="bg-[#f8f9fa] rounded-[12px] p-5 opacity-80 pointer-events-none">
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-[12px] font-['Google_Sans',sans-serif] text-[#bdc1c6] mb-1">Estimated Cost</label>
                                                <div className="h-8 border border-dashed border-[#dadce0] rounded-[6px] bg-white text-transparent"></div>
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-['Google_Sans',sans-serif] text-[#bdc1c6] mb-1">Estimated Time</label>
                                                <div className="h-8 border border-dashed border-[#dadce0] rounded-[6px] bg-white text-transparent"></div>
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-['Google_Sans',sans-serif] text-[#bdc1c6] mb-1">Work Completed Date</label>
                                                <div className="h-8 border border-dashed border-[#dadce0] rounded-[6px] bg-white text-transparent"></div>
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-['Google_Sans',sans-serif] text-[#bdc1c6] mb-1">IDT Amount</label>
                                                <div className="h-8 border border-dashed border-[#dadce0] rounded-[6px] bg-white text-transparent"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-['Google_Sans',sans-serif] text-[#bdc1c6] mb-1">Sign (After Work Completed)</label>
                                            <div className="h-8 border border-dashed border-[#dadce0] rounded-[6px] bg-white text-transparent"></div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                            {errors.submit && (
                                <div className="mt-4 p-3 bg-[#fce8e6] border border-[#c5221f] rounded-[8px] text-[#c5221f] text-[13px] text-center">
                                    {errors.submit}
                                </div>
                            )}
                        </div>
                    </div >
                </div >

                {/* Sticky Footer Actions */}
                < div className="sticky bottom-0 bg-white border-t border-[#dadce0] p-6 flex justify-between items-center z-10 w-full mt-auto" >
                    {step === 1 ? (
                        <>
                            <div className="w-20"></div> {/* Spacer for alignment */}
                            <button
                                onClick={handleNext}
                                disabled={!selectedDept}
                                className={`px-6 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium transition-all flex items-center gap-2 ${selectedDept
                                    ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-md cursor-pointer'
                                    : 'bg-[#1a73e8] text-white opacity-40 cursor-not-allowed'
                                    }`}
                            >
                                Continue to Details
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleBack}
                                className="px-6 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-colors flex items-center gap-1 border border-transparent"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium transition-all shadow-md flex items-center justify-center min-w-[140px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </>
                    )}
                </div >

            </div >
        </div >
    );
};

export default NewRequestModal;
