/** Converts stroops (1e7) to human-readable amount */
export function AmountDisplay({
  stroops,
  currency,
}: {
  stroops: string | number;
  currency: string;
}) {
  const amount = (Number(stroops) / 1e7).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <span>
      {amount} <span className="text-gray-500 text-sm">{currency}</span>
    </span>
  );
}
