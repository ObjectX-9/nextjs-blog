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
  fields: {
    key: string;
    label?: string;
    align?: "left" | "center" | "right";
    className?: string;
    render?: (value: any, item: ItemType, idx: number) => React.ReactNode;
  }[];
}

export const Table = memo<TableProps>((props) => {
  const { items = [], fields = [], caption, footer } = props;

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
          <TableRow key={item.id}>
            {fields.map((field) => (
              <TableCell
                className={`${item.className ?? ""} ${
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
