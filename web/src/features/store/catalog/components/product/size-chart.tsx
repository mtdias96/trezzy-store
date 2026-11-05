import type { ProductDetail } from '@/features/store/catalog/model/types';

type SizeChartProps = {
  chart: NonNullable<ProductDetail['sizeChart']>;
};

export function SizeChart({ chart }: SizeChartProps) {
  const [sizeHeader, ...measureHeaders] = chart.headers;

  return (
    <div className="overflow-x-auto rounded-2xl border border-paper-line">
      <table className="w-full text-left text-body-sm">
        <caption className="sr-only">Tabela de medidas</caption>
        <thead className="bg-paper-stone">
          <tr>
            <th scope="col" className="px-4 py-3 font-bold text-ink">{sizeHeader}</th>
            {measureHeaders.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-bold whitespace-nowrap text-ink">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-paper-line">
          {chart.rows.map(([size, ...measures]) => (
            <tr key={size}>
              <th scope="row" className="px-4 py-3 font-bold text-ink">{size}</th>
              {measures.map((measure, index) => (
                <td key={index} className="px-4 py-3 text-gray-800">{measure}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
