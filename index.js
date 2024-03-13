let player = new Player();
let currGraph = new Graph();

const save = () => {
    let save = currGraph.save();
    if (save) localStorage.setItem("G", JSON.stringify(save));
    return save;
}

window.onunload = () => {
    if (!isAction) save();
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
        if (modeSwitcher.value === "AUTO" && !player.isPaused) modeElem.querySelector(".play").click();
    }
});

window.onload = () => {
    let res = localStorage.getItem("G");
    if (res) {
        currGraph = Graph.load(JSON.parse(res));
        currGraph.Ps.forEach(elem => work.appendChild(elem.elem));
        currGraph.Es.forEach(elem => work.appendChild(elem.elem));
        currGraph.Vs.forEach(elem => work.appendChild(elem.elem));
    }
}

const weightWindow = function (EorP) {

    let form  = document.createElement("div");
    form.className = "form-wrap";
    form.innerHTML = 
    `
        <form class="weight-form">
            <label class="form-title" for="weight">${EorP instanceof E ? "Вес Ребра" : "Вес Дуги"}</label>
            <input id="weight" class="input-number" type="number" min="1" value="${EorP.value}">
            <button type="submit" class="submit">Ок</button>
        </form>
    `;

    const input = form.querySelector("#weight");

    input.ondblclick = () => {
        input.value = "";
    }

    form.onsubmit = (e) => {

        e.preventDefault();

        if(input.value){
            EorP.value = Number(input.value);
            EorP.setDesc(Number(input.value));
        }
        
        form.remove();
    }

    document.body.append(form);
}


const warnWindow = function (text) {

    let form  = document.createElement("div");
    form.className = "form-wrap";
    form.innerHTML = 
    `
        <form class="warn-form">
            <p class="form-title">${text}</p>
            <button type="submit" class="submit">Ок</button>
        </form>
    `;

    form.onsubmit = (e) => {
        
        e.preventDefault();
        form.remove();
    }

    document.body.append(form);
}

const preLoadWindow = function () {

    let form  = document.createElement("div");
    form.className = "form-wrap";
    form.innerHTML = 
    `
        <div class="warn-form">
            <p class="form-title">Вы уверены, что хотите загрузить файл? Текущий граф будет утерян!</p>
            <div class="button-holder">
                <button type="button" class="accept submit">Да</button>
                <button type="button" class="cancel submit">Нет</button>
            </div>
        </div>
    `;
    return form;
}

function getCoords(e) {
    let p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    let cursorP =  p.matrixTransform(svg.getScreenCTM().inverse());
    return {x: cursorP.x, y: cursorP.y }
}

