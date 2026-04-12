import type { BallBody } from "../physics/BallBody";

export type ShotState = "aiming" | "pulling" | "shooting" | "waiting";

export class ShotController {
    private state: ShotState = "waiting";
    private aimAngle = 0; // radian, hướng cue stick
    private pullDistance = 0; // px kéo chuột, tương ứng lực
    private mouseX = 0;
    private mouseY = 0;
    private isDragging = false;

    readonly MAX_POWER = 150; // lực tối đa
    readonly MAX_PULL = 80; // px kéo tối đa hiển thị

    // Callback khi shot được thực hiện
    public onShoot?: (angle: number, power: number) => void;

    constructor(
        private canvas: HTMLCanvasElement,
        private cueBall: BallBody,
        private offsetX: number, // TABLE.CUSHION
        private offsetY: number,
    ) {
        this.bindEvents();
    }

    private bindEvents(): void {
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
    }

    private toTableCoords(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left - this.offsetX,
            y: clientY - rect.top - this.offsetY,
        };
    }

    private onMouseMove = (e: MouseEvent) => {
        const { x, y } = this.toTableCoords(e.clientX, e.clientY);
        this.mouseX = x;
        this.mouseY = y;

        if (this.state === "aiming" || this.state === "pulling") {
            // Góc từ cue ball đến chuột
            const dx = this.cueBall.x - x;
            const dy = this.cueBall.y - y;
            this.aimAngle = Math.atan2(dy, dx);

            if (this.isDragging) {
                // Kéo ngược chiều aim để tính lực
                const dist = Math.hypot(dx, dy);
                this.pullDistance = Math.min(dist, this.MAX_PULL);
                this.state = "pulling";
            } else {
                this.state = "aiming";
                this.pullDistance = 0;
            }
        }
    };

    private onMouseDown = () => {
        if (this.state !== "aiming" && this.state !== "pulling") return;
        this.isDragging = true;
        this.state = "pulling";
    };

    private onMouseUp = () => {
        if (this.state === "pulling" && this.isDragging) {
            this.shoot();
        }
        this.isDragging = false;
    };

    private shoot(): void {
        const power = (this.pullDistance / this.MAX_PULL) * this.MAX_POWER;
        if (power < 2) return; // bỏ qua click nhẹ
        this.onShoot?.(this.aimAngle, power);
        this.state = "waiting";
        this.pullDistance = 0;
    }

    // Gọi từ game loop sau khi bóng dừng
    activate(): void {
        this.state = "aiming";
    }

    deactivate(): void {
        this.state = "waiting";
        this.pullDistance = 0;
        this.isDragging = false;
    }

    getAimAngle() {
        return this.aimAngle;
    }
    getPullDistance() {
        return this.pullDistance;
    }
    getState() {
        return this.state;
    }
    getMouseX() {
        return this.mouseX;
    }
    getMouseY() {
        return this.mouseY;
    }

    destroy(): void {
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
    }
}
