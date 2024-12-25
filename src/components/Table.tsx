"use client";

import {
  TableBody,
  TableCaption,
  TableCell,
  Table as TableComponent,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { memo } from "react";

export type ItemType = {
  [K in TableProps["fields"][number]["key"]]: string | number;
} & { id: string | number; className?: string };

interface TableProps {
  items: ItemType[];
  caption?: string | React.ReactNode;
  footer?: string | React.ReactNode;
  onRowClick?: (item: ItemType) => void;
  fields: {
    key: string;
    label?: string;
    align?: "left" | "center" | "right";
    className?: string;
    render?: (value: any, item: ItemType, idx: number) => React.ReactNode;
  }[];
}

export const Table = memo<TableProps>((props) => {
  const { items = [], fields = [], caption, footer, onRowClick } = props;

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>, item: ItemType) => {
    // 如果点击的是按钮或链接，不触发行点击
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    onRowClick?.(item);
  };

  return (
    <TableComponent>
      {caption && <TableCaption className="mt-8 mb-3">{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {fields.map((field) => (
            <TableHead
              className={`${field.className ?? ""} ${
                field.align ? `text-${field.align}` : ""
              }`.trim()}
              key={field.key}
            >
              {field.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, idx) => (
          <TableRow 
            key={item.id}
            onClick={(e) => handleRowClick(e, item)}
            className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${item.className ?? ''}`.trim()}
          >
            {fields.map((field) => (
              <TableCell
                className={`${
                  field.align ? `text-${field.align}` : ""
                }`.trim()}
                key={`${field.key}-${item.id}`}
              >
                {field.render
                  ? field.render(item[field.key], item, idx)
                  : item[field.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      {footer && <TableFooter>{footer}</TableFooter>}
    </TableComponent>
  );
});

Table.displayName = "Table";
