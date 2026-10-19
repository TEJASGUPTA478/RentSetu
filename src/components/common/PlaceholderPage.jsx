import { Clock } from 'lucide-react';
import './PlaceholderPage.css';

/**
 * Honest "coming soon" placeholder for pages not yet built.
 * Shows the page name and a brief message.
 */
export default function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-inner">
        <div className="placeholder-icon">
          <Clock size={28} strokeWidth={1.5} />
        </div>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-desc">
          {description ||
            'This section is being built. It will be available in the next update.'}
        </p>
      </div>
    </div>
  );
}
