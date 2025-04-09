//#region Initialize the app
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, renderer, camera, controls, animationId;
const canvas = document.getElementById("three-canvas");
renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 100;

controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// List of all the Event Listerner 
function allEventListenerHandles() {
  document
    .getElementById("btn2")
    .addEventListener("click", () => loadProject(fun2));
  document
    .getElementById("btn3")
    .addEventListener("click", () => loadProject(fun3));
  document
    .getElementById("btn8")
    .addEventListener("click", () => loadProject(fun8));
  document
    .getElementById("btn12")
    .addEventListener("click", () => loadProject(fun12));
  document
    .getElementById("btn13")
    .addEventListener("click", () => loadProject(fun13));
  document
    .getElementById("btn16")
    .addEventListener("click", () => loadProject(fun16));
  document
    .getElementById("btn20")
    .addEventListener("click", () => loadProject(fun20));
  document
    .getElementById("btn21")
    .addEventListener("click", () => loadProject(fun21));
  document
    .getElementById("btn25")
    .addEventListener("click", () => loadProject(fun25));
  document
    .getElementById("btn31")
    .addEventListener("click", () => loadProject(fun31));
  document
    .getElementById("btn41")
    .addEventListener("click", () => loadProject(fun41));
}

// Clear previous scene
function clearScene() {
  cancelAnimationFrame(animationId);
  if (scene) {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }
}

// Load a project
function loadProject(functionName) {
  clearScene();
  scene = new THREE.Scene();
  functionName();
}

// Animation loop
function animate(updateFn) {
  function loop() {
    updateFn();
    controls.update();
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(loop);
  }
  loop();
}
//#endregion

// Project Functions Start Here 


//#region  Project 2:
function fun2() {
  const rectWidth = 10,
    rectHeight = 9;
  const shape = new THREE.Shape();
  shape.moveTo(-rectWidth / 2, -rectHeight / 2);
  shape.lineTo(rectWidth / 2, -rectHeight / 2);
  shape.lineTo(rectWidth / 2, rectHeight / 2);
  shape.lineTo(-rectWidth / 2, rectHeight / 2);
  shape.lineTo(-rectWidth / 2, -rectHeight / 2);

  const radius = 1;
  const cols = 2;
  const rows = 2;

  const colSpacing = rectWidth / (cols + 1);
  const rowSpacing = rectHeight / (rows + 1);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = -rectWidth / 2 + (j + 1) * colSpacing;
      const y = -rectHeight / 2 + (i + 1) * rowSpacing;
      const hole = new THREE.Path();
      hole.absarc(x, y, radius, 0, Math.PI * 2);
      shape.holes.push(hole);
    }
  }

  const extrudeSettings = {
    depth: 2,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshBasicMaterial({
    color: 0x0077ff,
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  animate(() => {});
}
//#endregion

//#region  Project 3:
function fun3() {
  const origin = new THREE.Vector2(1, 1);
  const height = 2,
    width = 2;
  const shape = new THREE.Shape();
  shape.moveTo(origin.x, origin.y);
  shape.lineTo(origin.x + width, origin.y);
  shape.lineTo(origin.x + width, origin.y + height);
  shape.lineTo(origin.x + width + width, origin.y + height);
  shape.lineTo(origin.x + width + width, origin.y + height + height);
  shape.lineTo(origin.x + width, origin.y + height + height);
  shape.lineTo(origin.x + width, origin.y + height + height + height);
  shape.lineTo(origin.x, origin.y + height + height + height);
  shape.lineTo(origin.x, origin.y + height + height);
  shape.lineTo(origin.x - width, origin.y + height + height);
  shape.lineTo(origin.x - width, origin.y + height);
  shape.lineTo(origin.x, origin.y + height);
  shape.lineTo(origin.x, origin.y);

  const extrudeLength = 10;
  class CustomCurve extends THREE.Curve {
    getPoint(t) {
      return new THREE.Vector3(extrudeLength * t, 0, 0);
    }
  }
  const customPath = new CustomCurve();

  const extrudeSettings = {
    bevelEnabled: false,
    steps: 1,
    extrudePath: customPath,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshBasicMaterial({
    color: "#ff0000",
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const vertices = [];
  const positionAttribute = geometry.attributes.position;

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);
    vertices.push([x, y, z]);
  }

  const uniqueVertices = [
    ...new Set(vertices.map((v) => JSON.stringify(v))),
  ].map((v) => JSON.parse(v));
  // console.log(uniqueVertices);

  const maxX = Math.max(...uniqueVertices.map((v) => v[0]));
  const lastCrossSection = uniqueVertices.filter((v) => v[0] === maxX);

  const previousXValues = uniqueVertices
    .map((v) => v[0])
    .filter((x) => x < maxX);
  const secondMaxX =
    previousXValues.length > 0 ? Math.max(...previousXValues) : null;
  const previousCrossSection =
    secondMaxX !== null
      ? uniqueVertices.filter((v) => v[0] === secondMaxX)
      : [];

  const distBetweenPointsPerpendicular =
    lastCrossSection[0][0] - previousCrossSection[0][0];
  const distBetweenPointsBase = height;

  let actualMaxAngle = Math.atan(
    distBetweenPointsPerpendicular / distBetweenPointsBase
  );
  // console.log(actualMaxAngle * (180 / Math.PI));

  var angleDegrees = 20;
  if (angleDegrees > actualMaxAngle * (180 / Math.PI)) {
    angleDegrees = actualMaxAngle * (180 / Math.PI);
  }

  const angleRadians = angleDegrees * (Math.PI / 180);
  const distToMove = distBetweenPointsBase * Math.tan(angleRadians);

  const verticesAtExtreme = uniqueVertices.filter(
    (v) => v[0] == 0 || v[0] == extrudeLength
  );
  console.log(verticesAtExtreme);

  const verticesToUpdate = verticesAtExtreme
    .filter(
      ([x, y, z]) => !(x === 0 && y === 0) || !(x === extrudeLength && y === 0)
    )
    .map((v) => {
      const [x, y, z] = v;
      let newVertex = v;

      if (x === 0) {
        newVertex = [x + distToMove * (y / width), y, z];
      } else if (x === extrudeLength) {
        newVertex = [x - distToMove * (y / width), y, z];
      }

      return { old: v, new: newVertex };
    });

  console.log(verticesToUpdate);

  verticesToUpdate.forEach(({ old: oldVertex, new: newVertex }) => {
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      if (x === oldVertex[0] && y === oldVertex[1] && z === oldVertex[2]) {
        positionAttribute.setXYZ(i, newVertex[0], newVertex[1], newVertex[2]);
      }
    }
  });

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 80,
  });
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(edges, edgeMaterial);
  mesh.add(line);

  animate(() => {});
}
//#endregion

//#region  Project 8
function fun8() {
  const shape = new THREE.Shape();
  const origin = new THREE.Vector2(0, 0);
  const height = 300;
  var width = 100,
    diameter = 10;

  shape.moveTo(origin.x, origin.y);
  shape.lineTo(origin.x, origin.y + height);
  shape.quadraticCurveTo(
    origin.x,
    origin.y + height + height / 12,
    origin.x - (width * 3.5) / 15,
    origin.y + height + height / 23
  );
  shape.lineTo(origin.x - width, origin.y + height - height / 10);
  shape.lineTo(origin.x - width, origin.y + height - height / 10 - height / 5);
  shape.lineTo(
    origin.x - (width * 2) / 5 - 6,
    origin.y + height + height / 10 - (1.35 * height) / 4
  );
  shape.quadraticCurveTo(
    origin.x - (width * 2) / 5 - 2,
    origin.y + height + height / 10 - (1.35 * height) / 4,
    origin.x - (width * 2) / 5,
    origin.y + height + height / 10 - (1.4 * height) / 4
  );
  shape.lineTo(origin.x - (width * 2) / 5, origin.y);
  shape.quadraticCurveTo(
    origin.x - width / 5,
    origin.y - width / 5,
    origin.x,
    origin.y
  );
  var radius = diameter / 2;
  if (radius > height / 8 || radius < 0 || radius > width / 2.5) {
    radius = Math.min(height / 8, width / 2.5 - 3, height / 10);
  }
  width = Math.max(width, 20);
  const hole = new THREE.Path();
  hole.absarc(
    origin.x - (width * 2) / 5 - 6,
    origin.y + height + height / 10 - (1.3 * height) / 4 + height / 10,
    radius,
    0,
    Math.PI * 2,
    true
  );
  shape.holes.push(hole);
  const extrudeSetting = {
    depth: 1,
  };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSetting);
  const mat = new THREE.MeshBasicMaterial({ color: "blue", wireframe: false });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const edgeo = new THREE.EdgesGeometry(geo);
  const edmat = new THREE.LineBasicMaterial({ color: "white" });
  const edges = new THREE.LineSegments(edgeo, edmat);
  mesh.add(edges);
  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region  Project 12
