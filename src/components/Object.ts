import StaticUniverse from "./StaticUniverse";

const G = 6.67e-11;
// const MASS_SCALE = 1.0e12;
// const DISTANCE_SCALE = 1.0e-4;

const radiusToMass = (r: number) => 5 * (r**2) ;

export class Universe {
    Objects: SpaceObject[];
    static MASS_SCALE: number = 12;
    static DISTANCE_SCALE: number = -4;
    constructor() {
        this.Objects = [];
    }
    copy = (u: StaticUniverse) => {
        u.Objects.forEach(s_object => {
            let n_object = new SpaceObject(s_object.x, s_object.y, s_object.vx, s_object.vy, s_object.radius, 
                this, s_object.color, s_object.context)
            this.Objects.push(n_object);
        })
    }   
    add = (s: SpaceObject[]) => {
        s.forEach(o => {
            this.Objects.push(o);
        })
    }
    draw = () => {
        this.Objects.forEach(object => {
            object.draw();
        })
    }
    drawLines = () => {
        this.Objects.forEach(object => {
            object.drawLine();
        });
    }
    clearHistory = () => {
        this.Objects.forEach(object => {
            object.history = [];
        })
    }
    reset = () => {
        this.Objects = [];
    }
    getTotalMomentum = () => {
        let momentum = 0;
        this.Objects.forEach(object => {
            let m = pythagorean(object.vx, object.vy) * object.mass;
            momentum += m;
        })
        return ~~momentum;
    }
}
const pythagorean = (a: number, b: number) => {
    return Math.sqrt(a**2 + b**2);
}
export class SpaceObject {
    x: number;
    y: number;
    vx: number;
    vy: number;
    ax: number;
    ay: number;
    radius: number;
    mass: number;
    history: number[][];
    universe: Universe;
    id: number;
    color: string;
    context: CanvasRenderingContext2D
    constructor(x: number, y: number, vx: number, vy: number, radius: number, universe: Universe, color: string, context: CanvasRenderingContext2D) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = 0;
        this.ay = 0;
        this.radius = radius;
        this.mass = radiusToMass(radius); // mass should be determined as a function of radius
        this.universe = universe;
        this.context = context;
        this.color = color;
        this.history = [];
        this.id = Math.floor(Math.random() * 1000000);
    }
    draw = () => {
        this.move();
        this.context.beginPath();
        this.context.fillStyle = this.color;
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    }
    drawLine = () => {
        this.context.beginPath();
        this.context.strokeStyle = this.color;
        let count = 0;
        this.history.forEach(point => {
            if (count === 0) {
                this.context.moveTo(point[0], point[1]);
            } else {
                this.context.lineTo(point[0], point[1])
            }
            count++;
        });
        this.context.stroke();
    }
    move = () => {
        this.history.push([this.x, this.y])
        if (this.history.length > 5000) {
            this.history.splice(0, 1);
        }
        this.x += (this.vx * scale(Universe.DISTANCE_SCALE));
        this.y += (this.vy * scale(Universe.DISTANCE_SCALE));
        this.vx += this.ax;
        this.vy += this.ay;
        this.force();
    }
    force = () => {
        let ax = 0, ay = 0;
        this.universe.Objects.forEach(spaceObject => {
            if (spaceObject === this) return;
            let selfMass = this.mass * scale(Universe.MASS_SCALE);
            let otherMass = spaceObject.mass * scale(Universe.MASS_SCALE);
            let F = (G * selfMass * otherMass) / (distance([this.x, this.y], [spaceObject.x, spaceObject.y])**2)
            let signX = (spaceObject.x - this.x > 0) ? 1 : -1;
            let signY = (spaceObject.y - this.y > 0) ? 1 : -1;
            let angle = angleBetween([this.x, this.y], [spaceObject.x, spaceObject.y])
            ax += (F/selfMass) * Math.cos(angle) * signX;
            ay += (F/selfMass) * Math.sin(angle) * signY;
        });
        this.ax = ax;
        this.ay = ay;
    }
}
const distance = (a: number[], b: number[]) => {
    return Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2);
}
const angleBetween = (a: number[], b: number[]) => {
    return Math.atan(Math.abs((b[1] - a[1]) / (b[0] - a[0])));
}
const scale = (n: number) => {
    return Number(`1.0e${n}`)
}