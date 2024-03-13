class E {
    constructor(value, v1, v2){
        this.v1 = v1;
        this.v2 = v2;
        this.value = value;
        this.desc = value;
        this.elem = this.createEdge(v1, v2, Colors.GREEN, value);
    }

    setDesc(desc){
        this.desc = desc;
        this.elem.querySelector(".l-text").textContent = desc;
    }

    setColor(color){
        this.elem.setAttribute("fill", color.fill);
        this.elem.setAttribute("stroke", color.stroke);
    }

    createEdge(v1, v2, color, text){

        let elem = edge.cloneNode(true);

        let dy = elem.querySelector(".l-text").getAttribute("font-size").replace("px","") / 4;

        elem.setAttribute("stroke", color.stroke);
        elem.setAttribute("fill", color.fill);

        elem.querySelector(".line").setAttribute("x1", v1.x);
        elem.querySelector(".line").setAttribute("y1", v1.y);
        elem.querySelector(".line").setAttribute("x2", v2.x);
        elem.querySelector(".line").setAttribute("y2", v2.y);

        let k = (v1.y - v2.y) / (v1.x - v2.x);
        let a = Math.trunc(Math.atan(k) * 180 / Math.PI);

        elem.querySelector(".l-text").setAttribute("x", (v1.x + v2.x) / 2);
        elem.querySelector(".l-text").setAttribute("y", (v1.y + v2.y) / 2 - dy);
        elem.querySelector(".l-text").setAttribute("transform", `rotate(${a}, ${(v1.x + v2.x) / 2}, ${(v1.y + v2.y) / 2})`);
        elem.querySelector(".l-text").setAttribute("text-anchor", "middle");
        elem.querySelector(".l-text").textContent = text;

        elem.onclick = () => {

            if (isAction) return;

            if (selectedTool.name !== "Курсор" && selectedTool.name !== "Ребро" && selectedTool.name !== "Удаление") return;
            if (currSelected) currSelected.setColor(Colors.GREEN);

            lastSelected = currSelected;
            currSelected = this;
            this.setColor(Colors.YELLOW);
        }

        elem.ondblclick = (e) => {
            if (isAction) return;
            if (selectedTool.name !== "Курсор" && selectedTool.name != "Ребро") return;
            
            e.preventDefault();
            weightWindow(this);
        }

        return elem;
    }

    getE(){
        return this.elem;
    }
}