let tools = [
    {
        name: "Курсор", 
        desc: "ЛКM/Тап - выделить. Двойной ЛКМ/Тап по ребру/дуге - изменить вес.", 
        src: "Icons/Cursor.svg", 
        action: (e) => {
            if (isAction) return;
        }
    },
    {
        name: "Удаление", 
        desc: "ЛКM/Тап по объекту - удалить.", 
        src: "Icons/Delete.svg", 
        action: (e) => {
            if (isAction) return;

            if (currSelected) {
                if (currSelected instanceof P) {
                    currGraph.deleteP(currSelected);
                }
                else if (currSelected instanceof E) {
                    currGraph.deleteE(currSelected);
                }
                else {
                    currGraph.deleteV(currSelected);
                }
        
                lastSelected = currSelected;
                currSelected = null;
            }
        }
    },
    {
        name: "Вершина", 
        desc: "ЛКМ/Тап по пустому месту - создать вершину.", 
        src: "Icons/V.svg", 
        action: (e) => {
            if (isAction) return;

            if (e.target.closest(".vertex") || e.target.closest(".edge") || e.target.closest(".path") ) return;

            let p = getCoords(e);
            let newV = new V(currGraph.Vs.length + 1, currGraph.Vs.length + 1, p.x, p.y);
            currGraph.Vs.push(newV);

            work.appendChild(newV.getV());
        }
    },
    {
        name: "Ребро", 
        desc: "ЛКМ/Тап по первой вершине, затем по второй вершине - создать ребро.", 
        src: "Icons/E.svg",
        action: (e) => {

            if (isAction) return;

            for(let i = 0; i < currGraph.Ps.length; i++){
                let e = currGraph.Ps[i];
                if (e.v1 === lastSelected && e.v2 === currSelected || e.v2 === lastSelected && e.v1 === currSelected){
                    return;
                }
            }

            if (currSelected && lastSelected && currSelected instanceof V && lastSelected instanceof V && lastSelected !== currSelected){

                for(let i = 0; i < currGraph.Es.length; i++){
                    let e = currGraph.Es[i];
                    if (e.v1 === lastSelected && e.v2 === currSelected || e.v2 === lastSelected && e.v1 === currSelected){
                        return;
                    }
                }

                let newE = new E(1, lastSelected, currSelected);
                currGraph.Es.push(newE);
                
                currSelected.setColor(Colors.GREEN);
                lastSelected = null;
                currSelected = null;

                work.insertBefore(newE.getE(), work.firstChild);
            }
        }
    },
    {
        name: "Дуга", 
        desc: "ЛКМ/Тап по первой вершине, затем по второй вершине - создать дугу.", 
        src: "Icons/P.svg",
        action: (e) => {

            if (isAction) return;

            for(let i = 0; i < currGraph.Es.length; i++){
                let e = currGraph.Es[i];
                if (e.v1 === lastSelected && e.v2 === currSelected || e.v2 === lastSelected && e.v1 === currSelected){
                    return;
                }
            }

            if (currSelected && lastSelected && currSelected instanceof V && lastSelected instanceof V && lastSelected !== currSelected){

                for(let i = 0; i < currGraph.Ps.length; i++){
                    let e = currGraph.Ps[i];
                    if (e.v1 === lastSelected && e.v2 === currSelected){
                        return;
                    }
                }

                let newP = new P(1, lastSelected, currSelected);
                currGraph.Ps.push(newP);
                currSelected.setColor(Colors.GREEN);
                lastSelected = null;
                currSelected = null;

                work.insertBefore(newP.getP(), work.firstChild)
            }
        }
    },
    {
        name: "Обход в ширину", 
        desc: "Выбрать начальную вершину для запуска алгоритма 'Обход в ширину'. Завершить работу с алгоритмом - кнопка 'Завершить'.", 
        src: "Icons/BFS.svg", 
        action: (e) => {
                if (currSelected && currSelected instanceof V){

                    if (isAction) return;
                    else isAction = true;

                    lastSave = save();

                    let startV = currSelected;
                    let start = currGraph.Vs.indexOf(startV);
                    let list = currGraph.getList();
                    let edgeAccess = currGraph.getAdvancedMatrix();

                    let path = new Array();
                    let visited = new Array(currGraph.Vs.length).fill(false);
                    let queue = new Array();

                    let before = "";
                    let after = "Добавляем выбранную вершину в очередь. " + getQueue(queue, "push", start);
                    player.push(
                        Step.getSteps([
                            new VertexSegment(startV, Colors.PURPLE, Colors.YELLOW, null, null),
                            new TextSegment(myAlert, after, before),
                        ])
                    )
                    before = after;

                    queue.push(start);
                    visited[start] = true;
                    
                    while(queue.length > 0){

                        let a = queue.shift();
                        path.push(currGraph.Vs[a].name);

                        after = "Извлекаем вершину из очереди. Текущая вершина " + currGraph.Vs[a].name + ". Просматриваем смежные непосещенные вершины. " + getQueue(queue, "pop", a);
                        console.log(new String(after));
                        player.push(
                            Step.getSteps([
                                new VertexSegment(currGraph.Vs[a], Colors.YELLOW, Colors.PURPLE, null, null),
                                new TextSegment(myAlert, after, before),
                            ])
                        )
                        before = after;

                        for (let i = 0; i < list[a].length; i++){
                            let idx = list[a][i];
                            if (!visited[idx]){

                                after = "Заносим вершину " + currGraph.Vs[idx].name + " в очередь. " + getQueue(queue, "push", idx);
                                player.push(
                                    Step.getSteps([
                                        new VertexSegment(currGraph.Vs[idx], Colors.PURPLE, Colors.GREEN, null, null),
                                        new EdgeSegment(edgeAccess[a][idx], Colors.BLUE, Colors.GREEN, null, null),
                                        new TextSegment(myAlert, after, before),
                                    ])
                                )
                                before = after;

                                queue.push(idx);
                                visited[idx] = true;
                            }
                        }

                        after = "Смежных непосещенных вершин больше нет.";
                        player.push(
                            Step.getSteps([
                                new VertexSegment(currGraph.Vs[a], Colors.BLUE, Colors.YELLOW, null, null),
                                new TextSegment(myAlert, after, before),
                            ])
                        )
                        before = after;
                    }

                    if (path.length === currGraph.Vs.length) after = "Очередь пуста. Обход завершен. Результат: ";
                    else after = "Очередь пуста. Не все вершины достижимы из вершины " + currGraph.Vs[start].name + ". Результат: "
                    for (let k = 0; k < path.length - 1; k++) after += path[k] + ", ";
                    after += path[path.length - 1] + ".";
                    player.push(
                        Step.getSteps([new TextSegment(myAlert, after, before)])
                    )

                    player.invoke();
                }
            }
    },
    {
        name: "Обход в глубину", 
        desc: "Выбрать начальную вершину для запуска алгоритма 'Обход в глубину'. Завершить работу с алгоритмом - кнопка 'Завершить'.", 
        src: "Icons/DFS.svg", 
        action: (e) => {
                if (currSelected && currSelected instanceof V){

                    if (isAction) return;
                    else isAction = true;

                    lastSave = save();

                    let startV = currSelected;
                    let start = currGraph.Vs.indexOf(startV);
                    let list = currGraph.getList();
                    let edgeAccess = currGraph.getAdvancedMatrix();

                    let path = new Array();
                    let visited = new Array(currGraph.Vs.length).fill(false);
                    let stack = new Array();

                    let before = "";
                    let after = "Добавляем выбранную вершину в стек. " + getStack(stack, "push", start);
                    player.push(
                        Step.getSteps([
                            new VertexSegment(startV, Colors.PURPLE, Colors.YELLOW, null, null),
                            new TextSegment(myAlert, after, before),
                        ])
                    )
                    before = after;

                    stack.push(start);
                    path.push(startV.name);
                    
                    while(stack.length > 0){

                        let a = stack.pop();
                        visited[a] = true;
                        

                        after = "Извлекаем вершину из стека. Текущая вершина " + currGraph.Vs[a].name + ". " + getStack(stack, "pop", a);
                        player.push(
                            Step.getSteps([
                                new VertexSegment(currGraph.Vs[a], Colors.YELLOW, Colors.PURPLE, null, null),
                                new TextSegment(myAlert, after, before),
                            ])
                        )
                        before = after;

                        let flag = true;
                        for (let i = 0; i < list[a].length; i++){
                            let idx = list[a][i];
                            if (!visited[idx]){

                                after = "Найдена непосещенная вершина " + currGraph.Vs[idx].name + ", смежная с текущей.";
                                player.push(
                                    Step.getSteps([
                                        new VertexSegment(currGraph.Vs[idx], Colors.RED, Colors.GREEN, null, null),
                                        new EdgeSegment(edgeAccess[a][idx], Colors.RED, Colors.GREEN, null, null),
                                        new TextSegment(myAlert, after, before),
                                    ])
                                )
                                before = after;

                                after = "Возвращаем текующую вершину " + currGraph.Vs[a].name + " в стек. " + getStack(stack, "push", a);
                                player.push(
                                    Step.getSteps([
                                        new VertexSegment(currGraph.Vs[a], Colors.PURPLE, Colors.YELLOW, null, null),
                                        new TextSegment(myAlert, after, before),
                                    ])
                                )
                                before = after;

                                stack.push(a);

                                after = "Добавляем найденную вершину " + currGraph.Vs[idx].name + " в стек. " + getStack(stack, "push", idx);
                                player.push(
                                    Step.getSteps([
                                        new VertexSegment(currGraph.Vs[idx], Colors.PURPLE, Colors.RED, null, null),
                                        new EdgeSegment(edgeAccess[a][idx], Colors.BLUE, Colors.RED, null, null),
                                        new TextSegment(myAlert, after, before),
                                    ])
                                )
                                before = after;

                                stack.push(idx);

                                path.push(currGraph.Vs[idx].name);

                                flag = false;
                                break;
                            }
                        }

                        if (flag){
                            after = "Вершин, смежных с текущей, нет.";
                            player.push(
                                Step.getSteps([
                                    new VertexSegment(currGraph.Vs[a], Colors.BLUE, Colors.YELLOW, null, null),
                                    new TextSegment(myAlert, after, before),
                                ])
                            )
                            before = after;
                        }
                    }

                    if (path.length === currGraph.Vs.length) after = "Стек пуст. Обход завершен. Результат: ";
                    else after = "Стек пуст. Не все вершины достижимы из вершины " + currGraph.Vs[start].name + ". Результат: "
                    for (let k = 0; k < path.length - 1; k++) after += path[k] + ", ";
                    after += path[path.length - 1] + ".";

                    player.push(
                        Step.getSteps([new TextSegment(myAlert, after, before)])
                    )

                    player.invoke();
                }
            }        
    },
    {
        name: "Алгоритм Дейкстры", 
        desc: "Выбрать начальную и конечную вершины для запуска алгоритма поиска кратчайшего рассотяния 'Алгоритм Дейсткры'. Завершить работу с алгоритмом - кнопка 'Завершить'.", 
        src: "Icons/MinPath.svg", 
        action: (e) => {
            
                if (currSelected && lastSelected && 
                    currSelected instanceof V && lastSelected instanceof V && 
                    lastSelected !== currSelected){

                    if (isAction) return;
                    else isAction = true;

                    lastSave = save();

                    let sourceV = lastSelected;
                    let sinkV = currSelected;

                    let source = currGraph.Vs.indexOf(sourceV);
                    let sink = currGraph.Vs.indexOf(sinkV);

                    if (!currGraph.isPath(source, sink)) {
                        warnWindow("Пути между выбраными вершинами нет! Выберите другую пару вершин.");
                        document.querySelector(".finish").click();
                        return;
                    }

                    let matrix = currGraph.getMatrix();
                    let edgeAccess = currGraph.getAdvancedMatrix();

                    let parent = new Array(currGraph.Vs.length);
                    let visited = new Array(currGraph.Vs.length).fill(false);
                    let d = new Array(currGraph.Vs.length).fill(Infinity);

                    for(let i = 0; i < currGraph.Vs.length; i++){
                        currGraph.Vs[i].showTables();
                        currGraph.Vs[i].setDesc("∞");
                    }

                    let curr = source;
                    let currMin = 0;

                    visited[curr] = true;
                    d[curr] = 0;

                    let next = curr;

                    currGraph.Vs[source].setColor(Colors.YELLOW);
                    currGraph.Vs[sink].setColor(Colors.RED);

                    let before = "";
                    let after = "Присваиваем стартовой вершине метку 0, остальным - ∞.";
                    player.push(
                        Step.getSteps([
                            new VertexSegment(currGraph.Vs[source], Colors.RED, Colors.YELLOW, "0", "∞"),
                            new TextSegment(myAlert, after, before)
                        ])
                    );
                    before = after;

                    for (let i = 0; i < currGraph.Vs.length; i++){

                        let nextMin = Infinity;

                        let after = "Текущая вершина " + currGraph.Vs[curr].name + ", так как до нее наименьшее расстояние " + currMin + ".";
                        player.push(
                            Step.getSteps([
                                new VertexSegment(currGraph.Vs[curr], Colors.YELLOW, currGraph.Vs[curr] === sinkV || currGraph.Vs[curr] === sourceV ? Colors.RED : Colors.GREEN, null, null),
                                new TextSegment(myAlert, after, before)
                            ])
                        );
                        before = after;

                        let painted = [];
                        
                        for (let j = 0; j < currGraph.Vs.length; j++){

                            if (visited[j]) continue;

                            if (matrix[curr][j] > 0){

                                painted.push(j);

                                if(matrix[curr][j] + currMin < d[j]){

                                    after = "Рассмотрим вершину " + currGraph.Vs[j].name + ": " + matrix[curr][j] + " + " + currMin + " < " + (d[j] === Infinity ? "∞" : d[j]) + " => обновляем значение метки.";
                                    player.push(
                                        Step.getSteps([
                                            new VertexSegment(currGraph.Vs[j], Colors.PURPLE, currGraph.Vs[j] === sinkV ? Colors.RED : Colors.GREEN, matrix[curr][j] + currMin, d[j] === Infinity ? "∞" : d[j]),
                                            new EdgeSegment(edgeAccess[curr][j], Colors.PURPLE, Colors.GREEN, null, null),
                                            new TextSegment(myAlert, after, before)
                                        ])
                                    );
                                    before = after;

                                    d[j] = matrix[curr][j] + currMin;
                                    parent[j] = curr;
                                }
                                else {
                                    after = "Рассмотрим вершину " + currGraph.Vs[j].name + ": " + matrix[curr][j] + " + " + currMin + " >= " + (d[j] === Infinity ? "∞" : d[j]) + " => оставляем значение метки нетронутым.";
                                    player.push(
                                        Step.getSteps([
                                            new VertexSegment(currGraph.Vs[j], Colors.PURPLE, currGraph.Vs[j] === sinkV ? Colors.RED : Colors.GREEN, null, null),
                                            new EdgeSegment(edgeAccess[curr][j], Colors.PURPLE, Colors.GREEN, null, null),
                                            new TextSegment(myAlert, after, before)
                                        ])
                                    );
                                    before = after;
                                }
                            }

                            if (d[j] < nextMin){
                                nextMin = d[j];
                                next = j;
                            }
                        }

                        let toChange = [];
                        for (let k = 0; k < painted.length; k++){
                            toChange.push(new VertexSegment(currGraph.Vs[painted[k]], currGraph.Vs[painted[k]] === sinkV ? Colors.RED : Colors.GREEN, Colors.PURPLE, null, null))
                            toChange.push(new EdgeSegment(edgeAccess[curr][painted[k]], Colors.GREEN, Colors.PURPLE, null, null))
                        }

                        if (currGraph.Vs.length - 1 != i) after = "Выбираем новую текущую вершину, так как больше нет непосещенных смежных вершин.";
                        else after = "Все достижимые вершины пройдены.";
                        player.push(
                            Step.getSteps(toChange.concat([
                                new VertexSegment(currGraph.Vs[curr], Colors.BLUE, Colors.YELLOW, null, null),
                                new TextSegment(myAlert, after, before)
                            ]))
                        );
                        before = after;

                        curr = next;
                        currMin = nextMin;
                        visited[curr] = true;
                    }


                        let i = sink;
                        let res = currGraph.Vs[i].name + "-" + currGraph.Vs[parent[i]].name;
                        let toChange = [];
                        toChange.push(new VertexSegment(currGraph.Vs[i], Colors.RED, Colors.BLUE, null, null));
                        let last = i;
                        i = parent[i];
    
                        while (i != source){
                            toChange.push(new VertexSegment(currGraph.Vs[i], Colors.RED, Colors.BLUE, null, null));
                            toChange.push(new EdgeSegment(edgeAccess[i][last], Colors.RED, Colors.GREEN, null, null));
                            
                            res += "-" + currGraph.Vs[parent[i]].name;
                            last = i;
                            i = parent[i];
                        }
    
                        toChange.push(new EdgeSegment(edgeAccess[i][last], Colors.RED, Colors.GREEN, null, null));
                        toChange.push(new VertexSegment(currGraph.Vs[i], Colors.RED, Colors.BLUE, null, null));
    
                        after = "Кратчайшее рассотяние между веришинами " + sourceV.name + " и " + sinkV.name + " равно " + d[sink] + ". Кратчайший путь: " + res.split("").reverse().join("") + ".";
                        toChange.push(new TextSegment(myAlert, after, before));
                        player.push(Step.getSteps(toChange));

                    
                    player.invoke();
                }
            }
    },
    {
        name: "Эйлеров цикл", 
        desc: "Выбрать начальную вершину для запуска алгоритма 'Поиск эйлерова цикла'. Завершить работу с алгоритмом - кнопка 'Завершить'.", 
        src: "Icons/Euler.svg", 
        action: (e) => {
            if (currGraph.Es.length == 0 || currGraph.Ps.length == 0){
                if (currGraph.isConnected()){
                    if (currGraph.isEuler(currGraph.Es.length == 0)){
                        if (currSelected && currSelected instanceof V){

                            if (isAction) return;
                            else isAction = true;

                            lastSave = save();

                            let startV = currSelected;
                            let start = currGraph.Vs.indexOf(startV);

                            let edgeAccess = currGraph.getAdvancedMatrix();
                            let list = currGraph.getList();
                            let path = [];

                            let stack = new Array();
                            let before = "";
                            let after;
                            
                            after = "Добавляем выбранную вершину в стек." + getStack(stack, "push", start);
                            player.push(
                                Step.getSteps([
                                    new VertexSegment(currGraph.Vs[start], Colors.PURPLE, Colors.YELLOW, null, null),
                                    new TextSegment(myAlert, after, before)
                                ])
                            );
                            before = after;

                            stack.push(start);

                            while(stack.length > 0) {

                                let a = stack.pop();

                                after = "Извлекаем вершину из стека. Текущая вершина = " + currGraph.Vs[a].name + ". " + getStack(stack, "pop", a);
                                player.push(
                                    Step.getSteps([
                                        new VertexSegment(currGraph.Vs[a], Colors.YELLOW, Colors.PURPLE, null, null),
                                        new TextSegment(myAlert, after, before),
                                    ])
                                )
                                before = after;

                                if (list[a].length == 0) {
                                    path.push(a);
                                    after = "У текущей вершины нет ребер (дуг), по которым можно попасть в другие вершины. Добавляем ее в результат: ";
                                    for (let i = 0; i < path.length; i++) after += currGraph.Vs[path[i]].name + "-";
                                    after = after.substring(0, after.length-1) + ".";
                                    player.push(
                                        Step.getSteps([
                                            new VertexSegment(currGraph.Vs[a], stack.indexOf(a) === -1 ? Colors.BLUE : Colors.PURPLE, Colors.YELLOW, null, null),
                                            new TextSegment(myAlert, after, before),
                                        ])
                                    )
                                    before = after;
                                }
                                else {
                                    let b = list[a].pop();

                                    let i = list[b].indexOf(a);
                                    if (i != -1 && edgeAccess[a][b] instanceof E) list[b].splice(i,1);

                                    after = "У текущей вершины есть путь в вершину " + currGraph.Vs[b].name + " через ребро (дугу) " + currGraph.Vs[a].name + "-" + currGraph.Vs[b].name + ". Удаляем это ребро (дугу).";
                                    player.push(
                                        Step.getSteps([
                                            new VertexSegment(currGraph.Vs[b], Colors.RED, stack.indexOf(b) !== -1 ? Colors.PURPLE : Colors.GREEN, null, null),
                                            new EdgeSegment(edgeAccess[a][b], Colors.GRAY, Colors.GREEN, null, null),
                                            new TextSegment(myAlert, after, before),
                                        ])
                                    )
                                    before = after;

                                    after = "Возвращаем текущую вершину в стек." + getStack(stack, "push", a);
                                    player.push(
                                        Step.getSteps([
                                            new VertexSegment(currGraph.Vs[a], Colors.PURPLE, Colors.YELLOW, null, null),
                                            new TextSegment(myAlert, after, before),
                                        ])
                                    )
                                    before = after;

                                    stack.push(a);

                                    after = "Добавляем новую вершину " + currGraph.Vs[b].name + " в стек." + getStack(stack, "push", b);
                                    player.push(
                                        Step.getSteps([
                                            new VertexSegment(currGraph.Vs[b], Colors.PURPLE, Colors.RED, null, null),
                                            new TextSegment(myAlert, after, before),
                                        ])
                                    )
                                    before = after;

                                    stack.push(b);
                                }
                            }

                            let toChange = [];
                            after = "Поиск завершен. Эйлеров цикл: ";
                            for (let i = 0 ; i < path.length - 1; i++){
                                toChange.push(new EdgeSegment(edgeAccess[path[i+1]][path[i]], Colors.RED, Colors.GRAY, null, null));
                                after += currGraph.Vs[path[i]].name + "-"
                            }
                            after += currGraph.Vs[path[path.length - 1]].name + ".";
                            
                            toChange.push(new TextSegment(myAlert, after, before));

                            player.push(Step.getSteps(toChange));
                        }
                    }
                    else {
                        if (currGraph.Es.length == 0){
                            warnWindow("Граф содержит вершины, у которых число входных дуг не равно числу выходных. Эйлеров цикл отсутсвует.");
                        }
                        else {
                            warnWindow("Граф содержит вершины нечетной сетепени. Эйлеров цикл отсутсвует.");
                        }
                    }
                }
                else{
                    warnWindow("Граф несвязный! Алгоритм не применим.");
                    return;
                }
            }
            else{
                warnWindow("Граф смешанный. Приведите его к ориентированному или неориентированному виду для применения алгоритма.");
                return;
            }
        }
    },
    {
        name: "Гамильтонов цикл", 
        desc: "Выбрать начальную вершину для запуска алгоритма 'Поиск гамильтонова цикла'. Завершить работу с алгоритмом - кнопка 'Завершить'.", 
        src: "Icons/Hamilton.svg", 
        action: (e) => {
                if (currSelected && currSelected instanceof V){

                    if (isAction) return;
                    else isAction = true;

                    lastSave = save();

                    let startV = currSelected;

                    let list = currGraph.getList();
                    console.log(list);
                    let edgeAccess = currGraph.getAdvancedMatrix();

                    let n = currGraph.Vs.length;
                    let visited = new Array(n).fill(false);
                    let cycle = new Array(n);
                    let start = currGraph.Vs.indexOf(startV);

                    cycle[0] = start;
                    visited[start] = true;     

                    let stack = new Array();

                    let before = "";
                    let after = "Добавляем выбранную вершину в стек. " + getStack(stack, "push", start);
                    player.push(
                        Step.getSteps([
                            new VertexSegment(currGraph.Vs[start], Colors.PURPLE, Colors.YELLOW, null, null),
                            new TextSegment(myAlert, after, before),
                        ])
                    )
                    before = after;

                    stack.push(start);
                    let curr, last;
                    let flag = false;

                    while(true){

                        curr = stack.pop();

                        if (stack.length + 1 == currGraph.Vs.length){
                            if (list[curr].indexOf(start) !== -1) {

                                after = "Гамильтонов цикл обнаружен: ";
                                for (let i = 0; i < stack.length; i++){
                                    after += currGraph.Vs[stack[i]].name + "-";
                                }
                                after += currGraph.Vs[curr].name + "-" +  currGraph.Vs[start].name + ".";
                                player.push(
                                    Step.getSteps([
                                        new VertexSegment(currGraph.Vs[curr], Colors.YELLOW, Colors.PURPLE, null, null),
                                        new EdgeSegment(edgeAccess[curr][start], Colors.YELLOW, Colors.GREEN, null, null),
                                        new TextSegment(myAlert, after, before)
                                    ])
                                );

                                break;
                            }
                        }

                        after = "Извлекаем вершину из стека. Текущая вершина " + currGraph.Vs[curr].name + ". " + getStack(stack, "pop", curr);
                        let toChange4 = [
                            new VertexSegment(currGraph.Vs[curr], Colors.YELLOW, Colors.PURPLE, null, null),
                        ]
                        if (flag)  toChange4 = [];
                        player.push(
                            Step.getSteps(toChange4.concat([
                                new TextSegment(myAlert, after, before),
                            ]))
                        )
                        before = after;

                        let si = 0;
                        let toChange = [];
                        if (flag) {
                            after = "Просмотр смежных непосещенных вершин для вершины " + currGraph.Vs[curr].name + " ранее был прерван. Возобновляем просмотр. Уже просмотренные вершины: ";  
                            while (true){
                                if (!visited[list[curr][si]]) {
                                    after += currGraph.Vs[list[curr][si]].name + ", ";
                                }
                                if (list[curr][si] == last) break;
                                si++;
                            }
                            after = after.substring(0, after.length - 2) + ".";
                            player.push(
                                Step.getSteps(toChange.concat([
                                    new TextSegment(myAlert, after, before),
                                ]))
                            )
                            before = after;
                            
                            si = list[curr].indexOf(last) + 1;
                        }
                        else {
                            after = "Начинаем просмотр смежных непосещенных вершин.";
                            player.push(
                                Step.getSteps([
                                    new TextSegment(myAlert, after, before),
                                ])
                            )
                            before = after;
                        }

                        flag = true;
                        for (let idx = si; idx < list[curr].length; idx++){
                            let i = list[curr][idx];

                            if (!visited[i]){

                                after = "Найдена смежная непосещенная вершина " + currGraph.Vs[i].name + ". Временно прерываем просмотр смежных непосещенных вершин для вершины " + currGraph.Vs[curr].name + ". Возвращаем текущую вершину в стек. " + getStack(stack, "push", curr);
                                player.push(
                                    Step.getSteps([
                                        new VertexSegment(currGraph.Vs[i], Colors.PURPLE, Colors.GREEN, null, null),
                                        new EdgeSegment(edgeAccess[curr][i], Colors.YELLOW, Colors.GREEN, null, null),
                                        new TextSegment(myAlert, after, before),
                                    ])
                                )
                                before = after;

                                stack.push(curr);

                                after = "Добавляем новую вершину " + currGraph.Vs[i].name + " в стек. " + getStack(stack, "push", i);
                                player.push(
                                    Step.getSteps([
                                        new TextSegment(myAlert, after, before),
                                    ])
                                )
                                before = after;

                                stack.push(i);
    
                                visited[i] = true;
                                flag = false;
                                break;
                            }
                        }

                        if (stack.length == 0){
                            after = "Гамильтонов цикл не обнаружен.";
                                player.push(
                                    Step.getSteps([
                                        new TextSegment(myAlert, after, before)
                                    ])
                                );
                            break;
                        }

                        if (flag){
                            last = curr;
                            visited[curr] = false;

                            after = "У вершины " + currGraph.Vs[curr].name + " больше нет непросмотренных смежных вершин. Покидаем эту вершину.";
                            player.push(
                                Step.getSteps([
                                    new VertexSegment(currGraph.Vs[curr], Colors.GREEN, Colors.YELLOW, null, null),
                                    new EdgeSegment(edgeAccess[stack[stack.length - 1]][curr], Colors.GREEN, Colors.YELLOW, null, null),                                    new TextSegment(myAlert, after, before),
                                ])
                            )
                            before = after;
                        }
                    }
                }
            }
    },
    {
        name: "Алгоритм Прима", 
        desc: "Выбрать начальную вершину для запуска алгоритма построения минимального остовного дерева 'Алгоритм Прима'. Завершить работу с алгоритмом - кнопка 'Завершить'.", 
        src: "Icons/MST.svg", 
        action: (e) => {
            if (currGraph.Ps.length == 0){
                if (currGraph.isConnected()){
                    if (currSelected && currSelected instanceof V){
                        if (isAction) return;
                        else isAction = true;
    
                        lastSave = save();
    
                        let startV = currSelected;
                        let matrix = currGraph.getMatrix();
                        let edgeAccess = currGraph.getAdvancedMatrix();
    
                        let visited = new Array(currGraph.Vs.length).fill(false);
                        let d = new Array(currGraph.Vs.length).fill([Infinity, "?"]);
    
                        let sum = 0;
                        let curr = currGraph.Vs.indexOf(startV);
                        let next;
    
                        visited[curr] = true;
                        d[curr] = [0, curr];
    
                        for(let i = 0; i < currGraph.Vs.length; i++){
                            currGraph.Vs[i].showTables();
                            currGraph.Vs[i].setDesc("? ∞");
                        }
    
                        let before = "";
                        let after = "Присваиваем стартовой вершине метку " + currGraph.Vs[curr].name + " 0.";
                        player.push(
                            Step.getSteps([
                                new VertexSegment(currGraph.Vs[curr], null, null, currGraph.Vs[curr].name + " 0", "? ∞"),
                                new TextSegment(myAlert, after, before)
                            ])
                        );
                        before = after;
                        
                        for (let i = 0; i < currGraph.Vs.length - 1; i++){
    
                            let nextMin = Infinity;
    
                            after = "Просматриваем смежные непосещенные вершины для текущей вершины " + currGraph.Vs[curr].name + ".";
                            player.push(
                                Step.getSteps([
                                    new TextSegment(myAlert, after, before)
                                ])
                            );
                            before = after;
    
                            let painted = [];
    
                            for (let j = 0; j < matrix[curr].length; j++){
    
                                if (!visited[j]){
                                    if (matrix[curr][j] > 0){
    
                                        painted.push(j);
    
                                        if (matrix[curr][j] < d[j][0]){        
    
                                            after = "Рассмотрим вершину " + currGraph.Vs[j].name + ": " + matrix[curr][j] + " < " + (d[j][0] === Infinity ? "∞" : d[j][0]) + " => обновляем значение метки.";
                                            player.push(
                                                Step.getSteps([
                                                    new VertexSegment(currGraph.Vs[j], Colors.PURPLE, Colors.GREEN, currGraph.Vs[curr].name + " " + matrix[curr][j], d[j][0] === Infinity ? d[j][1] + " ∞" : d[j][1] + " " + d[j][0]),
                                                    new EdgeSegment(edgeAccess[curr][j], Colors.PURPLE, Colors.GREEN, null, null),
                                                    new TextSegment(myAlert, after, before)
                                                ])
                                            );
                                            before = after;
    
                                            d[j] = [matrix[curr][j], curr];
    
                                        }
                                        else {
                                            after = "Рассмотрим вершину " + currGraph.Vs[j].name + ": " + matrix[curr][j] + " >= " + (d[j][0] === Infinity ? "∞" : d[j][0]) + " => значение метки оставляем прежним.";
                                            player.push(
                                                Step.getSteps([
                                                    new VertexSegment(currGraph.Vs[j], Colors.PURPLE, Colors.GREEN, null, null),
                                                    new EdgeSegment(edgeAccess[curr][j], Colors.PURPLE, Colors.GREEN, null, null),
                                                    new TextSegment(myAlert, after, before)
                                                ])
                                            );
                                            before = after;
                                        }
                                    }
    
                                    if (d[j][0] < nextMin){
                                        nextMin = d[j][0];
                                        next = j;
                                    }
                                }
                            }
    
                            let toChange = [];
                            for (let k = 0; k < painted.length; k++){
                                toChange.push(new VertexSegment(currGraph.Vs[painted[k]],Colors.GREEN, Colors.PURPLE, null, null))
                                toChange.push(new EdgeSegment(edgeAccess[curr][painted[k]], Colors.GREEN, Colors.PURPLE, null, null))
                            }

                            after = "Непосещенный смежных вершин больше нет.";
                            player.push(
                                Step.getSteps(toChange.concat([
                                    new TextSegment(myAlert, after, before)
                                ]))
                            );
                            before = after;
    
                            after = "Следующая вершина " + currGraph.Vs[next].name + ", так как ее присоединение требует минимальных затрат.";
                            player.push(
                                Step.getSteps([
                                    new VertexSegment(currGraph.Vs[curr], Colors.BLUE, Colors.YELLOW, null, null),
                                    new VertexSegment(currGraph.Vs[next], Colors.YELLOW, Colors.GREEN, null, null),
                                    new TextSegment(myAlert, after, before)
                                ])
                            );
                            before = after;
    
                            after = "Присоединим новую вершину ребром " + currGraph.Vs[curr].name + "-" + currGraph.Vs[next].name + " минимального веса " + d[next][0] + ".";
                            player.push(
                                Step.getSteps([
                                    new EdgeSegment(edgeAccess[d[next][1]][next], Colors.RED, Colors.GREEN, null, null),
                                    new TextSegment(myAlert, after, before)
                                ])
                            );
                            before = after;
    
                            sum += d[next][0];
                            curr = next;
                            visited[curr] = true;
                        }
    
                        
                        // for (let i = 0; i < d.length; i++){
                        //     sum += d[i][0];
                        // }
    
                        after = "Минимальное остовное дерево построено. Вес дерева равен " + sum + ".";
                        player.push(
                            Step.getSteps([
                                new VertexSegment(currGraph.Vs[curr], Colors.BLUE, Colors.YELLOW, null, null),
                                new TextSegment(myAlert, after, before)
                            ])
                        );
                        before = after;
                    }
                }
                else {
                    warnWindow("Граф несвязный! Алгоритм не применим.");
                }
            }
            else {
                warnWindow("Граф содержит дуги! Алгоритм не применим.");
            }
        }
    },
    {
        name: "Алгоритм Форда-Фалкерсона", 
        desc: "Выбрать начальную вершину (исток) и конечную вершину (сток) для запуска алгоритма поиска максимального потока 'Алгоритм Форда-Фалкерсона'. Завершить работу с алгоритмом - кнопка 'Завершить'.", 
        src: "Icons/MaxFlow.svg", 
        action: (e) => {
                if (currSelected && lastSelected && 
                    currSelected instanceof V && lastSelected instanceof V && 
                    lastSelected !== currSelected){

                    if (isAction) return;
                    else isAction = true;

                    lastSave = save();

                    let sourceV = lastSelected;
                    let sinkV = currSelected;

                    let source = currGraph.Vs.indexOf(sourceV);
                    let sink = currGraph.Vs.indexOf(sinkV);

                    if (!currGraph.isPath(source, sink)) {
                        warnWindow("Пути между выбраными вершинами нет.");
                        document.querySelector(".finish").click();
                        return;
                    }

                    sourceV.setColor(Colors.RED);
                    sinkV.setColor(Colors.RED);

                    let matrix = currGraph.getMatrix();
                    let edgeAccess = currGraph.getAdvancedMatrix();

                    for (let i = 0; i < currGraph.Vs.length; i++){
                        for (let j = 0; j < currGraph.Vs.length; j++){
                            elem = edgeAccess[i][j];
                            if (elem instanceof E){
                                elem.setDesc("←" + matrix[i][j] + "  " + matrix[i][j] + "→");
                            }
                            else if (elem instanceof P){
                                elem.setDesc("←0  " + matrix[i][j] + "→");
                            }
                        }
                    }

                    const BSFforFF = (matrix, s, t) => {

                        parent = new Array(currGraph.Vs.length).fill(-1);
                        visited = new Array(currGraph.Vs.length).fill(false);
                        queue = new Array();

                        queue.push(s);
                        visited[s] = true;

                        while(queue.length > 0) {
                            let a = queue.shift();
                            visited[a] = true;

                            for (let i = 0; i < currGraph.Vs.length; i++){
                                if (!visited[i] && matrix[a][i] > 0){
                                    if (i == t){
                                        parent[i] = a;
                                        return parent;
                                    }

                                    queue.push(i);
                                    parent[i] = a;
                                    visited[i] = true;
                                }
                            }
                        }

                        return null;
                    }

                    let maxFlow = 0;

                    let before = "";
                    let after = "Устанавливаем начальный максимальный поток = 0. Введем для каждой дуги/ребра обозначение '←<обратная пропускная способность>  <прямая пропускная способность>→'";
                    player.push(
                        Step.getSteps([
                            new TextSegment(myAlert, after, before)
                        ])
                    );
                    before = after;

                    let toChange2 = [];

                    while(true){

                        after = "Ищем путь от истока к стоку";
                        player.push(
                            Step.getSteps(toChange2.concat([
                                new TextSegment(myAlert, after, before)
                            ]))
                        );
                        before = after;
                        toChange2 = [];

                        let parent = BSFforFF(matrix, source, sink);
                        if (!parent) break;                  

                        let min = Infinity;
                        let path = currGraph.Vs[sink].name;

                        let toChange = [];
                        let minList = "";

                        for (let i = sink; i != source; i = parent[i]){
                            if (matrix[parent[i]][i] < min){
                                min = matrix[parent[i]][i];
                            }

                            minList += matrix[parent[i]][i] + ",";

                            let edge = edgeAccess[parent[i]][i];
                            if (!edge) edge = edgeAccess[i][parent[i]];

                            toChange.push(new EdgeSegment(edge, Colors.RED, Colors.GREEN, null, null));
                            toChange.push(new VertexSegment(currGraph.Vs[parent[i]], Colors.RED, Colors.GREEN, null, null));

                            toChange2.push(new EdgeSegment(edge, Colors.GREEN, Colors.RED, null, null));
                            toChange2.push(new VertexSegment(currGraph.Vs[parent[i]], Colors.GREEN, Colors.RED, null, null));
                            path += "-" + currGraph.Vs[parent[i]].name;
                        }

                        toChange2.pop();
                        toChange.pop();

                        after = "Такой путь найден: " + path.split("").reverse().join("") + "Максимально возможный поток через этот тут равен: MIN(" + minList.substring(0, minList.length - 1) + ") = " + min + ".";
                        player.push(
                            Step.getSteps(toChange.concat([
                                new TextSegment(myAlert, after, before)
                            ]))
                        );
                        before = after;

                        let toChange3 = [];
                        for (let i = sink; i != source; i = parent[i]){
                            matrix[parent[i]][i] -= min;
                            matrix[i][parent[i]] += min;

                            
                            let edgeA = edgeAccess[parent[i]][i];
                            let edgeB = edgeAccess[i][parent[i]]; 
                            
                            if (!edgeA) 
                                toChange3.push(new EdgeSegment(edgeB, null, null, "←"+matrix[parent[i]][i]+"  "+matrix[i][parent[i]]+"→",edgeB.desc));
                            else
                                toChange3.push(new EdgeSegment(edgeA, null, null, "←"+matrix[i][parent[i]]+"  "+matrix[parent[i]][i]+"→",edgeA.desc));
                        }

                        after = "Уменьшаем прямую пропускную способность на " + min + ". Увеличиваем обратную пропускную способность на " + min + ".";
                        player.push(
                            Step.getSteps(toChange3.concat([
                                new TextSegment(myAlert, after, before)
                            ]))
                        );
                        before = after;

                        maxFlow += min;
                        after = "Увеличиваем максимальный поток на " + min + ". Текущий максимальный поток = " + maxFlow;
                        player.push(
                            Step.getSteps([
                                new TextSegment(myAlert, after, before)
                            ])
                        );
                    }

                    after = "Пути от истока к стоку нет. Максимальный поток = " + maxFlow;
                    player.push(
                        Step.getSteps(toChange2.concat([
                            new TextSegment(myAlert, after, before)
                        ]))
                    );

                }
            }
        }
];

