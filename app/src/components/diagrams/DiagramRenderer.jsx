import RightTriangleDiagram from './RightTriangleDiagram'
import LadderDiagram from './LadderDiagram'
import RectangleDiagram from './RectangleDiagram'
import CubeDiagram from './CubeDiagram'
import SquareDiagram from './SquareDiagram'
import EquilateralTriangleDiagram from './EquilateralTriangleDiagram'

const diagramComponents = {
  right_triangle: RightTriangleDiagram,
  ladder: LadderDiagram,
  rectangle: RectangleDiagram,
  cube: CubeDiagram,
  square: SquareDiagram,
  equilateral_triangle: EquilateralTriangleDiagram
}

function DiagramRenderer({ diagram }) {
  if (!diagram || !diagram.type) return null

  const Component = diagramComponents[diagram.type]

  if (!Component) {
    console.warn(`Unknown diagram type: ${diagram.type}`)
    return null
  }

  return (
    <div className="flex justify-center my-2">
      <div className="h-24 sm:h-32">
        <Component {...diagram} />
      </div>
    </div>
  )
}

export default DiagramRenderer
