import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="relative z-10 mt-32 px-4 pb-10 sm:px-6 md:px-8">
    <div className="border-t border-ink/15 pt-10">
      <p className="meta text-graphite">let's work together</p>
      <a
        href="mailto:mvgago26@gmail.com"
        className="text-satin mt-4 block break-all font-display text-[7vw] leading-none tracking-[-0.02em] transition-opacity duration-700 hover:opacity-70 md:text-[4.2vw]"
      >
        mvgago26@gmail.com
      </a>

      <div className="mt-16 grid gap-6 text-graphite sm:grid-cols-3 sm:items-end">
        <nav className="meta flex gap-6">
          <Link to="/projects" className="hover:text-ink">projects</Link>
          <Link to="/artwork" className="hover:text-ink">artwork</Link>
          <Link to="/about" className="hover:text-ink">studio</Link>
        </nav>
        <span className="meta sm:text-center">available for projects — {new Date().getFullYear()}</span>
        <span className="meta sm:text-right">fugahaus © {new Date().getFullYear()}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
