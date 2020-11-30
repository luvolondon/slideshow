

class SlideshowSheet extends JournalSheet {
    
    constructor(object, options={}) {
        super(object, options);

        this.graph = null;
        this.paper = null;    
        this.currentDrop = null;         
    }

    get template() {
        return "modules/slideshow/templates/slideshowsheet.html";
    }

    async _onShowPlayers(event) {
        event.preventDefault();
        await this.submit();

        if (slideshow) {
            slideshow.start(this.object);    
            await this.close();
        } 
        return;
      }

      /** @override */
    _getHeaderButtons() {
        const buttons = BaseEntitySheet.prototype._getHeaderButtons.call(this);
        const isOwner = this.object.owner;

        if ( game.user.isGM ) {
            buttons.unshift({
              label: "JOURNAL.ActionShow",
              class: "share-image",
              icon: "fas fa-eye",
              onclick: ev => this._onShowPlayers(ev)
            });
          }
        return buttons;
    }
    activateListeners(html) {
        super.activateListeners(html);
        this.initGraph();
    }

    /** @override */
    _getSubmitData(updateData={}) {
        console.log("Submit");
        $('#content').val(JSON.stringify(this.graph.toJSON()));

        return super._getSubmitData(updateData);
    }

    initGraph() {
        this.graph = new joint.dia.Graph;

        this.paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: this.graph,
            height: 2000,
            width: 600,
            gridSize: 1
        });
    
        var main = this;

        
        joint.shapes.html = {};
        joint.shapes.html.Element = joint.shapes.basic.Rect.extend({
            defaults: joint.util.deepSupplement({
                type: 'html.Element',
                size: { width: 400, height:140 },
                attrs: {
                    
                    rect: { stroke: 'none', 'fill-opacity': 0 }
                }
            }, joint.shapes.basic.Rect.prototype.defaults)
        });
        $('#myholder').on('dragenter', function(evt) {
            if (main.currentDrop != null) {
                $(main.currentDrop).removeClass("highlight");      
                main.currentDrop = null;                      
            }
            evt.preventDefault();            
        });

        $('#myholder').on('dragleave', function(evt) {
            if (main.currentDrop != null) {
                $(main.currentDrop).removeClass("highlight");      
                main.currentDrop = null;                      
            }
            evt.preventDefault();            
        });

        $('#myholder').on('dragover', function(ev) {
            var holder =  $('#myholder').offset();
            var co = new g.Point(ev.clientX - holder.left, ev.clientY - holder.top);            
            var elementBelow = main.paper.findViewsFromPoint(co);    
                
            if (elementBelow.length > 0) { 
                
                var elem = elementBelow[0];                
                var configs = $(elem.$box).find(".config");
                configs.each( function(id,config) {
                    if (
                        ( ev.clientX >= $(config).offset().left ) && 
                        ( ev.clientX <= ($(config).offset().left + $(config).width())) &&
                        ( ev.clientY >= $(config).offset().top ) && 
                        ( ev.clientY <= ($(config).offset().top + $(config).height()))
                    ) {
                        if (main.currentDrop && (main.currentDrop !== config)) {
                            $(main.currentDrop).removeClass("highlight");                            
                        }
                        const data = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));                        
                        if ( ((id == 0) && (data.type == "Playlist") ) ||
                        ((id == 1) && (data.type == "JournalEntry") ) ||
                        ((id == 2) && (data.type == "JournalEntry") ) ||
                        ((id == 3) && (data.type == "JournalEntry") )                         
                        ) {
                            main.currentDrop = config;
                            $(config).addClass("highlight");

                        }
                        
                    }
                    
                });
                
            }
            
            ev.preventDefault();
            
        });

        $('#myholder').on('drop', function(ev) {
            var holder =  $('#myholder').offset();
            var co = new g.Point(ev.clientX - holder.left, ev.clientY - holder.top);            
            var elementBelow = main.paper.findViewsFromPoint(co);    
                
            if (elementBelow.length > 0) {                
                var elem = elementBelow[0];                
                var configs = $(elem.$box).find(".config");
                configs.each( function(id,config) {
                    if (
                        ( ev.clientX >= $(config).offset().left ) && 
                        ( ev.clientX <= ($(config).offset().left + $(config).width())) &&
                        ( ev.clientY >= $(config).offset().top ) && 
                        ( ev.clientY <= ($(config).offset().top + $(config).height()))
                    ) {
                        if (main.currentDrop && (main.currentDrop !== config)) {
                            $(main.currentDrop).removeClass("highlight");                            
                        }
                        const data = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));                        
                        if ( ((id == 0) && (data.type == "Playlist") ) ||
                        ((id == 1) && (data.type == "JournalEntry") ) ||
                        ((id == 2) && (data.type == "JournalEntry") ) ||
                        ((id == 3) && (data.type == "JournalEntry") )                         
                        ) {
                            $(config).removeClass("highlight");
                            main.currentDrop = null;
                            elem.model.set('content' + id, data.id);
                            elem.updateBox();
                        }
                        
                    }
                    
                });
                
            }
                        
            //console.log(ev.originalEvent.dataTransfer.getData('text/plain'));
            //ev.preventDefault();
        });
        joint.shapes.html.ElementView = joint.dia.ElementView.extend({
    
            template: [
                '<div class="html-element">',
                '<button class="delete">x</button>',  
                '<div class="editlabel">',
                '<input type="text" name="label" value="Name" />',            
                '</div>',
                
                '<div class="configframe" style="display:flex">',
                '<div class="config audio"><i class="fas fa-music"></i> Audio',
                '<div class="dropzone"><i class="fas fa-expand"></i></div>',
                '</div>',
                '<div class="config background"><i class="fas fa-image"></i> Background',
                '<div class="dropzone"><i class="fas fa-expand"></i></div>',
                '</div>',
                '<div class="config content"><i class="fas fa-photo-video"></i> Content',
                '<div class="dropzone"><i class="fas fa-expand"></i></div>',
                '</div>',
                '<div class="config gmnotes"><i class="fas fa-clipboard"></i> GM Notes',
                '<div class="dropzone"><i class="fas fa-expand"></i></div>',
                '</div>',
                '<div class="config data">',                
                '</div>',


                '</div>',
                '</div>'
            ].join(''),
    
            initialize: function() {
                _.bindAll(this, 'updateBox');
                joint.dia.ElementView.prototype.initialize.apply(this, arguments);
    
                this.$box = $(_.template(this.template)());

               
        
                // Prevent paper from handling pointerdown.
                this.$box.find('input').on('mousedown click', function(evt) {
                    evt.stopPropagation();
                });
                this.$box.find('input').on('keyup', function(e) {
                    if (e.key === 'Enter' || e.keyCode === 13) {
                        e.stopPropagation();

                    }
                });
               
                // This is an example of reacting on the input change and storing the input data in the cell model.
                this.$box.find('input').on('change', _.bind(function(evt) {
                    
                    this.model.set('label', $(evt.target).val());
                }, this));
                            
                this.$box.find('.delete').on('mouseup', function(evt) {
                    
                    var elements = main.getElements();
                    if (elements.length > 1) {
                        main.removeFromGraph(this.model);
                        this.model.remove();   
                        main.updateLayout();           
                    }
                }.bind(this));
                    
                // Update the box position whenever the underlying model changes.
                this.model.on('change', this.updateBox, this);
                // Remove the box when the model gets removed from the graph.
                this.model.on('remove', this.removeBox, this);
    
                this.updateBox();
            },
            render: function() {
                joint.dia.ElementView.prototype.render.apply(this, arguments);
                this.paper.$el.prepend(this.$box);
                this.updateBox();
                return this;
            },
            updateBox: function() {            

                // Set the position and dimension of the box so that it covers the JointJS element.
                var bbox = this.model.getBBox();
                // Example of updating the HTML with a data stored in the cell model.
                this.$box.find('input').val(this.model.get('label'));
                var contentdata = "";
                if (this.model.get('content0') > "") { 
                    const name = Playlist.collection.get(this.model.get('content0'));
                    contentdata = contentdata + '<i class="fas fa-music"></i> ' + name.data.name + "<br>"; 
                }
                if (this.model.get('content1') > "") { 
                    const name = JournalEntry.collection.get(this.model.get('content1'));
                    
                    contentdata = contentdata + '<i class="fas fa-image"></i> ' + name.data.name + "<br>"; 
                }
                if (this.model.get('content2') > "") { 
                    const name = JournalEntry.collection.get(this.model.get('content2'));
                    contentdata = contentdata + '<i class="fas fa-photo-video"></i> ' + name.data.name + "<br>"; 
                }
                if (this.model.get('content3') > "") { 
                    const name = JournalEntry.collection.get(this.model.get('content3'));
                    contentdata = contentdata + '<i class="fas fa-clipboard"></i> ' + name.data.name + "<br>"; 
                }
                if (contentdata > "") {
                    this.$box.find('.config.data').html(contentdata);    
                }
                
                this.$box.css({
                   // width: bbox.width,
                   // height: bbox.height,
                    left: bbox.x,
                    top: bbox.y
                });
            },
            removeBox: function(evt) {
                this.$box.remove();
            }
        });
    
        if ($('#content').val() > "") {
            this.graph.fromJSON(JSON.parse($('#content').val()));
        }
    
        var elements = this.getElements();
        
        if (elements.length == 0) {
            var elem = this.newElement();
            elem.addTo(this.graph);
        }
    
        this.updateLayout();
    
        
        this.paper.on('blank:pointerclick', function(event,x,y) {
            $('#dropdown').hide();
        });

        this.paper.on('element:pointerup', function(cellView,event,x,y) {
            
            var cell = cellView.model;
            if (cell.isElement()) {
                
                var elements = this.getElements();
                var prevElem = null;
                
                elements.forEach( function(el) {
                    
                    if ( (el !== cell) && (el.get('position').y < y)) {
                        
                        prevElem = el;
                    }
                });
                
                var linksin = this.graph.getConnectedLinks(cell, { inbound: true });
                var source = null;            
                linksin.forEach( function(l) {
                    source = l.getSourceElement();                          
                });
                if ( (prevElem == null) && (source != null)) {
                    // moved to top of list
                    this.removeFromGraph(cell);
                    this.addBeforeInGraph(cell, elements[0]);
                }
                if ( (prevElem != null) && (source != prevElem)) {
                    // moved to new position in list
                    this.removeFromGraph(cell);
                    this.addBehindInGraph(cell, prevElem);
                }
            
                this.updateLayout();
            }
        
          
        }.bind(this));
            
        this.paper.on('element:contextmenu', function(cellView,evt,x,y) {        
            var isElement = cellView.model.isElement();
            var message = (isElement ? 'Element' : 'Link') + ' clicked';
            $('.dropdown').css({left: x, top: y});        
            $('#dropdown').show();
            $('#dropdown a').unbind("click");
            
            $('#dropdown a').click( function(ev) {
                
                const action = $(this).data("action");
               
                if (action == "addbefore") {                
                    var elem = main.newElement();                
                    elem.addTo(main.graph);
    
                    main.addBeforeInGraph(elem, cellView.model);                
                    main.updateLayout();
                }
                if (action == "addbehind") {                
                    var elem = main.newElement();                
                    elem.addTo(main.graph);
    
                    main.addBehindInGraph(elem, cellView.model);
                    main.updateLayout();
                }      
    
                $('#dropdown').hide();
                return false;
            });
                     
        });
    }

    addLink(source,target) {
        if (source && target) {
            var link = new joint.dia.Link({
                source: { id: source.id },
                target: { id: target.id },
                attrs: { '.connection': { 'stroke-width': 5, stroke: '#34495E' }}
            });
            link.addTo(this.graph);
        }    

    }

    updatePos(i, element ) {
        element.position(40,(i - 1) * 170 + 30);
        var links = this.graph.getConnectedLinks(element, { outbound: true });
        var target = null;
        links.forEach( function(l) {
            target = l.getTargetElement();            
        });
        if (target) {
            this.updatePos(i + 1, target);
        }
    }

    updateLayout() {
        
        var sources = this.graph.getSources();
        sources.forEach( function(s) {
            this.updatePos(1, s);
        }.bind(this));
        this.paper.setDimensions(600, this.graph.getElements().length * 170 + 60);
    }

    getElementsSub(elements, element) {
        elements.push( element);
        var links = this.graph.getConnectedLinks(element, { outbound: true });
        var target = null;
        links.forEach( function(l) {
            target = l.getTargetElement();            
        });
        if (target) {
            elements = this.getElementsSub(elements, target);
        }
        return elements;
    }

    getElements() {
        var elements = [];
        var sources = this.graph.getSources();
        sources.forEach( function(s) {
            elements = this.getElementsSub(elements, s);
        }.bind(this));
        return elements;
    }

    removeFromGraph(element) {
        var linksin = this.graph.getConnectedLinks(element, { inbound: true });
        var linksout = this.graph.getConnectedLinks(element, { outbound: true });
        var source = null;
        var target = null;
        linksin.forEach( function(l) {
            source = l.getSourceElement();
            l.remove();                   
        });
        linksout.forEach( function(l) {
            target = l.getTargetElement();
            l.remove();                   
        });
        this.addLink(source,target);
    }

    addBeforeInGraph(element, before) {
        var links = this.graph.getConnectedLinks(before, { inbound: true });
        links.forEach( function(l) {
            var target = l.getSourceElement();
            this.addLink(target, element);
            l.remove();
        }.bind(this));
        this.addLink(element,before);
    }

    addBehindInGraph(element, behind) {
        var links = this.graph.getConnectedLinks(behind, { outbound: true });
        links.forEach( function(l) {
            var target = l.getTargetElement();
            this.addLink(element, target);
            l.remove();
        }.bind(this));
        this.addLink(behind, element);
    }

    newElement() {
        var elem = new joint.shapes.html.Element({
            position: { x: 1, y: 1 },
            size: { width: 350, height: 130 },
            label: 'Slide'
        });
        
        return elem;
    }

}

