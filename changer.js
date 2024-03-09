class Changer{

    constructor(
        vertex, vertexColor, vertexText,
        edge, edgeColor, edgeText,
        message, text
    ){

        this.edge = edge;
        this.edgeColor = edgeColor;
        this.edgeText = edgeText;

        this.vertex = vertex;
        this.vertexColor = vertexColor;
        this.vertexText = vertexText;
        
        this.message = message;
        this.text = text;
    }

    invoke(){
        if (this.edge){
            if (this.edgeColor) this.edge.setColor(this.edgeColor);
            if (this.edgeText) this.edge.setValue(this.edgeText);
        }

        if (this.vertex){
            if (this.vertexColor) this.vertex.setColor(this.vertexColor);
            if (this.vertexText) this.vertex.setDesc(this.vertexText);
        }

        if (this.message){
            if (this.text) this.message.innerHTML = this.text;
            console.log(this.text);
        }
    }
}