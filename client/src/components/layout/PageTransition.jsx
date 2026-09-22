import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToTop } from "../../utils/scrollToTop";

export function PageTransition({ children }) {
  const location = useLocation();
  const routeKey = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );

  useEffect(() => {
    scrollToTop({ behavior: "instant" });
  }, [routeKey]);

  return (
    <div className="page-transition page-enter" key={routeKey}>
      {children}
    </div>
  );
}
