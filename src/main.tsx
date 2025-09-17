import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DepartmentProvider } from './contexts/department-context.tsx'

createRoot(document.getElementById("root")!).render(
  <DepartmentProvider>
    <App />
  </DepartmentProvider>
);
