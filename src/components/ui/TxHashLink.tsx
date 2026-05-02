export function TxHashLink({ hash }: { hash: string }) {
  const short = `${hash.slice(0, 8)}…${hash.slice(-8)}`;
  return (
    <a
      href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-sm text-indigo-600 hover:underline"
      title={hash}
    >
      {short}
    </a>
  );
}
