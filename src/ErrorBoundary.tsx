import React from "react";
type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error("UI error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ padding: 24, margin: 16 }}>
          <h2 style={{ color: "var(--danger)" }}>Ops! Ocorreu um erro na interface.</h2>
          <p>Abra o Console (F12 → Console) e me envie a mensagem exibida lá.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
