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

    getNoteFromElement(element:Element):ElementNote|null {
        for(var note in this.notes as ElementNote[]) {
            if(this.notes[note].element?.isSameNode(element)) return this.notes[note];
        }
        return null;
    }

    getNotesFromAttachedElement(element:Element):ElementNote[] {
        var result=[];
        for(var note in this.notes as ElementNote[]) {
            if(this.notes[note].attachedElement?.isSameNode(element)) result.push(this.notes[note]);
        }
        return result;
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

    removeAll() {
        for(var i in this.notes) {
            $(".element-note").remove();
            $(".element-note-link").remove();
        }
        this.notes = [];
    }
}

class ElementNote {
    attachedElement: Element|null;
    html: string;
    element: HTMLDivElement|null = null;
    text: string = ""; //value of the textarea
    collection: ElementNoteCollection|null;
    onClose: Function|null = null;
    link:HTMLElement|null = null;
    rect:DOMRect|null = null;
    
    constructor(attachedElement:Element|null, html:string, text:string, collection:ElementNoteCollection|null) {
        this.attachedElement = attachedElement;
        this.html = html;
        this.text = text;
        this.collection = collection;
    }

    addLinkToDOM(document:Document, targetText?:string):HTMLElement {
        if(this.attachedElement == null) throw("No attached element for note.");
		var link:HTMLElement = document.createElement("div");
        $(link).addClass("element-note-link");

        if(targetText) this.setRect(targetText);

        link.style.left = this.rect!.x -19 + this.rect!.width + $(window).scrollLeft()! + "px";
        link.style.top = this.rect!.y -5 - this.rect!.height + $(window).scrollTop()! + "px";
        link.style.width = "20px";
        link.style.height = "20px";
        if(typeof this.element?.style.zIndex != "undefined") link.style.zIndex = "2";
        else link.style.zIndex = (parseInt(this.element?.style.zIndex as unknown as string)+1).toString();
        let boundShowContainer = this.collection!.showContainer.bind(this.collection);
        let thisNote = this;
        $(link).on("click", function(){
            boundShowContainer();
            thisNote.show();
            $(".element-note-link").css("animation-name", "none");
            $(link).css("animation-name", "element-note-link-selected");
        });
        var body:Element = document.getElementsByTagName("BODY")[0];
        body.appendChild(link);
        this.link = link;
        return link;
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

    setRect(targetText:string) {
        var range:Range = document.createRange();
        var nodes = this.attachedElement!.childNodes;
        this.rect = (this.attachedElement as Element).getBoundingClientRect();
        for (let node of nodes as any)
        {
            var start;
            if (node.nodeType == Node.TEXT_NODE) {
                start = node.textContent!.search(RegExp(targetText as string, "gi"));
                var end;
                if(start != -1) {
                    end = start + targetText.length;
                    range.setStart(node, start);
                    range.setEnd(node, end);
                    var rects = range.getClientRects();
                    if(rects[0]) this.rect = rects[0];
                }
            }
        } 
    }

    show() {
        $(this.element!).show();
        if(this.collection) this.collection.hideLinks();
    }

    hide() {
        $(this.element!).hide();
        if(this.collection) this.collection.showLinks();
    }
}