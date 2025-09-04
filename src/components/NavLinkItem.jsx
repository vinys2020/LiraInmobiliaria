import { NavLink } from "react-router-dom";

const NavLinkItem = ({ to, children, onClick, isWhiteNavbar }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      onClick={onClick}
      style={{ color: isWhiteNavbar ? "#000" : "#fff" }} // 👈 COLOR AUTOMÁTICO
    >
      {children}
    </NavLink>
  );
};

export default NavLinkItem;
