export function Step1_Prompt({ prompt, judul }: { prompt: string; judul: string }) {
  return (
    <div className="langkah">
      <p className="t-action-sm langkah__label">{judul}</p>
      <p className="langkah__prompt">{prompt}</p>
    </div>
  );
}
