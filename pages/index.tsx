import Head from 'next/head'
import { CSSProperties, JSXElementConstructor, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Topology, Objects } from 'topojson-specification';
import { educInfoElemType, geometriesArrElem } from '../customTypes';
import tippy from 'tippy.js';
import 'tippy.js/animations/shift-away-subtle.css';
import ReactDOMServer from 'react-dom/server';

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

function Graphic(props: { mapInfo: Topology<Objects<{ [name: string]: any; }>>, educInfo: Array<educInfoElemType> }) {

  const [forceRender, setforceRender] = useState<number>(Math.random())

  const graphicRef = useRef<HTMLDivElement>(null);

  const legendData = [0, 1, 2, 3, 4, 5, 6];
  const legendLabelData = legendData.slice().concat(Math.max(...legendData) + 1)

  useLayoutEffect(function () {

    const svgWidth = graphicRef.current.clientWidth;
    const svgHeight = svgWidth * (props.mapInfo.transform.scale[1]/props.mapInfo.transform.scale[0]);

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

    const legendBlocks = svg.append('g')
      .selectAll('rect')
      .data(legendData)
      .enter().append('rect')
      .attr('width', 5)
      .attr('height', svgHeight / legendData.length - 20 / legendData.length)
      .attr('y', (d) => (d * (svgHeight / legendData.length - 20 / legendData.length)) + 10)
      .attr('fill', function (d) {
        switch (d) {
          case 6: return '#e5f5e0';
          case 5: return '#c7e9c0';
          case 4: return '#a1d99b';
          case 3: return '#74c476';
          case 2: return '#41ab5d';
          case 1: return '#238b45';
          case 0: return '#006d2c';
          default: break;
        }
      })

    const legendLabel = svg.append('g')
      .call(d3.axisRight(d3.scaleLinear().domain([Math.min(...legendLabelData), Math.max(...legendLabelData)]).range([svgHeight - 20, 0]))
        .tickValues(legendLabelData)
        .tickFormat(function (d) {
          switch (d) {
            case 7: return '66%';
            case 6: return '57%';
            case 5: return '48%';
            case 4: return '39%';
            case 3: return '30%';
            case 2: return '21%';
            case 1: return '12%';
            case 0: return '03%';
            default: break;
          }
        }))
      .attr('transform', 'translate(0,10)')


    countiesMap.nodes().forEach(function (val, i, arr) {
      const valEducInfo = props.educInfo.find((elem) => elem.fips === Number(val.getAttribute('data-fips')));
      const contentStyle: CSSProperties = {
        margin: '0px',
        padding: '5px',
        borderRadius: '3px',
        boxShadow: '0px 0px 10px 0px gray',
        color: (valEducInfo.bachelorsOrHigher >= 39 && 'white'),
        backgroundColor: (
          valEducInfo.bachelorsOrHigher <= 12 ? '#e5f5e0' :
            valEducInfo.bachelorsOrHigher <= 21 ? '#c7e9c0' :
              valEducInfo.bachelorsOrHigher <= 30 ? '#a1d99b' :
                valEducInfo.bachelorsOrHigher <= 39 ? '#74c476' :
                  valEducInfo.bachelorsOrHigher <= 48 ? '#41ab5d' :
                    valEducInfo.bachelorsOrHigher <= 57 ? '#238b45' :
                      valEducInfo.bachelorsOrHigher <= 66 ? '#006d2c' : '')
      }
      tippy(val, {
        allowHTML: true,
        animation: 'shift-away-subtle',
        content: ReactDOMServer.renderToStaticMarkup(
          <p style={contentStyle}>{valEducInfo.area_name}, {valEducInfo.state}: {valEducInfo.bachelorsOrHigher}%</p>
        ),
      }).unmount()
    })

    return (function () {
      svg.remove();
    })
  }, [forceRender])

  useEffect(function () {
    window.addEventListener('resize', function () {
      setforceRender(Math.random())
    })
  }, [])

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