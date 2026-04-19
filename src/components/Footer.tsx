export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <a
          className="footer-link portfolio-link"
          href="https://alejosworkstuff.github.io/portfolio/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Portfolio
        </a>
        <a
          className="social-bubble social-github"
          href="https://github.com/alejosworkstuff"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          title="GitHub"
        >
          <img src="/assets/icons/github.svg" alt="" className="social-icon" />
        </a>
        <a
          className="social-bubble social-linkedin"
          href="https://www.linkedin.com/in/alejo-castillo-0b02b73b0/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
          title="LinkedIn"
        >
          <img src="/assets/icons/linkedin.svg" alt="" className="social-icon" />
        </a>
      </div>
    </footer>
  );
}