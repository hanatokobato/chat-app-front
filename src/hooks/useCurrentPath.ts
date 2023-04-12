import { matchRoutes, useLocation } from 'react-router-dom';

const routes = [{ path: '/rooms/:id' }];

const useCurrentPath = () => {
  const location = useLocation();
  const matches = matchRoutes(routes, location);
  if (!matches) return null;

  return matches[0].route.path;
};

export default useCurrentPath;