class Slideshow_Slideshow extends Application {
    constructor( options) {
      super( options);
      this.show = null;
    }
    static get defaultOptions() {

        return mergeObject(super.defaultOptions, {
            id: "slideshow_slideshow",
          template: "modules/slideshow/templates/slideshow.html",
          popOut: false,
          title: "Slideshow"
          
      });
   }
   
   getElementsSub(graph, elements, element) {
        elements.push( element);
        var links = graph.getConnectedLinks(element, { outbound: true });
        var target = null;
        links.forEach( function(l) {
            target = l.getTargetElement();            
        });
        if (target) {
            elements = this.getElementsSub(graph, elements, target);
        }
        return elements;
    }

    getElements(graph) {
        var elements = [];
        var sources = graph.getSources();
        sources.forEach( function(s) {
            elements = this.getElementsSub(graph, elements, s);
        }.bind(this));
        return elements;
    }
}

class Slideshow_Slideshow_Notes extends Application {
    constructor( options) {
      super( options);
      this.show = null;
    }
    static get defaultOptions() {

        return mergeObject(super.defaultOptions, {
            id: "slideshow_slideshow_notes",
          template: "modules/slideshow/templates/slideshow_notes.html",
          popOut: true,
          resizable: true,
          width: 600,
          height: 300,
          title: 'Slideshow Notes (Hit "O" to toggle Overview mode)'
          
      });
   }
   async close(options={}) {
    if (slideshow != null) {
        slideshow_slideshow_notes = null;
        slideshow.stop();
    }
    await super.close(options);
}
}

