import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualizedPageGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateRowHeight?: number;
  containerClassName?: string;
  gridClassName?: string;
  emptyState?: React.ReactNode;
}

export function VirtualizedPageGrid<T>({
  items,
  renderItem,
  estimateRowHeight = 250,
  containerClassName = '',
  gridClassName = '',
  emptyState = null,
}: VirtualizedPageGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number>(4);

  // Measure container width and adjust columns responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateColumns = () => {
      const width = el.clientWidth;
      if (width < 520) {
        setColumns(2);
      } else if (width < 780) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();

    const resizeObserver = new ResizeObserver(() => {
      updateColumns();
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Compute row count
  const rowCount = useMemo(() => {
    return Math.ceil(items.length / columns);
  }, [items.length, columns]);

  // TanStack Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 2,
  });

  if (items.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto max-h-[75vh] min-h-[360px] pr-1.5 scrollbar-thin scrollbar-thumb-[#C7C9CC] dark:scrollbar-thumb-[#333333] ${containerClassName}`}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: '1rem',
                paddingBottom: '1rem',
              }}
              className={gridClassName}
            >
              {rowItems.map((item, colOffset) => {
                const itemIndex = startIndex + colOffset;
                return (
                  <React.Fragment key={itemIndex}>
                    {renderItem(item, itemIndex)}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
