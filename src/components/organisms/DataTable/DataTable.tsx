"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  className?: string;
  renderCell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  emptyStateText?: string;
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 5,
  emptyStateText = "No data available",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentData = data.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full bg-white border border-black/5 rounded-md overflow-hidden animate-scale-in">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fdfcf9] border-b border-black/5 select-none">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-xs font-medium text-[#8a7f75] ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {currentData.length > 0 ? (
              currentData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-[#f4f2ef] transition-colors duration-150 group"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3 text-sm text-[#2b2622] ${col.className || ""}`}
                    >
                      {col.renderCell
                        ? col.renderCell(row)
                        : (row[col.accessor as keyof T] as unknown as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-[#8a7f75] font-medium"
                >
                  {emptyStateText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-black/5 flex items-center justify-between bg-[#fdfcf9] text-xs font-medium text-[#6b5e52] select-none">
          <span>
            Showing <span className="text-[#1a1a1a] font-semibold">{startIndex + 1}</span> to{" "}
            <span className="text-[#1a1a1a] font-semibold">{endIndex}</span> of{" "}
            <span className="text-[#1a1a1a] font-semibold">{totalItems}</span> results
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              icon={<ChevronLeft size={14} />}
              className="py-1 px-2.5"
              width="w-auto"
            >
              Prev
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 rounded-md text-xs font-medium transition-all duration-150 ${
                    page === currentPage
                      ? "bg-[#d08873] text-white"
                      : "text-[#6b5e52] hover:bg-[#f4f2ef] hover:text-[#1a1a1a]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              icon={<ChevronRight size={14} />}
              iconPosition="right"
              className="py-1 px-2.5"
              width="w-auto"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