function fun12() {
  const radius = 10,
    depth = 35,
    height = 300,
    width = 300;
  const origin = new THREE.Vector2(0, 0);
  let shape = new THREE.Shape();

  shape.moveTo(origin.x, origin.y);
  shape.lineTo(origin.x, origin.y + height);
  shape.absarc(
    origin.x + width / 4,
    origin.y + height - depth,
    width / 4,
    Math.PI,
    0,
    true
  );
  shape.absarc(
    origin.x + width / 2 - depth / 2,
    origin.y + height - depth,
    depth / 2,
    0,
    Math.PI,
    true
  );
  shape.absarc(
    origin.x + width / 4,
    origin.y + height - depth,
    width / 4 - depth,
    0,
    Math.PI,
    false
  );
  shape.moveTo(origin.x + depth, origin.y + height - depth);
  shape.lineTo(origin.x + depth, origin.y + depth);
  shape.lineTo(origin.x + width - depth, origin.y + depth);
  shape.lineTo(origin.x + width - depth, origin.y + depth + height / 3);
  shape.absarc(
    origin.x + width - depth / 2,
    origin.y + depth + height / 3,
    depth / 2,
    Math.PI,
    0,
    true
  );
  shape.lineTo(origin.x + width, origin.y);
  shape.lineTo(origin.x, origin.y);

  const hole1 = new THREE.Path();
  hole1.absarc(
    origin.x + width / 2 - depth / 2,
    origin.y + height - depth + 5,
    radius,
    0,
    Math.PI * 2,
    true
  );
  shape.holes.push(hole1);

  const hole2 = new THREE.Path();
  hole2.absarc(
    origin.x + width - depth / 2,
    origin.y + depth + height / 3 - 5,
    radius,
    0,
    Math.PI * 2,
    true
  );
  shape.holes.push(hole2);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0,
    bevelEnabled: false,
  });
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
  const ch = new THREE.SphereGeometry(2);
  const chmat = new THREE.MeshBasicMaterial({ color: "red", wireframe: false });
  const chmesh = new THREE.Mesh(ch, chmat);
  chmesh.position.set(
    origin.x + width - depth / 2,
    origin.y + depth + height / 3 - 5
  );
  // chmesh.position.set(origin.x + width - depth / 2, origin.y  + height / 3);
  // scene.add(chmesh)
  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region  Project 13
