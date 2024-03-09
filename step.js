class Step {
    constructor(next, back){
        this.backObj = back;
        this.nextObj = next;
    }

    next(){
        this.nextObj.invoke();
    }

    back(){
        this.backObj.invoke();
    }

    static getSteps(obj){
        let vertexObjs = [];
        let vertexColorOld = [];
        let vertexColorNew = [];
        let vertexTextOld = [];
        let vertexTextNew = [];

        let edgeObjs = [];
        let edgeColorOld = [];
        let edgeColorNew = [];
        let edgeTextOld = [];
        let edgeTextNew = [];

        let textObj;
        let textOld;
        let textNew;

        for (let i = 0; i < obj.length; i++){
            if (obj[i] instanceof VertexSegment){
                vertexObjs.push(obj[i].object);
                vertexColorOld.push(obj[i].oldColor);
                vertexColorNew.push(obj[i].newColor);
                vertexTextOld.push(obj[i].oldText);
                vertexTextNew.push(obj[i].newText);
            }
            else if (obj[i] instanceof EdgeSegment){
                edgeObjs.push(obj[i].object);
                edgeColorOld.push(obj[i].oldColor);
                edgeColorNew.push(obj[i].newColor);
                edgeTextOld.push(obj[i].oldText);
                edgeTextNew.push(obj[i].newText);
            }
            else if (obj[i] instanceof TextSegment){
                textObj = obj[i].object;
                textOld = obj[i].oldValue;
                textNew = obj[i].newValue;
            }
        }

        return new Step(
            new ChangerArr(vertexObjs, vertexColorNew, vertexTextNew, edgeObjs, edgeColorNew, edgeTextNew, textObj, textNew),
            new ChangerArr(vertexObjs, vertexColorOld, vertexTextOld, edgeObjs, edgeColorOld, edgeTextOld, textObj, textOld),
        )
    }
}

class TextSegment{
    constructor(object, newValue, oldValue){
        this.object = object;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}

class EdgeSegment{
    constructor(object, newColor, oldColor,  newText, oldText,){
        this.object = object;
        this.oldColor = oldColor;
        this.newColor = newColor;
        this.oldText = oldText;
        this.newText = newText;
    }
}

class VertexSegment{
    constructor(object, newColor, oldColor, newText, oldText){
        this.object = object;
        this.oldColor = oldColor;
        this.newColor = newColor;
        this.oldText = oldText;
        this.newText = newText;
    }
}