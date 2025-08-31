import "./home.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();  

    return (
        // Home Page
        <div className="landingPageContainer">
            <nav>
                {/* Logo */}
                <div className="navHeader" onClick={() => navigate("/")}>
                    <img src="/images/logo.png" alt="Logo" style={{ width: "30px", marginRight: "8px" }} />
                    <img src="/images/logo-name.png" alt="Logo Name" style={{ width: "200px" }} />
                </div>

                {/* Navbar Links */}
                <div className="navlist">
                    <p onClick={() => navigate("/an2477")}>Join as Guest</p>
                    <p onClick={() => navigate("/auth")}>Register</p>
                    <p onClick={() => navigate("/auth")}>Login</p>
                </div>
            </nav>

            <div className="landingMainContainer">
                {/* Left Part */}
                <div>
                    <h1 style={{textShadow: "1.2px 1.2px  3.5px #665df5"}}>Connect with People</h1>
                    <p >with high-quality video calls and real-time messaging all in one place.</p>
                    <div role="button" className="getStartedBtn">
                        <Link to="/auth">Get Started</Link>
                    </div>
                </div>

                {/* Right Part */}
                <div className="homeImage">
                    <img src="/images/homePage-Image.png" alt="Home Page Illustration" />
                </div>
            </div>
        </div>
    );
}