function fun13() {
  const spotLight = new THREE.SpotLight(0x00ff00, 1000);
  spotLight.position.set(0, 4, 0);
  scene.add(spotLight);

  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);

  const planeSize = 400;
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "https://threejs.org/manual/examples/resources/images/checker.png"
  );
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    // side: THREE.DoubleSide,
    wireframe: false,
  });
  const mesh1 = new THREE.Mesh(planeGeo, planeMat);
  mesh1.rotation.x = Math.PI * -0.5;
  mesh1.position.set(0, -50, 0);
  scene.add(mesh1);

  const shape = new THREE.Shape();
  const origin = new THREE.Vector2(0, 0);

  let height = 400,
    width = 500,
    depth = 57,
    diameter = 10;
  if (diameter > depth) {
    diameter = depth;
  }
  if (height < depth) {
    height = depth + 10;
  }

  // Desire Shape formation
  shape.moveTo(origin.x, origin.y);
  shape.lineTo(origin.x, origin.y + height - depth - 10);
  shape.quadraticCurveTo(
    origin.x,
    origin.y + height - depth,
    origin.x - 10,
    origin.y + height - depth
  );
  shape.lineTo(origin.x - width, origin.y + height - depth);
  shape.absarc(
    origin.x - width - depth / 2,
    origin.y + height - depth,
    depth / 2,
    0,
    Math.PI,
    true
  );
  shape.absarc(
    origin.x - width - depth,
    origin.y + height - depth + depth / 2,
    depth / 2,
    (3 * Math.PI) / 2,
    Math.PI / 2,
    true
  );
  shape.absarc(
    origin.x - width - depth / 2,
    origin.y + height,
    depth / 2,
    Math.PI,
    0,
    true
  );
  shape.lineTo(origin.x + depth - 10, origin.y + height);
  shape.quadraticCurveTo(
    origin.x + depth,
    origin.y + height,
    origin.x + depth,
    origin.y + height - 10
  );
  shape.lineTo(origin.x + depth, origin.y);
  shape.absarc(origin.x + depth / 2, origin.y, depth / 2, 0, Math.PI, true);

  // Hole
  const circle = new THREE.Path();
  circle.absarc(
    origin.x - width - depth / 2,
    origin.y + height - depth / 2,
    diameter / 2,
    0,
    Math.PI * 2,
    true
  );
  shape.holes.push(circle);

  // Extrude Geometry
  const extrudeSetting = {
    depth: 50,
  };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSetting);
  // const mat = new THREE.MeshBasicMaterial({ color: 'green', wireframe: false })
  const mat = new THREE.MeshNormalMaterial({
    color: "green",
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Side bala light hai ye
  const edgeo = new THREE.EdgesGeometry(geo);
  const edmat = new THREE.LineBasicMaterial({ color: "white" });
  const edges = new THREE.LineSegments(edgeo, edmat);
  mesh.add(edges);
  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region  Project
function fun16() {
  const origin = new THREE.Vector2(0, 0);
  let doorHeight = 200,
    doorWidth = 300,
    holeDiameter = 50,
    handleHeight = 50,
    handleWidth = 100;

  // Handle height calculation
  if (handleHeight < 20) {
    handleHeight = 20;
  }
  if (handleHeight > doorHeight) {
    handleHeight = doorHeight;
  }
  if (holeDiameter + 20 > handleHeight) {
    holeDiameter = handleHeight - 20;
  }
  doorHeight = Math.max(doorHeight, 2 * holeDiameter + 40);
  // Extrusion
  const shapeDeep = 1;
  const extrudeSetting = {
    depth: shapeDeep,
  };

  // Door formation
  const doorShape = new THREE.Shape();
  doorShape.moveTo(origin.x, origin.y);
  doorShape.lineTo(origin.x + doorWidth, origin.y);
  doorShape.lineTo(origin.x + doorWidth, origin.y + doorHeight);
  doorShape.lineTo(origin.x, origin.y + doorHeight);
  doorShape.lineTo(origin.x, origin.y);

  const doorHoles = [
    { x: origin.x + holeDiameter / 2 + 5, y: origin.y + doorHeight / 2 },
    {
      x: origin.x - holeDiameter / 2 - 5 + doorWidth,
      y: origin.y + doorHeight / 2,
    },
    { x: origin.x + doorWidth / 2, y: origin.y + holeDiameter - 10 },
    {
      x: origin.x + doorWidth / 2,
      y: origin.y + doorHeight - holeDiameter + 10,
    },
  ];
  doorHoles.forEach((hole) => {
    const doorHole = new THREE.Path();
    doorHole.absarc(hole.x, hole.y, holeDiameter / 2, 0, Math.PI * 2, true);
    doorShape.holes.push(doorHole);
  });

  // Door Extrusion
  const door = new THREE.ExtrudeGeometry(doorShape, extrudeSetting);
  const doormat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: false,
  });
  const doorMesh = new THREE.Mesh(door, doormat);
  scene.add(doorMesh);

  // handle Formaton
  const originHandle = new THREE.Vector2(0, 0);
  let handle = new THREE.Shape();
  handle.moveTo(originHandle.x, originHandle.y);
  handle.lineTo(originHandle.x + handleHeight / 2, originHandle.y);
  handle.lineTo(
    originHandle.x + handleHeight / 2,
    originHandle.y + handleWidth
  );
  handle.lineTo(
    originHandle.x - handleHeight / 2,
    originHandle.y + handleWidth
  );
  handle.lineTo(originHandle.x - handleHeight / 2, originHandle.y);

  // Handle Hole
  const HandleHole = new THREE.Path();
  HandleHole.absarc(
    originHandle.x,
    originHandle.y + holeDiameter / 2 + 5,
    holeDiameter / 2,
    0,
    Math.PI * 2,
    true
  );
  handle.holes.push(HandleHole);

  //  Handle UP
  const handles = new THREE.ExtrudeGeometry(handle, extrudeSetting);
  const handleMesh = new THREE.MeshBasicMaterial({
    color: 0x00ff00ff,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const handlesrMesh = new THREE.Mesh(handles, handleMesh);
  handlesrMesh.position.set(
    originHandle.x + doorWidth / 2,
    originHandle.y + doorHeight - holeDiameter - 10,
    shapeDeep
  );
  scene.add(handlesrMesh);

  //  Handle DOWN
  const handleDown = handles.clone();
  const handleDownMat = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const handleDownMatMesh = new THREE.Mesh(handleDown, handleDownMat);
  handleDownMatMesh.position.set(
    originHandle.x + doorWidth / 2,
    originHandle.y + holeDiameter + 10,
    shapeDeep * 2
  );
  handleDown.rotateX(Math.PI);
  scene.add(handleDownMatMesh);

  // Handle RIGHT
  const handleRight = handles.clone();
  const handleRightMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const handleRightMatMesh = new THREE.Mesh(handleRight, handleRightMat);
  handleRightMatMesh.position.set(
    originHandle.x + doorWidth - holeDiameter - 10,
    originHandle.y + doorHeight / 2,
    shapeDeep
  );
  handleRightMatMesh.rotateZ(-Math.PI / 2);
  scene.add(handleRightMatMesh);

  // Handle LEFT
  const handleLeft = handles.clone();
  const handleLeftMat = new THREE.MeshBasicMaterial({
    color: 0xf00f0ff,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const handleLeftMatMesh = new THREE.Mesh(handleLeft, handleLeftMat);
  handleLeftMatMesh.position.set(
    originHandle.x + holeDiameter + 10,
    originHandle.y + doorHeight / 2,
    shapeDeep
  );
  handleLeftMatMesh.rotateZ(Math.PI / 2);
  scene.add(handleLeftMatMesh);

  // Edge line for handle geometry
  const handleEdmat = new THREE.LineBasicMaterial({ color: "white" });

  const handleEdgeo = new THREE.EdgesGeometry(handles);
  const handleEdges = new THREE.LineSegments(handleEdgeo, handleEdmat);
  handlesrMesh.add(handleEdges);

  // Edge line Handle Left
  const handleLeftEdge = new THREE.EdgesGeometry(handleLeft);
  const handleLeftEdgeSeg = new THREE.LineSegments(handleLeftEdge, handleEdmat);
  handleLeftMatMesh.add(handleLeftEdgeSeg);

  // // Edge line for clone2 handle geometry
  const handleRightEdge = new THREE.EdgesGeometry(handleRight);
  const handleRightEdgeSeg = new THREE.LineSegments(
    handleRightEdge,
    handleEdmat
  );
  handleRightMatMesh.add(handleRightEdgeSeg);

  // // Edge line for clone3 handle geometry
  const handleDownEdge = new THREE.EdgesGeometry(handleDown);
  const handleDownEdgeSeg = new THREE.LineSegments(handleDownEdge, handleEdmat);
  handleDownMatMesh.add(handleDownEdgeSeg);

  const ch = new THREE.SphereGeometry(2);
  const chmat = new THREE.MeshBasicMaterial({ color: "red", wireframe: false });
  const chmesh = new THREE.Mesh(ch, chmat);
  chmesh.position.set(originHandle.x, originHandle.y);
  // scene.add(chmesh)
  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region Function 20 (diagonal + side )
function fun20() {
  const origin = new THREE.Vector2(0, 0);
  let doorHeight = 200,
    doorWidth = 300,
    holeDiameter = 50,
    handleHeight = 50,
    handleWidth = 100;

  // Handle height calculation
  if (handleHeight < 20) {
    handleHeight = 20;
  }
  if (handleHeight > doorHeight) {
    handleHeight = doorHeight;
  }
  if (holeDiameter + 20 > handleHeight) {
    holeDiameter = handleHeight - 20;
  }
  doorHeight = Math.max(doorHeight, 2 * holeDiameter + 40);
  // Extrusion
  const shapeDeep = 10;
  const extrudeSetting = {
    depth: shapeDeep,
  };

  // Door formation
  const doorShape = new THREE.Shape();
  doorShape.moveTo(origin.x + 10, origin.y);
  doorShape.lineTo(origin.x + doorWidth - 10, origin.y);
  doorShape.quadraticCurveTo(
    origin.x + doorWidth,
    origin.y,
    origin.x + doorWidth,
    origin.y + 10
  );
  doorShape.lineTo(origin.x + doorWidth, origin.y + doorHeight - 10);
  doorShape.quadraticCurveTo(
    origin.x + doorWidth,
    origin.y + doorHeight,
    origin.x + doorWidth - 10,
    origin.y + doorHeight
  );
  doorShape.lineTo(origin.x + 10, origin.y + doorHeight);
  doorShape.quadraticCurveTo(
    origin.x,
    origin.y + doorHeight,
    origin.x,
    origin.y + doorHeight - 10
  );
  doorShape.lineTo(origin.x, origin.y + 10);
  doorShape.quadraticCurveTo(origin.x, origin.y, origin.x + 10, origin.y);

  const doorHoles = [
    { x: origin.x + holeDiameter, y: origin.y + doorHeight - holeDiameter },
    // { x: origin.x + holeDiameter / 2 + 5, y: origin.y + doorHeight / 2 },
    {
      x: origin.x - holeDiameter / 2 - 5 + doorWidth,
      y: origin.y + doorHeight / 2,
    },
    { x: origin.x + doorWidth / 2, y: origin.y + holeDiameter - 10 },
    //     { x: origin.x + doorWidth / 2, y: origin.y + doorHeight - holeDiameter + 10 },
  ];
  doorHoles.forEach((hole) => {
    const doorHole = new THREE.Path();
    doorHole.absarc(hole.x, hole.y, holeDiameter / 2, 0, Math.PI * 2, true);
    doorShape.holes.push(doorHole);
  });

  // Door Extrusion
  const door = new THREE.ExtrudeGeometry(doorShape, extrudeSetting);
  const doormat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: false,
  });
  const doorMesh = new THREE.Mesh(door, doormat);
  scene.add(doorMesh);

  // handle Formaton
  let handle = new THREE.Shape();
  // handle.moveTo(origin.x , origin.y)
  handle.lineTo(handleHeight / 2 - 5, 0);
  handle.quadraticCurveTo(handleHeight / 2, 0, handleHeight / 2, 5);
  handle.lineTo(handleHeight / 2, handleWidth - 5);
  handle.quadraticCurveTo(
    handleHeight / 2,
    handleWidth,
    handleHeight / 2 - 5,
    handleWidth
  );
  handle.lineTo(-handleHeight / 2 + 5, handleWidth);
  handle.quadraticCurveTo(
    -handleHeight / 2,
    handleWidth,
    -handleHeight / 2,
    handleWidth - 5
  );
  handle.lineTo(-handleHeight / 2, 5);
  handle.quadraticCurveTo(-handleHeight / 2, 0, -handleHeight / 2 + 5, 0);

  // Handle Hole
  const HandleHole = new THREE.Path();
  // HandleHole.absarc(0, 0 + holeDiameter / 2, holeDiameter / 2, 0, Math.PI * 2, true);
  HandleHole.absarc(
    0,
    holeDiameter / 2 + 5,
    holeDiameter / 2,
    0,
    Math.PI * 2,
    true
  );
  handle.holes.push(HandleHole);

  //  Diagonal Handle
  const handles = new THREE.ExtrudeGeometry(handle, { depth: 20 });
  const handleMesh = new THREE.MeshBasicMaterial({
    color: 0x00ff00ff,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const handlesrMesh = new THREE.Mesh(handles, handleMesh);
  handlesrMesh.position.set(
    origin.x + holeDiameter + 14,
    origin.y + doorHeight - holeDiameter - 14,
    shapeDeep
  );
  handlesrMesh.rotateZ(Math.PI / 4);
  scene.add(handlesrMesh);

  // clone Handle

  //  Handle DOWN
  const handleDown = handles.clone();
  const handleDownMat = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const handleDownMatMesh = new THREE.Mesh(handleDown, handleDownMat);
  handleDownMatMesh.position.set(
    origin.x + doorWidth / 2,
    origin.y + holeDiameter + 10,
    shapeDeep * 2
  );
  handleDown.rotateX(Math.PI);
  scene.add(handleDownMatMesh);

  // Handle RIGHT
  const handleRight = handles.clone();
  const handleRightMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const handleRightMatMesh = new THREE.Mesh(handleRight, handleRightMat);
  handleRightMatMesh.position.set(
    origin.x + doorWidth - holeDiameter - 10,
    origin.y + doorHeight / 2,
    shapeDeep
  );
  handleRightMatMesh.rotateZ(-Math.PI / 2);
  scene.add(handleRightMatMesh);

  // Edge line for handle geometry
  const handleEdgeo = new THREE.EdgesGeometry(handles);
  const handleEdmat = new THREE.LineBasicMaterial({ color: "white" });
  const handleEdges = new THREE.LineSegments(handleEdgeo, handleEdmat);
  handlesrMesh.add(handleEdges);

  // Edge line for Door geometry
  const doorEdgeo = new THREE.EdgesGeometry(door);
  const doorEdmat = new THREE.LineBasicMaterial({ color: "white" });
  const doorEdges = new THREE.LineSegments(doorEdgeo, doorEdmat);
  scene.add(doorEdges);

  const ch = new THREE.SphereGeometry(5);
  const chmat = new THREE.MeshBasicMaterial({ color: "red", wireframe: false });
  const chmesh = new THREE.Mesh(ch, chmat);
  chmesh.position.set(handleHeight / 2, doorHeight - holeDiameter);
  // scene.add(chmesh)

  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region Function (21) (Handle)
const turnRight = false;

//#region Function - 1  Lock Base
function fun21() {
  const directionalTop = new THREE.DirectionalLight(0xffffff, 1);
  directionalTop.position.set(0, 50, 0);
  scene.add(directionalTop);

  const directionalDown = new THREE.DirectionalLight(0xffffff, 1);
  directionalDown.position.set(0, -20, -50);
  scene.add(directionalDown);

  const directionalRight = new THREE.DirectionalLight(0xffffff, 1);
  directionalRight.position.set(50, 0, 50);
  scene.add(directionalRight);

  const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight4.position.set(-50, 0, 0);
  scene.add(directionalLight4);
  const x_handle_Position = 0,
    y_handle_Position = 0,
    z_handle_Position = 0;
  const width = 10,
    height = 29,
    radius = 7;
  const path = new THREE.Shape();
  const origin = new THREE.Vector2(0, 0);
  path.moveTo(origin.x, origin.y + height / 2);
  path.absarc(
    origin.x,
    origin.y + radius,
    radius,
    Math.PI * 1.5,
    Math.PI / 2,
    false
  );
  path.quadraticCurveTo(
    origin.x - 5,
    origin.y + radius * 2,
    origin.x - 5,
    origin.y + radius * 2 + height / 4
  );
  path.lineTo(origin.x - width, origin.y + radius * 2 + height / 4);
  path.lineTo(origin.x - width, origin.y - height / 4);
  path.lineTo(origin.x - 5, origin.y - height / 4);
  path.quadraticCurveTo(origin.x - 5, origin.y, origin.x, origin.y);

  const LockExtrude = 5;
  const extrudeSettings = { depth: LockExtrude, bevelEnabled: false };
  const geo = new THREE.ExtrudeGeometry(path, extrudeSettings);
  const geoMat = new THREE.MeshPhysicalMaterial({ color: "#e4e6e8" });
  const mesh = new THREE.Mesh(geo, geoMat);
  mesh.position.set(x_handle_Position, y_handle_Position, z_handle_Position);
  scene.add(mesh);

  // Add edge lines (Only front & back faces)
  const contour = path.getPoints(50);
  const lineMaterial = new THREE.LineBasicMaterial({ color: "white" });

  const frontEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(contour),
    lineMaterial
  );
  const backEdges = frontEdges.clone();
  backEdges.position.set(0, 0, LockExtrude);

  mesh.add(frontEdges);
  mesh.add(backEdges);

  // Add circular elements
  const circleMaterial = new THREE.MeshPhysicalMaterial({
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const circle1 = new THREE.Mesh(new THREE.CircleGeometry(1.5), circleMaterial);
  const circle2 = new THREE.Mesh(new THREE.CircleGeometry(1.5), circleMaterial);
  circle1.position.set(-7.5, -4, LockExtrude + 0.1);
  circle2.position.set(-7.5, height / 2 + 3, LockExtrude + 0.1);
  mesh.add(circle1);
  mesh.add(circle2);

  if (turnRight) {
    mesh.rotateY(Math.PI);
    circle1.position.set(-7.5, -4, -0.1);
    circle2.position.set(-7.5, height / 2 + 3, -0.1);
  }

  // Add small pit holes
  const pit = new THREE.Shape();
  const pos = new THREE.Vector2(0, 0);
  const rad = 0.5;
  pit.moveTo(pos.x, pos.y);
  pit.absarc(pos.x, pos.y, rad, Math.PI * 1.5, Math.PI * 0.5, false);
  pit.absarc(pos.x - rad, pos.y + rad, rad, 0, Math.PI, false);
  pit.absarc(pos.x - rad * 2, pos.y, rad, Math.PI / 2, Math.PI * 1.5, false);
  pit.absarc(pos.x - rad, pos.y - rad, rad, Math.PI, 0, false);

  const pitHole = new THREE.ExtrudeGeometry(pit, {
    depth: 0.1,
    bevelEnabled: false,
  });
  const pitHoleMat = new THREE.MeshPhysicalMaterial({ color: "black" });

  const meshPit1 = new THREE.Mesh(pitHole, pitHoleMat);
  meshPit1.position.set(rad, 0, 0);
  circle1.add(meshPit1);

  const meshPit2 = new THREE.Mesh(pitHole.clone(), pitHoleMat);
  meshPit2.position.set(rad, 0, 0);
  circle2.add(meshPit2);

  // Add edge lines for pit holes
  const pitEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pit.getPoints(30)),
    lineMaterial
  );
  // meshPit1.add(pitEdges);

  const pitEdges2 = pitEdges.clone();
  // meshPit2.add(pitEdges2);

  // Add lock component
  const lock = fun21C();
  mesh.add(lock);
  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region Function - 2  // Lock Handle
function fun21A() {
  const depth = 5.3,
    height = 50;
  const path = new THREE.Shape();
  const origin = new THREE.Vector2(0, -height);

  path.moveTo(origin.x, origin.y);
  path.absarc(origin.x + depth / 2, origin.y, depth / 2, Math.PI, 0, false);
  path.lineTo(origin.x + depth, origin.y + height);
  path.lineTo(origin.x, origin.y + height);

  const extrudeSettings = { depth: 2, bevelEnabled: false };
  const geo = new THREE.ExtrudeGeometry(path, extrudeSettings);
  const geoMat = new THREE.MeshPhysicalMaterial({
    color: "#f2f3f4",
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geo, geoMat);
  mesh.position.set(-4.85, -9, 6);

  const contour = path.getPoints();
  const lineMaterial = new THREE.LineBasicMaterial({ color: "white" });

  const frontEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(contour),
    lineMaterial
  );
  const backEdges = frontEdges.clone();
  backEdges.position.set(0, 0, extrudeSettings.depth);

  mesh.add(frontEdges);
  mesh.add(backEdges);

  const curve = fun21B();
  mesh.add(curve);

  if (turnRight) {
    mesh.rotateY(Math.PI);
    mesh.position.set(0.5, -9, -4);
  }

  return mesh;
}

//#endregion

//#region Function - 3 // Lock Curve
function fun21B() {
  const innerRadius = 3,
    deep = 2;
  const path = new THREE.Shape();
  const heightOfHandle = 0;
  const origin = new THREE.Vector2(0, heightOfHandle);

  path.moveTo(origin.x, origin.y);
  path.absarc(
    origin.x + innerRadius,
    origin.y,
    innerRadius,
    Math.PI,
    Math.PI / 2,
    true
  );
  path.absarc(
    origin.x + innerRadius,
    origin.y + innerRadius * 2,
    innerRadius,
    Math.PI * 1.5,
    0,
    false
  );
  path.lineTo(origin.x + innerRadius * 2 - deep, origin.y + innerRadius * 2);
  path.absarc(
    origin.x + innerRadius,
    origin.y + innerRadius * 2,
    innerRadius - deep,
    0,
    Math.PI * 1.5,
    true
  );
  path.absarc(
    origin.x + innerRadius,
    origin.y,
    innerRadius + deep,
    Math.PI / 2,
    Math.PI,
    false
  );

  const extrudeSettings = { depth: 5.3, bevelEnabled: false };
  const geo = new THREE.ExtrudeGeometry(path, extrudeSettings);
  const geoMat = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    wireframe: false,
    roughness: 100,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, geoMat);
  mesh.rotateY(Math.PI / 2);

  const contour = path.getPoints();
  const lineMaterial = new THREE.LineBasicMaterial({ color: "white" });

  const frontEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(contour),
    lineMaterial
  );
  const backEdges = frontEdges.clone();
  backEdges.position.set(0, 0, extrudeSettings.depth);

  mesh.add(frontEdges);
  mesh.add(backEdges);

  return mesh;
}

//#endregion

//#region Function - 4 // Lock
function fun21C() {
  const lockHeight = 10,
    lockWidth = 9.9;
  const path = new THREE.Shape();
  const origin = new THREE.Vector2(0.2, 0);
  path.quadraticCurveTo(
    origin.x + 1,
    origin.y,
    origin.x + 0.5,
    origin.y + lockHeight / 2
  );
  path.quadraticCurveTo(
    origin.x,
    origin.y + lockHeight - lockHeight / 4,
    origin.x - lockWidth / 3,
    origin.y + lockHeight
  );
  path.quadraticCurveTo(
    origin.x - lockWidth / 3 - lockWidth / 4,
    origin.y + lockHeight + 0.4,
    origin.x - lockWidth / 3 - lockWidth / 2,
    origin.y + lockHeight
  );
  path.quadraticCurveTo(
    origin.x - lockWidth / 3 - lockWidth / 2 - lockWidth / 6,
    origin.y + lockHeight - lockHeight / 6,
    origin.x - lockWidth / 3 - lockWidth / 2 - lockWidth / 3,
    origin.y + lockHeight - lockHeight / 5
  );
  path.bezierCurveTo(
    origin.x - lockWidth / 3 - lockWidth / 2 - lockWidth / 4 - lockWidth / 2,
    origin.y + lockHeight - lockHeight / 3,
    origin.x - lockWidth / 3 - lockWidth / 2 - lockWidth,
    origin.y + lockHeight / 1.5,
    origin.x - lockWidth / 3 - lockWidth / 2 - lockWidth / 8 - lockWidth / 2,
    origin.y + lockHeight / 4
  );
  path.lineTo(
    origin.x - lockWidth / 3 - lockWidth / 2 - lockWidth / 3,
    origin.y + lockHeight / 10
  );
  path.lineTo(origin.x - lockWidth / 1.2, origin.y + lockHeight / 15);
  path.quadraticCurveTo(
    origin.x - lockWidth / 2,
    origin.y + lockHeight / 15,
    origin.x - lockWidth / 2,
    origin.y - lockHeight / 3
  );
  path.lineTo(origin.x + 0.2, origin.y - lockHeight / 3);
  path.quadraticCurveTo(
    origin.x + 1,
    origin.y,
    origin.x,
    origin.y + lockHeight / 2
  );

  const deepLock = 2;
  const extrudeSettings = {
    depth: deepLock,
    bevelEnabled: false,
  };
  const geo = new THREE.ExtrudeGeometry(path, extrudeSettings);
  const geoMat = new THREE.MeshPhysicalMaterial({
    color: "#f2f3f4",
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geo, geoMat);
  mesh.position.set(2, 3, 5);

  const radius = lockHeight / 2.5;
  const hemisphereGeometry = new THREE.SphereGeometry(
    radius,
    15,
    15,
    0,
    Math.PI
  );
  const matSphere = new THREE.MeshPhysicalMaterial({
    color: "#f2f3f4",
    wireframe: false,
  });
  const sphereMesh = new THREE.Mesh(hemisphereGeometry, matSphere);
  sphereMesh.position.set(-lockWidth / 2, lockHeight / 2, 1);
  mesh.add(sphereMesh);

  if (turnRight) {
    mesh.position.set(2, 2, -2);
    sphereMesh.position.set(-5, lockHeight / 2, -0.1);
    sphereMesh.rotateX(Math.PI);
  }

  const HandleLock = fun21A();
  mesh.add(HandleLock);

  const contour = path.getPoints();
  const lineMaterial = new THREE.LineBasicMaterial({ color: "white" });

  const frontEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(contour),
    lineMaterial
  );
  const backEdges = frontEdges.clone();
  backEdges.position.set(0, 0, extrudeSettings.depth);

  mesh.add(frontEdges);
  // mesh.add(backEdges);

  return mesh;
}
//#endregion

//#endregion

//#region Handle (fun 25 ) (Patio handle)
let turnLeft = true;
let height = 400;
let width = 100;
let CylinderHeight = 10;
let CylinderWidthLength = 70;
let y_key_pos = 0;
let y_design = 0;
let cylinderWidth = width / 4;

//#region Hnadle Base
function fun25() {
  const directionalTop = new THREE.DirectionalLight(0xffffff, 1);
  directionalTop.position.set(0, 50, 0);
  scene.add(directionalTop);

  const directionalDown = new THREE.DirectionalLight(0xffffff, 1);
  directionalDown.position.set(0, -20, -50);
  scene.add(directionalDown);

  const directionalRight = new THREE.DirectionalLight(0xffffff, 1);
  directionalRight.position.set(50, 0, 50);
  scene.add(directionalRight);

  const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight4.position.set(-50, 0, 0);
  scene.add(directionalLight4);
  const x_Patio_handle = 0,
    y_Patio_handle = 0,
    z_Patio_handle = 0;

  const origin = new THREE.Vector2(0, 0);
  const path = new THREE.Shape();
  path.absarc(origin.x + width / 2, origin.y, width / 2, Math.PI, 0, false);
  path.lineTo(origin.x + width, origin.y + height);
  path.absarc(
    origin.x + width / 2,
    origin.y + height,
    width / 2,
    0,
    Math.PI,
    false
  );
  path.lineTo();

  const clonePath = path.clone();

  let upWidth = 55,
    upLength = 55;
  const key = new THREE.Shape();

  const x_key_pos = width / 2 - upWidth / 4;
  let y_pos = y_key_pos + upLength + upWidth / 2;
  if (y_pos < upLength + upWidth / 2) {
    y_pos = upLength + upWidth / 2;
  }
  if (y_pos >= width / 2 + upLength + upWidth / 2 + upLength + upWidth / 2) {
    y_pos = width / 2 + upLength + upWidth / 2 + upLength + upWidth / 2 - 2;
  }
  upWidth /= 2;
  const keyOrigin = new THREE.Vector2(x_key_pos, y_pos);
  key.absarc(
    keyOrigin.x + upWidth / 2,
    +keyOrigin.y,
    upWidth / 2,
    -Math.PI / 3,
    Math.PI + Math.PI / 3,
    false
  );
  key.absarc(
    keyOrigin.x + upWidth / 2,
    -upLength + keyOrigin.y,
    upWidth / 4,
    Math.PI,
    0,
    false
  );
  path.holes.push(key);

  const keyLineSeg = key.getPoints(50);
  const frontEdges_key = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(keyLineSeg),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  frontEdges_key.position.set(0, 0, 5);

  const baseExtrude = 5;
  const geo = new THREE.ExtrudeGeometry(path, {
    depth: baseExtrude,
    bevelEnabled: false,
  });
  const geoMat = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geo, geoMat);
  mesh.position.set(x_Patio_handle, y_Patio_handle, z_Patio_handle);
  scene.add(mesh);

  const cloneMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(clonePath, { depth: 1, bevelEnabled: false }),
    geoMat
  );
  cloneMesh.position.set(0, 0, -1);
  mesh.add(cloneMesh);
  mesh.add(frontEdges_key);

  const contour = path.getPoints(50);
  const frontEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(contour),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  const backEdges = frontEdges.clone();
  backEdges.position.set(0, 0, baseExtrude);
  mesh.add(frontEdges);
  mesh.add(backEdges);

  // handle strted here
  // cylinder 1 and cylinder 2
  const material = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });

  const geometry1 = new THREE.CylinderGeometry(
    cylinderWidth,
    cylinderWidth,
    CylinderHeight
  );
  const cylinder1 = new THREE.Mesh(geometry1, material);
  cylinder1.position.set(
    width / 2,
    -cylinderWidth / 2 + cylinderWidth / 10,
    CylinderHeight / 2 + baseExtrude
  );
  cylinder1.rotateX(Math.PI / 2);
  mesh.add(cylinder1);

  const geometry2 = geometry1.clone();
  const cylinder2 = new THREE.Mesh(geometry2, material);
  cylinder2.position.set(
    width / 2,
    height + cylinderWidth / 2 - cylinderWidth / 10,
    CylinderHeight / 2 + baseExtrude
  );
  cylinder2.rotateX(Math.PI / 2);
  mesh.add(cylinder2);

  // Curve 1 and curve 2
  const torusMaterial = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
    side: THREE.DoubleSide,
  });

  const torusGeometry1 = new THREE.TorusGeometry(
    cylinderWidth,
    cylinderWidth,
    16,
    16,
    Math.PI / 2
  );
  const torus1 = new THREE.Mesh(torusGeometry1, torusMaterial);
  torus1.position.set(cylinderWidth, CylinderHeight / 2, 0);
  torus1.rotateZ(Math.PI / 2);
  cylinder1.add(torus1);

  const torusGeometry2 = torusGeometry1.clone();
  const torus2 = new THREE.Mesh(torusGeometry2, torusMaterial);
  torus2.position.set(cylinderWidth, CylinderHeight / 2, 0);
  torus2.rotateZ(Math.PI / 2);
  cylinder2.add(torus2);

  // cylinder 3 and cylinder 4

  const geometry3 = new THREE.CylinderGeometry(
    cylinderWidth,
    cylinderWidth,
    CylinderWidthLength
  );
  const cylinder3 = new THREE.Mesh(geometry3, material);
  cylinder3.position.set(cylinderWidth, -CylinderWidthLength / 2, 0);
  torus1.add(cylinder3);

  const cylinder4 = new THREE.Mesh(geometry3, material);
  cylinder4.position.set(cylinderWidth, -CylinderWidthLength / 2, 0);
  torus2.add(cylinder4);

  const Patio_handle_clone = mesh.clone();
  const cylinderHandle = fun25A();
  cylinder4.add(cylinderHandle);

  const up1 = fun25B();
  const up2 = fun25B();
  mesh.add(up1);
  Patio_handle_clone.add(up2);

  if (turnLeft) {
    torus1.rotateX(Math.PI);
    torus2.rotateX(Math.PI);
    torus1.position.set(-cylinderWidth, CylinderHeight / 2, 0);
    torus2.position.set(-cylinderWidth, CylinderHeight / 2, 0);
  }

  Patio_handle_clone.add(fun25C());
  Patio_handle_clone.position.set(400, 0, 0);
  scene.add(Patio_handle_clone);

  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region Holding Hnadle