const getStack = (stack, action, elem) => {

    let stackWrap = document.createElement("div"); 
    stackWrap.classList.add("struct-wrap");

    let visualStack = document.createElement("div");
    visualStack.classList.add("stack");
    stackWrap.appendChild(visualStack);

    if (stack.length < 7) {
        for (let i = 0; i < stack.length; i++){
            let elem = document.createElement("p");
            elem.innerHTML = currGraph.Vs[stack[i]].name;
            elem.classList.add("element");
            visualStack.appendChild(elem);
        }
    }
    else {
        for (let i = 0; i < 3; i++){
            let elem = document.createElement("p");
            elem.innerHTML = currGraph.Vs[stack[i]].name;
            elem.classList.add("element");
            visualStack.appendChild(elem);
        }

        let elem = document.createElement("p");
        elem.innerHTML = "...";
        elem.classList.add("element");
        visualStack.appendChild(elem);

        for (let i = stack.length - 3; i < stack.length; i++){
            let elem = document.createElement("p");
            elem.innerHTML = currGraph.Vs[stack[i]].name;
            elem.classList.add("element");
            visualStack.appendChild(elem);
        }
    }

    if (action !== null){
        let arrow = document.createElement("p");
        arrow.innerHTML = action === "push" ? "←" : "→";
        arrow.classList.add("arrow");
        stackWrap.appendChild(arrow);

        let add = document.createElement("p");
        add.innerHTML = currGraph.Vs[elem].name;
        add.classList.add("element");
        stackWrap.appendChild(add);
    }

    return stackWrap.outerHTML;
}

