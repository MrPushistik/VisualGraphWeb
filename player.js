class Player {
    constructor(){
        this.stepHolder = new Array();
        this.index = 0;
        this.isPaused = false;
        this.speeds = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30]
        this.speed = 4;
        this.mode = "STEP";
    }

    clear(){
        this.stepHolder = new Array();
        this.index = 0;
        this.isPaused = true;
    }

    pause(){
        this.isPaused = true;
    }

    play(){
        this.isPaused = false;
    }

    isNext(){
        return this.index !== this.stepHolder.length;
    }

    faster(){
        if (this.speed < this.speeds.length - 1) this.speed++;
    }

    slower(){
        if (this.speed > 0) this.speed--;
    }

    getSpeed(){
        return this.speeds[this.speed];
    }

    getIndex(){
        return this.index;
    }

    getMode(){
        return this.mode;
    }

    next(){
        if (this.index < this.stepHolder.length){
            this.stepHolder[this.index].next();
            this.index++;
        } 
    }

    back(){
        if (this.index > 0){
            this.index--;
            this.stepHolder[this.index].back();
        } 
    }

    toEnd(){
        while (this.stepHolder.length > this.index) this.next();
    }

    toStart(){
        while (this.index > 0) this.back();
    }

    push(step){
        this.stepHolder.push(step);
    }

    invoke(){
        if (this.mode !== "AUTO") return;

        if (this.isNext()) {
            setTimeout(() => {

                if (this.isPaused) return;

                this.next();
                this.invoke();
            }, 1000 * this.getSpeed())
        }
    }
}