import { Link } from "react-router-dom";
import "../styles/SplashPage.css";

export default function SplashPage() {
  return (
    <div className="splash-outer">
      <div className="splash-inner">
        <header className="splash-header">
          <div className="header-content">
            <div className="title-wrap">
              <h1 className="app-title">Easy Release</h1>
            </div>

            <nav className="main-nav" aria-label="primary">
              <ul>
                <li>Townhomes</li>
                <li>Apartments</li>
                <li>Single Homes</li>
                <li>Condos</li>
                <li>Studios</li>
              </ul>
            </nav>

            <div className="auth-wrap">
              <Link to="/login" className="login-button">
                Log In/ Sign up
              </Link>
            </div>
          </div>
        </header>

        <main className="splash-main" />
      </div>
    </div>
  );
}
