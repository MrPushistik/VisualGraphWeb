class P {
    constructor(value, v1, v2){
        this.v1 = v1;
        this.v2 = v2;
        this.value = value; 
        this.elem = this.createPath(v1, v2, Colors.GREEN, value);
    }

    setColor(color){
        this.elem.setAttribute("fill", color.fill);
        this.elem.setAttribute("stroke", color.stroke);
    }

    setValue(value){
        this.value = value;
        this.elem.querySelector(".p-text").textContent = value;
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

        if (Math.abs(dY21) < 0.1){
            X3 = Xc
            Y3 = Yc + way * h;
        }
        else{
            let dX3c = way * Math.sqrt( (h * h) / ( ((dX21 * dX21) / (dY21 * dY21)) + 1));
            X3 = Xc + dX3c
            Y3 = - (dX21 / dY21) * dX3c + Yc;
        }

        elem.querySelector(".path").setAttribute("d", `M${v1.x} ${v1.y} Q ${X3} ${Y3} ${v2.x} ${v2.y}`);

        let dX23 = v2.x - X3;
        let dY23 = v2.y - Y3;
        let b = 20;
        let r = 25;
        let c = 10;

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

        let dy = elem.querySelector(".p-text").getAttribute("font-size").replace("px","") / 4;

        elem.querySelector(".p-text").setAttribute("x", X3);
        elem.querySelector(".p-text").setAttribute("y", Y3 + dy);
        elem.querySelector(".p-text").setAttribute("transform", `rotate(${a}, ${X3}, ${Y3})`);
        elem.querySelector(".p-text").setAttribute("text-anchor", "middle");
        elem.querySelector(".p-text").textContent = text;

        elem.onclick = () => {

            if (selectedTool.name === "Вершина") return;
            if (currSelected) currSelected.setColor(Colors.GREEN);

            lastSelected = currSelected;
            currSelected = this;
            this.setColor(Colors.YELLOW);
        }

        elem.ondblclick = (e) => {
            e.preventDefault();
            weightWindow(this);
        }
        
        return elem;
    }

    getP(){
        return this.elem;
    }
}