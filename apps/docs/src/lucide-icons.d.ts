declare module "lucide/dist/esm/icons/*.mjs" {
  type SVGProps = Record<string, boolean | number | string | undefined>;
  type IconNode = [tag: string, attrs: SVGProps][];

  const iconNode: IconNode;
  export default iconNode;
}
