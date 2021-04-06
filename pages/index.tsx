import Head from 'next/head'
import { useEffect, useLayoutEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Topology, Objects } from 'topojson-specification';
import { geometriesArrElem } from '../customTypes';

export default function Home({ educInfo, mapInfo }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>FCC Choropleth Map</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>United States Educational Attainment</h1>
      <h4>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h4>
      <div style={{ width: '55vw', margin: 'auto' }}>
        <Graphic educInfo={educInfo} mapInfo={mapInfo} />
      </div>
    </div>
  )
}

function Graphic(props: { mapInfo: Topology<Objects<{ [name: string]: any; }>>, educInfo: any[] }) {

  const graphicRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(function () {

    const svgWidth = graphicRef.current.clientWidth;
    const svgHeight = svgWidth * 0.58;

    const transformVal = 'scale(' + (props.mapInfo.transform.scale[0] * svgWidth / 10) + '),translate(' + -props.mapInfo.transform.translate[0] + ',' + -props.mapInfo.transform.translate[1] + ')';

    const svg = d3.select(graphicRef.current)
      .append('svg')
      .attr('height', svgHeight)
      .attr('width', svgWidth)

    const countiesMap = svg.append('g')
      .selectAll('path')
      .data(topojson.feature(props.mapInfo, props.mapInfo.objects.counties).features)
      .enter().append('path')
      .attr('data-fips', (d: geometriesArrElem) => d.id)
      .attr('data-education', (d: geometriesArrElem) => props.educInfo.find((elem) => elem.fips === d.id).bachelorsOrHigher)
      .attr('fill', function (d: geometriesArrElem) {
        const bachelorsOrHigher = props.educInfo.find((elem) => elem.fips === d.id).bachelorsOrHigher;
        if (bachelorsOrHigher <= 12) { return '#e5f5e0' }
        else if (bachelorsOrHigher <= 21) { return '#c7e9c0' }
        else if (bachelorsOrHigher <= 30) { return '#a1d99b' }
        else if (bachelorsOrHigher <= 39) { return '#74c476' }
        else if (bachelorsOrHigher <= 48) { return '#41ab5d' }
        else if (bachelorsOrHigher <= 57) { return '#238b45' }
        else if (bachelorsOrHigher <= 66) { return '#006d2c' }
      })
      .attr('onmouseover', "this.setAttribute('opacity','0.5')")
      .attr('onmouseout', "this.setAttribute('opacity','1')")
      .attr("d", d3.geoPath())
      .attr('transform', transformVal)

    const statesMap = svg.append("path")
      .datum(topojson.mesh(props.mapInfo, props.mapInfo.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath())
      .attr('transform', transformVal)

    console.log(props.mapInfo)

    return (function () {
      svg.remove();
    })
  })

  return (
    <div ref={graphicRef} style={{ height: '100%', width: '100%' }} />
  )
}

export async function getStaticProps(context) {
  const res1 = await fetch(`https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json`)
  const res2 = await fetch(`https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json`)
  const educInfo = await res1.json()
  const mapInfo = await res2.json()

  return {
    props: { educInfo, mapInfo }, // will be passed to the page component as props
  }
}