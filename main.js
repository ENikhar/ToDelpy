//#region Initialize the app
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSG } from "three-csg-ts";
let scene, renderer, camera, controls, animationId;
const canvas = document.getElementById("three-canvas");
renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  4000
);
camera.position.z = 100;

controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// List of all the Event Listerner
function allEventListenerHandles() {
  document
    .getElementById("btn1")
    .addEventListener("click", () => loadProject(fun1));
  document
    .getElementById("btn2")
    .addEventListener("click", () => loadProject(fun2));
  document
    .getElementById("btn3")
    .addEventListener("click", () => loadProject(fun3));
  document
    .getElementById("btn4")
    .addEventListener("click", () => loadProject(fun4));
  document
    .getElementById("btn5")
    .addEventListener("click", () => loadProject(fun5));
  document
    .getElementById("btn6")
    .addEventListener("click", () => loadProject(fun6));
  document
    .getElementById("btn7")
    .addEventListener("click", () => loadProject(fun7));
  document
    .getElementById("btn8")
    .addEventListener("click", () => loadProject(fun8));
  document
    .getElementById("btn9")
    .addEventListener("click", () => loadProject(fun9));
  document
    .getElementById("btn10")
    .addEventListener("click", () => loadProject(fun10));
  document
    .getElementById("btn11")
    .addEventListener("click", () => loadProject(fun11));
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

//#region  Project clicking
function fun1() {
  //#region Raycast
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const polygonVertices = [];
  const vectorAngles = [];
  const vertexAngles = [];
  const extrudeStartPoints = [];
  const extrudeEndPoints = [];
  const cuttingLines = [];
  const extrudeDirectionsByEdge = [];
  const extrusionHeight = 10;

  const planeGeometry = new THREE.PlaneGeometry(500, 500);
  const planeMaterial = new THREE.MeshBasicMaterial({
    visible: false,
    color: "white",
  });
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
  const drawingPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  // drawingPlane.scale.set(0.1, 0.1, 0.1);
  drawingPlane.position.set(0, 0, 5);
  scene.add(drawingPlane);
  //#endregion

  function drawCircleAt(point) {
    const circle = new THREE.Mesh(
      new THREE.CircleGeometry(1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    circle.position.copy(point);
    scene.add(circle);
  }

  function extrudeFaceBetween(startPoint, endPoint) {
    const shape = new THREE.Shape();
    const depth = 0;
    const height = extrusionHeight;
    shape.moveTo(0, 0);
    shape.lineTo(depth, 0);
    shape.lineTo(depth, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    const path = new THREE.LineCurve3(startPoint, endPoint);
    const extrudeSettings = {
      steps: 1,
      bevelEnabled: false,
      extrudePath: path,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhysicalMaterial({ color: "#e4e6e8" });
    const mesh = new THREE.Mesh(geometry, material);

    const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
    let dominantAxis;
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      dominantAxis = direction.x > 0 ? "x" : "-x";
    } else if (Math.abs(direction.y) > Math.abs(direction.x)) {
      dominantAxis = direction.y > 0 ? "y" : "-y";
    }

    extrudeDirectionsByEdge.push(dominantAxis);

    const positionAttribute = geometry.attributes.position;
    const uniqueVerticesSet = new Set();
    const uniqueVertices = [];
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      const vertex = JSON.stringify([x, y, z]);
      if (!uniqueVerticesSet.has(vertex)) {
        uniqueVerticesSet.add(vertex);
        uniqueVertices.push([x, y, z]);
      }
    }

    extrudeStartPoints.push(uniqueVertices[2]);
    extrudeEndPoints.push(uniqueVertices[0]);

    scene.add(mesh);
  }

  function calculateAngles() {
    if (polygonVertices.length < 3) return;
    for (let i = 1; i < polygonVertices.length; i++) {
      if (i == polygonVertices.length - 1) {
        polygonVertices[0] = polygonVertices[1];
      }
      const prevVertex =
        polygonVertices[
        (i - 1 + polygonVertices.length) % polygonVertices.length
        ];
      const currentVertex = polygonVertices[i];
      const nextVertex = polygonVertices[(i + 1) % polygonVertices.length];

      // This is the point where the angle is calculated using th side of the rectangle shape
      const pointLeft = new THREE.Vector3(...extrudeStartPoints[i - 1]);
      const commonPoint = new THREE.Vector3(...polygonVertices[i]);
      const pointRight = new THREE.Vector3(
        ...extrudeEndPoints[i % extrudeEndPoints.length]
      );
      // drawCircleAt(pointLeft);
      // drawCircleAt(pointRight);
      // drawCircleAt(commonPoint);
      const vectorAvertexAngle = new THREE.Vector3().subVectors(
        pointLeft,
        commonPoint
      );
      const vectorBvertexAngle = new THREE.Vector3().subVectors(
        pointRight,
        commonPoint
      );
      const vertexAngle = vectorAvertexAngle.angleTo(vectorBvertexAngle);
      vertexAngles.push(vertexAngle);
      // Ends here

      const vectorA = new THREE.Vector3().subVectors(prevVertex, currentVertex);
      const vectorB = new THREE.Vector3().subVectors(nextVertex, currentVertex);
      const angle = vectorA.angleTo(vectorB);
      vectorAngles.push(angle);
      console.log(prevVertex, currentVertex, nextVertex);

      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 64;
      const context = canvas.getContext("2d");
      context.fillStyle = "rgb(255, 255, 255)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = "24px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText(
        (vertexAngle * (180 / Math.PI)).toFixed(1) + "°",
        canvas.width / 2,
        canvas.height / 2 + 8
      );

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(currentVertex);
      sprite.scale.set(0.5, 0.25, 1);
      sprite.userData.isAngleLabel = true;
      // scene.add(sprite);

      const bisector = new THREE.Vector3()
        .addVectors(vectorA.normalize(), vectorB.normalize())
        .normalize();

      const arrowLength = extrusionHeight * 1.2;
      const arrowColor = 0xffffff;
      const arrowEnd = new THREE.Vector3().addVectors(
        currentVertex,
        bisector.multiplyScalar(arrowLength)
      );
      cuttingLines.push(arrowEnd);
      const arrowLineGeometry = new THREE.BufferGeometry().setFromPoints([
        currentVertex,
        arrowEnd,
      ]);
      const arrowLineMaterial = new THREE.LineBasicMaterial({
        color: arrowColor,
      });
      const arrowLine = new THREE.Line(arrowLineGeometry, arrowLineMaterial);
      scene.add(arrowLine);
    }
  }

  function findExtrudePath() {
    for (let i = 0; i < polygonVertices.length - 1; i++) {
      extrudeFaceBetween(polygonVertices[i], polygonVertices[i + 1]);
    }
  }

  function stepFinal() {
    vectorAngles.forEach((angle) => {
      console.log(angle * (180 / Math.PI));
    });
    vertexAngles.forEach((angle) => {
      console.log(angle * (180 / Math.PI));
    });

    let faceIndex = 0;
    scene.traverse((child) => {
      if (child.isMesh && child.geometry instanceof THREE.ExtrudeGeometry) {
        const geometry = child.geometry;
        const positionAttribute = geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
          const x = positionAttribute.getX(i);
          const y = positionAttribute.getY(i);
          const z = positionAttribute.getZ(i);

          const start = extrudeStartPoints[faceIndex];
          const end = extrudeEndPoints[faceIndex];
          if (x === start[0] && y === start[1] && z === start[2]) {
            positionAttribute.setXYZ(
              i,
              cuttingLines[faceIndex].x,
              cuttingLines[faceIndex].y,
              z
            );
          }

          if (x === end[0] && y === end[1] && z === end[2]) {
            positionAttribute.setXYZ(
              i,
              cuttingLines[
                (cuttingLines.length - 1 + faceIndex) % cuttingLines.length
              ].x,
              cuttingLines[
                (cuttingLines.length - 1 + faceIndex) % cuttingLines.length
              ].y,
              z
            );
          }
        }
        faceIndex++;
      }
    });

    // console.log(extrudeStartPoints);
  }
  let isToStop = false;
  function ch() {
    function onClick(event) {
      console.log("clicked");

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(drawingPlane);

      if (intersects.length > 0) {
        const clickedPoint = intersects[0].point;
        const clickedVec = new THREE.Vector3(clickedPoint.x, clickedPoint.y, 5);
        polygonVertices.push(clickedVec);

        // Check if the shape is closed (clicked near the first point)
        const firstPoint = polygonVertices[0];
        console.log(polygonVertices, clickedPoint);

        const isClosed =
          polygonVertices.length > 1 &&
          parseFloat(clickedPoint.x.toFixed(0)) ===
          parseFloat(polygonVertices[0].x.toFixed(0)) &&
          parseFloat(clickedPoint.y.toFixed(0)) ===
          parseFloat(polygonVertices[0].y.toFixed(0)) &&
          parseFloat(clickedPoint.z.toFixed(0)) ===
          parseFloat(polygonVertices[0].z.toFixed(0));

          console.log(isClosed);
          

        if (isClosed) {
          isToStop = true;
          console.log("Got the starting point. Polygon closed.");
          polygonVertices[polygonVertices.length - 1] = firstPoint.clone(); // ensure closure

          findExtrudePath();
          calculateAngles();
          stepFinal();
        }

        if (!isToStop) {
          drawCircleAt(clickedVec);
        }
      }

      animate(() => { });
    }
    window.addEventListener("click", onClick);
  }

  setTimeout(ch, 100);


}
//#endregion

//#region Function 2
function fun2() {
  camera.position.set(0, 0, 700);
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
  const doormat = new THREE.MeshPhysicalMaterial({ color: "#e4e6e8" });
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
  const handleMesh = new THREE.MeshPhysicalMaterial({ color: "#e4e6e8" });
  const handlesrMeshDiagonal = new THREE.Mesh(handles, handleMesh);
  handlesrMeshDiagonal.position.set(
    origin.x + holeDiameter + 14,
    origin.y + doorHeight - holeDiameter - 14,
    shapeDeep
  );
  handlesrMeshDiagonal.rotateZ(Math.PI / 4);
  scene.add(handlesrMeshDiagonal);

  // clone Handle

  //  Handle DOWN
  const handleDown = handles.clone();
  const handleDownMat = new THREE.MeshPhysicalMaterial({ color: "#e4e6e8" });
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
  const handleRightMat = new THREE.MeshPhysicalMaterial({ color: "#e4e6e8" });
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
  // handlesrMeshDiagonal.add(handleEdges);

  // Edge line for Door geometry
  const doorEdgeo = new THREE.EdgesGeometry(door);
  const doorEdmat = new THREE.LineBasicMaterial({ color: "white" });
  const doorEdges = new THREE.LineSegments(doorEdgeo, doorEdmat);
  scene.add(doorEdges);

  animate(() => { });
}
//#endregion

//#region  Project 3:

function fun3() {
  camera.position.set(-100, 0, -100);
  const directional = new THREE.DirectionalLight(0xffffff, 3); // Soft white light
  directional.position.set(0, 40, 0);
  scene.add(directional);
  const directional1 = new THREE.DirectionalLight(0xffffff, 1); // Soft white light
  directional1.position.set(-40, 0, 0);
  scene.add(directional1);

  const ambientLight3 = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight3);

  function RectangleShapeHeight() {
    return 50;
  }

  // Width of Rectangular shape
  function RectangularShapeWidth() {
    return 30;
  }

  // Extrude Length of Rectangular shape
  function rectangleExtrudeLength() {
    return 300;
  }

  //#region Type - 3  Multiple slices

  const leftLinePoints = [
    new THREE.Vector3(0, 0, 0), // left line start coordinate
    new THREE.Vector3(0, 50, 100), // left line end coordinate
  ];

  const rightLinePoints = [
    new THREE.Vector3(0, 0, 200), // right line start coordinate
    new THREE.Vector3(0, 51, 300), // right line end coordinate
  ];

  // Create a CatmullRomCurve3 curve
  const leftCurve = new THREE.CatmullRomCurve3(leftLinePoints);
  const rightCurve = new THREE.CatmullRomCurve3(rightLinePoints);

  // Generate the Cut Line from the given Vertices
  const leftCurvePoints = leftCurve.getPoints(100);
  leftCurvePoints.forEach((v) => {
    // top edge for end point
    if (Math.round(v.y) == RectangleShapeHeight() && v.z >= 0) {
      leftLinePoints[1].y = RectangleShapeHeight();
      leftLinePoints[1].z = v.z;
    }
    // left edge for end point
    if (Math.round(v.z) == 0) {
      leftLinePoints[1].y = v.y;
      leftLinePoints[1].z = 0;
    }
  });
  leftCurvePoints.forEach((v) => {
    // left edge for start point
    if (Math.round(v.z) == 0 && leftLinePoints[1].y == RectangleShapeHeight()) {
      leftLinePoints[0].y = v.y;
      leftLinePoints[0].z = 0;
    }
    // down edge for start point
    if (Math.round(v.y) == 0) {
      leftLinePoints[0].y = 0;
      leftLinePoints[0].z = v.z;
    }
  });

  const rightCurvePoints = rightCurve.getPoints(100);
  rightCurvePoints.forEach((v) => {
    // top edge for end point
    if (
      Math.round(v.y) == RectangleShapeHeight() &&
      v.z <= rectangleExtrudeLength()
    ) {
      rightLinePoints[1].y = RectangleShapeHeight();
      rightLinePoints[1].z = v.z;
    }
    // right edge for end point
    if (Math.round(v.z) == rectangleExtrudeLength()) {
      rightLinePoints[1].y = v.y;
      rightLinePoints[1].z = rectangleExtrudeLength();
    }
  });
  rightCurvePoints.forEach((v) => {
    // right edge for start point
    if (
      Math.round(v.z) == rectangleExtrudeLength() &&
      rightLinePoints[1].y == RectangleShapeHeight()
    ) {
      // console.log(Math.round(v.x) , Math.round(v.y) , Math.round(v.z));
      rightLinePoints[0].y = v.y;
      rightLinePoints[0].z = rectangleExtrudeLength();
    }
    // down edge for start point
    if (Math.round(v.y) == 0) {
      // console.log(Math.round(v.x) , Math.round(v.y) , Math.round(v.z));
      rightLinePoints[0].y = 0;
      rightLinePoints[0].z = v.z;
    }
  });

  const leftGeometry = new THREE.BufferGeometry().setFromPoints(
    leftCurvePoints
  );
  const rightGeometry = new THREE.BufferGeometry().setFromPoints(
    rightCurvePoints
  );
  // Create a material for the line
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  // Create the line object
  const rightLine = new THREE.Line(rightGeometry, material);
  const leftLine = new THREE.Line(leftGeometry, material);

  // Add the line to the scene
  scene.add(leftLine);
  scene.add(rightLine);
  function HollowRectangleShape_Type3() {
    const rectangleExtrudeShape = RectangleShape(RectangleShapeHeight() / 2);

    // Extrude settings for rectangular shape
    const extrudeLength = rectangleExtrudeLength();
    const extrudeSettings = {
      depth: rectangleExtrudeLength(),
      steps: 1,
      bevelEnabled: false,
    };

    // rectangular Geometry , material and Mesh
    const rectangleTopExtrude = new THREE.ExtrudeGeometry(
      rectangleExtrudeShape,
      extrudeSettings
    );
    const rectangleTopMaterial = new THREE.MeshPhysicalMaterial({
      color: "#a2afbd",
      wireframe: false,
    });
    const rectangleTopMesh = new THREE.Mesh(
      rectangleTopExtrude,
      rectangleTopMaterial
    );
    RectangularShapeCalculation(rectangleTopExtrude, extrudeLength);
    scene.add(rectangleTopMesh);

    animate(() => { });
  }
  //#endregion

  // Edge cutting calculation
  function RectangularShapeCalculation(geometry, extrudeLength) {
    // console.log("Left Line cutting vertices ", leftLinePoints[0], leftLinePoints[1]);
    // console.log("Right Line cutting vertices ", rightLinePoints[0], rightLinePoints[1]);
    const positionAttribute = geometry.attributes.position;

    const leftStartCoordinate = leftLinePoints[0];
    const leftEndCoordinate = leftLinePoints[1];

    const rightStartCoordinate = rightLinePoints[0];
    const rightEndCoordinate = rightLinePoints[1];

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      // LEFT LINE CUTTING
      if (
        leftStartCoordinate.y <= 0 &&
        leftStartCoordinate.z >= 0 &&
        leftStartCoordinate.z < rightStartCoordinate.z
      ) {
        if (z == 0 && (y == 0 || y == RectangularShapeWidth() / 20)) {
          if (y == 0)
            positionAttribute.setXYZ(
              i,
              x,
              leftStartCoordinate.y,
              leftStartCoordinate.z
            );
          if (y == RectangularShapeWidth() / 20)
            positionAttribute.setXYZ(
              i,
              x,
              leftStartCoordinate.y + RectangularShapeWidth() / 20,
              leftStartCoordinate.z + RectangularShapeWidth() / 20
            );
        }
      }
      if (leftEndCoordinate.y > 0 && leftEndCoordinate.z >= 0) {
        if (y == RectangleShapeHeight() / 2 && z == 0) {
          positionAttribute.setXYZ(
            i,
            x,
            leftEndCoordinate.y,
            leftEndCoordinate.z
          );
        }

        if (leftEndCoordinate.z != 0) {
          if (
            z == 0 &&
            (y == RectangleShapeHeight() ||
              y == RectangleShapeHeight() - RectangularShapeWidth() / 20)
          ) {
            if (y == RectangleShapeHeight())
              positionAttribute.setXYZ(
                i,
                x,
                leftEndCoordinate.y,
                leftEndCoordinate.z
              );
            if (y == RectangleShapeHeight() - RectangularShapeWidth() / 20)
              positionAttribute.setXYZ(
                i,
                x,
                leftEndCoordinate.y - RectangularShapeWidth() / 20,
                leftEndCoordinate.z + RectangularShapeWidth() / 20
              );
          }
        }
      }
      if (leftStartCoordinate.y > 0 && leftStartCoordinate.z == 0) {
        if (y == RectangleShapeHeight() / 2 && z == 0) {
          positionAttribute.setXYZ(
            i,
            x,
            leftStartCoordinate.y,
            leftStartCoordinate.z
          );
        }
      }

      // RIGHT LINE CUTTING

      if (
        rightStartCoordinate.y <= 0 &&
        rightStartCoordinate.z <= rectangleExtrudeLength() &&
        rightStartCoordinate.z > leftStartCoordinate.z
      ) {
        if (
          z == rectangleExtrudeLength() &&
          (y == 0 || y == RectangularShapeWidth() / 20)
        ) {
          positionAttribute.setXYZ(
            i,
            x,
            rightStartCoordinate.y,
            rightStartCoordinate.z
          );
        }
        if (z == rectangleExtrudeLength() && y == RectangleShapeHeight() / 2) {
          positionAttribute.setXYZ(
            i,
            x,
            rightEndCoordinate.y,
            rightEndCoordinate.z
          );
        }
      }

      if (
        rightEndCoordinate.y >= RectangleShapeHeight() &&
        rightEndCoordinate.z <= rectangleExtrudeLength() &&
        rightEndCoordinate.z > leftEndCoordinate.z
      ) {
        if (
          z == rectangleExtrudeLength() &&
          (y == RectangleShapeHeight() ||
            y == RectangleShapeHeight() - RectangularShapeWidth() / 20)
        ) {
          positionAttribute.setXYZ(
            i,
            x,
            rightEndCoordinate.y,
            rightEndCoordinate.z
          );
        }
      }

      if (
        rightStartCoordinate.y > 0 &&
        rightStartCoordinate.z == rectangleExtrudeLength()
      ) {
        if (z == rectangleExtrudeLength() && y == RectangleShapeHeight() / 2) {
          positionAttribute.setXYZ(
            i,
            x,
            rightStartCoordinate.y,
            rightStartCoordinate.z
          );
        }
      }
    }
  }

  // Rectangle shape geometry
  function RectangleShape(variableHeight) {
    const shape = new THREE.Shape();
    const height = RectangleShapeHeight();
    const changeHeight = variableHeight;
    const width = RectangularShapeWidth();
    const offset = width / 20;
    const origin = new THREE.Vector2(0, 0);

    shape.moveTo(origin.x, origin.y);
    shape.lineTo(origin.x, origin.y + changeHeight);
    shape.lineTo(origin.x, origin.y + height);
    shape.lineTo(origin.x + width, origin.y + height);
    shape.lineTo(origin.x + width, origin.y + changeHeight);
    shape.lineTo(origin.x + width, origin.y);
    shape.lineTo(origin.x + 1, origin.y);
    shape.lineTo(origin.x + 1, origin.y + offset);
    shape.lineTo(origin.x + width - offset, origin.y + offset);
    shape.lineTo(origin.x + width - offset, origin.y + changeHeight);
    shape.lineTo(origin.x + width - offset, origin.y + height - offset);
    shape.lineTo(origin.x + offset, origin.y + height - offset);
    shape.lineTo(origin.x + offset, origin.y + changeHeight);
    shape.lineTo(origin.x + offset, origin.y);

    return shape;
  }

  HollowRectangleShape_Type3();
}
//#endregion

