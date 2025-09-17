declare module 'feather-icons' {
  interface FeatherIcon {
    toSvg(options?: Record<string, string | number | undefined>): string;
  }

  interface FeatherIcons {
    icons: Record<string, FeatherIcon> & {
      loader?: FeatherIcon;
    };
    replace(options?: Record<string, unknown>): void;
  }

  const feather: FeatherIcons;

  export default feather;
}