function fun25A() {
  let CylinderHeight = height - cylinderWidth;
  const material = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const geometry1 = new THREE.CylinderGeometry(
    cylinderWidth,
    cylinderWidth,
    CylinderHeight
  );
  const cylinderHandle = new THREE.Mesh(geometry1, material);
  cylinderHandle.position.set(
    0,
    -CylinderWidthLength / 2 - cylinderWidth,
    height / 2 + cylinderWidth / 2
  );
  cylinderHandle.rotateX(-Math.PI / 2);
  cylinderHandle.rotateY(-Math.PI / 2);
  // scene.add(cylinderHandle);

  // Torous 3 and torous 4
  const torusMaterial = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
    side: THREE.DoubleSide,
  });

  const torusGeometry3 = new THREE.TorusGeometry(
    cylinderWidth,
    cylinderWidth,
    16,
    16,
    Math.PI / 2
  );
  const torus3 = new THREE.Mesh(torusGeometry3, torusMaterial);
  torus3.position.set(cylinderWidth, CylinderHeight / 2, 0);
  torus3.rotateZ(Math.PI / 2);
  cylinderHandle.add(torus3);

  const torusGeometry4 = torusGeometry3.clone();
  const torus4 = new THREE.Mesh(torusGeometry4, torusMaterial);
  torus4.position.set(
    cylinderWidth,
    -CylinderHeight / 2 + cylinderWidth / 5,
    0
  );
  torus4.rotateX(Math.PI);
  torus4.rotateZ(Math.PI / 2);
  cylinderHandle.add(torus4);

  if (turnLeft) {
    cylinderHandle.position.set(
      0,
      -CylinderWidthLength / 2 - cylinderWidth,
      -(height / 2 + cylinderWidth / 4)
    );
  }
  return cylinderHandle;
}
//#endregion