class SlideshowEntry extends JournalEntry {

    /** @override */
    static get config() {        
      return {
        baseEntity: JournalEntry,
        collection: game.journal,
        embeddedEntities: {},
        label: "Slideshow",
        permissions: {
          create: "JOURNAL_CREATE"
        }
      };
    }
}

class Slideshow {
    constructor() {
        
        this.slideshow = null;
      }

      createSlideshow(event) {
        event.preventDefault();
        event.stopPropagation();
        const button = event.currentTarget;
        const data = {'flags.core.sheetClass' : 'journals.SlideshowSheet', type: 'base', name: "Slideshow"};
        const options = {width: 320, left: window.innerWidth - 630, top: button.offsetTop };
        return SlideshowEntry.createDialog(data, options);
      }

    
    async start(slideshow) {
        if ( (this.slideshow != null) && (this.slideshow != slideshow)) {
            await this.stopSlideshow();
        }
        this.slideshow = slideshow;
        if (game.user.isGM) { 
            game.settings.set("slideshow", "id", this.slideshow.data._id);
        }
       
        $('body').addClass("hide");
       
   
        if (slideshow_slideshow == null) {
            slideshow_slideshow = new Slideshow_Slideshow();
            slideshow_slideshow.render(true);                
        }
        if (game.user.isGM) {
            if (slideshow_slideshow_notes == null) {
                slideshow_slideshow_notes = new Slideshow_Slideshow_Notes();
                slideshow_slideshow_notes.render(true);                    
            }
        }
        Hooks.on("renderSlideshow_Slideshow_Notes", (app) => {

            window.RevealAudioSlideshow.updateNotes(slideshow_slideshow.show);
            $('#slideshow_slideshow_notes .controls .left').off("click");
            $('#slideshow_slideshow_notes .controls .right').off("click");

            $('#slideshow_slideshow_notes .controls .left').click( function() {                    
                slideshow_slideshow.show.prev(); 
            });
            $('#slideshow_slideshow_notes .controls .right').click( function() {                    
                slideshow_slideshow.show.next(); 
            });
        });
        Hooks.on("renderSlideshow_Slideshow", (app) => {
    
            if (this.slideshow != null) {
                
                var graph = new joint.dia.Graph;
                graph.fromJSON(JSON.parse(this.slideshow.data.content));
                
                var elements = app.getElements(graph);
                var output = "";
                elements.forEach( function( slide) {
                    var attr = slide.attributes;
                    var audio = Playlist.collection.get(attr.content0);
                    var background = JournalEntry.collection.get(attr.content1);
                    var content = JournalEntry.collection.get(attr.content2);
                    var gmnotes = JournalEntry.collection.get(attr.content3);                                            

                    output = output + '<section ';
                    if (audio != null) {
                        output = output + 'data-audio-src="' + audio.data.name + '" ';
                    } 
                    if (background != null) {
                        output = output + 'data-background-image="' + background.data.img + '" ';
                    }
                    if (gmnotes != null) {
                        output = output + 'data-journalentry="' + gmnotes.data.name + '">';
                    }
                    if (content != null) {
                        output = output + content.data.content;
                    }
                    output = output + '</section>';

                });
                
                $("#slideshow_slideshow .reveal .slides").html(output);
            }
            
            let options = {
                embedded: true,
                controls: false,    
                plugins: [ RevealAudioSlideshow]
            };
            if (!game.user.isGM) {
                options =
                {
                    embedded: true,
                    controls: false,                  
                    controlsTutorial: false,
                    progress: false,                  
                    keyboard: false,              
                    overview: false,
                    touch: false,
                    plugins: [ RevealAudioSlideshow]
                }                
            };    
            if (app.show == null)  {
                
                app.show = new Reveal( document.querySelector( '.reveal' ), options);
                app.show.initialize({
                    audio: {
                        defaultAudios:false,
                        autoplay:true
                    }
                });
                if (game.user.isGM) { 
                    app.show.on( 'slidechanged', event => {
                        game.settings.set("slideshow", "step",event.indexh);                            
                    } );
                } 
                let indexh = game.settings.get("slideshow", "step");
                
                if (indexh > 0) {
                    if (app.show != null)
                        setTimeout( function() { app.show.slide(indexh,1,1) }.bind(app,indexh), 100); 
                }
                
            }
            
        });
            
    }
    async stop() {                
        game.settings.set("slideshow", "id", "");    
        await this.stopSlideshow();
    }