//#region  Project 4:
function fun4() {
  camera.position.set(-20, 10, 30);

  const shapeHeight = 10,
    shapeWidth = 10;
  const ambientLight = new THREE.AmbientLight(0xffffff, 3);
  scene.add(ambientLight);

  const loader = new THREE.TextureLoader();

  function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / shapeWidth, 1 / shapeHeight);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  const materials = new THREE.MeshStandardMaterial({
    map: loadColorTexture("./Texture/brick3.jpg"),
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
  });

  const extrudeSettings = {
    depth: 10,
  };
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(shapeWidth, 0);
  shape.lineTo(shapeWidth, shapeHeight);
  shape.lineTo(0, shapeHeight);

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mesh = new THREE.Mesh(geometry, materials);
  scene.add(mesh);

  animate(() => { });
}
//#endregion

//#region  Project 5
function fun5() {
  camera.position.z = 100;
  camera.position.y = 0;
  const loader = new THREE.TextureLoader();

  function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const materials = new THREE.MeshStandardMaterial({
    map: loadColorTexture("./Texture/earth.jpg"),
    color: 0xffffff,
    roughness: 0.5,
    metalness: 1.0,
  });
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

  const geometry = new THREE.SphereGeometry(40);
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);

  animate(() => { });
}
//#endregion

