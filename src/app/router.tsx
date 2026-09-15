import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { SimulatorPage } from '@/features/simulator/SimulatorPage';

/**
 * App routes. `/` is the marketing landing; `/simulate/:demo` mounts a demo use case with
 * the floating SimulationPanel over it. Demo ids are validated inside SimulatorPage.
 */
export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/simulate/:demo', element: <SimulatorPage /> },
  { path: '/simulate', element: <SimulatorPage /> },
]);