const getQueue = (queue, action, elem) => {

    let queueWrap = document.createElement("div"); 
    queueWrap.classList.add("struct-wrap");

    let visualQueue = document.createElement("div");
    visualQueue.classList.add("queue");
    queueWrap.appendChild(visualQueue);

    if (queue.length < 7) {
        for (let i = 0; i < queue.length; i++){
            let elem = document.createElement("p");
            elem.innerHTML = currGraph.Vs[queue[i]].name;
            elem.classList.add("element");
            visualQueue.appendChild(elem);
        }
    }
    else {
        for (let i = 0; i < 3; i++){
            let elem = document.createElement("p");
            elem.innerHTML = currGraph.Vs[queue[i]].name;
            elem.classList.add("element");
            visualQueue.appendChild(elem);
        }

        let elem = document.createElement("p");
        elem.innerHTML = "...";
        elem.classList.add("element");
        visualQueue.appendChild(elem);

        for (let i = queue.length - 3; i < queue.length; i++){
            let elem = document.createElement("p");
            elem.innerHTML = currGraph.Vs[queue[i]].name;
            elem.classList.add("element");
            visualQueue.appendChild(elem);
        }
    }

    if (action !== null){

        let arrow = document.createElement("p");
        arrow.innerHTML = "←";
        arrow.classList.add("arrow");
        
        let add = document.createElement("p");
        add.innerHTML = currGraph.Vs[elem].name;
        add.classList.add("element");
    
        if (action === "pop"){
            queueWrap.insertBefore(arrow, queueWrap.firstChild);
            queueWrap.insertBefore(add, queueWrap.firstChild);
        }
        else{
            queueWrap.appendChild(arrow);
            queueWrap.appendChild(add);
        }
    }

    return queueWrap.outerHTML;
}

