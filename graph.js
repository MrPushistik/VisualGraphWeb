class Graph{

    constructor(){
        this.Vs = new Array();
        this.Es = new Array();
        this.Ps = new Array();
    }

    getMatrix() {
        let res = Array(this.Vs.length).fill().map(() => Array(this.Vs.length).fill(0));
        
        for (let k = 0; k < this.Es.length; k++){
    
            let e = this.Es[k];
    
            let i = this.Vs.indexOf(e.v1);
            let j = this.Vs.indexOf(e.v2);
    
            res[i][j] = e.value;
            res[j][i] = e.value;
        }
    
        for (let k = 0; k < this.Ps.length; k++)
        {
            let p = this.Ps[k];

            let i = this.Vs.indexOf(p.v1);
            let j = this.Vs.indexOf(p.v2);
    
            res[i][j] = p.value;
        }
    
        return res;
    }

    getList() {
        let res = Array(this.Vs.length).fill().map(() => []);

        for (let k = 0; k < this.Es.length; k++){

            let e = this.Es[k];
    
            let i = this.Vs.indexOf(e.v1);
            let j = this.Vs.indexOf(e.v2);

            res[i].push(j);
            res[j].push(i);
        }

        for (let k = 0; k < this.Ps.length; k++)
        {
            let p = this.Ps[k];

            let i = this.Vs.indexOf(p.v1);
            let j = this.Vs.indexOf(p.v2);
    
            res[i].push(j);
        }

        return res;
    }

    getAdvancedMatrix(){
        let res = Array(this.Vs.length).fill().map(() => Array(this.Vs.length).fill());

        this.Es.forEach(elem => {
            let i = this.Vs.indexOf(elem.v1), j = this.Vs.indexOf(elem.v2);
            res[i][j] = elem;
            res[j][i] = elem;
        })
        this.Ps.forEach(elem => res[this.Vs.indexOf(elem.v1)][this.Vs.indexOf(elem.v2)] = elem)

        return res;
    }

    deleteV(v){
        for (let i = this.Es.length - 1; i >= 0; i--){
            if (this.Es[i].v1 === v || this.Es[i].v2 === v){
                this.Es[i].elem.remove();
                this.Es.splice(i, 1);
            }
        }

        for (let i = this.Ps.length - 1; i >= 0; i--){
            if (this.Ps[i].v1 === v || this.Ps[i].v2 === v){
                this.Ps[i].elem.remove();
                this.Ps.splice(i, 1);
            }
        }

        v.elem.remove();

        let curr = this.Vs.indexOf(v);

        for (let i = curr + 1; i < this.Vs.length; i++) {
            this.Vs[i].setName(this.Vs[i].name - 1);
            this.Vs[i].setDesc(this.Vs[i].desc - 1);
        }
        this.Vs.splice(curr, 1);

        console.log(this.getAdvancedMatrix());
    }

    deleteE(e){
        e.elem.remove();
        this.Es.splice(this.Es.indexOf(e), 1);
    }

    deleteP(p){
        p.elem.remove();
        this.Ps.splice(this.Ps.indexOf(p), 1);
    }

    save(){
        let copyVs = new Array();
        this.Vs.forEach((elem, i) => {
            copyVs[i] = {name: elem.name, desc: elem.desc, x: elem.x, y: elem.y}
        });

        let copyEs = new Array();
        this.Es.forEach((elem, i) => {
            copyEs[i] = {v1: this.Vs.indexOf(elem.v1), v2: this.Vs.indexOf(elem.v2), value: elem.value}
        });

        let copyPs = new Array();
        this.Ps.forEach((elem, i) => {
            copyPs[i] = {v1: this.Vs.indexOf(elem.v1), v2: this.Vs.indexOf(elem.v2), value: elem.value}
        });

        return {
            Vs: copyVs,
            Es: copyEs,
            Ps: copyPs,
        }
    }

    isPath(v, u){
        let start = v;
        let list = currGraph.getList();

        let queue = new Array();
        let visited = new Array(currGraph.Vs.length).fill(false);

        queue.unshift(start);
        visited[start] = true;
        let count = 1;
        
        while(queue.length > 0){
            let a = queue.pop();
           
            for (let i = 0; i < list[a].length; i++){

                let idx = list[a][i];

                if (!visited[idx]){
                    if (idx == u) return true;
                    queue.unshift(idx);
                    visited[idx] = true;
                    count++;
                }
            }
        }

        return false;

    }

    isEuler(bool){
        if (bool){
            let edgeAccess = this.getAdvancedMatrix();
            for (let i = 0; i < this.Vs.length; i++){
                let flow = 0;
                for (let j = 0; j < this.Vs.length; j++){
                    if (edgeAccess[i][j]) flow--;
                    if (edgeAccess[j][i]) flow++;
                }
                if (flow !== 0) return false;
            }

        }
        else{
            let list = this.getList();
            for (let i = 0; i < list.length; i++){
                if (list[i].length % 2 !== 0) return false;
            }
        }

        return true;
    }

    isConnected(){

        let list = Array(this.Vs.length).fill().map(() => []);

        for (let k = 0; k < this.Es.length; k++){

            let e = this.Es[k];
    
            let i = this.Vs.indexOf(e.v1);
            let j = this.Vs.indexOf(e.v2);

            list[i].push(j);
            list[j].push(i);
        }

        for (let k = 0; k < this.Ps.length; k++)
        {
            let p = this.Ps[k];

            let i = this.Vs.indexOf(p.v1);
            let j = this.Vs.indexOf(p.v2);
    
            list[i].push(j);
            list[j].push(i);
        }

        let start = 0;

        let queue = new Array();
        let visited = new Array(currGraph.Vs.length).fill(false);

        queue.unshift(start);
        visited[start] = true;
        let count = 1;
        
        while(queue.length > 0){
            let a = queue.pop();
           

            for (let i = 0; i < list[a].length; i++){

                let idx = list[a][i];

                if (!visited[idx]){

                    queue.unshift(idx);
                    visited[idx] = true;
                    count++;
                }
            }
        }

        return count == this.Vs.length;
    }

    isEven(){
        let list = this.getList();

        for (let i = 0; i < list.length; i++){
            if (list[i].length % 2 !== 0) return false;
        }

        return true;
    }

    static load(savedData){

        let graph = new Graph();

        savedData.Vs.forEach(elem => {
            graph.Vs.push(new V(elem.name, elem.desc, elem.x, elem.y));
        })

        savedData.Es.forEach(elem => {
            graph.Es.push(new E(elem.value, graph.Vs[elem.v1], graph.Vs[elem.v2]));
        })

        savedData.Ps.forEach(elem => {
            graph.Ps.push(new P(elem.value, graph.Vs[elem.v1], graph.Vs[elem.v2]));
        })

        return graph;
    }
}
