declare module 'react-dom/client' {
  import { Container } from 'react-dom';
  export function createRoot(container: Container | null): {
    render(children: React.ReactNode): void;
  };
}
