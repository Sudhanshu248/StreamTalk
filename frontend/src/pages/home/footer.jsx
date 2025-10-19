import React from "react";
import "./footer.css"; // new CSS file for footer styles

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerBranding">
          <h4>StreamTalk</h4>
          <p>
            Bringing people together through seamless video calls,
            multilingual chat, and smart meeting tools.
          </p>
        </div>
 <nav className="footerNav">
  <p>Follow us</p>
     <div style={{ display: "flex", gap: "1rem" }}>
       <a
        href="https://www.linkedin.com/in/sudhanshusaini24"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow us on LinkedIn"
        className="iconLink"
      >
        <i class="fa-brands fa-square-linkedin"></i>
      </a>
      <a
        href="#"
        aria-label="Contact us via email"
        className="iconLink"
      >
        <i class="fa-solid fa-square-envelope"></i>
      </a>
      <a
        href="https://github.com/Sudhanshu248"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow us on GitHub"
        className="iconLink"
      >
        <i class="fa-brands fa-github"></i>
      </a>
     </div>
    </nav>
      </div>

      <div className="footerCopyright">
        &copy; {new Date().getFullYear()} StreamTalk. All rights reserved.
      </div>
    </footer>
  );
}