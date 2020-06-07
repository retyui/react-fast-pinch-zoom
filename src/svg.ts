// I'd rather use DOMMatrix/DOMPoint here, but the browser support isn't good enough.
// Given that, better to use something everything supports.
export const createSvg = (
  cachedSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
) => ({
  createMatrix: () => cachedSvg.createSVGMatrix(),
  createPoint: () => cachedSvg.createSVGPoint()
});
