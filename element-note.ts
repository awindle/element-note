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

    getNoteFromElement(element:HTMLDivElement):ElementNote|undefined {
        for(var note in this.notes as ElementNote[]) {
            if(this.notes[note].element?.isSameNode(element)) return this.notes[note];
        }
    }

    getNoteFromReference(reference:string):ElementNote|null{
        for(var note in this.notes as ElementNote[]) {
            let element = this.notes[note].attachedElement;
            if($(element as Element).text() == reference) return this.notes[note];
        }
        return null;
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
    onClose: Function|null = null;
    
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
        link.style.left = rect.x + rect.width + $(window).scrollLeft()! + "px";
        link.style.top = rect.y - rect.height + $(window).scrollTop()! + "px";
        link.style.width = "20px";
        link.style.height = "20px";
        if(typeof this.element?.style.zIndex != "undefined") link.style.zIndex = "2";
        else link.style.zIndex = (parseInt(this.element?.style.zIndex as unknown as string)+1).toString();
        let boundShowContainer = this.collection.showContainer.bind(this.collection);
        let thisNote = this;
        $(link).on("click", function(){
            boundShowContainer();
            thisNote.show();
        });
        var body:Element = document.getElementsByTagName("BODY")[0];
        body.appendChild(link);
        console.log(link);
    }

    addNoteToDOM(document:Document, container:HTMLDivElement, $:Function):HTMLDivElement {
        container!.insertAdjacentHTML('beforeend', this.html);
        this.element = $('.element-note')[$('.element-note').length-1];
        $(this.element).find(".element-note-text").val(this.text);
        let thisNote = this;
        $(this.element).find(".element-note-close").on("click", function(){
            thisNote.hide();
            if(thisNote.onClose != null) thisNote.onClose();
        });
        return this.element!;
    }

    show() {
        $(this.element!).show();
        this.collection.hideLinks();
    }

    hide() {
        $(this.element!).hide();
        this.collection.showLinks();
    }
}