const getCommandStack = (stack, action, elem) => {

    let stackWrap = document.createElement("div"); 
    stackWrap.classList.add("struct-wrap");

    let visualStack = document.createElement("div");
    visualStack.classList.add("stack");
    stackWrap.appendChild(visualStack);

    if (stack.length < 7) {
        for (let i = 0; i < stack.length; i++){
            let elem = document.createElement("p");
            elem.innerHTML = stack[i];
            elem.classList.add("element");
            visualStack.appendChild(elem);
        }
    }
    else {
        for (let i = 0; i < 3; i++){
            let elem = document.createElement("p");
            elem.innerHTML = stack[i];
            elem.classList.add("element");
            visualStack.appendChild(elem);
        }

        let elem = document.createElement("p");
        elem.innerHTML = "...";
        elem.classList.add("element");
        visualStack.appendChild(elem);

        for (let i = stack.length - 3; i < stack.length; i++){
            let elem = document.createElement("p");
            elem.innerHTML = stack[i];
            elem.classList.add("element");
            visualStack.appendChild(elem);
        }
    }

    if (action !== null){
        let arrow = document.createElement("p");
        arrow.innerHTML = action === "push" ? "←" : "→";
        arrow.classList.add("arrow");
        stackWrap.appendChild(arrow);

        let add = document.createElement("p");
        add.innerHTML = elem;
        add.classList.add("element");
        stackWrap.appendChild(add);
    }

    return stackWrap.outerHTML;
}

let toolCreator = function(toolObj) {
    let div = document.createElement("div");
    div.className = "tool"
    div.innerHTML =
    `
        <div class="tool-img-holder">
            <img class="tool-img" alt="${toolObj.name}" src="${toolObj.src}">
        </div>

        <div class="tool-desc-holder">
            <p class="tool-desc">${toolObj.name}</p>
        </div>
    `
    div.onclick = () => {
        if (isAction) {
            warnWindow("Завершите работу с алгоритмом, чтобы использовать инструменты");
            return;
        }

        let last = document.querySelector(".selected-tool");
        if (last) last.classList.remove("selected-tool");
        div.classList.add("selected-tool");
        selectedTool = toolObj;

        if (currSelected) currSelected.setColor(Colors.GREEN);
        lastSelected = currSelected;
        currSelected = null;

        myAlert.innerHTML = toolObj.desc;
    }
    return div;
}

let saveTool = function() {
    let div = document.createElement("div");
    div.className = "tool"
    div.innerHTML =
    `
        <div class="tool-img-holder">
            <img class="tool-img" alt="сохранение" src="Icons/Save.svg">
        </div>

        <div class="tool-desc-holder">
            <p class="tool-desc">Сохранить</p>
        </div>
    `
    div.onclick = () => {
        if (isAction) {
            warnWindow("Завершите работу с алгоритмом, чтобы использовать инструменты");
            return;
        }

        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currGraph.save()));
        let dlAnchorElem = document.createElement("a");
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", "graph.json");
        dlAnchorElem.click();   
    }
    return div;
}

let loadTool = function() {
    let div = document.createElement("div");
    div.className = "tool"
    div.innerHTML =
    `
        <div class="tool-img-holder">
            <img class="tool-img" alt="загрузка" src="Icons/Load.svg">
        </div>

        <div class="tool-desc-holder">
            <p class="tool-desc">Загрузить</p>
        </div>

        <input id="getFile" type="file" hidden>
    `

    let getFile = div.querySelector("#getFile");
    let form = preLoadWindow();

    div.onclick = () => {
        if (isAction) {
            warnWindow("Завершите работу с алгоритмом, чтобы использовать инструменты");
            return;
        }
        
        form.querySelector(".accept").onclick = () => {getFile.click();}
        form.querySelector(".cancel").onclick = () => {form.remove();}
        document.body.append(form);
    }

    getFile.onchange = (event) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader()
            fileReader.onload = (e) => {
                let obj = e.target.result;
                resolve(JSON.parse(obj));
            }
            fileReader.readAsText(event.target.files[0]);

        }).then(res => {
            form.remove();
            currGraph = Graph.load(res);
            work.innerHTML = "";
            currGraph.Ps.forEach(elem => work.appendChild(elem.elem));
            currGraph.Es.forEach(elem => work.appendChild(elem.elem));
            currGraph.Vs.forEach(elem => work.appendChild(elem.elem));
        }).catch((err => {
            warnWindow("Файл не был загружен");
        }))
    }

    return div;
}

addEventListener("click",(e) => {
    if (isAction) return;

    if (selectedTool){
        if (e.target.closest("#svg")) {       

            if (e.target.id === "svg"){
                if (currSelected) currSelected.setColor(Colors.GREEN);
                lastSelected = currSelected;
                currSelected = null;
            }
            selectedTool.action(e);
        }
    }
})

modeSwitcher.onclick = () => {
    if (modeSwitcher.value === "AUTO"){

        player.pause();

        modeElem.innerHTML = 
        `
        <p class="mode-tool-title">Шаг:</p>
        <div class="speed-controller">
            <button type="button" class="step-first"><img src="Player/back2.svg" alt="в начало" class="player-icon"></button>
            <button type="button" class="step-back"><img src="Player/back.svg" alt="назад" class="player-icon"></button>
            <p class="step">${player.getIndex() + 1}</p>
            <button type="button" class="step-next"><img src="Player/next.svg" alt="вперед" class="player-icon"></button>
            <button type="button" class="step-last"><img src="Player/next2.svg" alt="в конец" class="player-icon"></button>
        </div>
        `;
        player.mode = "STEP";
        modeSwitcher.innerHTML = "По шагам"
        modeSwitcher.value = "STEP";

        let curr = modeElem.querySelector(".step");

        modeElem.querySelector(".step-first").onclick = () => {
            player.toStart();
            curr.innerHTML = player.getIndex() + 1;
        }

        modeElem.querySelector(".step-back").onclick = () => {
            player.back();
            curr.innerHTML = player.getIndex() + 1;
        }

        modeElem.querySelector(".step-next").onclick = () => {
            player.next();
            curr.innerHTML = player.getIndex() + 1;
        }

        modeElem.querySelector(".step-last").onclick = () => {
            player.toEnd();
            curr.innerHTML = player.getIndex() + 1;
        }
    }
    else{
        modeElem.innerHTML = 
        `
        <button type="button" class="play" value="${player.isPaused ? "pause" : "play"}">
            ${
                player.isPaused ?
                `<img src="Player/next.svg" alt="продолжить" class="player-icon">` :
                `<img src="Player/pause.svg" alt="на паузу" class="player-icon">`
            }
        </button>

        <p class="mode-tool-title">Скорость:</p>
        <div class="speed-controller">
            <button type="button" class="slower"><img src="Player/slower.svg" alt="медленнее" class="player-icon"></button>
            <p class="speed">${player.getSpeed()}c</p>
            <button type="button" class="faster"><img src="Player/faster.svg" alt="быстрее" class="player-icon"></button>
        </div>
        `;
        player.mode = "AUTO";
        modeSwitcher.innerHTML = "Авто"
        modeSwitcher.value = "AUTO";

        const playButton = modeElem.querySelector(".play");
        const playButtonImg = modeElem.querySelector(".play .player-icon");

        let curr = modeElem.querySelector(".speed");

        modeElem.querySelector(".slower").onclick = () => {
            player.slower();
            curr.innerHTML = player.getSpeed() + "c";
        }

        modeElem.querySelector(".faster").onclick = () => {
            player.faster();
            curr.innerHTML = player.getSpeed() + "c";
        }

        playButton.onclick = () => {
            if (playButton.value === "play"){
                playButton.value = "pause";
                playButtonImg.src = "Player/next.svg";
                playButtonImg.alt = "прожолжить";
                player.pause();
            }
            else{
                playButton.value = "play";
                playButtonImg.src = "Player/pause.svg";
                playButtonImg.alt = "на паузу";
                player.play();
                player.invoke();
            }
                
        }
    }
}

