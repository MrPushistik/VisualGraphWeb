class ChangerArr{

    constructor(
        vertexArr, vertexColorArr, vertexTextArr,
        edgeArr, edgeColorArr, edgeTextArr,
        message, text
    ){

        this.edgeArr = edgeArr;
        this.edgeColorArr = edgeColorArr;
        this.edgeTextArr = edgeTextArr

        this.vertexArr = vertexArr;
        this.vertexColorArr = vertexColorArr;
        this.vertexTextArr = vertexTextArr;
        
        this.message = message;
        this.text = text;
    }

    invoke(){
        for (let i = 0; i < this.vertexColorArr.length; i++) {
            if (this.vertexColorArr && this.vertexColorArr[i]) this.vertexArr[i].setColor(this.vertexColorArr[i]);
            if (this.vertexTextArr && this.vertexTextArr[i]) this.vertexArr[i].setDesc(this.vertexTextArr[i]);
        }
        for (let i = 0; i < this.edgeColorArr.length; i++) {
            if (this.edgeTextArr && this.edgeTextArr[i]) this.edgeArr[i].setDesc(this.edgeTextArr[i]);
            if (this.edgeColorArr && this.edgeColorArr[i]) this.edgeArr[i].setColor(this.edgeColorArr[i]);
        }
        if (this.message){
            if (this.text) this.message.innerHTML = this.text;
        }
    }
}