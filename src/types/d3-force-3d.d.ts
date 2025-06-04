declare module 'd3-force-3d' {
  import * as d3 from 'd3';

  export function forceSimulation<Datum>(
    nodes?: d3.SimulationNodeDatum[]
  ): d3.Simulation<d3.SimulationNodeDatum, undefined>;

  export function forceLink<Datum>(
    links?: Array<{ source: number | string | Datum; target: number | string | Datum }>
  ): any;

  export function forceManyBody<Datum>(): any;
  export function forceCenter<Datum>(x?: number, y?: number, z?: number): any;
  export function forceCollide(radius?: number): any;
  export function forceX(x?: number): any;
  export function forceY(y?: number): any;
  export function forceZ(z?: number): any;
  export function forceRadial(radius: number, x?: number, y?: number): any;
}
