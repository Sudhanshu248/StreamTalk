import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import Hero from "./hero";
import Footer from "./footer.jsx";

export default function LandingPage() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu when navigating
    const handleNavigate = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="landingPageContainer">
            <nav>
                {/* Logo */}
                <div className="navHeader" onClick={() => { setMenuOpen(false); navigate("/"); }}>
                    <img src="/images/logo.png" alt="Logo" style={{ width: "30px", marginRight: "8px" }} />
                    <img src="/images/logo-name.png" alt="Logo Name" style={{ width: "200px" }} />
                </div>

                {/* Hamburger icon */}
                <div
                    className={`hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") setMenuOpen(!menuOpen); }}
                >
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>

                {/* Navbar Links */}
                <div className={`navlist ${menuOpen ? "open" : ""}`}>
                    <p onClick={() => handleNavigate("/an2477")}>Join as Guest</p>
                    <p onClick={() => handleNavigate("/auth")}>Register</p>
                    <p onClick={() => handleNavigate("/auth")}>Login</p>
                </div>
            </nav>

            <div className="landingMainContainer">
                {/* Left Part */}
                <div>
                    <h1 style={{ textShadow: "1.2px 1.2px 3.5px #665df5" }}>Connect with People</h1>
                    <p>with high-quality video calls and real-time messaging all in one place.</p>
                    <div role="button" className="getStartedBtn">
                        <Link to="/auth">Get Started</Link>
                    </div>
                </div>

                {/* Right Part */}
                <div className="homeImage">
                    <img src="/images/homePage-Image.png" alt="Home Page Illustration" />
                </div>
            </div>

            <Hero />
            <Footer />
        </div>
    );
}