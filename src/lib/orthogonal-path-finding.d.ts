/**
 * Relevant type declarations for the NPM package orthogonal-path-finding.
 * Duplicated here because, at the time of writing, that package did not
 * expose its type declarations in its `package.json` `exports` object.
 */
declare module "orthogonal-path-finding" {
  export type Point = { x: number; y: number };

  export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  export function orthogonalPathFinding(
    start: Point,
    end: Point,
    obstacles: Rectangle[],
    options?: { debug?: boolean; padding?: number },
  ): { path: Point[]; d: string };
}
