export const rootClassName = `mur_skdsdfnm`;
export const childClassName = `amur_klndasd`;

const css = `.${rootClassName}{display:block;overflow:hidden;touch-action:none}.${childClassName}{transform:translate(var(--x,0),var(--y,0)) scale3d(var(--scale,1));transform:translate3d(var(--x,0),var(--y,0),0) scale3d(var(--scale,1),var(--scale,1),1);transform-origin:0 0;will-change:transform}
`;

const styleElement = document.createElement("style");

styleElement.appendChild(document.createTextNode(css));

document.getElementsByTagName("head")[0].appendChild(styleElement);
