import Head from 'next/head'
import { useEffect, useLayoutEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function Home({ educInfo, mapInfo }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>FCC Choropleth Map</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>United States Educational Attainment</h1>
      <h4>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h4>
      <div style={{ width: '70vw', margin: 'auto' }}>
        <Graphic educInfo={educInfo} mapInfo={mapInfo} />
      </div>
    </div>
  )
}

function Graphic(props) {

  const graphicRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(function () {

    const svgWidth = graphicRef.current.clientWidth;
    const svgHeight = svgWidth * 0.58;

    const transformVal = 'scale(' + (props.mapInfo.transform.scale[0] * svgWidth / 10) + '),translate(' + -props.mapInfo.transform.translate[0] + ',' + -props.mapInfo.transform.translate[1] + ')';

    console.log(svgWidth, window.innerWidth, svgWidth / window.innerWidth)

    const svg = d3.select(graphicRef.current)
      .append('svg')
      .attr('height', svgHeight)
      .attr('width', svgWidth)

    svg.append("path")
      .datum(topojson.merge(props.mapInfo, props.mapInfo.objects.nation.geometries))
      .attr("fill", "#ddd")
      .attr("d", d3.geoPath())
      .attr('transform', transformVal)

    svg.append("path")
      .datum(topojson.mesh(props.mapInfo, props.mapInfo.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath())
      .attr('transform', transformVal)

    svg.append("path")
      .datum(topojson.mesh(props.mapInfo, props.mapInfo.objects.counties, (a, b) => a !== b))
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
    <div ref={graphicRef} style={{ height: '100%', width: '100%', borderStyle: 'solid' }} />
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