class ElementNoteCollection {
    notes:ElementNote[];
    container:HTMLDivElement|null = null;
    document:Document;
    $:Function;

    constructor(notes:ElementNote[], document:Document, $:Function) {
        this.notes = notes;
        this.document = document;
        this.$ = $;
    }

    addContainerToDocument() {       
        this.container = this.document.createElement("div");
        this.container.id = "element-notes-container";
        var body:Element = this.document.getElementsByTagName("BODY")[0];
        body.appendChild(this.container);
    }

    addNote(attachedElement:HTMLElement, html:string, text:string):ElementNote {
        var newElementNote = new ElementNote(attachedElement, html, text, this);
        newElementNote.addNoteToDOM(this.document, this.container!, this.$);
        // not using innerHTML as it would break js event listeners of the page
        this.showContainer();
        this.notes.push(newElementNote);
        return newElementNote;
    }

    getNoteForElement(element:HTMLDivElement):ElementNote|undefined {
        for(var note in this.notes as ElementNote[]) {
            if(this.notes[note].element?.isSameNode(element)) return this.notes[note];
        }
    }

    showContainer() {
        this.container!.style.display = "block";
    }

    showLinks() {
        this.$(".element-note-link").show();
    }

    hideLinks() {
        this.$(".element-note-link").hide();
    }
}

class ElementNote {
    attachedElement: Element;
    html: string;
    element: HTMLDivElement|null = null;
    text: string = ""; //value of the textarea
    collection: ElementNoteCollection;
    
    constructor(attachedElement: Element, html:string, text:string, collection:ElementNoteCollection) {
        this.attachedElement = attachedElement;
        this.html = html;
        this.text = text;
        this.collection = collection;
    }

    addLinkToDOM(document:Document) {
		var link:HTMLElement = document.createElement("div");
        $(link).addClass("element-note-link");
        var rect:DOMRect = this.attachedElement.getBoundingClientRect();
        link.style.left = rect.x+rect.width+"px";
        link.style.top = rect.y-rect.height+"px";
        link.style.width = "20px";
        link.style.height = "20px";
        let boundShowContainer = this.collection.showContainer.bind(this.collection);
        let thisNote = this;
        $(link).on("click", function(){
            boundShowContainer();
            thisNote.show();
        });
        var body:Element = document.getElementsByTagName("BODY")[0];
        body.appendChild(link);
    }

    addNoteToDOM(document:Document, container:HTMLDivElement, $:Function):HTMLDivElement {
        container!.insertAdjacentHTML('beforeend', this.html);
        this.element = $('.element-note')[$('.element-note').length-1];
        $(this.element).find(".element-note-text").val(this.text);
        let thisNote = this;
        $(this.element).find(".element-note-close").on("click", function(){
            thisNote.hide();
        });
        return this.element!;
    }

    show() {
        this.element!.style.display = "block";
        this.collection.hideLinks();
    }

    hide() {
        this.element!.style.display = "none";
        this.collection.showLinks();
    }
}