const features = [
  {
    title: 'JWT Authentication',
    description: 'Passport.js with role-based access control, refresh tokens, and email verification.',
  },
  {
    title: 'Request Validation',
    description: 'Joi schemas with a validate middleware for type-safe request handling.',
  },
  {
    title: 'API Documentation',
    description: 'Interactive Swagger docs auto-generated from route definitions.',
  },
  {
    title: 'Testing Suite',
    description: 'Jest + Supertest with integration and unit test coverage.',
  },
  {
    title: 'Docker Ready',
    description: 'Multi-stage Dockerfile with dev and production compose configs.',
  },
  {
    title: 'CI/CD Pipeline',
    description: 'GitHub Actions with semantic-release for automated versioning.',
  },
];

export default function Home() {
  return (
    <main style={styles.main}>
      <div style={styles.hero}>
        <div style={styles.badge}>Open Source</div>
        <h1 style={styles.title}>
          <span style={styles.titleAccent}>GSoft</span> Node.js Monorepo
        </h1>
        <p style={styles.subtitle}>
          A production-ready starter for building RESTful APIs with Express, MongoDB, JWT auth, validation, testing, Docker,
          and more.
        </p>
        <div style={styles.buttons}>
          <a href="/v1/docs" style={{ ...styles.button, ...styles.buttonPrimary }}>
            API Docs
            <span style={styles.arrow}>&rarr;</span>
          </a>
          <a
            href="https://github.com/nicchongwb/nodejs-boilerplate"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            GitHub
          </a>
        </div>
      </div>

      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>What&apos;s Included</h2>
        <div style={styles.grid}>
          {features.map((feature) => (
            <div key={feature.title} style={styles.card}>
              <h3 style={styles.cardTitle}>{feature.title}</h3>
              <p style={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.stack}>
        <h2 style={styles.sectionTitle}>Tech Stack</h2>
        <div style={styles.tags}>
          {['Node.js 24', 'Express', 'MongoDB', 'Passport.js', 'Joi', 'Jest', 'Docker', 'pnpm', 'ESLint 9', 'Prettier'].map(
            (tech) => (
              <span key={tech} style={styles.tag}>
                {tech}
              </span>
            ),
          )}
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>Built with Next.js &middot; MIT License</p>
      </footer>
    </main>
  );
}

const styles = {
  main: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '80px 24px 48px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '80px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#3b82f6',
    border: '1px solid #262626',
    borderRadius: '999px',
    marginBottom: '24px',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: '16px',
  },
  titleAccent: {
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    color: '#888',
    maxWidth: '600px',
    margin: '0 auto 32px',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '8px',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  buttonPrimary: {
    background: '#3b82f6',
    color: '#fff',
  },
  buttonSecondary: {
    background: 'transparent',
    color: '#ededed',
    border: '1px solid #262626',
  },
  arrow: {
    fontSize: '16px',
  },
  features: {
    marginBottom: '64px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '32px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    padding: '24px',
    background: '#141414',
    border: '1px solid #262626',
    borderRadius: '12px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '8px',
  },
  cardDescription: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: '#888',
  },
  stack: {
    marginBottom: '64px',
    textAlign: 'center',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },
  tag: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    background: '#141414',
    border: '1px solid #262626',
    borderRadius: '999px',
    color: '#ededed',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '32px',
    borderTop: '1px solid #262626',
  },
  footerText: {
    fontSize: '13px',
    color: '#888',
  },
};