    async stopSlideshow() {
        $('body').removeClass("hide");       
        
        if (slideshow_slideshow) {
            if (game.user.isGM) { 
                window.RevealAudioSlideshow.stop(slideshow_slideshow.show);
            }
            $('.reveal').remove();
            await slideshow_slideshow.close();
            slideshow_slideshow = null;
        }
        if (slideshow_slideshow_notes) {
            await slideshow_slideshow_notes.close();
            slideshow_slideshow_notes = null;
        }
    }
    async idChanged() {
        var slideshowid = game.settings.get("slideshow", "id");                
        if (!game.user.isGM) { 
            if (slideshowid == "") {
                await this.stopSlideshow();                                 
            } else {
                if ( slideshow != this.slideshow ) {
                    this.start( JournalEntry.collection.get( game.settings.get("slideshow", "id") ) );                        
                }    
            }
        }
    }

    stepChanged() {
        if (!game.user.isGM) { 
            let indexh = game.settings.get("slideshow", "step");
            
            if (slideshow_slideshow.show != null)
                slideshow_slideshow.show.slide(indexh,1,1);
        }
    }
}

let slideshow = null;
let slideshow_slideshow = null;
let slideshow_slideshow_notes = null;
/* -------------------------------------------- */
/*  Hook calls                                  */
/* -------------------------------------------- */
Hooks.on("init", () => {

    if (typeof CONFIG["JournalEntry"]["sheetClasses"] === 'undefined') {    
        CONFIG["JournalEntry"]["sheetClasses"] = {};         
        CONFIG["JournalEntry"]["sheetClasses"][CONST.BASE_ENTITY_TYPE] = {};       
    }
    EntitySheetConfig.registerSheet(JournalEntry, "journals", SlideshowSheet, {
        label: "Slideshow",
        types: [CONST.BASE_ENTITY_TYPE],
        makeDefault: false
    });
    EntitySheetConfig.registerSheet(JournalEntry, "journals", JournalSheet, {        
        types: [CONST.BASE_ENTITY_TYPE],
        makeDefault: true
    });
      
      game.settings.register("slideshow", "step", {
        name: "Position in current slideshow",
        hint: "Position in current slideshow",
        scope: "world",
        config: false,
        default: 0,
        type: Number,
        
        onChange: () => slideshow.stepChanged(),
      });
      game.settings.register("slideshow", "id", {
        name: "Id of current slideshow",
        hint: "Id of current slideshow",
        scope: "world",
        config: false,
        default: '',
        type: String,
        
        onChange: () => {
            if (slideshow) { if (!game.user.isGM) slideshow.idChanged(); } 
        },
      });
  });

Hooks.on("ready", () => {
      
    
    Hooks.on("renderJournalDirectory", (app) => {
        if (game.user.isGM) {
            $('<button class="create-slideshow"><i class="fas fa-feather"></i>Create Slideshow Entry</button>').insertAfter("#journal .action-buttons .create-folder");
            $('#journal .action-buttons .create-slideshow').click( ev => slideshow.createSlideshow(ev));
        }
    });    
    slideshow = new Slideshow();
    if (game.user.isGM) {
        var slideshowid = game.settings.get("slideshow", "id");
        if (slideshowid > "") {
            slideshow.start( JournalEntry.collection.get( slideshowid ) );   
        }
    } else 
        slideshow.idChanged();
    
  });
  