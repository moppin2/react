import publicRoutes from './routesPublic';
import privateRoutes from './routesPrivate';

const allRoutes = [
  ...publicRoutes,
  ...privateRoutes,
];

export default allRoutes;