//#region  Project 6:
function fun6() {
  camera.position.set(0, 10, 10);
  const light1 = new THREE.SpotLight(0xffffff, 100);
  light1.position.set(2.5, 5, 5);

  scene.add(light1);

  const light2 = new THREE.SpotLight(0xffffff, 100);
  light2.position.set(-2.5, 5, 5);

  scene.add(light2);

  const cubeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial()
  );
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );
  cubeMesh.position.set(-5, 0, -6);
  scene.add(cubeMesh);
  sphereMesh.position.set(-2, 0, -6);
  scene.add(sphereMesh);

  const cubeCSG = CSG.fromMesh(cubeMesh, 0);
  const sphereCSG = CSG.fromMesh(sphereMesh, 1);

  const cubeSphereIntersectCSG = cubeCSG.intersect(sphereCSG);
  const cubeSphereIntersectMesh = CSG.toMesh(
    cubeSphereIntersectCSG,
    new THREE.Matrix4(),
    [cubeMesh.material, sphereMesh.material]
  );
  cubeSphereIntersectMesh.position.set(-2.5, 0, -3);
  scene.add(cubeSphereIntersectMesh);

  // Create 3 cylinders and union them
  const cylinderMesh1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
    new THREE.MeshStandardMaterial({ color: 0xffbf00 })
  );
  const cylinderMesh2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  const cylinderMesh3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
    new THREE.MeshStandardMaterial({ color: 0x9f2b68 })
  );
  cylinderMesh1.position.set(1, 0, -6);
  scene.add(cylinderMesh1);
  cylinderMesh2.position.set(3, 0, -6);
  cylinderMesh2.geometry.rotateX(Math.PI / 2);
  scene.add(cylinderMesh2);
  cylinderMesh3.position.set(5, 0, -6);
  cylinderMesh3.geometry.rotateZ(Math.PI / 2);
  scene.add(cylinderMesh3);

  const cylinderCSG1 = CSG.fromMesh(cylinderMesh1, 2);
  const cylinderCSG2 = CSG.fromMesh(cylinderMesh2, 3);
  const cylinderCSG3 = CSG.fromMesh(cylinderMesh3, 4);
  const cylindersUnionCSG = cylinderCSG1.union(
    cylinderCSG2.union(cylinderCSG3)
  );

  const cylindersUnionMesh = CSG.toMesh(cylindersUnionCSG, new THREE.Matrix4());
  cylindersUnionMesh.material = [
    cylinderMesh2.material,
    cylinderMesh1.material,
    cylinderMesh3.material,
  ];
  cylindersUnionMesh.position.set(2.5, 0, -3);
  scene.add(cylindersUnionMesh);

  // Subtract the cylindersUnionCSG from the cubeSphereIntersectCSG
  const finalCSG = cubeSphereIntersectCSG.subtract(cylindersUnionCSG);
  const finalMesh = CSG.toMesh(finalCSG, new THREE.Matrix4());
  finalMesh.material = [
    cubeMesh.material,
    sphereMesh.material,
    cylinderMesh1.material,
    cylinderMesh2.material,
    cylinderMesh3.material,
  ];
  scene.add(finalMesh);

  animate(() => { });
}
//#endregion

