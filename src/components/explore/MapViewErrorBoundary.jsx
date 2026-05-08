import { Component } from 'react';

class MapViewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[60vh] bg-secondary/50 rounded-2xl flex flex-col items-center justify-center gap-3">
          <p className="text-2xl">🗺️</p>
          <p className="text-sm font-medium text-foreground">Map unavailable</p>
          <p className="text-xs text-muted-foreground">Try switching back to grid view</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapViewErrorBoundary;