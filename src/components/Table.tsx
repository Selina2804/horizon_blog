// src/components/Table.tsx
type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
};

export default function Table<T extends Record<string, any>>({
  data,
  columns,
}: {
  data: T[];
  columns?: Column<T>[];
}) {
  const cols: Column<T>[] =
    columns ??
    Object.keys(data[0] ?? {}).map((k) => ({
      key: k as keyof T,
      header: String(k),
    }));

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {cols.map((c) => (
              <th
                key={String(c.key)}
                className="text-left px-4 py-3 font-semibold"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {cols.map((c) => (
                <td key={String(c.key)} className="px-4 py-3">
                  {c.render ? c.render(row[c.key], row) : String(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
