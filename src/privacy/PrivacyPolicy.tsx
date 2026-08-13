import { Icon } from '../design/Icon';
import { PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from './content';
import './PrivacyPolicy.css';

/** US6 spec 002 (T028, FR-013): kebijakan privasi yang dapat diakses siswa/orang tua kapan saja. */
export function PrivacyPolicy({ onKembali }: { onKembali: () => void }) {
  return (
    <div className="privacy-page">
      <button type="button" className="privacy-page__back" onClick={onKembali}>
        <Icon name="chevron" width={14} height={14} />
        Kembali
      </button>

      <header className="privacy-page__header">
        <h1>Kebijakan Privasi</h1>
        <p>Terakhir diperbarui {PRIVACY_LAST_UPDATED} · Ditulis untuk dibaca siapa saja, tanpa istilah hukum yang rumit.</p>
      </header>

      <div className="privacy-page__sections">
        {PRIVACY_SECTIONS.map((section) => (
          <section key={section.judul} className="privacy-section">
            <h2>{section.judul}</h2>
            {section.paragraf.map((teks, index) => (
              <p key={index}>{teks}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
