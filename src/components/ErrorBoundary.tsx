"use client";

import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 text-red-900 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">React Render Crash Captured!</h1>
          <pre className="bg-red-100 p-4 rounded overflow-auto text-sm font-mono">
            {this.state.error?.stack || this.state.error?.toString() || "Unknown error"}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
