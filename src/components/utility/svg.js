// svg icons copied from https://materialdesignicons.com/
//
import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

// ! Why SVG
//
// The use of SVG rather than other formats allows me to
// - inline icons saving the need to fetch them from a server/cdn
// - add any new icon with no need to add any <img> or import anything, neither here nor in the calling component
// - customize the icon, perhaps the most compelling use case (See below)
//
// ! Customizing icons
//
// I made cusomizing icons possible in 3 ways:
//
// - passing className by the calling component - in case customization is sensisitve to the component consuming it
// - common - anystyling property that every icon would get
// - per icon - per-icon customizations that should be made regardless of the place the icon is inserted into
//
// example for the latter are icons whose specific shape make them appear above or below the other characters
// ideally the relative adjustment should be specified in 'em' units rather than 'px' to guarantee working for every font size

// Some icons due to their specific shape require a bit of adjustment to appear aligned with the text
const styles = {
  common: {},
  quote: {
    position: 'relative',
    top: '3px',
  },
  search: {
    width: '1.3em',
    height: '1.3em',
    position: 'relative',
    top: '0.1em',
  },
  rotate: {
    transform: 'rotateX(180deg)',
  },
}

const paths = {
  searchQuote:
    'M4,4H9.5C9.25,4.64 9.09,5.31 9.04,6H4V16H10V19.08L13.08,16H18V13.23L20,15.23V16A2,2 0 0,1 18,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22H9A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V6C2,4.89 2.9,4 4,4M15.5,2C18,2 20,4 20,6.5C20,7.38 19.75,8.2 19.31,8.89L22.41,12L21,13.39L17.89,10.31C17.2,10.75 16.38,11 15.5,11C13,11 11,9 11,6.5C11,4 13,2 15.5,2M15.5,4A2.5,2.5 0 0,0 13,6.5A2.5,2.5 0 0,0 15.5,9A2.5,2.5 0 0,0 18,6.5A2.5,2.5 0 0,0 15.5,4Z',
  quote:
    'M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10Z',
  search:
    'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z',
  check:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  info:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  cloudOff:
    'M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z',
  cloudOn:
    'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z',
  rotate:
    'M7.34 6.41L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49zM3.69 12.9l3.66-3.66L11 12.9l-3.66 3.66-3.65-3.66zm15.67-6.26C17.61 4.88 15.3 4 13 4V.76L8.76 5 13 9.24V6c1.79 0 3.58.68 4.95 2.05 2.73 2.73 2.73 7.17 0 9.9C16.58 19.32 14.79 20 13 20c-.97 0-1.94-.21-2.84-.61l-1.49 1.49C10.02 21.62 11.51 22 13 22c2.3 0 4.61-.88 6.36-2.64 3.52-3.51 3.52-9.21 0-12.72z',
}

const MySvg = ({ icon, className }) => {
  if (!icon) return <div></div>
  return (
    <SvgIcon
      style={{ ...styles.common, ...styles[icon] }}
      className={className}
    >
      <svg>
        <path d={paths[icon]} />
      </svg>
    </SvgIcon>
  )
}

export default MySvg
