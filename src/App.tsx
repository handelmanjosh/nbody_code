import React, { useEffect, useState } from 'react';
import './App.css';
import { SpaceObject, Universe } from './components/Object';
import ValueChanger from './components/ValueChanger';
import CheckBox from './components/CheckBox';
import StaticUniverse, { StaticObject, VELOCITY_SCALE_FACTOR } from './components/StaticUniverse';
import BasicButton from './components/BasicButton';

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let width: number, height: number;
let universe: Universe;
let staticUniverse: StaticUniverse;
let autoRecenter: boolean = false;
let drawLine: boolean = false;
let paused: boolean = false;
let started_alt: boolean = false;
let actualId: number = -1;
let mass_scale = {value: Universe.MASS_SCALE, min: -5, max: 60};
let distance_scale = {value: Universe.DISTANCE_SCALE, min: -10, max: 1};
let xPos: number | undefined = undefined;
let yPos: number | undefined = undefined;
let r: number = 0;
let checked: boolean = false;
let canMake: boolean = true;
let drawingV: boolean = false;
const colors = ["aqua", "blue", "fuchsia", "gray", "green", "lime", "maroon", "navy",
                "olive", "purple", "red", "silver", "teal", "white", "yellow"];
const App = () => {
  const [started, setStarted] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number>(-1);
  const [objects, setObjects] = useState<SpaceObject[]>([]);
  const [totalMomentum, setTotalMomentum] = useState<number>(0);
  useEffect(() => {
    document.addEventListener("mousemove", drawHelper);
    if (window.innerWidth < 768) {
      width = height = 400;
    } else {
      width = height = 800;
    }
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = width; canvas.height = height;
    context = canvas.getContext("2d") as CanvasRenderingContext2D;
    universe = new Universe();
    staticUniverse = new StaticUniverse();
    // let sun2 = new SpaceObject(450, 350, 5000, 0, 20, universe, "orange", context)
    //universe.add([sun, sun2, earth]);
    resetCanvas();
    frame();
  }, []);

  const frame = async () => {
    if (!paused && started_alt) {
      resetCanvas();
      if (universe.Objects.length === 0) {
        let message = "No objects created!"
        context.font = "16px Arial";
        context.textAlign = "center";
        context.fillStyle = "white";
        context.fillText(message, canvas.width / 2, canvas.height / 2)
      }
      if (universe.Objects.length !== objects.length) {
        setObjects(universe.Objects);
      }
      universe.draw();
      //console.log(sun.ax, sun.ay);
      if (mass_scale.value !== Universe.MASS_SCALE) {
        Universe.MASS_SCALE = mass_scale.value;
      }
      if (distance_scale.value !== Universe.DISTANCE_SCALE) {
        Universe.DISTANCE_SCALE = distance_scale.value;
      }
      if (autoRecenter) {
        let target = findObject();
        if (target.x > canvas.width || target.y > canvas.height || target.x < 0 || target.y < 0) {
          recenter();
        }
      }
      if (drawLine) {
        universe.drawLines();
      }
    } else if (!started_alt) {
      staticUniverse.draw();
    }
    //await new Promise(res => setTimeout(res, 500));
    requestAnimationFrame(frame);
  };
  const resetCanvas = () => {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  const findObject = (): SpaceObject => {
    let result!: SpaceObject;
    universe.Objects.forEach(object => {
      if (object.id === actualId) {
        result = object;
      }
    });
    return result ?? universe.Objects[0];
  }
  const recenter = () => {
    if (universe.Objects.length === 0) return;
    let centerObject: SpaceObject = findObject();
    console.log(centerObject.color, centerObject.id);
    universe.Objects.forEach(object => {
      if (object !== centerObject) {
        let distance: number[] = objectDistance(centerObject, object);
        let newCoords: number[] = originToRectCoords(distance);
        object.x = newCoords[0];
        object.y = newCoords[1];
      }
    });
    centerObject.x = canvas.width / 2;
    centerObject.y = canvas.height / 2;
    universe.clearHistory();
  }
  const objectDistance = (o1: SpaceObject, o2: SpaceObject): number[] => {
    return [o2.x - o1.x, o2.y - o1.y];
  }
  const originToRectCoords = (n: number[]): number[] => {
    return [n[0] + (canvas.width / 2), n[1] + (canvas.height / 2)]
  }
  const turnRecenter = ()=> {
    autoRecenter = !autoRecenter;
  }
  const turnLine = () => {
    drawLine = !drawLine
  }
  const start = () => {
    setStarted(true);
    started_alt = true;
    universe.copy(staticUniverse);
    setTotalMomentum(universe.getTotalMomentum())
  }
  const stop = () => {
    universe.reset();
    started_alt = false;
    checked = false;
    setStarted(false);
    resetCanvas();
  }
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedId(Number(event.target.value));
    actualId = Number(event.target.value);
  };
  const change = () => {
    checked = !checked;
    if (checked) {
        document.addEventListener("mousedown", startObject);
        document.addEventListener("mouseup", endObject);
    } else {
        document.removeEventListener("mousedown", startObject);
        document.removeEventListener("mouseup", endObject);
    }
  }
  const startObject = (e: MouseEvent) => {
    console.log("startObject");
    if (!checked || !canMake) {
      console.log("returned");
      return;
    }
    canMake = false;
    const boundingRect = document.getElementById("canvas")!.getBoundingClientRect();
    if (e.clientX > boundingRect.left && e.clientX < boundingRect.right) {
        xPos = e.clientX;
        console.log("set x");
    }
    if (e.clientY > boundingRect.top && e.clientY < boundingRect.bottom) {
        yPos = e.clientY
        console.log('set y')
    }
    
  }
  const endObject = (e: MouseEvent) => { 
    console.log("endObject");
    if (xPos === undefined || yPos === undefined) {
        xPos = undefined; yPos = undefined; canMake = true; 
        console.log("returned 2");
        return;
    }
    
    r = distance([xPos, yPos], [e.clientX, e.clientY])
    console.log(e.clientX, e.clientY, {xPos, yPos, r});
    if (Math.abs(r) < 2) {
        xPos = undefined; yPos = undefined; r = 0; return;
    } else {
        document.addEventListener("mousedown", endVelocity, {once: true});
        console.log("got here!");
        drawingV = true;
    }
  } 
  const endVelocity = (e: MouseEvent) => {
    console.log("End Velocity");
    if (xPos === undefined || yPos === undefined) {
        xPos = undefined; yPos = undefined; r = 0; 
        drawingV = false;
        canMake = true;
        
        return;
    }
    drawingV = false;
    const dx = e.clientX - xPos;
    const dy = e.clientY - yPos;
    
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const boundingRect = canvas.getBoundingClientRect();
    const adjXPos = xPos - boundingRect.left;
    const adjYPos = yPos - boundingRect.top;
    const color = colors[~~(Math.random() * colors.length)];
    const s_object = new StaticObject(adjXPos, adjYPos, r, VELOCITY_SCALE_FACTOR * dx, VELOCITY_SCALE_FACTOR * dy, color, canvas.getContext("2d")!);
    staticUniverse.Objects.push(s_object);
    console.log("object created!!");
    xPos = undefined; yPos = undefined; r = 0;
    canMake = true;
  }
  const drawHelper = (e: MouseEvent) => {
    if (started_alt || !checked) {
      return;
    } else if (!canMake && !drawingV) {
      resetCanvas();
      let d = distance([xPos!, yPos!], [e.clientX, e.clientY]);
      const boundingRect = canvas.getBoundingClientRect();
      const adjXPos = xPos! - boundingRect.left;
      const adjYPos = yPos! - boundingRect.top;
      context.beginPath();
      context.strokeStyle = "red";
      context.arc(adjXPos, adjYPos, d, 0, Math.PI * 2);
      context.stroke();
    } else if (drawingV) {
      resetCanvas();
      const boundingRect = canvas.getBoundingClientRect();
      const adjXPos = xPos! - boundingRect.left;
      const adjYPos = yPos! - boundingRect.top;
      const adjX = e.clientX - boundingRect.left;
      const adjY = e.clientY - boundingRect.top;
      context.beginPath();
      context.lineWidth = 3;
      context.strokeStyle = "blue";
      context.moveTo(adjXPos, adjYPos);
      context.lineTo(adjX, adjY);
      context.stroke();
    }
  }
  const clear = () => {staticUniverse.Objects = []; resetCanvas();}
  const distance = (a: number[], b: number[]) => Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2);
  return (
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex flex-row items-center justify-center gap-4">
          {!started ? <BasicButton click={start} text="Start"/> : <BasicButton click={stop} text="Stop"/>}
          <CheckBox onChecked={() => { paused = !paused }} text="Pause" />
        </div>
         <div className="flex flex-row items-center justify-center gap-3">
            <div className="flex flex-col items-center justify-center">
                <ValueChanger target={mass_scale} name="Mass Scaling: (1.0*10^x)" resetTarget={[mass_scale, 12]} />
            </div>
            <canvas className="rounded-lg" id="canvas" style={{width: width, height: height}} />
            <div className="flex flex-col items-center justify-center">
              <ValueChanger target={distance_scale} name="Distance Scaling: (1.0*10^x)" resetTarget={[distance_scale, -4]} />
            </div>
          </div>
          <div className="flex flex-row items-center gap-5 justify-center">
            <div>
              <select className="appearance-none outline-none border-none bg-blue-600 hover:bg-blue-800 active:bg-blue-800 rounded-md px-4 py-2" id="options" value={selectedId} onChange={handleOptionChange}>
                <option value=""> Recenter Target: </option>
                {objects.map((object) => (
                  <option key={`${object.color} - ${object.id}`} value={object.id}>
                     {`${object.color} - ${object.id}`} 
                  </option>
                ))}
                </select>
            </div>
            <BasicButton click={recenter} text="Recenter" />
            <CheckBox onChecked={turnRecenter} text="Auto-Recenter" />
            <CheckBox onChecked={turnLine} text="Draw History"/>
            {started ? <></> : <BasicButton click={clear} text="Clear" />}
            {started ? <></> :         
              <div className="flex flex-row justify-center items-center gap-3">
                <input
                  type="checkbox"
                  onChange={change}
                  className="appearance-none w-4 h-4 border border-gray-300 rounded-sm checked:bg-blue-500 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                />
              <p className="align-middle text-lg"> {"Create Object"} </p>
            </div>
            }
          </div>
          <div className="flex flex-row justify-center items-center gap-4 mt-6">
            <p> {`Total System Momentum: ${Math.round(totalMomentum)}`} </p>
          </div>
      </div>
  );
}

export default App;
