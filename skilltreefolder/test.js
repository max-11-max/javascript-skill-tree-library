const tg = new TreeGenerator()

function example1() {
 tg.makeTree("tree1", [255, 165, 0], [5, 5])
 tg.makeRoot("n1", "circ")
 tg.makeRoot("n2", "hex")
 tg.makeLeaf("n2", "n3")
 tg.makeLeaf("n3", "n4", "circ")
 tg.makeLeaf("n1", "n5", "hex")
 tg.makeRoot("n6")
 tg.addRelation("n1", "n3")
 tg.addRelation("n6", "n3")
 tg.makeLeaf("n5", "n7")
 tg.addRelation("n3", "n7")
 tg.addRelation("n5", "n4")
 tg.addText("n1", "Number 1")
 tg.addText("n2", "Number 2")
 tg.addText("n3", "Number 3")
 tg.showTree()
}

example1()

const body1 = document.querySelector('body')

const br1 = document.createElement("br")
const br2 = document.createElement("br")
const br3 = document.createElement("br")
body1.append(br1)



const tg2 = new TreeGenerator()

function example2() {
 tg2.makeTree("tree1", [200, 0, 0], [5, 5])
 tg2.makeRoot("n1", "circ")
 tg2.addText("n1", "Algebra")
 tg2.showTree()
}

example2()

body1.append(br2)

const tg3 = new TreeGenerator()

function example3() {
 tg3.makeTree("tree1", [255, 165, 0], [25, 5])
 tg3.makeRoot("n1", "circ")
 tg3.showTree()
}

example3()