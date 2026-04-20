import type { BallBody } from "../physics/BallBody";
export type ShotState = "aiming" | "pulling" | "shooting" | "waiting";

export class ShotController {
    private state: ShotState = "waiting";
    private aimAngle  = 0;
    private pullDist  = 0;
    private _mouseX   = 0;
    private _mouseY   = 0;
    private dragging  = false;

    // MAX_POWER 220: bóng bắn mạnh nhất đi ~2/3 bàn, không bay ra ngoài
    readonly MAX_POWER = 150;
    readonly MAX_PULL  = 80;

    public onShoot?: (angle: number, power: number) => void;

    constructor(
        private canvas: HTMLCanvasElement,
        private cueBall: BallBody,
        private offsetX: number, private offsetY: number,
        private scaleX:  number, private scaleY:  number,
    ) { this.bindEvents(); }

    private toPhy(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect();
        const bsx = rect.width  / this.canvas.width;
        const bsy = rect.height / this.canvas.height;
        return {
            x: (clientX - rect.left - this.offsetX * bsx) / (this.scaleX * bsx),
            y: (clientY - rect.top  - this.offsetY * bsy) / (this.scaleY * bsy),
        };
    }

    private onMove = (e: MouseEvent) => {
        const { x, y } = this.toPhy(e.clientX, e.clientY);
        this._mouseX = x; this._mouseY = y;
        if (this.state !== "aiming" && this.state !== "pulling") return;
        const dx = this.cueBall.x - x;
        const dy = this.cueBall.y - y;
        this.aimAngle = Math.atan2(dy, dx);
        if (this.dragging) {
            this.pullDist = Math.min(Math.hypot(dx, dy), this.MAX_PULL);
            this.state = "pulling";
        } else {
            this.pullDist = 0;
            this.state = "aiming";
        }
    };

    private onDown = () => {
        if (this.state !== "aiming" && this.state !== "pulling") return;
        this.dragging = true;
        this.state = "pulling";
    };

    private onUp = () => {
        if (this.state === "pulling" && this.dragging) {
            const power = (this.pullDist / this.MAX_PULL) * this.MAX_POWER;
            if (power >= 3) {
                this.onShoot?.(this.aimAngle, power);
                this.state = "waiting";
                this.pullDist = 0;
            }
        }
        this.dragging = false;
    };

    private bindEvents() {
        this.canvas.addEventListener("mousemove", this.onMove);
        this.canvas.addEventListener("mousedown", this.onDown);
        this.canvas.addEventListener("mouseup",   this.onUp);
    }

    activate()    { this.state = "aiming"; }
    deactivate()  { this.state = "waiting"; this.pullDist = 0; this.dragging = false; }
    getAimAngle() { return this.aimAngle; }
    getPullDistance() { return this.pullDist; }
    getState()    { return this.state; }

    destroy() {
        this.canvas.removeEventListener("mousemove", this.onMove);
        this.canvas.removeEventListener("mousedown", this.onDown);
        this.canvas.removeEventListener("mouseup",   this.onUp);
    }
}