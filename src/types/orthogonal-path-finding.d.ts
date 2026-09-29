// orthogonal-path-finding ships type declarations, but its package.json
// "exports" map doesn't expose them, so TypeScript can't find them. This
// mirrors the parts of dist/index.d.ts that we use.
declare module "orthogonal-path-finding" {
  export type Point = { x: number; y: number };

  export type Rectangle = { x: number; y: number; width: number; height: number };

  export function orthogonalPathFinding(
    start: Point,
    end: Point,
    obstacles: Rectangle[],
    options?: { debug?: boolean; padding?: number },
  ): { path: Point[]; d: string };
}
