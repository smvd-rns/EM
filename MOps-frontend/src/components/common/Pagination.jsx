import React from 'react';

const Pagination = ({
    currentPage = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 30, 50]
}) => {
    if (totalItems === 0) return null;

    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Generate page numbers array with intelligent truncation
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (end < totalPages) {
                if (end < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-[13px] text-on-surface-variant font-ui border-t border-outline/30 mt-4">
            {/* Info and Page Size Selector */}
            <div className="flex flex-wrap items-center gap-4">
                <span>
                    Showing <strong className="text-on-surface">{startItem}</strong> to{' '}
                    <strong className="text-on-surface">{endItem}</strong> of{' '}
                    <strong className="text-on-surface">{totalItems}</strong> items
                </span>

                <div className="flex items-center gap-2">
                    <label htmlFor="pageSizeSelect" className="text-slate-500 font-medium">Per page:</label>
                    <select
                        id="pageSizeSelect"
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="h-8 px-2 rounded-lg border border-outline/50 bg-surface text-on-surface font-semibold text-[12px] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                        {pageSizeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt} / page</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="h-8 px-3 rounded-lg border border-outline/40 bg-surface text-on-surface font-medium hover:bg-surface-variant/80 disabled:opacity-40 transition-all cursor-pointer"
                    title="Previous page"
                >
                    ‹ Prev
                </button>

                {getPageNumbers().map((p, idx) => (
                    p === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-slate-400">...</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`h-8 min-w-[32px] px-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                                currentPage === p
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'border border-outline/30 bg-surface text-on-surface hover:bg-surface-variant/80'
                            }`}
                        >
                            {p}
                        </button>
                    )
                ))}

                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="h-8 px-3 rounded-lg border border-outline/40 bg-surface text-on-surface font-medium hover:bg-surface-variant/80 disabled:opacity-40 transition-all cursor-pointer"
                    title="Next page"
                >
                    Next ›
                </button>
            </div>
        </div>
    );
};

export default Pagination;
