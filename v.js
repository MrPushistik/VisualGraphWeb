class V {
    constructor(name, desc, x, y){
        this.name = name;
        this.desc = desc;
        this.x = x;
        this.y = y; 
        this.elem = this.createVertex(this.x, this.y, this.name, this.desc, Colors.GREEN);
    }

    setName(name){
        this.name = name;
        this.elem.querySelector(".c-text").textContent = name;
    }

    setDesc(desc){
        this.desc = desc;
        this.elem.querySelector(".r-text").textContent = desc;
    }

    setColor(color){
        this.elem.setAttribute("fill", color.fill);
        this.elem.setAttribute("stroke", color.stroke);
    }

    getColor(){
        return this.color;
    }

    getV(){
        return this.elem;
    }

    createVertex(x, y, name, text, color){
        let elem = vertex.cloneNode(true);

        elem.setAttribute("stroke", color.stroke);
        elem.setAttribute("fill", color.fill);

        let dy = elem.querySelector(".c-text").getAttribute("font-size").replace("px","") / 4;

        elem.querySelector(".circle").setAttribute("cx", x);
        elem.querySelector(".circle").setAttribute("cy", y);

        elem.querySelector(".c-text").setAttribute("x", x);
        elem.querySelector(".c-text").setAttribute("y", y + dy);
        elem.querySelector(".c-text").setAttribute("text-anchor", "middle");
        elem.querySelector(".c-text").textContent = name;

        elem.querySelector(".rect").setAttribute("x", x - 25);
        elem.querySelector(".rect").setAttribute("y", y + 25);

        elem.querySelector(".r-text").setAttribute("x", x);
        elem.querySelector(".r-text").setAttribute("y", y + dy + 37.5);
        elem.querySelector(".r-text").setAttribute("text-anchor", "middle");
        elem.querySelector(".r-text").textContent = text;

        elem.onclick = () => {

            if (isAction) return;

            if (selectedTool.name === "Вершина") return;
            if (currSelected) currSelected.setColor(Colors.GREEN);

            lastSelected = currSelected;
            currSelected = this;
            this.setColor(Colors.YELLOW);
        }
        
        return elem;
    }

    showTables(){
        this.elem.querySelector(".rect").setAttribute("visibility", "visible");
        this.elem.querySelector(".r-text").setAttribute("visibility", "visible");
    }

    hideTables(){
        this.elem.querySelector(".rect").setAttribute("visibility", "hidden");
        this.elem.querySelector(".r-text").setAttribute("visibility", "hidden");
    }
}