//#region  UpDiagram
function fun25B() {
  let upWidth = 80,
    upLength = 80;
  const path = new THREE.Shape();
  let y_position = height / 2 + upLength + y_design;
  if (y_position < height / 2 + upLength) {
    y_position = height / 2 + upLength;
  }
  if (y_position > height - upWidth / 2) {
    y_position = height - upWidth / 2;
  }

  upWidth /= 2;
  path.absarc(upWidth / 2, 0, upWidth / 2, 0, Math.PI, false);
  path.absarc(upWidth / 2, -upLength, upWidth / 4, Math.PI, 0, false);
  const baseExtrude = 5;
  const geo = new THREE.ExtrudeGeometry(path, {
    depth: 5,
    bevelEnabled: false,
  });
  const geoMat = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geo, geoMat);
  mesh.position.set(width / 2 - upWidth / 2, y_position, baseExtrude + 0.1);

  // Line segment
  const contour = path.getPoints(50);
  const lineMaterial = new THREE.LineBasicMaterial({ color: "white" });
  const frontEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(contour),
    lineMaterial
  );
  const backEdges = frontEdges.clone();
  backEdges.position.set(0, 0, 5);
  mesh.add(frontEdges);
  mesh.add(backEdges);

  return mesh;
}
//#endregion

//#region Holding Hnadle
function fun25C() {
  let CylinderHeight = height - cylinderWidth;
  const material = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const geometry1 = new THREE.CylinderGeometry(
    cylinderWidth,
    cylinderWidth,
    CylinderHeight
  );
  const cylinderHandle = new THREE.Mesh(geometry1, material);
  cylinderHandle.position.set(
    width + CylinderWidthLength,
    CylinderHeight / 2 + cylinderWidth / 2,
    cylinderWidth * 1.5
  );
  cylinderHandle.rotateY(-Math.PI);
  // scene.add(cylinderHandle);

  // Torous 3 and torous 4
  const torusMaterial = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
    side: THREE.DoubleSide,
  });

  const torusGeometry3 = new THREE.TorusGeometry(
    cylinderWidth,
    cylinderWidth,
    16,
    16,
    Math.PI / 2
  );
  const torus3 = new THREE.Mesh(torusGeometry3, torusMaterial);
  torus3.position.set(cylinderWidth, CylinderHeight / 2, 0);
  torus3.rotateZ(Math.PI / 2);
  cylinderHandle.add(torus3);

  const torusGeometry4 = torusGeometry3.clone();
  const torus4 = new THREE.Mesh(torusGeometry4, torusMaterial);
  torus4.position.set(
    cylinderWidth,
    -CylinderHeight / 2 + cylinderWidth / 5,
    0
  );
  torus4.rotateX(Math.PI);
  torus4.rotateZ(Math.PI / 2);
  cylinderHandle.add(torus4);

  return cylinderHandle;
}
//#endregion

