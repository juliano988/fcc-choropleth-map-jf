export type geometriesArrElem = {
    type: string;
    id: number;
    arcs: Array<Array<number>>
  }

export type educInfoElemType = {
  fips: number,
  state: string,
  area_name: string,
  bachelorsOrHigher: number
}