//#region  Project 7
function fun7() {
  camera.position.set(90, 80, 0);
  const directional = new THREE.DirectionalLight(0xffffff, 3); // Soft white light
  directional.position.set(0, 40, 0);
  scene.add(directional);
  const directional1 = new THREE.DirectionalLight(0xffffff, 1); // Soft white light
  directional1.position.set(-40, 0, 0);
  scene.add(directional1);

  const ambientLight3 = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight3);

  const height = 23,
    holePlateWidth = 10,
    lockPlateWidth = 20,
    offset = 2,
    lockExtrusionLength = 22,
    lockWidth = 23,
    lockHeight = 20;

  function createCircleHole(x, y, diameter) {
    const hole = new THREE.Path();
    hole.absarc(x, y, diameter / 2, 0, Math.PI * 2, false);
    return hole;
  }

  function basePlate() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(lockPlateWidth / 2 + holePlateWidth, 0);
    shape.lineTo(lockPlateWidth / 2 + holePlateWidth, -lockExtrusionLength);
    shape.lineTo(-lockPlateWidth / 2 - holePlateWidth, -lockExtrusionLength);
    shape.lineTo(-lockPlateWidth / 2 - holePlateWidth, 0);
    shape.lineTo();

    shape.holes.push(
      createCircleHole(
        -lockPlateWidth / 2 - holePlateWidth / 2,
        -lockExtrusionLength / 2,
        holePlateWidth / 2
      )
    );
    shape.holes.push(
      createCircleHole(
        lockPlateWidth / 2 + holePlateWidth / 2,
        -lockExtrusionLength / 2,
        holePlateWidth / 2
      )
    );

    const extrudeSettings = {
      depth: offset,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhysicalMaterial({
      color: "#e4e6e8",
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(-Math.PI / 2);
    scene.add(mesh);

    // Base plate lock
    const basePlateLock = basepLateCurve();
    mesh.add(basePlateLock);

    // Base plate key lock
    const keyLockMesh = keyLock();
    mesh.add(keyLockMesh);

    // traingle lock
    const triangleLock = triangleBalaLock();
    triangleLock.rotateY(Math.PI / 2);
    mesh.add(triangleLock);

    animate(() => { });
  }

  function basepLateCurve() {
    const shape = new THREE.Shape();
    shape.moveTo(0, height);
    shape.lineTo(lockPlateWidth / 2, height);
    shape.lineTo(lockPlateWidth / 2, 0);
    shape.lineTo(lockPlateWidth / 2 - offset, 0);
    shape.lineTo(lockPlateWidth / 2 - offset, height - offset);
    shape.lineTo(-lockPlateWidth / 2 + offset, height - offset);
    shape.lineTo(-lockPlateWidth / 2 + offset, 0);
    shape.lineTo(-lockPlateWidth / 2, 0);
    shape.lineTo(-lockPlateWidth / 2, height);

    const extrudeSettings = {
      depth: lockExtrusionLength,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhysicalMaterial({
      color: "#e4e6e8",
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(Math.PI / 2);
    return mesh;
  }

  function triangleBalaLock() {
    const keyExtrusionLength = 10;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, lockHeight, lockHeight, Math.PI * 1.5, Math.PI, true);
    shape.lineTo(0, lockHeight);
    shape.lineTo();

    const extrudeSettings = {
      depth: keyExtrusionLength,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhysicalMaterial({
      color: "#e4e6e8",
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateZ(Math.PI);
    mesh.position.set(keyExtrusionLength / 2, lockHeight + 1, 0);
    return mesh;
  }
  function keyLock() {
    const keyExtrusionLength = 10;
    const arcRadius = offset;
    const shape = new THREE.Shape();
    shape.moveTo(offset, 0);
    shape.absarc(offset, offset, arcRadius, Math.PI * 1.5, Math.PI, true);
    shape.absarc(
      offset,
      lockHeight - offset,
      arcRadius,
      Math.PI,
      Math.PI / 2,
      true
    );
    shape.absarc(
      lockWidth - offset,
      lockHeight - offset,
      arcRadius,
      Math.PI / 2,
      0,
      true
    );
    shape.absarc(lockWidth - offset, offset, arcRadius, 0, Math.PI * 1.5, true);
    shape.holes.push(
      createCircleHole(lockWidth / 2, lockHeight / 2, lockWidth / 1.5)
    );

    const extrudeSettings = {
      depth: keyExtrusionLength,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhysicalMaterial({
      color: "#e4e6e8",
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateY(-Math.PI / 2);
    mesh.position.set(
      keyExtrusionLength / 2,
      -lockExtrusionLength - lockWidth + offset * 1.5,
      0
    );
    return mesh;
  }

  basePlate();
}
//#endregion

//#region Function 8
const turnRight = false;

//#region Function - 1  Lock Base
function fun8() {
  camera.position.z = 80;
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
    y_handle_Position = 30,
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
  animate(() => { });
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

//#region Handle (fun 9 ) (Patio handle)
let turnLeft = true;
let height = 400;
let width = 100;
let CylinderHeight = 10;
let CylinderWidthLength = 70;
let y_key_pos = 0;
let y_design = 0;
let cylinderWidth = width / 4;

//#region Hnadle Base
function fun9() {
  camera.position.z = 900;
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
  const x_Patio_handle = -200,
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
  Patio_handle_clone.position.set(200, 0, 0);
  scene.add(Patio_handle_clone);

  animate(() => { });
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

//#region Handle (fun 10) (Lift and slide handle)

function getBackPlateHeight() {
  return 600;
}

function getBackPlateWidth() {
  return 300;
}

function getHandleWidth() {
  return 500;
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
  return true;
}

function getKeyPosition() {
  return 0;
}

// fixed
let curveHandleHeight = 70;
let curve_Width = 200;
const handleBaseExtrude = 50;


//#region Main function
function fun10() {
  camera.position.z = 1000;
  camera.position.y = -1200;
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
    keyLength = 0,
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

  animate(() => { });
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

//#region Texture Mapping Fun11

function fun11() {
  camera.position.z = 100;
  camera.position.y = 0;
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

  animate(() => { });
}

//#endregion

//#region  Start the app when DOM is loaded
window.addEventListener("DOMContentLoaded", allEventListenerHandles);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
//#endregion
