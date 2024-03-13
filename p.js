class P {
    constructor(value, v1, v2){
        this.v1 = v1;
        this.v2 = v2;
        this.value = value; 
        this.desc = value;
        this.elem = this.createPath(v1, v2, Colors.GREEN, value);
    }

    setColor(color){
        this.elem.setAttribute("fill", color.fill);
        this.elem.setAttribute("stroke", color.stroke);
    }

    setDesc(desc){
        this.desc = desc;
        this.elem.querySelector(".p-text").textContent = desc;
    }

    createPath(v1, v2, color, text){

        let elem = path.cloneNode(true);
        let h = 35;

        elem.setAttribute("stroke", color.stroke);
        elem.setAttribute("fill", color.fill);

        let way = (v1.name - v2.name) > 0 ? 1 : -1;
        let Xc = (v2.x + v1.x)/2;
        let Yc = (v2.y + v1.y)/2;
        let dX21 = v2.x - v1.x;
        let dY21 = v2.y - v1.y;
        let X3, Y3;  
        let X3txt, Y3txt;
        let X3arr, Y3arr;

        if (Math.abs(dY21) < 0.1){
            X3 = Xc;
            Y3 = Yc + way * h;

            X3txt = X3;
            Y3txt = Y3;

            X3arr = X3;
            Y3arr = Y3;
        }
        else{
            let dX3c = way * Math.sqrt( (h * h) / ( ((dX21 * dX21) / (dY21 * dY21)) + 1));
            X3 = Xc + dX3c;
            Y3 = - (dX21 / dY21) * dX3c + Yc;

            let dX3ctxt = way * Math.sqrt( (16 * h * h / 20) / ( ((dX21 * dX21) / (dY21 * dY21)) + 1));
            X3txt = Xc + dX3ctxt;
            Y3txt = - (dX21 / dY21) * dX3ctxt + Yc;

            let dX3carr = way * Math.sqrt( (9 * h * h / 25) / ( ((dX21 * dX21) / (dY21 * dY21)) + 1));
            X3arr = Xc + dX3carr;
            Y3arr = - (dX21 / dY21) * dX3carr + Yc;
        }

        elem.querySelector(".path").setAttribute("d", `M${v1.x} ${v1.y} Q ${X3} ${Y3} ${v2.x} ${v2.y}`);

        let dX23 = v2.x - X3arr;
        let dY23 = v2.y - Y3arr;
        let b = 20;
        let r = 20;
        let c = 7;

        let dX24 = Math.sqrt(((b + r) * (b + r)) / (1 + (dY23 * dY23) / (dX23 * dX23)));
        let dX25 = Math.sqrt((r * r) / (1 + (dY23 * dY23) / (dX23 * dX23)));

        if (dX23 > 0) {
            dX24 *= -1;
            dX25 *= -1;
        }

        let X4 = v2.x + dX24
        let X5 = v2.x + dX25;

        let Y4 = dY23 / dX23 * dX24 + v2.y;
        let Y5 = dY23 / dX23 * dX25 + v2.y;

        let dX456 = Math.sqrt((c * c) / (1 + (dX23 * dX23) / (dY23 * dY23)));

        let X6 = X4 + dX456;
        let X7 = X4 - dX456;

        let Y6 = -(dX23 / dY23) * dX456 + Y4;
        let Y7 = (dX23 / dY23) * dX456 + Y4;

        elem.querySelector(".poly").setAttribute("points",`${X5},${Y5} ${X6},${Y6} ${X7},${Y7}`);
       
        let k = (v1.y - v2.y) / (v1.x - v2.x);
        let a = Math.trunc(Math.atan(k) * 180 / Math.PI);

        let dy = 8;

        elem.querySelector(".p-text").setAttribute("x", X3txt);
        elem.querySelector(".p-text").setAttribute("y", Y3txt + dy);
        elem.querySelector(".p-text").setAttribute("transform", `rotate(${a}, ${X3txt}, ${Y3txt})`);
        elem.querySelector(".p-text").setAttribute("text-anchor", "middle");
        elem.querySelector(".p-text").textContent = text;

        elem.onclick = () => {

            if (isAction) return;

            if (selectedTool.name !== "Курсор" && selectedTool.name != "Дуга") return;
            if (currSelected) currSelected.setColor(Colors.GREEN);

            lastSelected = currSelected;
            currSelected = this;
            this.setColor(Colors.YELLOW);
        }

        elem.ondblclick = (e) => {

            if (isAction) return;
            if (selectedTool.name !== "Курсор" && selectedTool.name != "Дуга") return;

            e.preventDefault();
            weightWindow(this);
        }
        
        return elem;
    }

    getP(){
        return this.elem;
    }
}