//#endregion

//#region Handle (fun 31 ) (Lift and slide handle)

function getBackPlateHeight() {
  return 600;
}

function getBackPlateWidth() {
  return 100;
}

function getHandleWidth() {
  return 90;
}

function getLongHandleHeight() {
  return 100;
}

function getXPatioHandle() {
  return 0;
}

function getYPatioHandle() {
  return -100;
}

function getZPatioHandle() {
  return 0;
}

function isKeyAvailable() {
  return false;
}

function getKeyPosition() {
  return 30;
}

// fixed
let curveHandleHeight = 900;
let curve_Width = 200;
const handleBaseExtrude = 50;

//#region HANDLE BASE PLATE function 31

//#region Main function
function fun31() {
  const directionalTop = new THREE.DirectionalLight(0xffffff, 1);
  directionalTop.position.set(0, 50, 0);
  scene.add(directionalTop);

  const directionalDown = new THREE.DirectionalLight(0xffffff, 1);
  directionalDown.position.set(0, -20, -50);
  scene.add(directionalDown);

  const directionalRight = new THREE.DirectionalLight(0xffffff, 1);
  directionalRight.position.set(50, 0, 50);
  scene.add(directionalRight);

  const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight4.position.set(-50, 0, 0);
  scene.add(directionalLight4);
  const origin = new THREE.Vector2(0, 0);
  const path = new THREE.Shape();
  path.absarc(
    origin.x + getBackPlateWidth() / 2,
    origin.y,
    getBackPlateWidth() / 2,
    Math.PI,
    0,
    false
  );
  path.lineTo(origin.x + getBackPlateWidth(), origin.y + getBackPlateHeight());
  path.absarc(
    origin.x + getBackPlateWidth() / 2,
    origin.y + getBackPlateHeight(),
    getBackPlateWidth() / 2,
    0,
    Math.PI,
    false
  );
  path.lineTo();

  const backPlate2Base = path.clone();

  // key hole
  let keyWidth = getBackPlateWidth() / 3,
    keyLength = 150,
    y_pos = getKeyPosition();
  const key = new THREE.Shape();
  const keyOrigin = new THREE.Vector2(
    getBackPlateWidth() / 2 - keyWidth / 2,
    y_pos
  );
  key.absarc(
    keyOrigin.x + keyWidth / 2,
    +keyOrigin.y,
    keyWidth / 2,
    -Math.PI / 3,
    Math.PI + Math.PI / 3,
    false
  );
  key.absarc(
    keyOrigin.x + keyWidth / 2,
    -keyLength + keyOrigin.y,
    keyWidth / 4,
    Math.PI,
    0,
    false
  );

  const keyHoleLine = key.getPoints();
  const KeyLineSegHole = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(keyHoleLine),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  const backEdgesBoltHole = KeyLineSegHole.clone();
  backEdgesBoltHole.position.set(0, 0, 50);

  if (!isKeyAvailable()) {
    path.holes.push(key);
  }

  // Bolt Hole
  const boltHole1 = new THREE.Shape();
  const boltDiameter = getBackPlateWidth() / 4;
  boltHole1.absarc(
    getBackPlateWidth() / 2,
    -getBackPlateWidth() / 2 + boltDiameter / 2 + getBackPlateHeight() / 12,
    boltDiameter / 2,
    0,
    Math.PI * 2,
    false
  );
  path.holes.push(boltHole1);

  const boltHole2 = new THREE.Shape();
  boltHole2.absarc(
    getBackPlateWidth() / 2,
    getBackPlateHeight() +
      getBackPlateWidth() / 2 -
      boltDiameter / 2 -
      getBackPlateHeight() / 12,
    boltDiameter / 2,
    0,
    Math.PI * 2,
    false
  );
  path.holes.push(boltHole2);

  // THIS IS FOR THE BACKPLATE
  const baseExtrude = 50;
  const geo2 = new THREE.ExtrudeGeometry(backPlate2Base, {
    depth: 1,
    bevelEnabled: false,
  });
  const geo2Mat = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const backPlate2 = new THREE.Mesh(geo2, geo2Mat);
  backPlate2.position.set(0, 0, -1);

  const geo = new THREE.ExtrudeGeometry(path, {
    depth: baseExtrude,
    bevelEnabled: false,
  });
  const geoMat = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const backPlate = new THREE.Mesh(geo, geoMat);
  backPlate.position.set(
    getXPatioHandle(),
    getYPatioHandle(),
    getZPatioHandle()
  );
  scene.add(backPlate);

  // BACK PLATE EDGES LINE SEGMENT
  const contour = path.getPoints(50);
  const frontEdges = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(contour),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  const backEdges = frontEdges.clone();
  backEdges.position.set(0, 0, baseExtrude);
  backPlate.add(frontEdges);
  backPlate.add(backEdges);

  let radiusTop = getLongHandleHeight();
  let radiusBottom =
      getBackPlateWidth() < 150
        ? 85
        : getBackPlateWidth() / 2 - getBackPlateWidth() / 20,
    cylinderHeight = 50;
  if (radiusTop > radiusBottom) {
    radiusTop = radiusBottom - 5;
  }

  // CYLINDER FRUSTRUM HANDLE BASE
  const slantheight = 40;
  const frustumCylinderBase = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    slantheight,
    32
  );
  const material = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const frustumCylinderBaseMesh = new THREE.Mesh(frustumCylinderBase, material);
  frustumCylinderBaseMesh.position.set(
    getBackPlateWidth() / 2,
    getBackPlateHeight() / 2 + getBackPlateHeight() / 8,
    cylinderHeight / 2 + baseExtrude + cylinderHeight
  );
  frustumCylinderBaseMesh.rotateX(Math.PI / 2);
  backPlate.add(frustumCylinderBaseMesh);

  // CYLINDER HANDLE BASE
  const cylinderBase = new THREE.CylinderGeometry(
    radiusBottom,
    radiusBottom,
    cylinderHeight,
    32
  );
  const cylinderBaseMesh = new THREE.Mesh(cylinderBase, material);
  cylinderBaseMesh.position.set(
    getBackPlateWidth() / 2,
    getBackPlateHeight() / 2 + getBackPlateHeight() / 8,
    cylinderHeight / 2 + baseExtrude
  );
  cylinderBaseMesh.rotateX(Math.PI / 2);
  backPlate.add(cylinderBaseMesh);

  // Lift and slide Handle
  const LASHandle = fun31A();
  frustumCylinderBaseMesh.add(LASHandle);
  LASHandle.position.set(
    -getHandleWidth() - curve_Width / 2,
    cylinderHeight * 2 + baseExtrude + 90,
    radiusTop / 2
  );
  LASHandle.rotateX(-Math.PI / 2);

  // cross Hole in the Bolt hole
  const crossHole1 = fun31C();
  crossHole1.position.set(
    getBackPlateWidth() / 2,
    -getBackPlateWidth() / 2 + boltDiameter / 2 + getBackPlateHeight() / 12,
    -4
  );
  backPlate.add(crossHole1);

  const crossHole2 = fun31C();
  crossHole2.position.set(
    getBackPlateWidth() / 2,
    getBackPlateHeight() +
      getBackPlateWidth() / 2 -
      boltDiameter / 2 -
      getBackPlateHeight() / 12,
    -4
  );
  backPlate.add(crossHole2);

  // CLONE THE Lift and slide handle - 2
  const rightBackPlateGeo = geo.clone();
  const rightBackPlateMat = geoMat.clone();
  const rightBackPlate = new THREE.Mesh(rightBackPlateGeo, rightBackPlateMat);
  rightBackPlate.position.set(getBackPlateWidth() + 100, 0, 0);
  // scene.add(rightBackPlate);

  const cylinderCloneMesh = new THREE.Mesh(
    frustumCylinderBase.clone(),
    material.clone()
  );
  rightBackPlate.add(cylinderCloneMesh);
  cylinderCloneMesh.position.set(
    getBackPlateWidth() / 2,
    getBackPlateHeight() / 2 + getBackPlateHeight() / 8,
    cylinderHeight / 2 + baseExtrude + cylinderHeight - 15
  );
  cylinderCloneMesh.rotateX(Math.PI / 2);

  const LASHandle2 = fun31A();
  cylinderCloneMesh.add(LASHandle2);
  LASHandle2.position.set(
    getHandleWidth() + curve_Width / 2 - 5,
    curveHandleHeight / 2 + baseExtrude + cylinderHeight / 2,
    -radiusTop / 2
  );
  LASHandle2.rotateX(-Math.PI / 2);
  LASHandle2.rotateZ(Math.PI);

  // cylinder base
  const cylinderBase2 = new THREE.CylinderGeometry(
    radiusBottom,
    radiusBottom,
    cylinderHeight,
    32
  );
  const cylinderBaseMesh2 = new THREE.Mesh(cylinderBase2, material);
  cylinderBaseMesh2.position.set(
    getBackPlateWidth() / 2,
    getBackPlateHeight() / 2 + getBackPlateHeight() / 8,
    cylinderHeight / 2 + baseExtrude
  );
  cylinderBaseMesh2.rotateX(Math.PI / 2);
  rightBackPlate.add(cylinderBaseMesh2);

  const crossHole3 = fun31C();
  crossHole3.position.set(
    getBackPlateWidth() / 2,
    -getBackPlateWidth() / 2 + boltDiameter / 2 + getBackPlateHeight() / 12,
    -4
  );
  rightBackPlate.add(crossHole3);

  const crossHole4 = fun31C();
  crossHole4.position.set(
    getBackPlateWidth() / 2,
    getBackPlateHeight() +
      getBackPlateWidth() / 2 -
      boltDiameter / 2 -
      getBackPlateHeight() / 12,
    -4
  );
  rightBackPlate.add(crossHole4);

  animate(() => {
    // Add your animation logic here
  });
}
//#endregion

