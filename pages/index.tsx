import Head from 'next/head'
import { useEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function Home({ data1, data2 }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>FCC Choropleth Map</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>United States Educational Attainment</h1>
      <h4>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h4>
      <div style={{ height: '70vh', width: '70vw', margin: 'auto' }}>
        <Graphic data1={data1} data2={data2} />
      </div>
    </div>
  )
}

function Graphic(props) {

  const graphicRef = useRef<HTMLDivElement>(null);

  useEffect(function () {

    const svgHeight = graphicRef.current.clientHeight;
    const svgWidth = graphicRef.current.clientWidth;

    console.log(svgWidth,window.innerWidth,svgWidth/window.innerWidth)

    const svg = d3.select(graphicRef.current)
      .append('svg')
      .attr('height', '100%')
      .attr('width', '100%')

    svg.append("path")
      .datum(topojson.merge(props.data2, props.data2.objects.nation.geometries))
      .attr("fill", "#ddd")
      .attr("d", d3.geoPath())
      .attr('transform','scale('+(props.data2.transform.scale[0] * svgWidth/9.5)+','+(props.data2.transform.scale[1] * svgHeight/3.5)+')')

    // svg.append("path")
    //   .datum(topojson.mesh(props.data2, props.data2.objects.states, (a, b) => a !== b))
    //   .attr("fill", "none")
    //   .attr("stroke", "white")
    //   .attr("stroke-linejoin", "round")
    //   .attr("d", d3.geoPath())
    //   .attr('transform','scale(0.5)')

    // svg.append("path")
    //   .datum(topojson.mesh(props.data2, props.data2.objects.counties, (a, b) => a !== b))
    //   .attr("fill", "none")
    //   .attr("stroke", "white")
    //   .attr("stroke-linejoin", "round")
    //   .attr("d", d3.geoPath())
    //   .attr('transform','scale(0.5)')


    console.log(props.data2)

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
  const data1 = await res1.json()
  const data2 = await res2.json()

  return {
    props: { data1, data2 }, // will be passed to the page component as props
  }
}