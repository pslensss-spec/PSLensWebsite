import { ProfileAvatar } from '../components/ProfileAvatar'
import { googleFormConfigured, googleFormEmbedUrl, googleFormUrl } from '../lib/googleForm'

export function ContactPage() {
  const embed = googleFormEmbedUrl()

  return (
    <div>
      <div className="header-row fade-in">
        <div>
          <p className="eyebrow">Studio desk</p>
          <h1 className="page-title">Contact</h1>
        </div>
        <ProfileAvatar />
      </div>

      <section className="card fade-in" style={{ marginBottom: 14 }}>
        <p className="small muted" style={{ margin: 0 }}>
          Share your details and we’ll get back to you about Studio 04 reel shoots.
        </p>
      </section>

      {embed ? (
        <div className="fade-in" style={{ borderRadius: 20, overflow: 'hidden', background: '#fff' }}>
          <iframe
            title="PSLens contact form"
            src={embed}
            width="100%"
            height="720"
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            style={{ display: 'block', border: 'none', minHeight: 640 }}
          >
            Loading…
          </iframe>
          {googleFormUrl ? (
            <p className="small muted" style={{ padding: '10px 12px', margin: 0 }}>
              Form not loading?{' '}
              <a href={googleFormUrl} target="_blank" rel="noreferrer">
                Open in a new tab
              </a>
            </p>
          ) : null}
        </div>
      ) : (
        <section className="card fade-in">
          <p style={{ marginTop: 0 }}>
            <strong>Google Form not configured yet.</strong>
          </p>
          <p className="small muted">
            Set <code>VITE_GOOGLE_FORM_URL</code> in Netlify (and local <code>.env</code>) to your
            form link, then redeploy. Example:
          </p>
          <p className="small" style={{ wordBreak: 'break-all' }}>
            https://docs.google.com/forms/d/e/…/viewform
          </p>
          {!googleFormConfigured ? null : (
            <p className="small muted">The URL looks invalid — paste the “viewform” share link.</p>
          )}
        </section>
      )}
    </div>
  )
}
