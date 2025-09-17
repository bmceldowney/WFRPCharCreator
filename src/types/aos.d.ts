declare module 'aos' {
  interface AosOptions {
    duration?: number;
    offset?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
    [key: string]: unknown;
  }

  interface AosInstance {
    init(options?: AosOptions): void;
    refresh(): void;
    refreshHard(): void;
  }

  const AOS: AosInstance;

  export default AOS;
}
