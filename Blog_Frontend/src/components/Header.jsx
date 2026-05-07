import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import {
  navbarClass,
  navContainerClass,
  navBrandClass,
  navLinksClass,
  navLinkClass,
  navLinkActiveClass,
} from "../styles/common";

function Header() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  // decide profile route based on role
  const getProfilePath = () => {
    if (!user) return "/";

    switch (user.role) {
      case "AUTHOR":
        return "/author-profile";
      case "ADMIN":
        return "/admin-profile";
      default:
        return "/user-profile";
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className={navbarClass}>
      <div className={navContainerClass}>

        {/* LOGO */}
        <NavLink to="/" className={navBrandClass}>
          MyBlog
        </NavLink>

        <ul className={navLinksClass}>

          {/* HOME */}
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? navLinkActiveClass : navLinkClass
              }
            >
              Home
            </NavLink>
          </li>

          {/* NOT LOGGED IN */}
          {!isAuthenticated && (
            <>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive ? navLinkActiveClass : navLinkClass
                  }
                >
                  Register
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? navLinkActiveClass : navLinkClass
                  }
                >
                  Login
                </NavLink>
              </li>
            </>
          )}

          {/* LOGGED IN */}
          {isAuthenticated && (
            <>
              <li>
                <NavLink
                  to={getProfilePath()}
                  className={({ isActive }) =>
                    isActive ? navLinkActiveClass : navLinkClass
                  }
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className={navLinkClass}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Logout
                </button>
              </li>
            </>
          )}

        </ul>
      </div>
    </nav>
  );
}

export default Header;