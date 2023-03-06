
export default class StaticUniverse {
    Objects: StaticObject[];
    constructor() {
        this.Objects = [];
    }
    draw = () => {
        this.Objects.forEach(object => {
            object.draw();
        })
    }
}
export const VELOCITY_SCALE_FACTOR: number = 100;
const colors = ["aqua", "blue", "fuchsia", "gray", "green", "lime", "maroon", "navy",
                "olive", "purple", "red", "silver", "teal", "white", "yellow"];
export class StaticObject {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    color: string;
    strokeColor: string;
    context: CanvasRenderingContext2D;
    constructor(x: number, y: number, radius: number, vx: number, vy: number, color: string, context: CanvasRenderingContext2D) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.strokeColor = this.color;
        while (this.strokeColor === this.color) this.strokeColor = colors[~~(colors.length * Math.random())];
        this.context = context;
    }
    draw = () => {
        this.context.beginPath();
        this.context.fillStyle = this.color;
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
        //make velocity arrow;
        this.context.lineWidth = 3;
        this.context.lineCap = "butt";
        this.context.strokeStyle = this.strokeColor;
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        let tx = this.vx / VELOCITY_SCALE_FACTOR, ty = this.vy / VELOCITY_SCALE_FACTOR;
        this.context.lineTo(this.x + tx, this.y + ty);
        this.context.stroke();
    }
}