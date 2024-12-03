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
    render?: (item: ItemType["key"], idx: number) => React.ReactNode;
  }[];
}
export const Table: React.FC<TableProps> = (props) => {
  const { items = [], fields = [], caption, footer } = props;
  return (
    <TableComponent>
      <TableCaption className="mt-8 mb-3">{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {fields.map((field) => (
            <TableHead
              className={`${field.className ?? ""} ${
                field.align ? `text-${field.align}` : ""
              }`}
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
                }`}
                key={field.key + item.id}
              >
                {field.render
                  ? field.render(item.key, idx)
                  : (item[field.key] as string | number | React.ReactNode)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>{footer}</TableFooter>
    </TableComponent>
  );
};