document.querySelector(".finish").onclick = () => {
    
    work.innerHTML = "";

    if (lastSave) currGraph = Graph.load(lastSave);

    if (currGraph){
        currGraph.Ps.forEach(elem => work.appendChild(elem.elem));
        currGraph.Es.forEach(elem => work.appendChild(elem.elem));
        currGraph.Vs.forEach(elem => work.appendChild(elem.elem));
    }

    myAlert.innerHTML = selectedTool.desc;

    if (player.mode === "STEP") modeElem.querySelector(".step").innerHTML = 1;
    else if (!player.isPaused) document.querySelector(".play").click();

    player.clear();

    isAction = false;

    lastSelected = null;
    currSelected = null;
}

toolPanel.appendChild(saveTool());
toolPanel.appendChild(loadTool());
for (let i = 0; i < tools.length; i++){
    toolPanel.appendChild(toolCreator(tools[i]));
}

modeSwitcher.click();

document.querySelectorAll(".tool")[2].click();

// {
    //     name: "Гамильтонов цикл", 
    //     desc: "", 
    //     src: "Icons/BFS.svg", 
    //     action: (e) => {

    //         if (currGraph.isConnected()){
    //             if (currSelected && currSelected instanceof V){

    //                 if (isAction) return;
    //                 else isAction = true;

    //                 lastSave = save();

    //                 let startV = currSelected;

    //                 let list = currGraph.getList();
    //                 let edgeAccess = currGraph.getAdvancedMatrix();

    //                 let n = currGraph.Vs.length;
    //                 let visited = new Array(n).fill(false);
    //                 let cycle = new Array(n);
    //                 let start = currGraph.Vs.indexOf(startV);

    //                 cycle[0] = start;
    //                 visited[start] = true;     

    //                 let before = "";
    //                 let after;

    //                 after = `В основе поиска гамильтонова цикла лежит рекурсивный вызов просмотра непосещенных соседей STEP(k), принимающий качестве параметра глубину вызова k. Для удобства понимания, начала сообщений будут снабжены метками с информацией о том, на какой глубине вызова выполняются действия.`;
    //                 player.push(
    //                     Step.getSteps([
    //                         new TextSegment(myAlert, after, before)
    //                     ])
    //                 );
    //                 before = after;
                    
    //                 const step = (k) => {

    //                     if (k == n - 1){
    //                         if (list[cycle[k]].indexOf(start) !== -1) return true;

    //                         after = `STEP(${k + 1}): Все вершины пройдены, но гамильтонов цикл не был найден. Завершение выполнения STEP(${k + 1}).`;
    //                         player.push(
    //                             Step.getSteps([
    //                                 new TextSegment(myAlert, after, before)
    //                             ])
    //                         );
    //                         before = after;

    //                         return false;
    //                     }

    //                     after = `STEP(${k + 1}): Просмотр непосещенных смежных вершин для вершины ` + currGraph.Vs[cycle[k]].name;
    //                     player.push(
    //                         Step.getSteps([
    //                             new TextSegment(myAlert, after, before)
    //                         ])
    //                      );
    //                     before = after;
                        
    //                     for (let idx = 0; idx < list[cycle[k]].length; idx++){

    //                         let i = list[cycle[k]][idx];

    //                         if (!visited[i]){

    //                             after = `STEP(${k + 1}): Перемещаемся в смежную непросмотренную вершину ` + currGraph.Vs[i].name + `. Вызов STEP(${k + 2})`;                               
    //                             player.push(
    //                                 Step.getSteps([
    //                                     new VertexSegment(currGraph.Vs[i], Colors.YELLOW, Colors.GREEN, null, null),
    //                                     new EdgeSegment(edgeAccess[cycle[k]][i], Colors.YELLOW, Colors.GREEN, null, null),
    //                                     new TextSegment(myAlert, after, before)
    //                                 ])
    //                             );
    //                             before = after;

    //                             cycle[k + 1] = i;
    //                             visited[i] = true;

    //                             if (step(k + 1)) return true;

    //                             visited[i] = false;

    //                             after = `STEP(${k + 1}): Возвращаемся к просмотру соседей вершины ` + currGraph.Vs[cycle[k]].name + `. `;
    //                             if (idx > 0){
    //                                 after += "Уже просмотренные соседи: ";
    //                                 for (let j = 0; j <= idx; j++) if (!visited[list[cycle[k]][j]]) after += currGraph.Vs[list[cycle[k]][j]].name + ", "
    //                                 after = after.substring(0, after.length - 2);
    //                             }
                                
    //                             player.push(
    //                                 Step.getSteps([
    //                                     new VertexSegment(currGraph.Vs[cycle[k + 1]], Colors.GREEN, Colors.YELLOW, null, null),
    //                                     new EdgeSegment(edgeAccess[cycle[k]][cycle[k+1]], Colors.GREEN, Colors.YELLOW, null, null),
    //                                     new TextSegment(myAlert, after, before)
    //                                 ])
    //                             );
    //                             before = after;
    //                         }
    //                     }

    //                     after = `STEP(${k + 1}): Просмотр соседей вершины ` + currGraph.Vs[cycle[k]].name + ` не дал результатов. Завершение выполнения STEP(${k + 1}).`;
    //                     player.push(
    //                         Step.getSteps([
    //                             new TextSegment(myAlert, after, before)
    //                         ])
    //                     );
    //                     before = after;

    //                     return false;
    //                 }

    //                 after = `Запускаем STEP(1).`;
    //                 player.push(
    //                     Step.getSteps([
    //                         new TextSegment(myAlert, after, before)
    //                     ])
    //                 );
    //                 before = after;
          

    //                 if (step(0)){
    //                     after = "Гамильтонов цикл обнаружен: "
    //                     for (let  i = 0; i < cycle.length; i++){
    //                         after += currGraph.Vs[cycle[i]].name + "-";
    //                     }
    //                     after += currGraph.Vs[cycle[0]].name;
    //                     player.push(
    //                         Step.getSteps([
    //                             new EdgeSegment(edgeAccess[cycle[0]][cycle[cycle.length-1]], Colors.YELLOW, Colors.GREEN, null, null),
    //                             new TextSegment(myAlert, after, before)
    //                         ])
    //                     );
    //                 }
    //                 else{
    //                     after = "Гамилтонов цикл в данном графе отсутсвует"
    //                     player.push(
    //                         Step.getSteps([
    //                             new TextSegment(myAlert, after, before)
    //                         ])
    //                     );
    //                 }
    //             }
    //         }
    //         else {
    //             warnWindow("Граф несвязный");
    //         }
    //     }
    // },