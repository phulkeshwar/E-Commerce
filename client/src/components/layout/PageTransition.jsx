import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }) {
  const location = useLocation();
  const routeKey = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );

  return (
    <div className="page-transition page-enter" key={routeKey}>
      {children}
    </div>
  );
}
