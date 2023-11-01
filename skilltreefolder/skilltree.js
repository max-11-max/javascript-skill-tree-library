(function(global, document) {
   const svgNS = "http://www.w3.org/2000/svg"

   function TreeGenerator() {
   this.container;
   this.roots = [] // root nodes
   this.nodes = {}
   this.width;
   this.height;
   this.lines = new Map() // not sure if needed
   this.color;
   this.pale;
   this.location;
   }

   function Node() {
   this.node;
   this.tree;
   this.roots = []
   this.parents = []
   this.lines = new Map() // Can probably change to ids and just use regular dictionary, not enough time
   this.width;
   this.height;
   this.learned = false;
   this.text;
   this.image;
   this.shape;
   this.color;
   this.pale;
   this.lock = false;
   this.location;
   }

   function Line() {
   this.tree;
   this.line;
   this.parent;
   this.child;
   this.learned = false;
   this.color;
   this.pale;
   this.location;
   }

   Node.prototype = {
   _makeNode: function(name, shape, color, pale, location, tree, width, height, parent) {
   console.log(this.parents)
   if (parent) {
      this.parents.push(parent)
   }
   console.log(this.parents)
   this.tree = tree
   this.width = width
   this.height = height
   this.shape = shape
   this.color = color
   this.pale = pale
   this.location = location
   console.log("shape:", shape)
   if (this.shape === 'circ') {
      this.node = document.createElementNS(svgNS,'circle')
      this.node.setAttribute("r", 50)
      //this.node.setAttribute("height", 100)
      this.node.setAttribute("cx", this.location[0] + 50 + this.width * 150)
      this.node.setAttribute("cy", this.location[1] + 50 + this.height * 150)
      this.node.setAttribute("rx", 15)
      this.node.setAttribute("stroke-width", 5)
   } else if (this.shape === 'hex') {
      this.node = document.createElementNS(svgNS,'polygon')
      this.node.setAttribute("points", `${(this.location[0] + this.width * 150)} ${(this.location[1] + 25 + this.height * 150)}, ${(this.location[0] + 50 + this.width * 150)} ${(this.location[1] + this.height * 150)}, ${(this.location[0] + 100 + this.width * 150)} ${(this.location[1] + 25 + this.height * 150)}, ${(this.location[0] + 100 + this.width * 150)} ${(this.location[1] + 75 + this.height * 150)}, ${(this.location[0] + 50 + this.width * 150)} ${(this.location[1] + 100 + this.height * 150)}, ${(this.location[0] + this.width * 150)} ${(this.location[1] + 75  + this.height * 150)}`)
      this.node.setAttribute("stroke-width", 5)
   } else {
      this.node = document.createElementNS(svgNS,'rect')
      this.node.setAttribute("width", 100)
      this.node.setAttribute("height", 100)
      this.node.setAttribute("x", this.location[0] + this.width * 150)
      this.node.setAttribute("y", this.location[1] + this.height * 150)
      this.node.setAttribute("rx", 15)
      this.node.setAttribute("stroke-width", 5)
   }
   this.node.style.stroke=this.color
   this.node.style.fill=this.pale
   
   this.node.addEventListener("mouseover", ()=>{
      if (!this.learned) {
      this.node.style.fill=color
      }
   })
   this.node.addEventListener("mouseleave", ()=>{
      if (!this.learned) {
      this.node.style.fill=pale
      }
   })
   this.node.addEventListener("dblclick", ()=>{
      console.log(this.lock)
      if (!this.lock) {
      if (!this.learned) {
      this._learn()
      } else {
      if (!this._checkLocks()) {
         this._unlearn()
         this._rootsUnlearn()
         }
      }
      } 
   })
   this.node.addEventListener("contextmenu", (e)=>{
      e.preventDefault()
      console.log("rightclick")
      if (!this.lock) {
      this.lock = true
      this.node.style.stroke = _pSBC(-0.1, this.color)
      console.log("lock")
      } else {
      this.lock = false
      this.node.style.stroke=this.color
      console.log("unlock")
      }
   })
   console.log(this.height)
   this.node.id = name
   console.log(this.tree.width)
   this.tree.appendChild(this.node)
   console.log("addednode")
   },
   makeChild: function(name, shape="rect", color, pale) {
   const node = new Node()
   console.log("new leaf")
   node._makeNode(name, shape, color, pale, this.location, this.tree, this.width, this.height + 1, this)
   this.roots.push(node)
   return node
   },
   _addChild: function(child) {
   this.roots.push(child)
   },
   _addParent: function(parent) {
   this.parents.push(parent)
   },
   _checkParentsLearned: function() {
   if (this.parents.length == 0) {
      return true
   }
   // Quite the inelegant solution
   let result = true
   console.log("checking", this.parents)
   this.parents.map((parent) => {
      if (result == false) {}
      else if (!parent._getLearned()) {
      result = false
      } else {
      if (!parent._checkParentsLearned()) {
      result = false
      } else {
      result = true
      }
      }
   })
   return result
   },
   _getLock: function() {
      return this.lock
   },
   _checkLocks: function() {
   const roots = this._getRoots()
   locked = false;
   roots.map((root) => {
      if (root._checkLocks()) {
         locked = true;
      }
   })
   roots.map((root) => {
      if (root._getLock()) {
      console.log("root is locked")
      locked = true;
      }
   })
   console.log("LOCKED?:", locked)
   return locked;
   },
   _rootsUnlearn: function() {
   const roots = this._getRoots()
   roots.map((root) => {
      root._unlearn()
      root._rootsUnlearn()
   })
   },
   _learn: function() { // NEED TO ALERT TREE THAT IT HAS BEEN LEARNED
   console.log(this.parents)
   if (this._checkParentsLearned()) {
      console.log("parents learned")
      this.node.style.fill=this.color
      this.learned = true
      console.log("learned")
      this._learnLines()
   }
   },
   _unlearn: function() {
   if (this.learned == true) {
      this.node.style.fill=this.pale
      this.learned = false
      console.log("unlearned")
      this._unlearnLines()
   }
   },
   _learnLines: function() {
   console.log("learning lines")
   console.log(this.lines)
   this.parents.map((parent) => {
      console.log("mapped one")
      const line = this.lines.get(parent)
      if (line) {
      line._lineLearn()
      }
   })
   },
   _unlearnLines: function() {
   console.log("unlearning lines")
   this.parents.map((parent) => {
      console.log("mapped one")
      const line = this.lines.get(parent)
      if (line) {
      line._lineUnlearn()
      }
   })
   },
   _addLine: function(parent, line) {
   console.log("lines", this.lines)
   this.lines.set(parent, line)
   console.log("lines", this.lines)
   },
   _addText: function(text) {
   const svgText = document.createElementNS(svgNS, "text")
   console.log("adding text", svgText)
   console.log(this.width)
   
   svgText.setAttribute("fill", "black")
   svgText.setAttribute("font-size", 15)
   svgText.setAttribute("font-family", "Helvetica Neue, Helvetica, sans-serif")
   svgText.setAttribute("font-weight", "bold")
   const textNode = document.createTextNode(text)
   console.log("adding actual text", textNode)
   svgText.appendChild(textNode)
   svgText.setAttribute("x", this.width * 150 + (this.location[0] + 95 - _getTextWidth(text, "15 pt helvetica")) / 2 - 5)
   svgText.setAttribute("y", this.location[1] + 57.5 + this.height * 150)
   //svgText.innerHTML(text)
   this.text = svgText
   this.tree.appendChild(this.text)
   },
   /*addImage: function(source) {
   this.image = document.createElement("embed")
   this.image.setAttribute("src", source)
   this.image.setAttribute("width", 100)
   this.image.setAttribute("height", 100)
   this.image.setAttribute("x", 5)
   this.image.setAttribute("y", 5)
   this.image.setAttribute("alt", "poop")
   this.tree.appendChild(this.image)
   },*/ // Couldn't get to work
   _getParents: function() {
   return this.parents
   },
   _getRoots: function() {
   return this.roots
   },
   _getWidth: function() {
   return this.width
   },
   _getHeight: function() {
   return this.height
   },
   _getLearned: function() {
   return this.learned
   }
   }

   Line.prototype = {
   _makeLine: function(tree, parent, child, color, pale, location) {
   console.log("making line")
   this.tree = tree
   this.parent = parent
   this.child = child
   this.color = color
   this.pale = pale
   this.location = location
   const parentHeight = this.parent._getHeight()
   const parentWidth = this.parent._getWidth()
   const childHeight = this.child._getHeight()
   const childWidth = this.child._getWidth()

   console.log("heights", parentHeight, childHeight)

   if (parentHeight + 1 == childHeight) {
      console.log("parent child")
      this.line = document.createElementNS(svgNS, "line")
      this.line.setAttribute("x1", this.location[0] + parentWidth * 150 + 50)
      this.line.setAttribute("y1", this.location[1] + parentHeight * 150 + 102)
      this.line.setAttribute("x2", this.location[0] + childWidth * 150 + 50)
      this.line.setAttribute("y2", this.location[1] + childHeight * 150 - 2)
      this.line.setAttribute("stroke", this.pale)
      this.line.setAttribute("stroke-width", "3")
      this.tree.prepend(this.line)
   }
   },
   _lineLearn: function() {
   if (!this.learned) {
      this.learned = true
      this.line.setAttribute("stroke", this.color)
      this.line.setAttribute("stroke-width", "5")
   }
   },
   _lineUnlearn: function() {
   if (this.learned) {
      this.learned = false
      this.line.setAttribute("stroke", this.pale)
      this.line.setAttribute("stroke-width", "5")
   }
   }
   }

   // circle, hexagon, rectangle, octagon, triangle


   TreeGenerator.prototype = {
   makeTree: function(name, colors=[255, 165, 0], location=[5, 5]) {
   this.width = 150
   this.height = 150
   this.container = document.createElementNS(svgNS, "svg")
   this.container.setAttribute("width", 150)
   this.container.setAttribute("height", 150)
   this.container.id = name
   console.log(this.container)
   this.color = `rgb(${colors[0]},${colors[1]},${colors[2]})`
   this.pale = _pSBC(0.3, this.color)
   this.location = location
   },
   checkChangeSize: function(attr, size) {
   console.log("checking", attr, size)
   if (attr == 0) {
      if (this.width < size * 150) {
      console.log("setting width")
      this.container.setAttribute("width", size * 150)
      this.width = size * 150
      }
   }
   if (attr == 1) {
      if (this.height < size * 150) {
      this.container.setAttribute("height", size * 150)
      this.height = size * 150
      }
   }
   },
   makeRoot: function(name, shape="rect") {
   const node = new Node()
   console.log("new node")
   console.log(this.roots.length)
   console.log("makeRoot:", shape, this.location)
   node._makeNode(name, shape, this.color, this.pale, this.location, this.container, this.roots.length, 0)
   this.roots.push(node)
   this.checkChangeSize(0,this.roots.length)
   this.nodes[name] = node
   },
   makeLeaf: function(parent, child, shape="rect") {
   const parentNode = this.nodes[parent]
   const node = parentNode.makeChild(child, shape, this.color, this.pale)
   this.checkChangeSize(1, node.height + 1)
   this.nodes[child] = node
   const line = new Line()
   line._makeLine(this.container, parentNode, node, this.color, this.pale, this.location)
   this.lines.set(parentNode, node, line)
   node._addLine(parentNode, line)
   },
   addRelation: function(parent, child) {
   const parentNode = this.nodes[parent]
   const childNode = this.nodes[child]
   parentNode._addChild(childNode)
   childNode._addParent(parentNode)
   const line = new Line()
   line._makeLine(this.container, parentNode, childNode, this.color, this.pale, this.location)
   this.lines.set(parentNode, childNode, line)
   console.log("ADDING RELATION LINE")
   childNode._addLine(parentNode, line)
   },
   addText: function(node, text) {
   this.nodes[node]._addText(text)
   },
   /*addImage: function(node, source){
   this.nodes[node].addImage(source)
   },*/ // Couldn't get to work
   showTree: function() {
   const body = document.querySelector('body')
   body.append(this.container)
   },
   hideTree: function(id) {
   const tree = document.getElementById(id)
   tree.remove()
   }
   }

   // Appropriated from https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
   function _getTextWidth(text, font) {
   // re-use canvas object for better performance
   const canvas = _getTextWidth.canvas || (_getTextWidth.canvas = document.createElement("canvas"));
   const context = canvas.getContext("2d");
   context.font = font;
   const metrics = context.measureText(text);
   return metrics.width;
   }

   function _getCssStyle(element, prop) {
      return window.getComputedStyle(element, null).getPropertyValue(prop);
   }

   function _getCanvasFontSize(el = document.body) {
   const fontWeight = _getCssStyle(el, 'font-weight') || 'normal';
   const fontSize = _getCssStyle(el, 'font-size') || '16px';
   const fontFamily = _getCssStyle(el, 'font-family') || 'Times New Roman';
   
   return `${fontWeight} ${fontSize} ${fontFamily}`;
   }

   // Appropriated from https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
   // Version 4.0

   const _pSBC=(p,c0,c1,l)=>{
      let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
      if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
      if(!this._pSBCr)this._pSBCr=(d)=>{
         let n=d.length,x={};
         if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
         }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
         }return x};
      h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this._pSBCr(c0),P=p<0,t=c1&&c1!="c"?this._pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
      if(!f||!t)return null;
      if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
      else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
      a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
      if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
      else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
   }

   global.TreeGenerator = global.TreeGenerator || TreeGenerator

})(window, window.document);