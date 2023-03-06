import StaticUniverse, { StaticObject, VELOCITY_SCALE_FACTOR } from "./StaticUniverse";

//UNUSED FOR NOW!!
type CreateObjectProps = {
    staticUniverse: StaticUniverse;
}
let xPos: number | undefined = undefined;
let yPos: number | undefined = undefined;
let r: number = 0;
let checked: boolean = false;
let canMake: boolean = true;
const colors = ["aqua", "blue", "fuchsia", "gray", "green", "lime", "maroon", "navy",
                "olive", "purple", "red", "silver", "teal", "white", "yellow"];
export default function CreateObject({ staticUniverse }: CreateObjectProps) {
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
        if (!checked || !canMake) return;
        canMake = false;
        const boundingRect = document.getElementById("canvas")!.getBoundingClientRect();
        if (e.clientX > boundingRect.left && e.clientX < boundingRect.right) {
            xPos = e.clientX;
        }
        if (e.clientY > boundingRect.top && e.clientX < boundingRect.bottom) {
            yPos = e.clientY
        }
    }
    const endObject = (e: MouseEvent) => { 
        if (xPos === undefined || yPos === undefined) {
            xPos = undefined; yPos = undefined; return;
        }
        r = distance([xPos, yPos], [e.clientX, e.clientY])
        if (r < 2) {
            xPos = undefined; yPos = undefined; r = 0; return;
        } else {
            document.addEventListener("mousedown", endVelocity, {once: true});
        }
    }
    const endVelocity = (e: MouseEvent) => {
        console.log("clicked", e.clientX, e.clientY);
        if (xPos === undefined || yPos === undefined) {
            xPos = undefined; yPos = undefined; r = 0; return;
        }
        const dx = e.clientX - xPos;
        const dy = e.clientY - yPos;
        
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const boundingRect = canvas.getBoundingClientRect();
        const adjXPos = xPos - boundingRect.left;
        const adjYPos = yPos - boundingRect.top;
        const color = colors[~~(Math.random() * colors.length)];
        const s_object = new StaticObject(adjXPos, adjYPos, r, VELOCITY_SCALE_FACTOR * dx, VELOCITY_SCALE_FACTOR * dy, color, canvas.getContext("2d")!);
        staticUniverse.Objects.push(s_object);
        xPos = undefined; yPos = undefined; r = 0;
        canMake = true;
    }
    const distance = (a: number[], b: number[]) => Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2);
    return (
        <div className="flex flex-row justify-center items-center gap-3">
            <input
            type="checkbox"
            onChange={change}
            className="appearance-none w-4 h-4 border border-gray-300 rounded-sm checked:bg-blue-500 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            />
            <p className="align-middle text-lg"> {"Create Object"} </p>
        </div>
    )
}