//#region LS Handle
function fun31A() {
  const LS_Handle = new THREE.Shape();
  LS_Handle.moveTo(0, 0);
  LS_Handle.quadraticCurveTo(
    getHandleWidth() / 2,
    -getLongHandleHeight() / 8,
    getHandleWidth(),
    0
  );
  LS_Handle.lineTo(getHandleWidth(), getLongHandleHeight());
  LS_Handle.quadraticCurveTo(
    getHandleWidth() / 2,
    getLongHandleHeight() + getLongHandleHeight() / 8,
    0,
    getLongHandleHeight()
  );
  LS_Handle.lineTo();
  const LS_Handlegeometry = new THREE.ExtrudeGeometry(LS_Handle, {
    depth: handleBaseExtrude,
    bevelEnabled: false,
  });
  const LS_HandleMaterial = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
  });
  const LSHandleMesh = new THREE.Mesh(LS_Handlegeometry, LS_HandleMaterial);

  const handleCurve = fun31B();
  LSHandleMesh.add(handleCurve);

  return LSHandleMesh;
}
//#endregion

//#region LS Handle curve
function fun31B() {
  let curve_Width = 200;
  let curveHandleHeight = 200;
  // const h = new THREE.AxesHelper(10);
  // scene.add(h)
  const path = new THREE.Shape();
  path.moveTo(curve_Width / 2, 0);
  path.lineTo(0, 0);
  path.quadraticCurveTo(
    curve_Width / 5,
    curveHandleHeight / 2 + curveHandleHeight / 5,
    -curve_Width / 10,
    curveHandleHeight
  );
  path.quadraticCurveTo(
    -curve_Width / 10,
    curveHandleHeight,
    -curve_Width / 10 - curve_Width / 10,
    curveHandleHeight + curve_Width / 10
  );
  path.lineTo(
    -curve_Width / 10 - curve_Width / 10,
    curveHandleHeight + curve_Width / 10 + handleBaseExtrude
  );
  path.quadraticCurveTo(
    -curve_Width / 10,
    curveHandleHeight + curve_Width / 10 + handleBaseExtrude,
    curve_Width / 7,
    curveHandleHeight + curveHandleHeight / 3.5
  );
  path.lineTo(curve_Width / 3, curveHandleHeight + curveHandleHeight / 7);
  path.quadraticCurveTo(
    curve_Width / 2 - 5,
    curveHandleHeight / 2 + curveHandleHeight / 14,
    curve_Width / 2 + curve_Width / 20,
    0
  );

  const geo = new THREE.ExtrudeGeometry(path, {
    depth: getLongHandleHeight(),
    bevelEnabled: false,
  });
  const geoMat = new THREE.MeshPhysicalMaterial({
    color: "#e4e6e8",
    wireframe: false,
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geo, geoMat);
  mesh.position.set(
    getHandleWidth() + curve_Width / 5,
    getLongHandleHeight(),
    -curveHandleHeight - handleBaseExtrude / 2.5
  );
  mesh.rotateX(Math.PI / 2);
  // scene.add(mesh);

  return mesh;
}
//#endregion

//#region cross Hole
function fun31C() {
  // Bolt Hole
  const boltHole1 = new THREE.Shape();
  const boltDiameter = getBackPlateWidth() / 4 + 10;
  boltHole1.absarc(0, 0, boltDiameter / 2, 0, Math.PI * 2, false);

  const crossDimension = getBackPlateWidth() / 8;
  const crossPath = new THREE.Shape();
  crossPath.moveTo(5, 5);
  crossPath.lineTo(5, crossDimension / 2);
  crossPath.lineTo(-5, crossDimension / 2);
  crossPath.lineTo(-5, 5);
  crossPath.lineTo(-crossDimension / 2, 5);
  crossPath.lineTo(-crossDimension / 2, -5);
  crossPath.lineTo(-5, -5);
  crossPath.lineTo(-5, -crossDimension / 2);
  crossPath.lineTo(5, -crossDimension / 2);
  crossPath.lineTo(5, -5);
  crossPath.lineTo(crossDimension / 2, -5);
  crossPath.lineTo(crossDimension / 2, 5);
  crossPath.lineTo(5, 5);
  crossPath.lineTo(5, crossDimension / 2);

  boltHole1.holes.push(crossPath);

  const baseExtrude = 50;
  const bolt = new THREE.ExtrudeGeometry(boltHole1, {
    depth: baseExtrude,
    bevelEnabled: false,
  });
  const boltMat = new THREE.MeshPhysicalMaterial({
    color: "#e4e6q9",
    wireframe: false,
  });
  const boltPlate = new THREE.Mesh(bolt, boltMat);

  return boltPlate;
}
//#endregion

//#endregion

//#endregion

//#region Texture Mapping Fun41

function fun41() {
  const loader = new THREE.TextureLoader();

  function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const materials = [
    new THREE.MeshStandardMaterial({
      map: loadColorTexture("./Texture/texture26.png"),
      color: 0xffffff,
      roughness: 0.4,
      metalness: 1.0,
    }),
    new THREE.MeshStandardMaterial({
      map: loadColorTexture("./Texture/texture35.png"),
      color: 0xffffff,
      roughness: 0.4,
      metalness: 1.0,
    }),
    new THREE.MeshStandardMaterial({
      map: loadColorTexture("./Texture/texture40.png"),
      color: 0xffffff,
      roughness: 0.4,
      metalness: 1.0,
    }),
    new THREE.MeshStandardMaterial({
      map: loadColorTexture("./Texture/texture62.png"),
      color: 0xffffff,
      roughness: 0.5,
      metalness: 1.0,
    }),
    new THREE.MeshStandardMaterial({
      map: loadColorTexture("./Texture/texture67.png"),
      color: 0xffffff,
      roughness: 0.5,
      metalness: 1.0,
    }),
  ];

  // Lighting setup1
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const lightDirections = [
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, -1],
    [-1, 0, 0],
    [0, -1, 0],
  ];

  lightDirections.forEach((dir) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(...dir);
    scene.add(light);
  });

  const geometry = new THREE.BoxGeometry(40, 80, 4);
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);

  document.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "1":
        cube.material = materials[0];
        break;
      case "2":
        cube.material = materials[1];
        break;
      case "3":
        cube.material = materials[2];
        break;
      case "4":
        cube.material = materials[3];
        break;
      case "5":
        cube.material = materials[4];
        break;
    }
  });

  animate(() => {
    // Add your animation logic here
  });
}

//#endregion

// Start the app when DOM is loaded
window.addEventListener("DOMContentLoaded", allEventListenerHandles);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
