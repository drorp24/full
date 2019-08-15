// import React, { Component } from 'react'

// // Using the 'state ='* way to initialize state/anything (*'class properties proposal')
// // which Babel already supports (Babel class property transform, already included in CRA)
// class ClassCounter extends Component {
//   state = { count: 0 }

//   // being an arrow function, clickHandler inhertis its 'this' from the class
//   // hence no need to define in the constructor that 'this.clickHandler = this.clickHandler.bind(this)'
//   // this is the last nail in the constructor coffin
//   // FFF suggests replacing class with factory function (https://www.youtube.com/watch?v=uCuTQYf80FU)
//   // but with hooks, classes are not needed anyway
//   // This way or the other, there's a performance hit as each invocation creates another clickHandler instance
//   clickHandler = () => this.setState({ count: this.state.count + 1 })

//   render() {
//     return (
//       <div>
//         <button onClick={this.clickHandler}>
//           Class - {this.state.count} Clicks
//         </button>
//       </div>
//     )
//   }
// }

// export default ClassCounter
